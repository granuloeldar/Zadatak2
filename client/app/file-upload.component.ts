import {Component, ViewChild, HostListener, Renderer} from '@angular/core';
import {NgForm, CORE_DIRECTIVES}    from '@angular/common';
import {SocketService} from './services/socket-service.service';
import {FileService} from './services/file-service.service';
import {SocketData} from './model/SocketData';
import {FileData} from './model/FileData';
import {Progress} from './custom_components/progress.directive';
import {Bar} from './custom_components/bar.component';
import {Progressbar} from './custom_components/progressbar.component';
import {CHUNK_SIZE} from './constants';
import {DictionaryToArrayPipe} from './pipes/dictionary-to-array-pipe.pipe';

/**
 * Component that handles file upload via socket.io,
 * displays and tracks progress of the upload
 */
@Component({
  selector: 'file-upload',
  templateUrl: 'app/templates/file-upload.component.html',
  providers: [SocketService, FileService],
  directives: [Progress, Bar, Progressbar, CORE_DIRECTIVES],
  pipes: [DictionaryToArrayPipe]
})
export class FileUploadComponent {

  files: { [id: string]: FileData } = {};
  uploadStarted: boolean = false;
  isWaitingForFiles: boolean = false;
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
        if (!this.fileService.isFilesEmpty() && this.files[index]) {
          this.fileService.setFileProgress(index, data.Percent);
          if (!this.files[index].Paused) {
            this.fileService.readNewFile(index, data.Place);
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
        if (!this.fileService.isFilesEmpty() && this.files[data.Name]) {
          this.fileService.setFileProgress(data.Name, 100);
          if (this.fileService.isUploadComplete()) {
            this.fileService.clearFiles();
            this.statusMessage = "Files successfully uploaded!";
          }
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
        this.fileService.removeFile(data.Name);
        if (this.fileService.isFilesEmpty()) {
          this.statusMessage = "Upload some other files?";
        } else {
          if (this.fileService.isUploadComplete()) {
            this.fileService.clearFiles();
            this.statusMessage = "Files successfully uploaded!";
          }
        }
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
        this.fileService.addFiles(event.dataTransfer.files, this.socketService, this.uploadStarted);
      }
    });

  }

  ngOnInit() {
    this.fileService.files$.subscribe(latestFiles => {
      this.files = latestFiles;
    });
  }

  startUpload() {
    if (!this.fileService.isFilesEmpty() && this.files != null) {
      // starting upload for every file selected by user
      this.fileService.startAllFileUploads();
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
    this.fileService.addFiles(fileInput.files, this.socketService, false);
  }

  resetForm() {
    this.statusMessage = "";
    this.uploadStarted = false;
    this.fileInputElement.nativeElement.value = "";
  }

  pause(fileName: string) {
    this.fileService.setFilePaused(fileName, true);
  }

  restart(fileName: string) {
    this.fileService.restartFileUpload(fileName);
  }

  cancel(fileName: string) {
    this.fileService.cancelFileUpload(fileName);
  }

  removeFile(fileName: string) {
    this.fileService.removeFile(fileName);
    if (this.fileService.isFilesEmpty() && !this.uploadStarted) {
      this.fileInputElement.nativeElement.value = "";
    }
  }

}