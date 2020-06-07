// document.querySelector('.chat[data-chat=person2]').classList.add('active-chat');
// document.querySelector('.person[data-chat=person2]').classList.add('active');
var ws = null;

$(document).ready(function () {
    if (ws) {
        return;
    }
    ws = new WebSocket('ws://127.0.0.1:5002/echo');

    var name = $('#name').html();
    var avatar = $('#user_avatar').attr('src');
    var user = $('#username').val();
    ws.onopen = function () {
        console.log('web socket 已连接');
        ws.send(JSON.stringify({'type': 'open', 'data': {name: name, user: user, avatar: avatar}}));
    }
    ws.onmessage = function (event) {
        var r_data = event.data; //接收到的数据
        show_message(r_data);
    }
    ws.onclose = function () {
        //alert('连接已关闭...');
    }
})


function show_message(json_string) {
    var json = JSON.parse(json_string);
    var type = json.type;
    var data = json.data;
    var avatar = data.avatar ? data.avatar : '/img/dog.png';
    var html = '';
    if (type === 'enter') {
        html = '<div class="conversation-start">' +
            '<span>' + data.time + '</span>' +
            '</div>';
        html += '<div class="welcome_msg">-- ' + data.name + ' 进入了聊天室！--</div>';
        peopleEnter(data)
    } else if (type === 'init') {
        pushOnline(data.people)
        pushMsg(data.history)
    } else if (type === 'history') {
        pushMsg(data.history)
    } else if (type === 'leave') {
        html = '<div class="leave_msg">' + data.name + ' 离开了聊天室！</div>';
        peopleLeave(data)
    } else if (type === 'say') {
        html = '<div class="group_you">' +
            '<img src="' + avatar + '" alt="" class="avatar"/>' +
            '<div class="you_name">' + data.name + '</div>' +
            '<div class="bubble you_msg">' + data.content +
            '</div>' +
            '</div>';
    } else if (type === 'private') {
        console.log('private', data)
        html = '<div class="group_you">' +
            '<img src="' + avatar + '" alt="" class="avatar"/>' +
            '<div class="you_name">' + data.from + '</div>' +
            '<div class="bubble you_msg">' + data.msg +
            '</div>' +
            '</div>';
        var div = document.getElementById('content_form_' + data.from)
        div.innerHTML += html;
        div.scrollTop = div.scrollHeight;
        if (!$('#online [data-chat="p_' + data.from + '"]').hasClass('active')) {
            $('#online [data-chat="p_' + data.from + '"] .new_blink').show()
            $('#online [data-chat="p_' + data.from + '"] .pp_status').hide()
        }
        return true
    }

    // $('#content').scrollIntoView();

    if (!$('#online [data-chat="chat_group"]').hasClass('active')) {
        $('#online [data-chat="chat_group"] .new_blink').show()
        $('#online [data-chat="chat_group"] .pp_status').hide()
    }
    var div = document.getElementById('content_form')
    div.innerHTML += html;
    div.scrollTop = div.scrollHeight;
}


function send_message() {
    if (!ws || ws.readyState === ws.CLOSED) {
        alert('连接聊天室失败，请刷新重试');
        return;
    }
    var text = document.getElementById('text').value;
    var name = $('#name').html();
    var avatar = $('#user_avatar').attr('src');
    var user = $('#username').val();
    var toUser = $('#toUser').html();
    if (!text || !text.replace(/(^\s+)|(\s+$)/g, '')) {
        return false
    }
    ws.send(JSON.stringify({
        'type': toUser === 'Group' ? 'say' : 'private',
        'data': {'content': text, 'avatar': avatar ? avatar : '/img/dog.png', name: name, user: user, to: toUser}
    }));
    var div = document.getElementById(toUser === 'Group' ? 'content_form' : 'content_form_' + toUser)
    div.innerHTML += '<div class="bubble me">' + text + '</div>';
    div.scrollTop = div.scrollHeight;
    $('#text').val('')
}

document.getElementById('button-send').onclick = function (event) {
    send_message();
}
document.getElementById('text').onkeypress = function (event) {
    if ((event.which || e.keyCode) == 13) {
        send_message();
        event.preventDefault();
    }

}

function pushMsg(history) {
    var historyHtml = ''
    history.forEach(function (res) {
        if (res.body === 'time') {
            historyHtml += '<div class="conversation-start">' +
                '<span>' + res.time + '</span>' +
                '</div>';
        } else if (res.body === 'you') {
            historyHtml += '<div class="group_you">' +
                '<img src="' + res.avatar + '" alt="" class="avatar"/>' +
                '<div class="you_name">' + res.user + '</div>' +
                '<div class="bubble you_msg">' + res.msg +
                '</div>' +
                '</div>';
        } else {
            historyHtml += '<div class="bubble me">' + res.msg + '</div>';
        }
    })
    var div = document.getElementById('content_form')
    div.innerHTML = historyHtml;
    div.scrollTop = div.scrollHeight;
}

