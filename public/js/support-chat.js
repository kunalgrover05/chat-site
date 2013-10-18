$(document).ready(function() {
    var socket = new io.connect('/');
    var chat_id='',
        chat_id0='',
        chat_id1='';
    var Chat = $("#Chat"),
        messagesWr = Chat.find("#messages"),
        messages = Chat.find("#messages ul"),
        chatInput = Chat.find("#chatInput"),
        status = Chat.find("#status"),
        nick = Chat.find("#nick");
        users = Chat.find("#users ul"),
        online = Chat.find("#online"),
        total = Chat.find("#total"),
        selected = Chat.find("#selected"),
        broadcast = Chat.find("#broadcast"),
        name = prompt('Enter your name');
        userId = ''

/*$(enter).on('click',function() {
   $('body').append('<div class="overlay" id="blurred"></div>');
   $("#dialog").dialog();
   //$('#blurred').append('<div class="username"><input type="text"/></div>');
});
  */  
  init();


    function init() {
        chatInput.focus();
        chatInput.keydown(function(e) {
            if (e.keyCode == 13) { // Enter
                if (chatInput.val()) {
                   socket.emit("chat", { msg: chatInput.val() });
                   chatInput.val('');
                }
            }
        });

        broadcast.on('click', function() {
            selected.html('broadcast');
            chatInput.focus();
        });
    }

    function private_chat() {
        $(chat_id).keydown(function(e) {
            if (e.keyCode == 13) {
            if ($(chat_id).val()) {
                socket.emit("private", { msg: $(chat_id).val(), to: chat_id1 });
                var currentDate = new Date(),
                    time = pad(currentDate.getHours()) +":"+ pad(currentDate.getMinutes()); //+":"+ pad(currentDate.getSeconds());
                $(chat_id0).append('<li><i>' + $(chat_id).val() + '</i><div class=chatTime>at '+time+' </div></li>');
                $(chat_id).val('');
            }
            }
        });
       $(chat_id1).prop('scrollTop', $(chat_id1).prop('scrollHeight'));
    }

    function params(data) {
        selected.html(data);
        chat_id1 = data;
        chat_id0 = '#' + chat_id1 + 'chat';
        chat_id =  '#' + chat_id1 + 'chatsend' ;
    }


    // If n < 10, add a leading 0
    function pad(n) {
      return ( n<10 ? '0'+ n : n);
    }

   

    
    socket.on('connect', function() {
        status.html("Connected.");
        socket.emit("nick", { nick: name});
        nick.html("Hi "+ name);
    });

    socket.on('userid',function(data) {
        userId = data.id;
    });
    socket.on('disconnect', function() {
        status.html("Disconnected.");
    });

    socket.on('users', function(data) {
        users.html('');
        data.users.forEach(function(nickname) {
            users.append('<li><a class="userNick" title="'+ (nickname == name ? "That's you!" : "Talk to " + nickname) +'">'+ nickname +'</a></li>');
        });
        total.html(data.users.length);
        $('.userNick').on("click", function() {
            if ($(this).text() != userId) {
                selected.html($(this).text());
            }
            chat_id1 = $(this).text();
            chat_id0 = '#' + $(this).text() + 'chat';
            chat_id =  '#' + $(this).text() + 'chatsend' ;
            if($(chat_id0).length <= 0) {
                $('body').append('<div class="PrivateChat" id="'+$(this).text()+'chat"> Chat with <b>'+chat_id1+'</b></div>'); 
                $(chat_id0).draggable();
                $(chat_id0).append('<input type="text"  id="'+$(this).text()+'chatsend" maxlength="200" value="" />');
                $(chat_id).click(function() {
                    params(this.id.replace('chatsend',''));
                    private_chat();
            });  
            }
        $(chat_id).focus();
        private_chat();
        });
    });
            


    socket.on('chat', function(data) {
       var currentDate = new Date(),
            time = pad(currentDate.getHours()) +":"+ pad(currentDate.getMinutes()); //+":"+ pad(currentDate.getSeconds());
        messages.append('<li>'+data.from +' says '+ '<b>'+data.msg+'</b>' +'<div class=chatTime>at '+time+' </div></li>');
        messagesWr.prop('scrollTop', messagesWr.prop('scrollHeight'));
        });



    socket.on('private', function(data) {
        chat_id1 = data.from;
        chat_id0 = '#' + chat_id1 + 'chat';
        chat_id =  '#' + chat_id1 + 'chatsend' ;
        
        if($('#'+data.from+'chat').length <= 0) {
            $('body').append('<div class="PrivateChat" id="'+data.from+'chat"> Chat with</div>'); 
            $(chat_id0).draggable();
            $('#'+data.from+'chat').append('<input type="text" id="'+data.from+'chatsend" maxlength="200" value="" />');
            $(chat_id).on("click",function() {
                params(this.id.replace('chatsend',''));
                private_chat();
            });  
        }
        var currentDate = new Date(),
            time = pad(currentDate.getHours()) +":"+ pad(currentDate.getMinutes()); //+":"+ pad(currentDate.getSeconds());
        
        $(chat_id0).append('<li><b>'+data.msg+'</b><div class=chatTime>at '+time+' </div></li>');
        selected.html(data.from);
        $(chat_id).focus();
        private_chat();
        


        ////messages.append('<li>'+ time +'] <em><strong>'+ data.from +'</strong>: '+ data.msg +'</em></li>');
       // messagesWr.prop('scrollTop', messagesWr.prop('scrollHeight'));
        });
});
