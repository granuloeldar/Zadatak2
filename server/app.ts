/// <reference path="../typings/main.d.ts" />
import * as express from 'express';
import * as socketIO from 'socket.io';
import * as fs from 'fs';
import { FileDescription } from './model/FileDescription';

const app: express.Application = express();

const server = require('http').Server(app);
const io: SocketIO.Server = socketIO.listen(server);
const constants = require('./constants');

app.use(express.static('./client'));
app.use(express.static('./client/assets/css'));
app.use(express.static('./client/assets/js'));
app.use('/modules', express.static('./node_modules'));

const files: { [id: string]: FileDescription; } = {};

// Socket.io

io.sockets.on('connection', (socket: SocketIO.Socket) => {
    socket.on('Start', (data) => {
        console.log("Upload started...");
        const name: string = data.Name;
        let place: number = 0;

        files[name] = {
            FileSize: data.Size,
            Data: "",
            Downloaded: 0.0
        };

        /**
         * Checking whether a file already exists with the name,
         * loading its' size and progress if it does, else creating a new file
         */
        try {
            fs.stat('server/temp/' + name, (err: Error, stats: fs.Stats) => {
                if (err) {
                    console.log(err);
                    console.log("File does not exist, creating file");
                } else if (stats.isFile()) {
                    files[name].Downloaded = stats.size;
                    place = stats.size / constants.CHUNK_SIZE;
                }
            });
        } catch (err) {
            console.log(err);
        }

        /**
         * Opening a file in append + create mode(a+) with read/write access
         * and storing the file descriptor for further use
         */
        fs.open("server/temp/" + name, "a+", '0666', (err: Error, fd: number) => {
            if (err) {
                console.log(err);
            } else {
                files[name].Handler = fd;
                socket.emit('MoreData', { Place: place, Percent: 0, Name: name });
            }
        });
    });

    /**
     * Handling the socket.io upload event, receives the data(file) in binary string
     * format from the client, determines the progress and checks whether the upload is 
     * finished
     */
    socket.on('Upload', (data) => {
        const name: string = data.Name;
        files[name].Downloaded += data.Data.length;
        files[name].Data += data.Data;
        const Place: Number = files[name].Downloaded / constants.CHUNK_SIZE,
            Percent: Number = (files[name].Downloaded / files[name].FileSize) * 100;
        if (files[name].Downloaded === files[name].FileSize) {
            // The entire file has been sent, write it and copy it to server/files directory
            fs.write(files[name].Handler, files[name].Data, null, 'binary', () => {
                const inputStream: fs.ReadStream = fs.createReadStream('server/temp/' + name),
                    outputStream: fs.WriteStream = fs.createWriteStream('server/files/' + name);
                inputStream.pipe(outputStream);

                // Upon closing of input stream, close and unlink the temporary file
                inputStream.on('end', () => {
                    fs.close(files[name].Handler, () => {
                        fs.unlink('server/temp/' + name, (err: Error) => {
                            if (err) {
                                throw err;
                            }
                            console.log('File deleted!');
                        });
                    });
                });
                // Emit a done event to alert the user 
                socket.emit('Done', { Path: 'server/files/' + name });
            });
        } else if (files[name].Data.length > constants.BUFFER_LIMIT) {
            // The buffer limit has been reached, data should be written to file
            fs.write(files[name].Handler, files[name].Data, null, 'binary', () => {
                files[name].Data = "";
                // Request a new chunk of data
                socket.emit('MoreData', { Place: Place, Percent: Percent, Name: name });
            });
        } else {
            // Buffer limit not reached, request new chunk of data
            socket.emit('MoreData', { Place: Place, Percent: Percent, Name: name });
        }
    });
});

app.get('/api/hello', function(request: express.Request, response: express.Response) {
    let dummy: string = '{"text": "dummy text", "text1" : "other text"}';
    response.send(JSON.parse(dummy).text + " " + JSON.parse(dummy).text1);
});

server.listen(3000, () => {
    console.log('Server started at localhost:3000');
});