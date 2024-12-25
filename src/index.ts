export interface IFileChunkOptions {
  chunkSize: number;
  concurrency: number;
}

export interface IFileChunk {
  chunk: Blob;
  current: number;
  count: number;
}

const defaultOptions: Partial<IFileChunkOptions> = {
  chunkSize: 1024 * 1024, // 1MB
  concurrency: 10
};

// @ref: https://chatgpt.com/c/676ace72-732c-8013-9342-48797a30f123
// https://github.com/rxaviers/async-pool
// https://stackoverflow.com/questions/42896456/get-which-promise-completed-in-promise-race

class FileChunk {
  public file: File;
  public options: IFileChunkOptions;

  get chunkCount(): number {
    const { chunkSize } = this.options;
    return Math.ceil(this.file.size / chunkSize);
  }

  get meta() {
    const { file, options } = this;
    return {
      file,
      ...options,
      chunkCount: this.chunkCount
    };
  }

  constructor(inFile: File, inOptions: IFileChunkOptions) {
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

  async processChunks(processChunk: (fileChunk: IFileChunk) => Promise<any>): Promise<any[]> {
    const { concurrency } = this.options;
    const chunkIterator = this.createIterator();
    // 将所有分片存储到数组中
    const chunks = [...chunkIterator];

    // 创建一个队列并行处理分片
    const results: Promise<any>[] = [];
    const activeTasks: Promise<any>[] = [];

    for (const [index, chunk] of chunks.entries()) {
      const current = index + 1;
      const task = processChunk({ chunk, current, count: this.chunkCount }).then((res) => {
        // remove the task from the active tasks list when it's done
        activeTasks.splice(activeTasks.indexOf(task), 1);
        return res;
      });

      activeTasks.push(task);

      // 控制并行任务数量
      if (activeTasks.length >= concurrency) {
        const completedTask = await Promise.race(activeTasks); // 等待一个任务完成
        results.push(completedTask); // 等待一个任务完成
      }
    }

    // 处理剩余未完成的任务
    results.push(...(await Promise.all(activeTasks)));

    return results;
  }
}

export default FileChunk;
