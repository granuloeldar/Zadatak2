import {Component} from 'angular2/core';
import {VideoUploadFormComponent} from './video-upload-form.component'

@Component({
    selector: 'app-begin',
    template: '<video-upload-form></video-upload-form>',
    directives: [VideoUploadFormComponent]
})
export class AppComponent { }