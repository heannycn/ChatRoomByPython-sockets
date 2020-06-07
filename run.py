from flask import Flask, render_template, request
import random
# app = Flask(__name__)
app = Flask(__name__, template_folder='./templates', static_url_path='', static_folder='./static')

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/chat')
def chat():
    return render_template('chat.html')
@app.route('/chat/<username>')
def chat_user(username):
    avatars=['/img/dog.png','/img/louis-ck.jpeg','/img/michael-jordan.jpg','/img/bo-jackson.jpg']
    avatar = random.choice(avatars)
    name = username
    return render_template('chat.html',**locals())


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) #threaded=True,
