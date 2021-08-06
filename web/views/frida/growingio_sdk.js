function main() {
    console.log("Enter the App!");
    Java.perform(function x() {

        //loadAPK("/data/local/tmp/gio_sdk.dex");
        try {
            var sdk = Java.openClassFile("/data/local/tmp/gio_sdk.dex").load();
        } catch (e) {
            console.error(e)
        }

        var Application = Java.use("android.app.Application");

        Application.onCreate.implementation = function () {
            send("application:onCreate() " + this);
            if (this.toString().indexOf("StubApp") > -1) return;
            this.onCreate();
            try {
                var sdk = Java.openClassFile("/data/local/tmp/gio_sdk.dex").load();
                var sdkUtils = Java.use("com.growingio.android.sdk.autotrack.CdpSdkUtils");
                sdkUtils.start(this, "91eaf9b283361032", "growing.8226cee4b794ebd0", "951f87ed30c9d9a3", "http://117.50.105.254:8080");
            } catch (e) {
                console.error(e)
            }
            // var config_instance = Java.use("com.growingio.android.sdk.autotrack.CdpAutotrackConfiguration").$new("bfc5d6a3693a110d", "growing.d80871b41ef40518");
            // console.log("config_instance:" + config_instance);
            // console.log("config:" + config_instance.getProjectId());
            // config_instance.setDebugEnabled(true);
            // config_instance.setDataSourceId("djfakdgw");
            // var autotracker = Java.use("com.growingio.android.sdk.autotrack.GrowingAutotracker");
            // console.log("autotracker_instance:" + autotracker);
            //
            // var appModule = Java.use("com.growingio.android.sdk.autotrack.GrowingAppModule");
            // appModule.config.implementation = function (config) {
            //     this.config(config);
            //     //config.setProject("bfc5d6a3693a110d", "growing.d80871b41ef40518");
            //     //config.setDataSourceId("http://117.50.105.254:8080");
            //     console.log("config: " + config);
            // };
            //
            // autotracker.startWithConfiguration.implementation = function (app, config) {
            //     console.log("app: " + app);
            //     console.log("config: " + config);
            //     console.log("data source: " + config.getDataSourceId());
            //     this.startWithConfiguration(app, config)
            // };
            //
            //
            // autotracker.startWithConfiguration(this, config_instance);
            //send(autotracker)
        };

        try {
            var Activity = Java.use("android.app.Activity");
            Activity.onResume.implementation = function () {
                send("onResume() " + this);
                try {
                    hookFragment();
                } catch (e) {
                    console.error(e)
                }
                this.onResume();
            };

        } catch (e) {
            console.error(e)
        }

        try {
            hookClick();
        } catch (e) {
            console.error(e)
        }

        try {
            hookFragment();
        } catch (e) {
            console.error(e)
        }

        try {
            hookLog();
        } catch (e) {
            console.error(e)
        }

        // Java.enumerateLoadedClasses({
        //     onMatch: function (class_name) {
        //         if (class_name.indexOf("com.cpacm") < 0) {
        //             return;
        //         } else {
        //             //console.log(class_name + ": ");
        //             var hook_cls = Java.use(class_name);
        //             var interfaces = hook_cls.class.getInterfaces();
        //             if (interfaces.length > 0) {
        //                 for (var i in interfaces) {
        //                     //console.log("\t interfaces:", interfaces[i].toString());
        //                     if (interfaces[i].toString().indexOf("android.view.View$OnClickListener") != -1) {
        //                         hook_cls.onClick.implementation = function (v) {
        //                             // Show a message to know that the function got called
        //                             send('Intercepted before button click event. Running onClick code...');
        //
        //                             // Call the original onClick handler
        //                             hook_cls.onClick.call(this, v);
        //
        //                             // Log to the console that it's done, and we should have the flag!
        //                             console.log('Done:' + JSON.stringify(this));
        //                         };
        //                     }
        //                 }
        //             }
        //             var ownMethods = hook_cls.class.getDeclaredMethods();
        //             if (ownMethods.length > 0) {
        //                 for (var i in ownMethods) {
        //                     //console.log("\t method:", ownMethods[i].toString());
        //                 }
        //             }
        //         }
        //     },
        //     onComplete: function () {
        //         console.log("load end")
        //     }
        // });
    })
}

function hookClick() {
    var clickInjector = Java.use("com.growingio.android.sdk.autotrack.click.ViewClickInjector");

    //View.OnClickListener.class-- > onClick
    Java.use("android.view.View").performClick.implementation = function () {
        var result = this.performClick();
        if (result) {
            clickInjector.viewOnClick(null, this);
            console.log("View$OnClickListener: " + this)
        }
        return result;
    };

    //AlertDialog.class --> show
    Java.use("android.app.AlertDialog").show.implementation = function () {
        this.show();
        clickInjector.alertDialogShow(this);
    };

    // DialogInterface.OnClickListener


    //AdapterView.class --> performItemClick
    Java.use("android.widget.AdapterView").performItemClick.overload("android.view.View", "int", "long").implementation = function (v, i, l) {
        var result = this.performItemClick(v, i, l);
        if (result) {
            clickInjector.viewOnClick(null, v);
        }
        return result;
    };

    //AdapterView.OnItemSelectedListener -> onItemSelected
    Java.use("android.widget.AdapterView").fireOnSelected.implementation = function () {
        var selection = this.getSelectedItemPosition();
        if (selection > 0) {
            var v = this.getSelectedView();
            clickInjector.viewOnClick(null, v);
        }
        this.fireOnSelected();
    };

    var Activity = Java.use("android.app.Activity");

    // Activity -> onOptionsItemSelected
    Activity.onOptionsItemSelected.overload("android.view.MenuItem").implementation = function (item) {
        this.onOptionsItemSelected(item);
        clickInjector.menuItemOnOptionsItemSelected(this, item);
    };

    // Activity -> onNewIntent
    Activity.onNewIntent.overload("android.content.Intent").implementation = function (intent) {
        this.onNewIntent(intent);
        Java.use("com.growingio.android.sdk.autotrack.inject.ActivityInjector").onActivityNewIntent(this, intent);
    };

    //android.webkit.WebView --> loadUrl
    Java.use("android.webkit.WebView").loadUrl.overload("java.lang.String").implementation = function (s) {
        this.loadUrl(s);
        Java.use("com.growingio.android.sdk.autotrack.inject.WebViewInjector").webkitWebViewLoadUrl(this, s);
    };

    // 其它就不补了，反正基本上有onClick就够了。。。。。。
}

