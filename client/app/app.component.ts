import {Component} from '@angular/core';
import {FileUploadComponent} from './file-upload.component'
import {SocketService} from './services/socket-service.service';
import {FileService} from './services/file-service.service';

@Component({
    selector: 'app-begin',
    template: '<file-upload></file-upload>',
    providers: [SocketService, FileService],
    directives: [FileUploadComponent]
})
export class AppComponent { 
	constructor(private socketService: SocketService, private fileService: FileService) {
		window.onbeforeunload = (event) => {
			this.socketService.emit('Save', {});
			if (!fileService.isFilesEmpty()) {
			   return 'There are file uploads still in progress, are you sure you want to navigate away from this page?';
			}
		};
	}
}