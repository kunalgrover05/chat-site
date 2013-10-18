var express = require('express'),
    socketio = require('socket.io'),
    http = require('http'),
    path = require('path'),
    stylus = require('stylus'),
    nib = require('nib') ;
 
var app = express();

// Configuration

  function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

app.configure(function(){
    app.use(express.static(__dirname + '/public'))
    app.set('port', process.env.PORT || 80);
    //app.set('view engine', 'jade');
    //app.set('views', __dirname + '/views');
    /*app.use(stylus.middleware({
         src: __dirname + '/public'
        , compile: compile
    }
    ));*/
   // app.use(express.favicon());
   // app.use(express.logger('short'));
   // app.use(app.router);
   // app.use(express.static(path.join(__dirname, 'public')));
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


var server = http.createServer(app).listen(app.get('port'),'10.22.26.194');
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

io.sockets.on('connection', function(client) {
    users.names.push(client.id);
    console.log('+ User id'+ client.id  +' connected ('+ client.handshake.address.address +'). Total users: '+ users.names.length );
    client.emit("userid",{id:client.id});
    client.on("nick",function(data) {
        users.nicks.push(data.nick);
        console.log(data.nick+' user connected');
        io.sockets.emit("users", { users: users.nicks});
    });

    client.on("chat", function(data) {
        io.sockets.emit("chat", { from: users.nicks[users.names.indexOf(client.id)], msg: data.msg });
    });

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
