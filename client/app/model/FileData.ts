import { SocketService } from '../services/socket-service.service';
/**
 * Interface that contains a file object and current progress in downloading that file
 */
export class FileData {
    file: File;
    progress: number;
    fileReader: FileReader;
    paused: boolean;

    constructor(file: File, _progress: number, private socketService: SocketService) {
        this.file = file;
        this.progress = _progress;
        this.fileReader = new FileReader();
        this.paused = false;
        this.fileReader.onload = ((event: ProgressEvent) => {
            this.socketService.emit('Upload', { name: this.file.name, data: (event.target as FileReader).result });
        }).bind(this);
    }
}