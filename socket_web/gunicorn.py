import multiprocessing

bind = '0.0.0.0:8002'
workers = 1
chdir = "/mnt/python/socket_web"
backlog = 2048

worker_class = "geventwebsocket.gunicorn.workers.GeventWebSocketWorker"
#worker_class = "gevent"
worker_connections = 1000
daemon = False
debug = True
proc_name = 'socket_web'
pidfile = './log/gunicorn.pid'
errorlog = './log/gunicorn.log'