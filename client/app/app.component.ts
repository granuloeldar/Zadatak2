import {Component} from 'angular2/core';
import {VideoUploadComponent} from './video-upload.component'

@Component({
    selector: 'app-begin',
    template: '<video-upload></video-upload>',
    directives: [VideoUploadComponent]
})
export class AppComponent { }