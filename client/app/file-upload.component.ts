import {Component} from 'angular2/core';
import {NgForm, CORE_DIRECTIVES}    from 'angular2/common';
import {SocketService, ISocketData} from './services/SocketService';
import {Progress} from './custom_components/progress.directive';
import {Bar} from './custom_components/bar.component';
import {Progressbar} from './custom_components/progressbar.component';
import {CHUNK_SIZE} from './constants';


/**
 * Component that handles file upload via socket.io,
 * displays and tracks progress of the upload
 */
@Component({
  selector: 'file-upload',
  templateUrl: 'app/templates/file-upload.component.html',
  providers: [SocketService],
  directives: [Progress, Bar, Progressbar, CORE_DIRECTIVES]
})
export class FileUploadComponent {

  progress: number = 0.0;
  fileToUpload: File = null;
  fileReader: FileReader = null;
  fileName: string = "";
  uploadStarted: boolean = false;

  constructor(private socketService: SocketService) {

    socketService
      .progress("MoreData")
      .subscribe((data: ISocketData) => {

        if (this.fileToUpload != null) {
          this.progress = data.Percent;
          const place: number = data.Place * CHUNK_SIZE,
                newFile: Blob = this.fileToUpload.slice(place, place + Math.min(CHUNK_SIZE, (this.fileToUpload.size - place)));
          this.fileReader.readAsBinaryString(newFile);
        }

      });
    
    socketService
      .progress("Done")
      .subscribe(() => {
        this.progress = 100;
        alert('File successfully uploaded!');
        this.uploadStarted = false;
        this.fileToUpload = null;
        this.fileReader = null;
        this.fileName = "";
        this.progress = 0.0;
      });
  }

  startUpload() {
    if (this.fileToUpload != null) {
        this.fileReader = new FileReader();
        this.fileName = this.fileToUpload.name;
        this.fileReader.onload = this.onFileReaderLoad.bind(this);
        this.socketService.emit('Start', { Name: this.fileName, Size: this.fileToUpload.size });
        this.uploadStarted = true;
    } else {
        alert('You have to choose a file!');
    }
  }

  /**
   * Callback that gets executed when a new file is selected in form input control
   * @param {[type]} fileInput input control as a result of #fileInput in html template
   */
  onFileChosen(fileInput) {
	   this.fileToUpload = fileInput.files[0];
     this.fileName = this.fileToUpload.name;
  }

  /**
   * Callback executed when the filereader loads a new file
   * @param {[type]} event contains file data that is sent to server
   */
  onFileReaderLoad(event: ProgressEvent) {
     this.socketService.emit('Upload', { Name: this.fileToUpload.name, Data: (event.target as FileReader).result });
  }

}