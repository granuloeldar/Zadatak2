import {SocketService} from '../services/socket-service.service';
/**
 * Interface that contains a file object and current progress in downloading that file
 */
export class FileData {
    File: File;
    Progress: number;
    FileReader: FileReader;
    Paused: boolean;

    constructor(file: File, progress: number, private socketService: SocketService) {
        this.File = file;
        this.Progress = progress;
        this.FileReader = new FileReader();
        this.Paused = false;
        this.FileReader.onload = ((event: ProgressEvent) => {
            this.socketService.emit('Upload', { Name: this.File.name, Data: (event.target as FileReader).result });
        }).bind(this);
    }
}