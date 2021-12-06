import os
import time

from django.http import JsonResponse
import json
from recognition_pic import models
import requests
from .serializers import RecSerializer


# Create your views here.

def recognize(request):
    if request.method == 'OPTIONS':
        return JsonResponse('ok',safe=False)
    filename = 'pic/' + time.strftime('%y%m%d-%H%M%S', time.localtime()) + '.png'
    with open(filename, 'wb+') as f:
        f.write(request.body)
        f.close()
    # u = 'https://justdemo-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/8d68b118-0807-4c6c-9533-bc1ca7507537/classify/iterations/classifyModel/image'
    u = 'https://southcentralus.api.cognitive.microsoft.com/customvision/v3.0/Prediction/5c00375c-a1d6-4c88-b0f7-9e63cba607c3/classify/iterations/Iteration5/image'

    h = {
        # 'Prediction-Key': 'd1c89990be164a4b98111c07dbd8f98a'
        'Prediction-Key': '7fee05ce941445feab591cb78492afa0'

    # python 中用请求体中放文件二进制流的时候，不需要指定Content-Type
    }
    r = requests.post(url=u, files={'file': open(filename, 'rb')}, headers=h)
    # print(r.text)
    result = []
    data = json.loads(r.text)
    if 'predictions' in data.keys():
        temp_result = data['predictions']

        for res in temp_result:
            if float(res['probability']) > 0.1:
                rec = models.Recognize.objects.filter(tagname=res['tagName']).first()
                rec = RecSerializer(rec).data
                place = rec['place']
                usefulness = rec['usefulness']
                res['place'] = place
                res['usefulness'] = usefulness
                result.append(


                    res
                )
    if len(result) == 0:
        result = [{'probability':'-','tagName': 'Image information is not recognized','place':'-','tagId':'-',

            'usefulness' : '-'
        }]
    if len(result) >= 1:
        result = [result[0]]
    print(str(result))
    return JsonResponse(result, safe=False)
