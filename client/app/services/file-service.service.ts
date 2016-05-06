import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import 'rxjs/add/operator/share';
import {FileData} from '../model/FileData';
import {SocketService} from './socket-service.service';
import {CHUNK_SIZE} from '../constants';


@Injectable()
export class FileService {

    files$: Observable<File>;
    private filesObserver: Observer<File>;

    constructor(private socketService: SocketService) {
        this.files$ = new Observable(observer => this.filesObserver = observer).share();
    }

    addFiles(fileList: FileList, socketService: SocketService) {
        Array.from(fileList)
            .map((file) => {
                this.filesObserver.next(file);
            });
    }
}

