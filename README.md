# 一键注入 SDK 的实现步骤
需要用到的设备和代码框架，
1. 一台 Root 的设备；
2. frida 框架，使用python语言，其注入代码为node.js实现
3. ATXServer2 平台，以 python 实现的Web平台
 
## 安装 frida

[FRIDA](https://github.com/frida/frida) 是一个动态注入框架，是开发者，反编译工程师和安全工程师经常使用的工具。

frida 安装需要 python3 的环境，推荐python3.7以上版本。

```sh
$ pip3 install frida-tools==10.2.1
或者
$ pip3 install frida==15.0.13
```

### 下载 frida-server 包
`frida-server` 是需要放置到手机中跟我们的平台进行通信。

到 [GitHub](https://github.com/frida/frida/releases) 上下载 `frida-server-15.0.13-android-arm64.xz`，
解压后重命名文件，如 `fs15` .
并推送到Android设备中 `</data/local/tmp>` 中
推送完成后修改文件权限
```sh
$ adb push fs15 /data/local/tmp
$ adb shell
$ su
$ chmod +x fs15
```

### 启动 frida 服务
进入 Android ADB 中启动 frida-server 
```sh
./fs15
```


## 编写注入代码

frida 注入代码是由node.js实现，GitHub 有一个库，集成后在ide上编写时能获得智能提示。

```sh
$ git clone git://github.com/oleavr/frida-agent-example.git
$ cd frida-agent-example/
$ npm install
$ frida-ps -U
$ frida -U -f com.example.android --no-pause -l _agent.js
```

### 注入SDK
为了注入自己的SDK,首先要将自己的SDK编译成一个 dex，并将其推送到手机上以便动态加载。

> 为了方便调用，可以先将初始化代码预先放入编译的 dex 中。

可以通过以下方法加载 Java 的 dex.
```js
var sdk = Java.openClassFile("/data/local/tmp/gio_sdk.dex").load();
```

之后 hook Android 的 `Application` onCreate 方法，让应用在启动的时候初始化SDK.

```js
Application.onCreate.implementation = function () {
       // if (this.toString().indexOf("StubApp") > -1) return;
        this.onCreate();
        try {
            var sdk = Java.openClassFile("/data/local/tmp/gio_sdk.dex").load();
            var sdkUtils = Java.use("com.growingio.android.sdk.autotrack.CdpSdkUtils");
            sdkUtils.start(this, "91eaf9b283361032", "growing.8226cee4b794ebd0", "951f87ed30c9d9a3", "http://117.50.105.254:8080");
        } catch (e) {
            console.error(e)
        }
};
```
在初始化时可以传入SDK需要的 `ProjectId`、`UrlScheme`、`DataSourceId`和`Host`数据。

### Hook 埋点
因为SDK需要自动埋点的功能，而在java sdk中是通过在代码编译时注入代码实现的。在 frida 中实现编译注入代码难度极大，所以选择通过hook注入点来实现。

比如说点击事件，可以hook `android.view.View`的 `performClick()`方法。
```js
var clickInjector = Java.use("com.growingio.android.sdk.autotrack.click.ViewClickInjector");

//View.OnClickListener.class --> onClick
Java.use("android.view.View").performClick.implementation = function () {
    var result = this.performClick();
    if (result) {
        clickInjector.viewOnClick(null, this);
        console.log("View$OnClickListener: " + this)
    }
    return result;
};
```
其他的自动埋点都可以找到相应的hook注入点,比较重要的有 fragment,activity等，具体可以参考该类的实现:

[growingio_sdk](https://github.com/cpacm/atxserver2/blob/master/static/growingio_sdk.js)

### 输出log
为了表示应用已经hook成功，可以通过hook `android.util.Log` 类在 python 输出台上打出日志。
在 Android 中更好的还是直接通过 Logcat 查看日志。

### 利用 Python 调用
虽然可以直接通过 `frida -U -f com.example.android --no-pause -l growingio_sdk.js` 直接调用起frida,但为了能将整个程序嵌入到 Python 其他应用中，可以写个 python 方法调用。
```python
import frida
import sys
import time


def click_handler(message, payload):
    print(message)


package = None
if sys.argv.__len__() > 1:
    package = sys.argv[1]
    print("正在启动应用：" + package)
# package = "com.cpacm.bangumi"
# package = "com.duokan.reader"
if package is None:
    package = input("请输入要启动的包名:")

try:
    device = frida.get_usb_device()
except BaseException:
    time.sleep(3)
    device = frida.get_usb_device()

pid = device.spawn(package)
# device.resume(pid)
time.sleep(1)
session = device.attach(pid)
with open("growingio_sdk.js") as f:
    script = session.create_script(f.read())
script.on("message", click_handler)
script.load()

# 为了防止 application 无法被注入，需要先 script.load() 才唤起应用进程。
time.sleep(1)
device.resume(pid)
sys.stdin.read()
```
输入命令行 
```sh
$ python3 growingio.py <可选参数：包名>
``` 
即可成功调用脚本。

### 一些使用技巧
* 打dex包
推荐使用 Android SDK 30 后面的d8命令，可以快速的将多个jar包合并成 dex
```sh
$ d8 sdk.jar okhttp-3.12.1.jar okio-1.15.0.jar --output sdk3.zip
```

* 为了保证 dex 在第三方应用上能够简单快速运行且不产生冲突，修改了sdk 源代码：网络库使用了系统自带的 `UrlConnection`；数据库不再通过 `ContentProvider`进行插入；防止R文件中id无法查找，直接使用 int 替代，如 100 << 24.

* 为了防止某些类无法找到导致脚本无法运行，如三个版本的 `Fragment` ，可以在注入时通过 try...catch...捕获异常。

## 集成到 ATXServer2 平台上

[ATXServer2](https://github.com/openatx/atxserver2) 平台是一个开源的移动设备管理平台(支持Android和iOS)，它的项目结构以 `tornado+rethinkdb` 为架构，整体上比较简单易修改。

### 安装
请 clone ATXServer2 的 [fork 版本](https://github.com/cpacm/atxserver2)，该版本添加了 Frida 模块，实现了一键注入SDK的功能。

安装过程与 ATXServer2 默认安装没有区别。

```sh
$ rethinkdb
$ python3 main.py //启动平台
$ python3 atxserver2-android-provider/main.py --server localhost:4000 //启动Android设备管理
```

### 如何修改
1. 修改 `/templates/remoteontrol_android.html` 模板页，添加了一个输入框和注入按钮。

2. 修改 `/web/urls` 路由表，添加新的路由地址：sdkHook,它由注入按钮触发。

3. 在 `/web/views/device.py` 下实现 SDKHook 触发后的功能，调用 frida 的脚本注入。参考 [APIDeviceHookHandler](https://github.com/cpacm/atxserver2/blob/master/web/views/device.py#L123) 代码。

4. [/web/views/frida/growingio.py](https://github.com/cpacm/atxserver2/blob/master/web/views/frida/growingio.py) 代码即为上面的 frida 调用的 python 脚本。

### 使用

1. 选中需要使用的设备后，选中 "安装管理" 分页。该页面可以上传apk,当你上传apk并安装后，包名会自动输入到输入框中，此时你可以点击注入完成SDK的注入。

2. 你可以到 "Terminal" 中，查看 Android 输入的日志，若咩有日志输出可以点击下方的 `logcat | grep Track`。

3. 若是应用首次安装并启动，注入SDK有一定概率失败，请回到步骤1再试一次。