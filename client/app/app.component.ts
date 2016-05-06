import { Component } from '@angular/core';

import { FileUploadComponent } from './file-upload.component'
import { SocketService } from './services/socket-service.service';
import { FileService } from './services/file-service.service';
import { FILE_UPLOAD_IN_PROGRESS_WARNING } from './constants';

@Component({
    selector: 'app-begin',
    template: '<file-upload></file-upload>',
    providers: [SocketService, FileService],
    directives: [FileUploadComponent]
})
export class AppComponent { 
	constructor(private socketService: SocketService, private fileService: FileService) {
		window.onbeforeunload = ((event) => {
			this.socketService.emit('Save', {});
			if (this.fileService.isUploadInProgress) {
				return FILE_UPLOAD_IN_PROGRESS_WARNING;
			}
		}).bind(this);
	}
}