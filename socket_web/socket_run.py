import json
import time

from flask import Flask, render_template, request
from flask_sockets import Sockets

app = Flask(__name__)
sockets = Sockets(app)

ws_pool = {}


def delpool(ws, pool):
    return {k: v for k, v in pool.items() if v['ws'] != ws}
    # key = None
    # for k in ws_pool.keys():
    #     if ws == ws_pool[k]['ws']:
    #         key = k
    #         continue
    # del ws_pool[key]


def getOnline(ws_pool):
    return {key: {k: v for k, v in val.items() if k != 'ws'} for key, val in ws_pool.items()}


def sendMsg(wss, msg):
    for ws in wss:
        try:
            ws.send(json.dumps(msg))
        except Exception as e:
            print(e)


#  ws://
@sockets.route('/echo')
def echo_socket(ws):
    global ws_pool
    r_data = ws.receive()
    r_data = json.loads(r_data)
    if not r_data['type'] == 'open':
        return
    # 用户登录的个人信息
    username = r_data['data']['user']
    name = r_data['data']['name']
    avatar = r_data['data']['avatar']
    ws_pool[username] = {'ws': ws, 'name': name, 'avatar': avatar}
    print('{}进来了，当前在线人数：{}'.format(name, len(ws_pool)))
    sendMsg([ws], {'type': 'init', 'data': {'people': getOnline(ws_pool),
                                            'time': time.strftime('%H:%M:%S', time.localtime()),
                                            'history': [
                                                {'time': '2020-05-01', 'body': 'time'},
                                                {'user': 'A', 'avatar': '/img/bwl.jpg', 'body': 'you', 'msg': '你是谁'},
                                                {'user': 'A', 'avatar': '/img/bwl.jpg', 'body': 'you', 'msg': '你在哪'},
                                                {'time': '2020-05-20', 'body': 'time'},
                                                {'user': 'Heanny', 'avatar': '/img/default.jpg', 'body': 'me',
                                                 'msg': '你瞅啥'},
                                            ]}})
    sendMsg([v['ws'] for k, v in ws_pool.items() if k != username], {'type': 'enter',
                                                                     'data': {'name': name,
                                                                              'avatar': avatar,
                                                                              'user': username,
                                                                              'people': getOnline(ws_pool),
                                                                              'time': time.strftime('%H:%M:%S',
                                                                                                    time.localtime())}})

    while not ws.closed:
        r_data = ws.receive()
        if not r_data:
            break
        # ws.send("客户端已收到: " + str(message))
        # 如何推送给其他人
        r_data = json.loads(r_data)
        print('r_data', r_data)
        if r_data['type'] == 'say':
            data = r_data['data']
            sendMsg([v['ws'] for k, v in ws_pool.items() if k != username], {'type': 'say',
                                                                             'data': {'name': name,
                                                                                      'msg': data['msg'],
                                                                                      'avatar': avatar,
                                                                                      'time': time.strftime('%H:%M:%S',
                                                                                                            time.localtime())
                                                                                      }})
        # todo:获取相应用户的历史聊天记录
        elif r_data['type'] == 'history':
            ws.send(json.dumps({'type': 'history',
                                'data': {'history': [{'time': time.strftime('%H:%M:%S',
                                                                            time.localtime()), 'body': 'time'}],
                                         'user': r_data['data']['user']}}))
        elif r_data['type'] == 'private':
            sendMsg([ws_pool[r_data['data']['to']]['ws']], {'type': 'private',
                                                            'data': {'from': username,
                                                                     'fromName': name,
                                                                     'msg': r_data['data']['msg'],
                                                                     'avatar': avatar,
                                                                     'user': r_data['data']['to'],
                                                                     'time': time.strftime('%H:%M:%S',
                                                                                           time.localtime())
                                                                     }})
    ws_pool = delpool(ws, ws_pool)
    print('{}离开了，当前在线人数：{}'.format(name, len(ws_pool)))
    sendMsg([v['ws'] for k, v in ws_pool.items()], {'type': 'leave',
                                                    'data': {'name': name,
                                                             'user': username,
                                                             'people': getOnline(ws_pool),
                                                             'time': time.strftime('%H:%M:%S', time.localtime())}})


if __name__ == '__main__':
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    server = pywsgi.WSGIServer(('0.0.0.0', 5002), app, handler_class=WebSocketHandler)
    print('web server start ... ')
    server.serve_forever()
