import {Component, ViewChild, HostListener, Renderer} from '@angular/core';
import {NgForm, CORE_DIRECTIVES}    from '@angular/common';
import {SocketService} from './services/socket-service.service';
import {FileService} from './services/file-service.service';
import {SocketData} from './model/SocketData';
import {FileData} from './model/FileData';
import {Progress} from './custom_components/progress.directive';
import {Bar} from './custom_components/bar.component';
import {Progressbar} from './custom_components/progressbar.component';
import {CHUNK_SIZE, FILE_UPLOAD_ADDITIONAL_PROMPT, FILE_UPLOAD_SUCCESS_MESSAGE, NO_FILE_CHOSEN_ERROR} from './constants';
import {DictionaryToArrayPipe} from './pipes/dictionary-to-array.pipe';

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

  files: { [id: string]: FileData } = {};
  uploadStarted: boolean = false;
  statusMessage: string = "";
  @ViewChild('fileInput') fileInputElement;

  constructor(private socketService: SocketService, renderer: Renderer, private fileService: FileService) {

    /**
     * Server is requesting more data, get the new chunk of file and load it into
     * its FileReader
     * @type {[type]}
     */
    socketService
      .progress("MoreData")
      .subscribe((data: SocketData) => {
        const index: string = data.name;
        if (!this.isFilesEmpty() && this.files[index]) {
          this.files[index].progress = data.percent;
          const fileData: FileData = this.files[index];
          if (!this.files[index].paused) {
            const place = data.place * CHUNK_SIZE,
               newFile: Blob = fileData.file.slice(place, place + Math.min(CHUNK_SIZE, (fileData.file.size - place)));
            fileData.fileReader.readAsBinaryString(newFile);
          }
        }

      });

    /**
     * Checks if all files have finished uploading and displays a message if they are
     * @type {[type]}
     */
    socketService
      .progress("Done")
      .subscribe((data: SocketData) => {
        if (!this.isFilesEmpty() && this.files[data.name]) {
          this.files[data.name].progress = 100;
        }
        if (this.isUploadComplete()) this.fileService.isUploadInProgress = false; 
      });

    /**
     * Subscribing to the server response after canceling a file,
     * checks if there are no files left after cancelling, if there are 
     * no files it asks the user to upload other files, else it checks if all 
     * other uploads have finished
     * @type {[type]}
     */
    socketService
      .progress("Cancelled")
      .subscribe((data) => {
        this.removeFile(data.name);
      });

    fileService.files$.subscribe((file) => {
       this.files[file.name] = new FileData(file, 0.0, this.socketService);
       this.socketService.emit('Start', { name: file.name, size: file.size });
       this.fileService.isUploadInProgress = true;
    });

    /**
     * Makes a global listener for the body of the document(whole document is a dropzone)
     */
    renderer.listenGlobal('body', 'dragenter', (event) => {
      event.preventDefault();
    });

    renderer.listenGlobal('body', 'dragover', (event) => {
      event.preventDefault();
    });

    renderer.listenGlobal('body', 'drop', (event) => {
      event.preventDefault();
      if (event.dataTransfer != null && event.dataTransfer.files != null && event.dataTransfer.files.length != 0) {
        this.fileService.addFiles(event.dataTransfer.files, this.socketService);
        this.fileService.isUploadInProgress = true;
      }
    });
  }

  /**
   * Callback that gets executed when a new file is selected in form input control,
   * also maps the fileList received into a dictionary
   * @param {[type]} fileInput input control as a result of #fileInput in html template
   */
  onFileChosen(fileInput) {
    this.fileService.addFiles(fileInput.files, this.socketService);
  }

  pause(fileName: string) {
    this.files[fileName].paused = true;
    this.socketService.emit('Pause', { name: fileName });
  }

  restart(fileName: string) {
    this.files[fileName].paused = false;
    this.socketService.emit('Start', { name: fileName, size: this.files[fileName].file.size });
  }

  cancel(fileName: string) {
    this.socketService.emit('Cancel', { name: fileName });
  }

  removeFile(fileName: string) {
    delete this.files[fileName];
    if (this.isFilesEmpty()) {
      this.fileInputElement.nativeElement.value = "";
      this.fileService.isUploadInProgress = false;
    }
  }

  isFilesEmpty() {
    return Object.keys(this.files).length == 0;
  }

  isUploadComplete() {
    let completeCount: number = 0;
    Object.keys(this.files).forEach((key) => {
      if (this.files[key].progress == 100) completeCount++;
    });
    return completeCount == Object.keys(this.files).length;
  }

}