function hookFragment() {
    var fragmentInjector = Java.use("com.growingio.android.sdk.autotrack.page.FragmentInjector");
    try {
        //fragment
        var fragment = Java.use("android.app.Fragment");
        fragment.onResume.implementation = function () {
            this.onResume();
            console.log(this);
            fragmentInjector.systemFragmentOnResume(this);
        };

        fragment.setUserVisibleHint.overload("boolean").implementation = function (b) {
            this.setUserVisibleHint(b);
            fragmentInjector.systemFragmentSetUserVisibleHint(this, b);
        };

        // Sophix 热修复会出现问题，原因不明； 测试app: com.kmxs.reader
        // fragment.onHiddenChanged.overload("boolean").implementation = function (b) {
        //     this.onHiddenChanged(b);
        //     fragmentInjector.systemFragmentOnHiddenChanged(this, b);
        // };
        //
        // fragment.onDestroyView.implementation = function () {
        //     this.onDestroyView();
        //     fragmentInjector.systemFragmentOnDestroyView(this);
        // };
    } catch (e) {
        console.error(e.toString());
    }

    try {
        var v4Fragment = Java.use("android.support.v4.app.Fragment");
        v4Fragment.onResume.implementation = function () {
            this.onResume();
            console.log("v4" + this);
            fragmentInjector.v4FragmentOnResume(this);
        };

        v4Fragment.setUserVisibleHint.overload("boolean").implementation = function (b) {
            this.setUserVisibleHint(b);
            fragmentInjector.v4FragmentSetUserVisibleHint(this, b);
        };

        v4Fragment.onHiddenChanged.overload("boolean").implementation = function (b) {
            this.onHiddenChanged(b);
            fragmentInjector.v4FragmentOnHiddenChanged(this, b);
        };

        v4Fragment.onDestroyView.implementation = function () {
            this.onDestroyView();
            fragmentInjector.v4FragmentOnDestroyView(this);
        };
    } catch (e) {
        console.error(e.toString());
    }

    try {
        var xFragment = Java.use("androidx.fragment.app.Fragment");
        xFragment.onResume.implementation = function () {
            this.onResume();
            console.log("androidX:" + this);
            fragmentInjector.androidxFragmentOnResume(this);
        };

        xFragment.setUserVisibleHint.overload("boolean").implementation = function (b) {
            this.setUserVisibleHint(b);
            fragmentInjector.androidxFragmentSetUserVisibleHint(this, b);
        };

        xFragment.onHiddenChanged.overload("boolean").implementation = function (b) {
            this.onHiddenChanged(b);
            fragmentInjector.androidxFragmentOnHiddenChanged(this, b);
        };

        xFragment.onDestroyView.implementation = function () {
            this.onDestroyView();
            fragmentInjector.androidxFragmentOnDestroyView(this);
        };
    } catch (e) {
        console.error(e);
    }
}

function hookLog() {
    var log = Java.use("android.util.Log");
    log.wtf.overload("java.lang.String", "java.lang.String").implementation = function (tag, msg) {
        console.trace(tag + ":" + msg);
        return this.wtf(tag, msg);
    };
    log.d.overload("java.lang.String", "java.lang.String").implementation = function (tag, msg) {
        console.log(tag + ":" + msg);
        return this.d(tag, msg);
    };
    log.println.overload("int", "java.lang.String", "java.lang.String").implementation = function (priority, tag, msg) {
        console.log("[" + priority + "]-" + tag + ":" + msg);
        return this.println(priority, tag, msg);
    };
    log.e.overload("java.lang.String", "java.lang.String").implementation = function (tag, msg) {
        console.error(tag + ":" + msg);
        return this.e(tag, msg);
    };
    log.e.overload("java.lang.String", "java.lang.String", "java.lang.Throwable").implementation = function (tag, msg, tr) {
        console.error(tag + ":" + msg + "/n/t" + tr.getMessage());
        return this.e(tag, msg, tr);
    };
}

// function loadAPK(path) {
//     var ActivityThread = Java.use("android.app.ActivityThread");
//     var app = ActivityThread.currentApplication();
//     Java.classFactory.cacheDir = "/data/data/" + app.getPackageName() + "/cache";
//     Java.classFactory.codeCacheDir = "/data/data/" + app.getPackageName() + "/code_cache";
//     var DexClassLoader = Java.use("dalvik.system.DexClassLoader");
//     DEXCL = DexClassLoader.$new(path, Java.classFactory.codeCacheDir, null, DexClassLoader.getSystemClassLoader());
//     DEXFactory = Java.ClassFactory.get(DEXCL);
//     DEXFactory.cacheDir = "/data/data/" + app.getPackageName() + "/cache";
//     DEXFactory.codeCacheDir = "/data/data/" + app.getPackageName() + "/code_cache";
// }

setImmediate(main);