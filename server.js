var express = require('express'),
    socketio = require('socket.io'),
    http = require('http'),
    path = require('path');
 
var app = express();

// Configuration


app.configure(function(){
    app.use(express.static(__dirname + '/public'))
    app.set('port', process.env.PORT || 80);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
    res.send('/public/index.html');
});

var server = http.createServer(app).listen(app.get('port'),null);                      //   Replace null by your IP address in single quotes to host
var io = socketio.listen(server);


io.configure(function() {
    io.enable('browser client minification');
    io.set('log level', 1);
});

var users = {
    names: [],
    nicks: []
};
var nicknames=[];

function ChatMaker() {
     this.names=[],
     this.nicks=[] 
};

io.sockets.on('connection', function(client) {
    users.names.push(client.id);
    console.log('+ User id'+ client.id  +' connected ('+ client.handshake.address.address +'). Total users: '+ users.names.length );
    client.emit("userid",{id:client.id});
    client.on("nick",function(data) {
        if(data.nick.length) {
            if(users.nicks.indexOf(data.nick) != -1) {
                io.sockets.emit("error",2);
            }
            else {
               users.nicks.push(data.nick);
               console.log('new'+data.nick+'user connected');
               io.sockets.emit("users", { users: users.nicks});
           }
        }   
        else io.sockets.emit("error",1);
    });

    client.on("chat", function(data) {
        io.sockets.emit("chat", { from: users.nicks[users.names.indexOf(client.id)], msg: data.msg });
    });

/*
    client.on("newroom",function(data) {
        var chatname = 'chat'+users.names.indexOf(client.id);
        eval(chatname + "mem= new ChatMaker();");


        eval(chatname + "mem.names.push(client.id)");

        console.log(client.id + 'made a new room');
        console.log(eval(chatname+ "mem.names.length") + 'members');
     
    })*/
    client.on("private", function(data) {
       io.sockets.socket(users.names[users.nicks.indexOf(data.to)]).emit("private", { from: users.nicks[users.names.indexOf(client.id)], to: data.to, msg: data.msg });
    });

    client.on('disconnect', function() {
        var length = users.names.length;
        for(var i = 0; i < length; i++) {
            if (users.names[i] === client.id) {
                users.names.splice(i, 1);
                users.nicks.splice(i , 1);
                break;
            }
        }

        io.sockets.emit("users", { users: users.nicks });
        console.log('- User '+ client.id +' disconnected ('+ client.handshake.address.address +'). Total users: '+ users.names.length );
    });
});
