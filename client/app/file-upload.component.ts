import {Component} from 'angular2/core';
import {NgForm, CORE_DIRECTIVES}    from 'angular2/common';
import {SocketService, ISocketData} from './services/SocketService';
import {Progress} from './custom_components/progress.directive';
import {Bar} from './custom_components/bar.component';
import {Progressbar} from './custom_components/progressbar.component';

let fileToUpload: File = null,
    fileReader = null;

@Component({
	selector: 'file-upload',
  	templateUrl: 'app/templates/file-upload.component.html',
  	providers: [SocketService],
    directives: [Progress, Bar, Progressbar, CORE_DIRECTIVES]
})
export class FileUploadComponent {

  socketService: SocketService;
  progress: number = 0.0;
  percent: number = 0.0;
  progressInMB: number = 0.0;
  fileName: string = "";
  uploadStarted: boolean = false;

  constructor(private _socketService: SocketService) {
	  this.socketService = _socketService;

      _socketService
          .progress("MoreData")
          .subscribe((data: ISocketData) => {

              if (fileToUpload != null) {

                  this.progress = data.Percent;
                  this.percent = (Math.round(data.Percent * 100) / 100);
                  this.progressInMB = Math.round(((this.percent / 100.0) * fileToUpload.size) / 1048576);
                  let place: number = data.Place * 524288,
                      newFile: Blob = fileToUpload.slice(place, place + Math.min(524288, (fileToUpload.size - place)));
                  fileReader.readAsBinaryString(newFile);
              }

          });

      _socketService
          .progress("Done")
          .subscribe(() => {

              this.progress = 100;
              alert('File successfully uploaded!');
              this.uploadStarted = false;

          });
  }

  startUpload() {
     if (fileToUpload != null) {
         fileReader = new FileReader();
		 this.fileName = fileToUpload.name;
		 fileReader.onload = this.onFileReaderLoad.bind(this);
		 this.socketService.emit('Start', { Name: this.fileName, Size: fileToUpload.size });
		 this.uploadStarted = true;
     } else {
		 alert('You have to choose a file!');
     }
  }

  onFileChosen(fileInput) {
	 fileToUpload = fileInput.files[0];
     this.fileName = fileToUpload.name;
  }

  onFileReaderLoad(event) {
	  this.socketService.emit('Upload', { Name: fileToUpload.name, Data: event.target.result });
  }

}