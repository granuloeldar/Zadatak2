import {Injectable} from 'angular2/core';
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";

export interface ISocketData {
    Percent: number;
    Place: number;
}
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

    /**
     * Track Progress of upload
     *
     * @returns {any}
     */
    public progress(namespace: string): Observable<ISocketData> {

        return Observable.create((observer: Observer<ISocketData>) => {

            this.socket.on(namespace, (data: ISocketData) => {

                observer.next(data);
            });

        });
    }

    public emit(event: string, data) {
		this.socket.emit(event, data);
    }

    public getSocket(): SocketIOClient.Socket {
        return this.socket;
    }
}