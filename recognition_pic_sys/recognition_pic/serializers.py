#!/usr/bin/python3.8
# -*- coding: utf-8 -*-
# @Time    : 2021/9/5 11:35
# @Author  : easin
# @Email   : wechat: easinlee
# @File    : serializers.py
# @Software: PyCharm
from rest_framework.serializers import Serializer
from rest_framework import serializers


class RecSerializer(Serializer):
    id = serializers.IntegerField()
    tagname = serializers.CharField()
    place = serializers.CharField()
    usefulness = serializers.CharField()
    # stime = serializers.CharField()
