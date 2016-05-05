import {Component} from '@angular/core';
import {FileUploadComponent} from './file-upload.component'
import {SocketService} from './services/SocketService';


@Component({
    selector: 'app-begin',
    template: '<file-upload></file-upload>',
    providers: [SocketService],
    directives: [FileUploadComponent]
})
export class AppComponent { 
	constructor(private socketService: SocketService) {
		window.onbeforeunload = (event) => {
			this.socketService.emit('Save', {});
		};
	}
}