'use strict';

var http = require('http'),
    net = require('net');


var config = {
    port: process.env.port || 3128,
};


// Create server
var server = http.createServer();

// Accept client
server.on('connect', function(req, socket, head) {
    parseTarget(req.url, function(err, target) {
        if (err) {
            console.error(err);
            return socket.end();
        }

        console.log('connect to %s, port %d', target.hostname, target.port);
        var proxy_socket = net.Socket();
        proxy_socket.connect(target.port, target.hostname);

        socket.write('HTTP/1.1 200 Connection established\r\n\r\n');
        proxy_socket.write(head);

        socket.pipe(proxy_socket).pipe(socket);
    });
});

server.listen(config.port, function(err) {
    if (err) console.error('cannot start proxy');

    console.log('proxy listening at port %d', config.port);
});


////////////

function parseTarget(url, callback) {
    if (!url) return callback('No URL found');

    var part = url.split(':');
    if (part.length !== 2) {
        return callback('Cannot parse target: ' + url);
    }

    var hostname = part[0],
        port = parseInt(part[1]);

    if (!hostname || !port) {
        return callback('Cannot parse target (2): ' + url);
    }

    callback(null, {
        hostname: hostname,
        port: port,
    });
}