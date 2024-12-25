import CryptoJS from "crypto-js";

interface FileChunkInterface {
  chunkSize: number;
  split: () => Promise<any>;
  init: () => Promise<any>;
  fileHash: string | CryptoJS.lib.WordArray;
  chunksCount: number;
  suffix: string;
  name: string;
}

interface FileListItemInterface {
  chunkIndex: number;
  name: string;
  suffix: string;
  type: string;
  chunksCount: number;
  file: File;
  size: number | string;
}

class FileChunk implements FileChunkInterface {
  public file: Blob;
  public fileList: FileListItemInterface[] = [];
  public fileHash: string | CryptoJS.lib.WordArray;
  public chunksCount: number = 0;
  private _chunkSize: number;
  public suffix: string;
  public name: string;

  constructor(file: File, chunkSize: number = 10485760) {
    this.file = file;
    this._chunkSize = chunkSize; // 1M

    const { name, type } = file;
    this.name = name;
    this.suffix = type;
  }

  set chunkSize(val: number) {
    this._chunkSize = val;
  }

  get chunkSize() {
    return this._chunkSize;
  }

  public split() {
    const { size } = this.file;
    this.chunksCount = Math.ceil(size / this.chunkSize);

    const _slice =
      File.prototype.slice ||
      // @ts-ignore
      File.prototype.mozSlice ||
      // @ts-ignore
      File.prototype.webkitSlice;

    let currentIndex = 0;

    const i = this.name.lastIndexOf(".");
    const name = this.name.slice(0, i);
    const suffix = this.name.slice(i + 1);

    const fileSHA256 = CryptoJS.algo.SHA256.create();

    const read: FileReader = new FileReader();
    const returnPromise = new Promise((resolve, reject) => {
      read.onload = (e: any) => {
        const wordArry = CryptoJS.lib.WordArray.create(e.target.result);
        fileSHA256.update(wordArry);
        currentIndex++;

        if (currentIndex < this.chunksCount) {
          next();
        } else {
          this.fileHash = fileSHA256.finalize();
          resolve(this.fileHash);
        }
      };
      read.onerror = (err: any) => {
        reject();
      };
    });

    const that = this;
    function next() {
      const start = currentIndex * that.chunkSize;
      const end = start + that.chunkSize > size ? size : start + that.chunkSize;

      const _file = _slice.call(that.file, start, end);
      that.fileList.push({
        chunkIndex: currentIndex,
        name,
        suffix,
        type: that.suffix,
        chunksCount: that.chunksCount,
        file: _file,
        size,
      });
      read.readAsArrayBuffer(_file);
    }

    next();

    return returnPromise;
  }

  public init() {
    return this.split();
  }
}

export default FileChunk;
