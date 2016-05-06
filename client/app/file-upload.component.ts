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
import {DictionaryToArrayPipe} from './pipes/dictionary-to-array-pipe.pipe';

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
        const index: string = data.Name;
        if (!this.isFilesEmpty() && this.files[index]) {
          this.files[index].Progress = data.Percent;
          const fileData: FileData = this.files[index];
          if (!this.files[index].Paused) {
            const place = data.Place * CHUNK_SIZE,
               newFile: Blob = fileData.File.slice(place, place + Math.min(CHUNK_SIZE, (fileData.File.size - place)));
            fileData.FileReader.readAsBinaryString(newFile);
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
        if (!this.isFilesEmpty() && this.files[data.Name]) {
          this.files[data.Name].Progress = 100;
        }
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
        this.removeFile(data.Name);
        if (this.isFilesEmpty()) {
          this.statusMessage = FILE_UPLOAD_ADDITIONAL_PROMPT;
        } 
      });

    fileService.files$.subscribe((file) => {
       this.files[file.name] = new FileData(file, 0.0, this.socketService);
       this.socketService.emit('Start', { Name: file.name, Size: file.size });
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
    this.files[fileName].Paused = true;
    this.socketService.emit('Pause', { Name: fileName });
  }

  restart(fileName: string) {
    this.files[fileName].Paused = false;
    this.socketService.emit('Start', { Name: fileName, Size: this.files[fileName].File.size });
  }

  cancel(fileName: string) {
    this.socketService.emit('Cancel', { Name: fileName });
  }

  removeFile(fileName: string) {
    delete this.files[fileName];
    if (this.isFilesEmpty() && !this.uploadStarted) {
      this.fileInputElement.nativeElement.value = "";
    }
  }

  isFilesEmpty() {
    return Object.keys(this.files).length == 0;
  }

  isUploadComplete() {
    let completeCount: number = 0;
    Object.keys(this.files).forEach((key) => {
      if (this.files[key].Progress == 100) completeCount++;
    });
    return completeCount == Object.keys(this.files).length;
  }
}