/**
 * Size of a single file part that gets uploaded to the server in bytes
 * @type {number}
 * Limit after which the received data is written into a temporary file in bytes
 * @type {number}
 */
export const CHUNK_SIZE: number = 524288;
export const BUFFER_LIMIT: number = 10485760; 
export const FILE_UPLOAD_SUCCESS_MESSAGE: string = "Files successfully uploaded!";
export const FILE_UPLOAD_ADDITIONAL_PROMPT: string = "Upload some other files?";
export const NO_FILE_CHOSEN_ERROR: string = "You have to choose a file!";
export const FILE_UPLOAD_IN_PROGRESS_WARNING: string = "There are file uploads still in progress, are you sure you want to leave this page?";