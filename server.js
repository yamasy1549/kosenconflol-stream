var fs = require('fs');
var http = require('http');
var url = require('url');
var twitter = require('twitter');

var html = fs.readFileSync('index.html');
var css = fs.readFileSync('./styles/style.css');
var png = fs.readFileSync('./images/logo.png');

var app = http.createServer(function(req, res) {
    if(req.url == "/styles/style.css") {
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end(css);
    } else if(req.url == "/images/logo.png") {
        res.writeHead(200, {'Content-Type': 'image/png'});
        res.end(png);
    } else if(req.url == "/styles/style.css.map") {
        // なんかせなあかんねやろけどわからん
    } else if(req.url == "/favicon.ico") {
        // なんかせなあかんねやろけどわからん
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    }
});

var socketIo = require('socket.io');
var io = socketIo(app);
var streaming = false;

var client = new twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

function startStream() {
    trackName = 'android';
    client.stream('statuses/filter', { track : trackName }, function(stream) {
        streaming = true;

        stream.on('data', function(data) {
            var text = data.text;
            var id = data.id;
            console.log(id);
            console.log(text);
            console.log("====================");
            // textがundefinedのときがあって落ちる
            io.emit('msg', text.substring(0, 33));
            // io.emit('msg', text);
        });
        stream.on('error', function(e) {
            streaming = false;
            startStream();
            console.error(e);
        });
    });
}

app.listen(process.env.PORT || 9000);
io.on('connection', function() {
    if (!streaming) {
        startStream();
    }
});
