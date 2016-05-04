/**
 * Utility class for storing data about a file being uploaded from the server
 * FileSize the size of the file
 * @type {number}
 * Data file in binary string format
 * @type {string}
 * Downloaded how much of the file has already been downloaded
 * @type {number}
 * Handler file descriptor to access the file throughout the upload
 */
export interface FileDescription {
    FileSize: number;
    Data: string;
    Downloaded: number;
    Handler?: number;
    Paused: boolean;
}