/**
 * Size of a single file part that gets uploaded to the server in bytes
 * @type {number}
 * Limit after which the received data is written into a temporary file in bytes
 * @type {number}
 */
export const CHUNK_SIZE: number = 524288;
export const BUFFER_LIMIT: number = 10485760; 