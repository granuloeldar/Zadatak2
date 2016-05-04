import {Component, ViewChild} from '@angular/core';
import {NgForm, CORE_DIRECTIVES}    from '@angular/common';
import {SocketService} from './services/SocketService';
import {ISocketData} from './model/ISocketData';
import {IFileData} from './model/IFileData';
import {Progress} from './custom_components/progress.directive';
import {Bar} from './custom_components/bar.component';
import {Progressbar} from './custom_components/progressbar.component';
import {CHUNK_SIZE} from './constants';
import {DictionaryToArrayPipe} from './pipes/DictionaryToArrayPipe';

/**
 * Component that handles file upload via socket.io,
 * displays and tracks progress of the upload
 */
@Component({
  selector: 'file-upload',
  templateUrl: 'app/templates/file-upload.component.html',
  providers: [SocketService],
  directives: [Progress, Bar, Progressbar, CORE_DIRECTIVES],
  pipes: [DictionaryToArrayPipe]
})
export class FileUploadComponent {

  files: { [id: string]: IFileData } = {};
  uploadStarted: boolean = false;
  statusMessage: string = "";
  @ViewChild('fileInput') fileInputElement; 

  constructor(private socketService: SocketService) {

    socketService
      .progress("MoreData")
      .subscribe((data: ISocketData) => {
        const index: string = data.Name;
        const fileData: IFileData = this.files[index];
        if (Object.keys(this.files).length > 0 && this.files != null && this.files[index]) {
          this.files[index].Progress = data.Percent;
          const place: number = data.Place * CHUNK_SIZE,
            newFile: Blob = fileData.File.slice(place, place + Math.min(CHUNK_SIZE, (fileData.File.size - place)));
          this.files[index].FileReader.readAsBinaryString(newFile);
        }

      });

    socketService
      .progress("Done")
      .subscribe((data: ISocketData) => {
        if (this.files != null && Object.keys(this.files).length > 0 && this.files[data.Name]) {
          this.files[data.Name].Progress = 100;
          let completeCount: number = 0;
          for(const item in this.files){
            if (this.files[item].Progress == 100) completeCount++;
          }
          if (completeCount == Object.keys(this.files).length) {
            this.statusMessage = "Files successfully uploaded!";
            this.files = {};
          }
        }
      });
  }

  startUpload() {
    if (Object.keys(this.files).length > 0 && this.files != null) {
      // starting upload for every file selected by user
      for (const key in this.files) {
        this.socketService.emit('Start', { Name: this.files[key].File.name, Size: this.files[key].File.size });
      }
      this.uploadStarted = true;
    } else {
      alert('You have to choose a file!');
    }
  }

  /**
   * Callback that gets executed when a new file is selected in form input control,
   * also maps the fileList received into a dictionary
   * @param {[type]} fileInput input control as a result of #fileInput in html template
   */
  onFileChosen(fileInput) {
    const fileList: FileList = fileInput.files;
    for (let i: number = 0; i < fileList.length; i++) {
      this.files[fileList[i].name] = new IFileData(fileList[i], 0.0, new FileReader(), this.socketService);
    }
  }

  resetForm(){
    this.statusMessage = "";
    this.uploadStarted = false;
    this.fileInputElement.nativeElement.value = "";
  }

}