function pushOnline(people) {
    var user = $('#username').val();
    var html = '<li class="person active" data-chat="chat_group">' +
        '<img src="/img/group.jpg" alt=""/>' +
        '<span class="name">Group</span>' +
        '<span class="time">2:09 PM</span>' +
        '<span class="preview pp_status"><span class="status away"></span>' +
        '当前在线<b id="people">' + Object.keys(people).length + '</b>人</span>' +
        '<span class="preview new_blink" style="display: none">你有新的消息</span>' +
        '</li>',
        chat = '<div class="chat active-chat" id="content_form" data-chat="chat_group">' +
            '<div class="conversation-start">' +
            '<span>Today, 6:48 AM</span>' +
            '</div>' +
            '</div>';
    Object.keys(people).forEach(function (k) {
        if (k !== user) {
            v = people[k]
            html += '<li class="person" data-chat="p_' + k + '">' +
                '<img src="' + v.avatar + '" alt=""/>' +
                '<span class="name">' + v.name + '</span>' +
                '<span class="time">2:09 PM</span>' +
                '<span class="preview pp_status"><span class="status online"></span>Online</span>' +
                '<span class="preview new_blink" style="display: none">你有新的消息</span>' +
                '</li>';
            chat += '<div class="chat" id="content_form_' + v.name + '" data-chat="p_' + v.name + '">' +
                '<div class="conversation-start">' +
                '<span>Today, 6:48 AM</span>' +
                '</div>' +
                '</div>';
        }

    })
    $('#online').html(html)
    $('#online_chat').html(chat)
    allReady()
}

function peopleEnter(data) {
    var newP = data.name
    var v = data.people[newP]
    var html = $('#online')[0].innerHTML,
        chat = $('#online_chat')[0].innerHTML;
    html += '<li class="person" data-chat="p_' + newP + '">' +
        '<img src="' + v.avatar + '" alt=""/>' +
        '<span class="name">' + v.name + '</span>' +
        '<span class="time">2:09 PM</span>' +
        '<span class="preview">Online</span>' +
        '</li>';
    chat += '<div class="chat" id="content_form_' + v.name + '" data-chat="p_' + v.name + '">' +
        '<div class="conversation-start">' +
        '<span>Today, 6:48 AM</span>' +
        '</div>' +
        '</div>';

    $('#online').html(html)
    $('#online_chat').html(chat)
    allReady()
}

function peopleLeave(data) {
    if ($('#online [data-chat="p_' + data.name + '"] ').hasClass('active')) {
        document.querySelector('.person[data-chat=chat_group]').classList.add('active');
        document.querySelector('.chat[data-chat=chat_group]').classList.add('active-chat');
    }
    $('#online [data-chat="p_' + data.name + '"]').remove();
    $('#online_chat [data-chat="p_' + data.name + '"]').remove();
    //allReady()
}

function getHitory(user) {
    console.log(user)
    ws.send(JSON.stringify({'type': 'history', 'data': {'user': user,}}));

}

function allReady() {
    // document.querySelector('.person[data-chat=chat_group]').classList.add('active');
    // document.querySelector('.chat[data-chat=chat_group]').classList.add('active-chat');
    gotoEnd()
    var friends = {
            list: document.querySelector('ul.people'),
            all: document.querySelectorAll('.left .person'),
            name: ''
        },

        chat = {
            container: document.querySelector('.container .right'),
            current: null,
            person: null,
            name: document.querySelector('.container .right .top .name')
        };


    friends.all.forEach(function (f) {
        f.addEventListener('mousedown', function () {
            f.classList.contains('active') || setAciveChat(f, friends, chat);
        });
    });

}

function setAciveChat(f, friends, chat) {
    friends.list.querySelector('.active').classList.remove('active');
    f.classList.add('active');
    chat.current = chat.container.querySelector('.active-chat');
    chat.person = f.getAttribute('data-chat');
    chat.current.classList.remove('active-chat');
    chat.container.querySelector('[data-chat="' + chat.person + '"]').classList.add('active-chat');
    friends.name = f.querySelector('.name').innerText;
    chat.name.innerHTML = friends.name;
    if (friends.name === 'Group') {
        $('#people').html(friends.all.length)
        $('#online [data-chat="chat_group"] .new_blink').hide()
        $('#online [data-chat="chat_group"] .pp_status').show()
    } else {
        $('#online [data-chat="p_' + friends.name + '"] .new_blink').hide()
        $('#online [data-chat="p_' + friends.name + '"] .pp_status').show()
    }
    // getHitory(friends.name)
    gotoEnd()
}

function gotoEnd() {
    var div = $('.container .right .active-chat')[0];
    div.scrollTop = div.scrollHeight;
}