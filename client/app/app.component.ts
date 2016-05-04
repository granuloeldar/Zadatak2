import {Component} from '@angular/core';
import {FileUploadComponent} from './file-upload.component'

@Component({
    selector: 'app-begin',
    template: '<file-upload></file-upload>',
    directives: [FileUploadComponent]
})
export class AppComponent { }