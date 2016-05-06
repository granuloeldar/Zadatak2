import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import 'rxjs/add/operator/share';
import {FileData} from '../model/FileData';
import {SocketService} from './socket-service.service';
import {CHUNK_SIZE} from '../constants';


@Injectable()
export class FileService {

    files$: Observable<{ [id: string]: FileData }>;
    private filesObserver: Observer<{ [id: string]: FileData }>;
    private dataStore: {
        files: { [id: string]: FileData }
    };

    constructor(private socketService: SocketService) {
        this.dataStore = { files: {} };
        this.files$ = new Observable(observer => this.filesObserver = observer).share();
    }

    addFiles(fileList: FileList, socketService: SocketService, uploadImmediately: boolean) {
        Array.from(fileList)
            .map((file) => {
                this.dataStore.files[file.name] = new FileData(file, 0.0, new FileReader(), socketService);
                if (uploadImmediately) this.socketService.emit('Start', { Name: file.name, Size: file.size });
            });
        this.filesObserver.next(this.dataStore.files);
    }

    removeFile(fileName: string) {
        delete this.dataStore.files[fileName];
        this.filesObserver.next(this.dataStore.files);
    }

    setFileProgress(fileName: string, progress: number) {
        this.dataStore.files[fileName].Progress = progress;
        this.filesObserver.next(this.dataStore.files);
    }

    setFilePaused(fileName: string, paused: boolean) {
        this.dataStore.files[fileName].Paused = paused;
        this.filesObserver.next(this.dataStore.files);
        if (paused) {
            this.socketService.emit('Pause', { Name: fileName });
        }
    }

    readNewFile(fileName: string, place: number) {
        place = place * CHUNK_SIZE;
        let fileData: File = this.dataStore.files[fileName].File;
        const newFile: Blob = fileData.slice(place, place + Math.min(CHUNK_SIZE, (fileData.size - place)));
        this.dataStore.files[fileName].FileReader.readAsBinaryString(newFile);
    }

    restartFileUpload(fileName: string) {
        this.setFilePaused(fileName, false);
        this.socketService.emit('Start', { Name: fileName, Size: this.dataStore.files[fileName].File.size });
    }

    cancelFileUpload(fileName: string) {
        this.socketService.emit('Cancel', { Name: fileName });
    }

    startAllFileUploads() {
        for (const key in this.dataStore.files) {
            this.socketService.emit('Start', { Name: this.dataStore.files[key].File.name, Size: this.dataStore.files[key].File.size, Restart: false });
        }
    }

    isUploadComplete() {
        let completeCount: number = 0;
        for (const item in this.dataStore.files) {
            if (this.dataStore.files[item].Progress == 100) completeCount++;
        }
        return completeCount == Object.keys(this.dataStore.files).length;
    }

    isFilesEmpty() {
        return Object.keys(this.dataStore.files).length == 0;
    }

    clearFiles() {
        this.dataStore.files = {};
        this.filesObserver.next(this.dataStore.files);
    }
}

