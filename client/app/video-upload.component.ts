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

  socket: SocketIOClient.Socket;
  progress: number = 0.0;
  percent: number = 0.0;
  fileName: string = "";
  uploadStarted: boolean = false;

  constructor(private socketService: SocketService) {
	  socketService.setCallbacks(this.onMoreData, this.onDone);
  }

  startUpload() {
     if (fileToUpload != null) {
         fileReader = new FileReader();
		 this.fileName = fileToUpload.name;
		 fileReader.onload = this.onFileReaderLoad;
		 this.socket.emit('Start', { Name: this.fileName, Size: fileToUpload.size });
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
		  let place: number = data.Place * 524288,
			  newFile: Blob = fileToUpload.slice(place, place + Math.min(524288, (fileToUpload.size - place)));
		  fileReader.readAsBinaryString(newFile);
	  } 
  }

  onFileReaderLoad(event) {
	  this.socket.emit('Upload', { Name: fileToUpload.name, Data: event.target.result });
  }

  calculateFileSize() {
  	if (fileToUpload != null) {
		return Math.round(((this.percent/100.0) * fileToUpload.size) / 1048576);
  	}
	return 0;
  }

}