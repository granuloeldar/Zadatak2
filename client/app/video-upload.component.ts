import {Component} from 'angular2/core';
import {NgForm}    from 'angular2/common';

let fileToUpload: File = null,
    fileReader = null,
    socket = null;

@Component({
  selector: 'video-upload',
  templateUrl: 'app/templates/video-upload.component.html'
})
export class VideoUploadComponent {

  progress: number = 0.0;
  percent: number = 0.0;
  fileName: string = "";
  uploadStarted: boolean = false;

  constructor() {
	  socket = io('http://localhost:3000');

	  socket.on('MoreData', function(data) {
	  	if (fileToUpload != null) {
			this.progress = data.Percent.toFixed(2);
			let place: number = data.Place * 524288,
			    newFile: Blob = fileToUpload.slice(place, place + Math.min(524288, (fileToUpload.size - place)));
			fileReader.readAsBinaryString(newFile);
	  	}  
	  });

	  socket.on("Done", function(data) {
		  this.progress = 100;
		  alert('File successfully uploaded!');
		  this.uploadStarted = false;
	  });
  }

  startUpload() {
     if (fileToUpload != null) {
         fileReader = new FileReader();
		 this.fileName = fileToUpload.name;
		 fileReader.onload = function(event) {
			 socket.emit('Upload', { Name: fileToUpload.name, Data: event.target.result });
		 }
		 socket.emit('Start', { Name: this.fileName, Size: fileToUpload.size });
		 this.uploadStarted = true;
     } else {
		 alert('You have to choose a file!');
     }
  }

  onFileChosen(file) {
	 fileToUpload = file.files[0];
     this.fileName = fileToUpload.name;
  }

  calculateFileSize() {
  	if (fileToUpload != null) {
		return Math.round(((this.percent/100.0) * fileToUpload.size) / 1048576);
  	}
	return 0;
  }

}