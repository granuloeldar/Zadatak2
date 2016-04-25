import {Component} from 'angular2/core';
import {NgForm}    from 'angular2/common';

@Component({
  selector: 'video-upload-form',
  templateUrl: 'app/templates/video-upload-form.component.html'
})
export class VideoUploadFormComponent {

  progress: Number = 0;
  submitted: boolean = false;

  onSubmit() { this.submitted = true; }
  
}