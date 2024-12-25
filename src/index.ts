export interface IFileChunkOptions {
  chunkSize: number;
  concurrency: number;
}

export interface IFileChunk {
  chunk: Blob;
  index: number;
  total: number;
}

const defaultOptions: Partial<IFileChunkOptions> = {
  chunkSize: 1024 * 1024, // 1MB
  concurrency: 10
};

// @ref: https://chatgpt.com/c/676ace72-732c-8013-9342-48797a30f123

class FileChunker {
  public file: Blob;
  public options: IFileChunkOptions;

  get chunkCount(): number {
    const { chunkSize } = this.options;
    return Math.ceil(this.file.size / chunkSize);
  }

  constructor(inFile: Blob, inOptions: IFileChunkOptions) {
    this.file = inFile;
    this.options = { ...defaultOptions, ...inOptions };
  }

  createIterator(): IterableIterator<Blob> {
    const {
      file,
      options: { chunkSize }
    } = this;
    let currentIndex = 0;

    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<Blob> {
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

  async processFileChunks(processChunk: (fileChunk: IFileChunk) => Promise<any>): Promise<any[]> {
    const { concurrency } = this.options;
    const chunkIterator = this.createIterator();
    // 将所有分片存储到数组中
    const chunks = [...chunkIterator];

    // 创建一个队列并行处理分片
    const results: any[] = [];
    let activeTasks: Promise<any>[] = [];

    for (const [index, chunk] of chunks.entries()) {
      const task = processChunk({ chunk, index, total: this.chunkCount }); // 假设 processChunk 是异步的处理函数
      activeTasks.push(task);

      // 控制并行任务数量
      if (activeTasks.length >= concurrency) {
        results.push(await Promise.race(activeTasks)); // 等待一个任务完成
        activeTasks = activeTasks.filter((t) => t !== task); // 移除完成的任务
      }
    }

    // 处理剩余未完成的任务
    results.push(...(await Promise.all(activeTasks)));

    return results;
  }
}

export default FileChunker;
