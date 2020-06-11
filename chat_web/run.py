from flask import Flask, render_template
import random

app = Flask(__name__, template_folder='./templates', static_url_path='', static_folder='./static')


@app.route('/')
@app.route('/chat')
def index():
    avatars = ['/img/dog.png', '/img/louis-ck.jpeg', '/img/michael-jordan.jpg', '/img/bo-jackson.jpg']
    avatar = random.choice(avatars)
    username = 'testuser'
    name = 'testuser'
    return render_template('index.html', **locals())


@app.route('/<username>')
@app.route('/chat/<username>')
def chat_user(username):
    avatars = ['/img/dog.png', '/img/louis-ck.jpeg', '/img/michael-jordan.jpg', '/img/bo-jackson.jpg']
    avatar = random.choice(avatars)
    username,name = username,username
    return render_template('index.html', **locals())


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)  # threaded=True,
