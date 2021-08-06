# -*- coding:utf-8 -*-
# coding=utf-8

import frida
import sys
import time


def click_handler(message, payload):
    print(message)


async def frida_hook(package):
    # package = None
    # if sys.argv.__len__() > 1:
    #     package = sys.argv[1]
    #     print("正在启动应用：" + package)
    # # package = "com.cpacm.bangumi"
    # # package = "com.duokan.reader"
    # if package is None:
    #     package = input("请输入要启动的包名:")

    try:
        device = frida.get_usb_device()
    except BaseException:
        time.sleep(3)
        device = frida.get_usb_device()

    pid = device.spawn(package)
    # device.resume(pid)
    time.sleep(1)
    session = device.attach(pid)
    with open("README.md") as f2:
        print("open file")
    with open("static/growingio_sdk.js") as f:
        script = session.create_script(f.read())
    script.on("message", click_handler)
    script.load()

    time.sleep(1)
    device.resume(pid)
    return
    # sys.stdin.read()

# 不支持程序列表：
# 不背单词：cn.com.langeasy.LangEasyLexis
