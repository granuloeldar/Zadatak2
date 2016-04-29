import {SocketService} from '../services/SocketService';
/**
 * Interface that contains a file object and current progress in downloading that file
 */
export class IFileData {
    File: File;
    Progress: number;
    FileReader: FileReader;

    constructor(file: File, progress: number, fileReader: FileReader, private socketService: SocketService) {
        this.File = file;
        this.Progress = progress;
        this.FileReader = fileReader;
        this.FileReader.onload = ((event: ProgressEvent) => {
            console.log('UČITAVAM FAJL U FAJL READER POD IMENOM: ' + this.File.name);
            this.socketService.emit('Upload', { Name: this.File.name, Data: (event.target as FileReader).result });
        }).bind(this);
    }
}