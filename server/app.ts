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
app.use('/config_scripts', express.static('./client/assets/js/angular_config'));
app.use('/dist', express.static('./client/app'));
app.use('/rxjs_temp', express.static('./node_modules/rxjs'));

const files: { [id: string]: FileDescription; } = {};

// Socket.io

io.sockets.on('connection', (socket: SocketIO.Socket) => {
    socket.on('Start', (data) => {
        console.log("Upload started...");
        const name: string = data.name;
        let place: number = 0;
        let percent: number = 0;

        if (!data.Restart) {
            files[name] = {
                FileSize: data.size,
                Data: "",
                Downloaded: 0.0,
                Paused: false
            };
        }
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
                    percent = (files[name].Downloaded / files[name].FileSize) * 100;
                    files[name].Paused = false;
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
                socket.emit('MoreData', { place: place, percent: percent, name: name });
            }
        });
    });

    /**
     * Handling the socket.io upload event, receives the data(file) in binary string
     * format from the client, determines the progress and checks whether the upload is 
     * finished
     */
    socket.on('Upload', (data) => {

        try {
            const name: string = data.name;
            files[name].Downloaded += data.data.length;
            files[name].Data += data.data;
            const Place: Number = files[name].Downloaded / constants.CHUNK_SIZE,
                Percent: Number = (files[name].Downloaded / files[name].FileSize) * 100;
            if (files[name].Paused) return;
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
                                // Emit a done event to alert the user 
                                socket.emit('Done', { path: 'server/files/' + name, name: name });
                            });
                        });
                    });

                });
            } else if (files[name].Data.length > constants.BUFFER_LIMIT) {
                // The buffer limit has been reached, data should be written to file
                fs.write(files[name].Handler, files[name].Data, null, 'binary', () => {
                    files[name].Data = "";
                    // Request a new chunk of data
                    socket.emit('MoreData', { place: Place, percent: Percent, name: name });
                });
            } else {
                // Buffer limit not reached, request new chunk of data
                socket.emit('MoreData', { place: Place, percent: Percent, name: name });
            }
        } catch (exception) {
            console.log("Exception happened " + exception);
        }
    });

    socket.on('Pause', (data) => {
        files[data.name].Paused = true;
        fs.write(files[data.name].Handler, files[data.name].Data, null, 'binary', () => {
            files[data.name].Data = "";
        });
    });

    socket.on('Cancel', (data) => {
        fs.unlink('server/temp/' + data.name, (err: Error) => {
            if (err) {
                throw err;
            }
            console.log('File deleted due to cancel!');
            // Emit a done event to alert the user 
            socket.emit('Cancelled', { name: data.name });
        });
    });

    socket.on('Save', (data) => {
        Object.keys(files).forEach((key) => { 
            fs.write(files[key].Handler, files[key].Data, null, 'binary', () => {
                files[key].Data = "";
            });
        });
    });

});

server.listen(3000, () => {
    console.log('Server started at localhost:3000');
});