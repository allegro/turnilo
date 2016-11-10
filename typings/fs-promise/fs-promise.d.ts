declare module 'fs-promise' {
  import * as Q from 'q';
  import * as stream from "stream";
  import * as events from "events";

  interface Stats {
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
  }

  interface FSWatcher extends events.EventEmitter {
    close(): void;
  }

  export interface ReadStream extends stream.Readable {
    close(): void;
  }
  export interface WriteStream extends stream.Writable {
    close(): void;
    bytesWritten: number;
  }

  /**
   * Asynchronous rename.
   * @param oldPath
   * @param newPath
   */
  export function rename(oldPath: string, newPath: string): Q.Promise<any>;
  /**
   * Synchronous rename
   * @param oldPath
   * @param newPath
   */
  export function renameSync(oldPath: string, newPath: string): void;
  export function truncate(path: string): Q.Promise<any>;
  export function truncate(path: string, len: number): Q.Promise<any>;
  export function truncateSync(path: string, len?: number): void;
  export function ftruncate(fd: number): Q.Promise<any>;
  export function ftruncate(fd: number, len: number): Q.Promise<any>;
  export function ftruncateSync(fd: number, len?: number): void;
  export function chown(path: string, uid: number, gid: number): Q.Promise<any>;
  export function chownSync(path: string, uid: number, gid: number): void;
  export function fchown(fd: number, uid: number, gid: number): Q.Promise<any>;
  export function fchownSync(fd: number, uid: number, gid: number): void;
  export function lchown(path: string, uid: number, gid: number): Q.Promise<any>;
  export function lchownSync(path: string, uid: number, gid: number): void;
  export function chmod(path: string, mode: number): Q.Promise<any>;
  export function chmod(path: string, mode: string): Q.Promise<any>;
  export function chmodSync(path: string, mode: number): void;
  export function chmodSync(path: string, mode: string): void;
  export function fchmod(fd: number, mode: number): Q.Promise<any>;
  export function fchmod(fd: number, mode: string): Q.Promise<any>;
  export function fchmodSync(fd: number, mode: number): void;
  export function fchmodSync(fd: number, mode: string): void;
  export function lchmod(path: string, mode: number): Q.Promise<any>;
  export function lchmod(path: string, mode: string): Q.Promise<any>;
  export function lchmodSync(path: string, mode: number): void;
  export function lchmodSync(path: string, mode: string): void;
  export function stat(path: string): Q.Promise<Stats>;
  export function lstat(path: string): Q.Promise<Stats>;
  export function fstat(fd: number): Q.Promise<Stats>;
  export function statSync(path: string): Stats;
  export function lstatSync(path: string): Stats;
  export function fstatSync(fd: number): Stats;
  export function link(srcpath: string, dstpath: string): Q.Promise<any>;
  export function linkSync(srcpath: string, dstpath: string): void;
  export function symlink(srcpath: string, dstpath: string, type?: string): Q.Promise<any>;
  export function symlinkSync(srcpath: string, dstpath: string, type?: string): void;
  export function readlink(path: string): Q.Promise<string>;
  export function readlinkSync(path: string): string;
  export function realpath(path: string): Q.Promise<string>;
  export function realpath(path: string, cache: {[path: string]: string}): Q.Promise<string>;
  export function realpathSync(path: string, cache?: { [path: string]: string }): string;
  /*
   * Asynchronous unlink - deletes the file specified in {path}
   *
   * @param path
   */
  export function unlink(path: string): Q.Promise<any>;
  /*
   * Synchronous unlink - deletes the file specified in {path}
   *
   * @param path
   */
  export function unlinkSync(path: string): void;
  /*
   * Asynchronous rmdir - removes the directory specified in {path}
   *
   * @param path
   */
  export function rmdir(path: string): Q.Promise<any>;
  /*
   * Synchronous rmdir - removes the directory specified in {path}
   *
   * @param path
   */
  export function rmdirSync(path: string): void;
  /*
   * Asynchronous mkdir - creates the directory specified in {path}.  Parameter {mode} defaults to 0777.
   *
   * @param path
   */
  export function mkdir(path: string): Q.Promise<any>;
  /*
   * Asynchronous mkdir - creates the directory specified in {path}.  Parameter {mode} defaults to 0777.
   *
   * @param path
   * @param mode
   */
  export function mkdir(path: string, mode: number): Q.Promise<any>;
  /*
   * Asynchronous mkdir - creates the directory specified in {path}.  Parameter {mode} defaults to 0777.
   *
   * @param path
   * @param mode
   */
  export function mkdir(path: string, mode: string): Q.Promise<any>;
  /*
   * Synchronous mkdir - creates the directory specified in {path}.  Parameter {mode} defaults to 0777.
   *
   * @param path
   * @param mode
   */
  export function mkdirSync(path: string, mode?: number): void;
  /*
   * Synchronous mkdir - creates the directory specified in {path}.  Parameter {mode} defaults to 0777.
   *
   * @param path
   * @param mode
   */
  export function mkdirSync(path: string, mode?: string): void;
  export function readdir(path: string): Q.Promise<string[]>;
  export function readdirSync(path: string): string[];
  export function close(fd: number): Q.Promise<any>;
  export function closeSync(fd: number): void;
  export function open(path: string, flags: string): Q.Promise<number>;
  export function open(path: string, flags: string, mode: number): Q.Promise<number>;
  export function open(path: string, flags: string, mode: string): Q.Promise<number>;
  export function openSync(path: string, flags: string, mode?: number): number;
  export function openSync(path: string, flags: string, mode?: string): number;
  export function utimes(path: string, atime: number, mtime: number): Q.Promise<any>;
  export function utimes(path: string, atime: Date, mtime: Date): Q.Promise<any>;
  export function utimesSync(path: string, atime: number, mtime: number): void;
  export function utimesSync(path: string, atime: Date, mtime: Date): void;
  export function futimes(fd: number, atime: number, mtime: number): Q.Promise<any>;
  export function futimes(fd: number, atime: Date, mtime: Date): Q.Promise<any>;
  export function futimesSync(fd: number, atime: number, mtime: number): void;
  export function futimesSync(fd: number, atime: Date, mtime: Date): void;
  export function fsync(fd: number): Q.Promise<any>;
  export function fsyncSync(fd: number): void;
  export function write(fd: number, buffer: Buffer, offset: number, length: number, position: number): Q.Promise<number>; // stuff omitted
  export function write(fd: number, buffer: Buffer, offset: number, length: number): Q.Promise<number>; // stuff omitted
  export function writeSync(fd: number, buffer: Buffer, offset: number, length: number, position: number): number;
  export function read(fd: number, buffer: Buffer, offset: number, length: number, position: number): Q.Promise<number>; // stuff omitted
  export function readSync(fd: number, buffer: Buffer, offset: number, length: number, position: number): number;
  /*
   * Asynchronous readFile - Asynchronously reads the entire contents of a file.
   *
   * @param fileName
   * @param encoding
   */
  export function readFile(filename: string, encoding: string): Q.Promise<string>;
  /*
   * Asynchronous readFile - Asynchronously reads the entire contents of a file.
   *
   * @param fileName
   * @param options An object with optional {encoding} and {flag} properties.  If {encoding} is specified, readFile returns a string; otherwise it returns a Buffer.
   */
  export function readFile(filename: string, options: { encoding: string; flag?: string; }): Q.Promise<string>;
  /*
   * Asynchronous readFile - Asynchronously reads the entire contents of a file.
   *
   * @param fileName
   * @param options An object with optional {encoding} and {flag} properties.  If {encoding} is specified, readFile returns a string; otherwise it returns a Buffer.
   */
  export function readFile(filename: string, options: { flag?: string; }): Q.Promise<Buffer>;
  /*
   * Asynchronous readFile - Asynchronously reads the entire contents of a file.
   *
   * @param fileName
   */
  export function readFile(filename: string): Q.Promise<Buffer>;
  /*
   * Synchronous readFile - Synchronously reads the entire contents of a file.
   *
   * @param fileName
   * @param encoding
   */
  export function readFileSync(filename: string, encoding: string): string;
  /*
   * Synchronous readFile - Synchronously reads the entire contents of a file.
   *
   * @param fileName
   * @param options An object with optional {encoding} and {flag} properties.  If {encoding} is specified, readFileSync returns a string; otherwise it returns a Buffer.
   */
  export function readFileSync(filename: string, options: { encoding: string; flag?: string; }): string;
  /*
   * Synchronous readFile - Synchronously reads the entire contents of a file.
   *
   * @param fileName
   * @param options An object with optional {encoding} and {flag} properties.  If {encoding} is specified, readFileSync returns a string; otherwise it returns a Buffer.
   */
  export function readFileSync(filename: string, options?: { flag?: string; }): Buffer;
  export function writeFile(filename: string, data: any): Q.Promise<any>;
  export function writeFile(filename: string, data: any, options: { encoding?: string; mode?: number; flag?: string; }): Q.Promise<any>;
  export function writeFile(filename: string, data: any, options: { encoding?: string; mode?: string; flag?: string; }): Q.Promise<any>;
  export function writeFileSync(filename: string, data: any, options?: { encoding?: string; mode?: number; flag?: string; }): void;
  export function writeFileSync(filename: string, data: any, options?: { encoding?: string; mode?: string; flag?: string; }): void;
  export function appendFile(filename: string, data: any, options: { encoding?: string; mode?: number; flag?: string; }): Q.Promise<any>;
  export function appendFile(filename: string, data: any, options: { encoding?: string; mode?: string; flag?: string; }): Q.Promise<any>;
  export function appendFile(filename: string, data: any): Q.Promise<any>;
  export function appendFileSync(filename: string, data: any, options?: { encoding?: string; mode?: number; flag?: string; }): void;
  export function appendFileSync(filename: string, data: any, options?: { encoding?: string; mode?: string; flag?: string; }): void;
  export function watchFile(filename: string, listener: (curr: Stats, prev: Stats) => void): void;
  export function watchFile(filename: string, options: { persistent?: boolean; interval?: number; }, listener: (curr: Stats, prev: Stats) => void): void;
  export function unwatchFile(filename: string, listener?: (curr: Stats, prev: Stats) => void): void;
  export function watch(filename: string, listener?: (event: string, filename: string) => any): FSWatcher;
  export function watch(filename: string, options: { persistent?: boolean; }, listener?: (event: string, filename: string) => any): FSWatcher;
  export function exists(path: string): Q.Promise<boolean>;
  export function existsSync(path: string): boolean;
  /** Constant for fs.access(). File is visible to the calling process. */
  export var F_OK: number;
  /** Constant for fs.access(). File can be read by the calling process. */
  export var R_OK: number;
  /** Constant for fs.access(). File can be written by the calling process. */
  export var W_OK: number;
  /** Constant for fs.access(). File can be executed by the calling process. */
  export var X_OK: number;
  /** Tests a user's permissions for the file specified by path. */
  export function access(path: string): Q.Promise<any>;
  export function access(path: string, mode: number): Q.Promise<any>;
  /** Synchronous version of fs.access. This throws if any accessibility checks fail, and does nothing otherwise. */
  export function accessSync(path: string, mode ?: number): void;
  export function createReadStream(path: string, options?: {
    flags?: string;
    encoding?: string;
    fd?: string;
    mode?: number;
    bufferSize?: number;
  }): ReadStream;
  export function createReadStream(path: string, options?: {
    flags?: string;
    encoding?: string;
    fd?: string;
    mode?: string;
    bufferSize?: number;
  }): ReadStream;
  export function createWriteStream(path: string, options?: {
    flags?: string;
    encoding?: string;
    string?: string;
  }): WriteStream;
}
