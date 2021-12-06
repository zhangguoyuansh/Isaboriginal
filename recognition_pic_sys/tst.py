#!/usr/bin/python3.8
# -*- coding: utf-8 -*-
# @Time    : 2021/9/1 21:30
# @Author  : easin
# @Email   : wechat: easinlee
# @File    : tst.py
# @Software: PyCharm
import os.path
import time

import requests
import json
def f():

    # pic = request.FILES.get('pic')
    u = 'https://justdemo-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/8d68b118-0807-4c6c-9533-bc1ca7507537/classify/iterations/classifyModel/image'
    h = {
        'Prediction-Key': 'd1c89990be164a4b98111c07dbd8f98a'
        # python 中用请求体中放文件二进制流的时候，不需要指定Content-Type
    }
    # d = {
    #     'Url': 'https://img2.baidu.com/it/u=1311085666,1887597967&fm=26&fmt=auto&gp=0.jpg'
    # }
    # r = requests.post(url=u, headers=h, files={})
    r = requests.post(url=u, files={'file': open('img.png', 'rb')},headers=h)
    print(r.text)
    result = 'no match'
    data = json.loads(r.text)
    if 'predictions' in data.keys():
        result = data['predictions']
        for i in range(len(result)):
            print(result[i])
if __name__ == '__main__':
    # f = open('img.png','rb')
    # print(f)
    # print(time.strftime('%y%m%d-%H%M%S',time.localtime()))
    file = os.path.join(os.getcwd(),'img.png')
    print(os.path.split(os.path.join(os.getcwd(),'img.png')))
    print(os.path.splitext(os.path.join(os.getcwd(),'img.png')))
    print(os.path.dirname(file))
    print(os.path.basename(file))
    print(os.getenv('JAVA_HOME'))
    print(os.stat(file))
    # print(os.path.split(os.getcwd() + '/' + 'img.png'))