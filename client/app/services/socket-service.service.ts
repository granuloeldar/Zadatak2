import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

import { SocketData } from "../model/SocketData";

/**
 * An injectable service wrapped in observable that handles socket.io connections
 * and callbacks
 */
@Injectable()
export class SocketService {
    socket: SocketIOClient.Socket;

    constructor() {
        this.socket = io.connect("localhost:3000");
    }

    /**
     * Track Progress of upload
     *
     * @returns {any}
     */
    public progress(namespace: string): Observable<SocketData> {

        return Observable.create((observer: Observer<SocketData>) => {

            this.socket.on(namespace, (data: SocketData) => {

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