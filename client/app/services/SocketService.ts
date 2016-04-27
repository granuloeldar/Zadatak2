import {Injectable} from 'angular2/core';

@Injectable()
export class SocketService {
    socket: SocketIOClient.Socket;

    constructor() {
        this.socket = io.connect("localhost:3000");
    }

    public setCallbacks(onMoreData, onDone) {
		this.socket.on('MoreData', onMoreData);
        this.socket.on('Done', onDone);
    }

    public emit(event: string, data) {
		this.socket.emit(event, data);
    }

    public getSocket(): SocketIOClient.Socket {
        return this.socket;
    }
}