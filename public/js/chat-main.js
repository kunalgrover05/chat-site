function make_chat_box(data) {
    $('#chatarea').append('<div class="PrivateChatBox" id="'+chat_name+'chat"><div class="bubbleHeader">Chat with<b> '+chat_name+'</b><a href="#"><div id="'+chat_name+'hide" class="hideit">Hide</div></a><a href="#"><div id="'+chat_name+'block" class="blockit">Block</div></a></div></div>');
                $(chat_id).append('<div class="chatline" id="'+data+'list"></div>');              
                $(chat_id).append('<input type="text" class="entermsg" id="'+chat_name+'send">');
                
                $(chat_sendbox).click(function() {
                    set_params(this.id.replace('send',''));
                    private_chat();
                }); 
                $('#'+chat_name+'hide').click(function() {
                    set_params(this.id.replace('hide',''));
                    $(chat_id).hide();
                });


                $('#'+chat_name+'block').click(function() {
                    set_params(this.id.replace('block',''));
                    if(typeof blockuser=='undefined') {
                        blockuser=[];
                    }
                    if($('#'+chat_name+'block').text() == "Unblock") {
                        $('#'+chat_name+'block').text("Block");
                        blockuser.splice(blockuser.indexOf(chat_name, 1));
                    }
                    else {
                        $('#'+chat_name+'block').text("Unblock");
                        blockuser.push(chat_name);
                        $(chat_id).hide();
                    }
                    return false;
                });
                


}

function init() {
        $(chatInput).focus();
        $(chatInput).keydown(function(e) {
            if (e.keyCode == 13) { // Enter
                if ($(chatInput).val()) {
                   socket.emit("chat", { msg: $(chatInput).val() });
                   $(chatInput).val('');
                }
            }
        });

        $(chatInput).on('click', function() {
            $(selected).html('broadcast');
        });
    }

    function private_chat() {
        $(chat_sendbox).keydown(function(e) {
            if (e.keyCode == 13) {
            if ($(chat_sendbox).val()) {
                socket.emit("private", { msg: $(chat_sendbox).val(), to: chat_name });
                var currentDate = new Date(),
                    time = pad(currentDate.getHours()) +":"+ pad(currentDate.getMinutes()); //+":"+ pad(currentDate.getSeconds());
                    //<textarea class="area" id="'+data+'send" rows="4" cols="28"></textarea>
              //  $(chat_listbox).append('<li><i>' + $(chat_sendbox).val() + </i><div class=chatTime>at '+time+' </div></li>');
                $(chat_listbox).append('<div class="newmess"><b><div class = "mess" style="font-weight: lighter">'+$(chat_sendbox).val()+'</div></b>' +'<div class="chatTime">'+time+' </div></div>');
                $(chat_listbox).prop('scrollTop', $(chat_listbox).prop('scrollHeight'));
                $(chat_sendbox).val('');
                $(".mess").linkify();
                emoticonize(mess);
            }
            }
        });
    }

    function set_params(data) {
        $(selected).html(data);
        chat_name = data;
        chat_id = '#' + chat_name + 'chat';
        chat_sendbox =  '#' + chat_name + 'send' ;
        chat_listbox = '#' + chat_name + 'list';
    }


    function pad(n) {
      return ( n<10 ? '0'+ n : n);
    }


