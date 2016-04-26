/// <reference path="../typings/main.d.ts" />
import * as express from 'express';
import * as socketIO from 'socket.io';
import * as fs from 'fs';
import { FileDescription } from './model/FileDescription';

const app: express.Application = express();

const server = require('http').Server(app);
const io = socketIO.listen(server);
const constants = require('./constants');

app.use(express.static('./client'));
app.use(express.static('./client/assets/css'));
app.use(express.static('./client/assets/js'));

let files: { [id: string]: FileDescription; } = {};

// Socket.io

io.sockets.on('connection', function(socket) {
    socket.on('Start', function(data) {
        console.log("Upload started...");
        let name: string = data.Name;
        let place: Number = 0;
        console.log(data.Size);
        files[name] = {
            FileSize: data.Size,
            Data: "",
            Downloaded: 0.0
        };
        try {
            fs.stat('server/temp/' + name, function(err, stats) {
                if (err) {
                    console.log(err);
                } else if (stats.isFile()) {
                    files[name].Downloaded = stats.size;
                    place = stats.size / constants.CHUNK_SIZE;
                }
            });
        } catch (err) {
            console.log(err);
        }
        fs.open("server/temp/" + name, "a+", '0666', function(err, fd) {
            if (err) {
                console.log(err);
            } else {
                files[name].Handler = fd;
                socket.emit('MoreData', { Place: place, Percent: 0 });
            }
        });
    });

    socket.on('Upload', function(data) {
        let name: string = data.Name;
        let Place: Number = files[name].Downloaded / constants.CHUNK_SIZE;
        let Percent: Number = (files[name].Downloaded / files[name].FileSize) * 100;
        files[name].Downloaded += data.Data.length;
        files[name].Data += data.Data;
        if (files[name].Downloaded === files[name].FileSize) {
            console.log("File succesfully uploaded!");
            fs.write(files[name].Handler, files[name].Data, null, 'binary', function() {
                // premještamo file i uklanjamo stari iz temp direktorija
                let inputStream = fs.createReadStream('server/temp/' + name),
                    outputStream = fs.createWriteStream('server/files/' + name);
                inputStream.pipe(outputStream);
                inputStream.on('end', function() {
                    fs.close(files[name].Handler, function() {
                        fs.unlink('server/temp/' + name, function(err) {
                            if (err) {
                                throw err;
                            }
                            console.log('File deleted!');
                        });
                    });
                });
                socket.emit('Done', { Path: 'server/files/' + name });
            });
        } else if (files[name].Data.length > constants.BUFFER_LIMIT) {
            fs.write(files[name].Handler, files[name].Data, null, 'binary', function() {
                files[name].Data = "";
                socket.emit('MoreData', { Place: Place, Percent: Percent });
            });
        } else {
            socket.emit('MoreData', { Place: Place, Percent: Percent });
        }
    });
});

app.get('/api/hello', function (request: express.Request, response: express.Response) { 
    let dummy: string = '{"text": "dummy text", "text1" : "other text"}';
    response.send(JSON.parse(dummy).text + " " +  JSON.parse(dummy).text1);
});

server.listen(3000, () => {
    console.log('Server started at localhost:3000');
});