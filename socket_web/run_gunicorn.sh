#!/bin/bash
gunicorn -c /mnt/python/socket_web/gunicorn.py run:app -D
#gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -b 0.0.0.0:8002 run:app
exit 0