function chat_ready() {
    setCookie("user",name,10);
    socket = new io.connect('/');
    
    socket.on('connect', function() {
        socket.emit("nick", { nick: name});
        $(nick).html("Hi "+ name);
        $(conn_status).replaceWith("Connected.");
    });

  /*  socket.on('error',function(data) {
        if (data == 1) {
            logOut();
        }
        else if (data ==2 ) {
            $(".blackout").fadeIn(500);
            $("#alerts3").fadeIn();
            setTimeout(function(){logOut(); },1500);
            }
            
             

    });*/

    socket.on('userid',function(data) {
        userId = data.id;
    });
    socket.on('disconnect', function() {
        $(".blackout").fadeIn(500);
        $("#alerts4").fadeIn(500);
        setTimeout(function() {
            logOut(); 
            }, 1500);
    });

    socket.on('users', function(data) {
        $(userlist).html('');
        usersol = [];
        data.users.forEach(function(nickname) {
            if(nickname !=name) {
                $(userlist).append('<a href="#" title="Talk to ' + nickname +'"><div class="usernick">'+ nickname +'</div></a>');
                usersol.push(nickname);
            } 
        });

        $( "#usersearch" ).autocomplete({
            source: usersol,
            select: function(event, ui) {
                set_params(ui.item.value);
                if($(chat_id).length <= 0) {
                    make_chat_box(chat_name);
                }
                $(chat_id).show();
                $(chat_sendbox).focus();
                private_chat();
                return false; 
            }
        })  ;
       
        $(total).html(data.users.length-1);
        $('.usernick').on("click", function() {
            set_params($(this).text());
            if($(chat_id).length <= 0) {
                make_chat_box(chat_name);
            }
            $(chat_id).show();
        $(chat_sendbox).focus();
        private_chat();
        return false;
        });
    });
            



    socket.on('chat', function(data) {
       var currentDate = new Date(),
            time = pad(currentDate.getHours()) +":"+ pad(currentDate.getMinutes()); //+":"+ pad(currentDate.getSeconds());
        $(messages).append('<div class="newmess"><div class="sender">'+data.from +' says </div>'+ '<b><div class = "mess">'+data.msg+'  </div></b>' +'<div class="chatTime">at '+time+' </div></div>');
        $(messages).prop('scrollTop', $(messages).prop('scrollHeight'));
        $(".mess").linkify();
       // $('.mess').emoticonize();
       emoticonize();
        });


    socket.on('private', function(data) {
        if(typeof blockuser=='undefined') {
            blockuser=[];
        }
        set_params(data.from);
        var currentDate = new Date(),
            time = pad(currentDate.getHours()) +":"+ pad(currentDate.getMinutes()); 
        
        if($(chat_id).length <= 0) {
            make_chat_box(chat_name);
        }
        if( blockuser.indexOf(data.from) != -1 ) {
             $(chat_id).hide();
             $(chat_listbox).append('<div class="newmess"><div class = "mess" style="color:#f00; font-weight: bold">'+data.msg+'</div>' +'<div class="chatTime">'+time+' </div></div>');
         }
         else {
            $(chat_id).show();
            $(chat_listbox).append('<div class="newmess"><div class = "mess" style="font-weight: bold">'+data.msg+'</div>' +'<div class="chatTime">'+time+' </div></div>');
         }
       
        
        
        $(chat_listbox).prop('scrollTop', $(chat_listbox).prop('scrollHeight'));
        $(".newmess").linkify();
        emoticonize(newmess);
        //$('.newmess').emoticonize();
        $(selected).html(chat_name);
        $(chat_sendbox).focus();
        private_chat();
        return false;

        });

  init();    

}
   
function setCookie(c_name,value,exdays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) { 
        c_value = null;
    }
    else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
    }
    return c_value;
}

function checkCookie() {
var username=getCookie("user");

  if (username != null && username.length) { 
    entername = username; 
    chat_ready();
  }
else {
  strtBlackout();
  }
}

function toggle() {
   $("#MainChat").toggle();
} 

function showall() {
    
}

$(document).ready(function() {
    var userId = '';
    var socket;
    checkCookie();
    var usersol=[];
    var blockuser=[];
/*$(gen).on('click',function() {
    var new_room = prompt('Enter name for new chatroom');
    var isPublic = confirm('Want room to be public?');
    alert(isPublic);
    socket.emit("newroom",{name: new_room , type:isPublic});
}
  $('body').append('<div class="overlay" id="blurred"></div>');
   $("#dialog").dialog();
   $('#blurred').append('<div class="username"><input type="text"/></div>');
);

socket.on('new_room_made', function(data) {
    
});*/  

});
