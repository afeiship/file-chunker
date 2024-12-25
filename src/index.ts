export interface IFileChunkerOptions {
  chunkSize: number;
}

const defaultOptions: Partial<IFileChunkerOptions> = {
  chunkSize: 1024 * 1024, // 1MB
};

class FileChunker {
  public file: Blob;
  public options: IFileChunkerOptions;


  get chunkCount(): number {
    const { chunkSize } = this.options;
    return Math.ceil(this.file.size / chunkSize);
  }

  constructor(inFile: Blob, inOptions: IFileChunkerOptions) {
    this.file = inFile;
    this.options = { ...defaultOptions, ...inOptions };
  }

  createIterator(): Iterator<Blob> {
    const { file, options: { chunkSize } } = this;
    let currentIndex = 0;

    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        if (currentIndex < file.size) {
          const chunk = file.slice(currentIndex, currentIndex + chunkSize);
          currentIndex += chunkSize;
          return { value: chunk, done: false };
        } else {
          return { value: null, done: true };
        }
      }
    };
  }
}


export default FileChunker;
