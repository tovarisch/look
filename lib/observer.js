var connect         = require('connect'),
    connectRoute    = require('connect-route'),
    http            = require('http'),
    IO              = require('socket.io'),
    Receiver        = require('./receiver'),
    rewrite         = function(req, res, next) {
        req.url = '/';
        next();
    },
    Observer;

Observer = function Observer (port, host) {
    port = port || 3131;
    host = host || '0.0.0.0';

    var receiver    = new Receiver(),
        observer    = this,
        app         = connect(),
        server      = http.createServer(app),
        io          = IO.listen(server, { log: false });
    
    this.receiver   = receiver;
    this.listeners  = [];

    app.use(connectRoute(function(router) {
        router.get('/metrics', rewrite);
        router.get('/transactions', rewrite);
        router.get('/cpu', rewrite);
        router.get('/memory', rewrite);
    }));

    app.use(connect.static(__dirname + '/web'));

    console.log('Profiler listening on ' + host + ':' + port);

    server.listen(port, host);


    io.sockets.on('connection', function (socket) {
        socket.on("command", function (data) {
            observer.listeners.forEach(function (callback) {
                callback(data);
            });
        });

    	receiver.addSocket(socket);
    });

    process.on('message', function (data) {
    	receiver.send(data);
    });
};

Observer.prototype.send = function (data) {
    this.receiver.send(data);
};

Observer.prototype.listen = function (callback) {
    this.listeners.push(callback);
};

module.exports = Observer;

