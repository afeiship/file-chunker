export interface IFileChunkerOptions {
  chunkSize: number;
  chunkCount: number;
  name: string;
  suffix: string;
  size: number;
}

const defaultOptions: Partial<IFileChunkerOptions> = {
  chunkSize: 1024 * 1024, // 1MB
};

class FileChunker {
  public file: Blob;
  public options: IFileChunkerOptions;


  constructor(inFile: Blob, inOptions: IFileChunkerOptions) {
    this.file = inFile;
    this.options = { ...defaultOptions, ...inOptions };
  }
}


export default FileChunker;
