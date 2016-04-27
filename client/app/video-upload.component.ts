import {Component} from 'angular2/core';
import {NgForm}    from 'angular2/common';
import {SocketService} from './services/SocketService';

let fileToUpload: File = null,
    fileReader = null;

@Component({
	selector: 'video-upload',
  	templateUrl: 'app/templates/video-upload.component.html',
  	providers: [SocketService]
})
export class VideoUploadComponent {

  socketService: SocketService;
  progress: number = 0.0;
  percent: number = 0.0;
  progressInMB: number = 0.0;
  fileName: string = "";
  uploadStarted: boolean = false;

  constructor(private _socketService: SocketService) {
	  this.socketService = _socketService;
	  this.socketService.setCallbacks(this.onMoreData.bind(this), this.onDone.bind(this));
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

  onDone(data) {
	  this.progress = 100;
	  alert('File successfully uploaded!');
	  this.uploadStarted = false;
  }

  onMoreData(data) {
	  if (fileToUpload != null) {
		  this.progress = data.Percent;
		  this.percent = (Math.round(data.Percent * 100) / 100);
		  this.progressInMB = Math.round(((this.percent / 100.0) * fileToUpload.size) / 1048576);
		  let place: number = data.Place * 524288,
			  newFile: Blob = fileToUpload.slice(place, place + Math.min(524288, (fileToUpload.size - place)));
		  fileReader.readAsBinaryString(newFile);
	  } 
  }

  onFileReaderLoad(event) {
	  this.socketService.emit('Upload', { Name: fileToUpload.name, Data: event.target.result });
  }

}