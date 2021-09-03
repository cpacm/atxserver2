# -*- coding:utf-8 -*-
# coding=utf-8

import os
import sys
import time
import asyncio

def click_handler(message, payload):
    print(message)


async def ios_inject(bundleId,udid):
    print("bundleId " + bundleId)
    print("udid " + udid)
    await os.system("./ios_inject.sh " + bundleId + " " + udid)
    return
    # sys.stdin.read()

if __name__ == "__main__":
    tasks = [ios_inject("com.niwodai.jiekuan", "e073940f143ede3a619bf50f3f20c37c58a9bfe4")]
    loops = asyncio.get_event_loop()
    loops.run_until_complete(asyncio.wait(tasks))
# 不支持程序列表：
# 不背单词：cn.com.langeasy.LangEasyLexis
