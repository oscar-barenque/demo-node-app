var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.Promise = Promise;

var dbUrl = 'mongodb://user:password@localhost:27017/demoapp';

var Message = mongoose.model('Message', {
    name: String,
    message: String
});

/**
var messages = [
    { name: 'Tim', message: 'Hi' },
    { name: 'Jane', message: 'Hello' }
];
**/
app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });
});

app.post('/messages', async (req, res) => {
    try {
        var message = new Message(req.body);
        var saveMessage = await message.save()
        console.log('saved');
        var censored = await Message.findOne({ message: 'badword' });
        if (censored) {
            await Message.remove({ _id: censored.id });
        } else {
            io.emit('message', req.body)
        }
        res.sendStatus(200);
    } catch (error) {
        res.send(500);
        return console.error(error);
    } finally {
        console.log('message post called')
    }
});

app.get('/messages/:user', (req, res) => {
    var user = req.params.user;
    Message.find({ name: user }, (err, messages) => {
        res.send(messages);
    });
});

io.on('connection', (socket) => {
    console.log('a user connected')
});

mongoose.connect(dbUrl, (err) => {
    console.log('mongo db connection', err);
});

var server = http.listen(3000, () => {
    console.log(`server is listening on port ${server.address().port}`)
});