# file-chunker
> Efficiently chunk files and process them in parallel streams.

[![version][version-image]][version-url]
[![license][license-image]][license-url]
[![size][size-image]][size-url]
[![download][download-image]][download-url]

## installation
```shell
npm install @jswork/file-chunker
```

## usage
```js
import FileChunk from '@jswork/file-chunker';

const ipt1 = document.getElementById('file');

ipt1.addEventListener('change', function(e) {
  const files = e.target.files;
  if (files.length) {
    const file = files[0];
    const chunker = new FileChunk(file, {
      chunkSize: 1024 * 1024,
      concurrency: 3
    });
    console.log(chunker.chunkCount);
    chunker.processChunks(({ chunk, index, current, count }) => {
      console.log('chunk:', chunk, 'count:', count, 'percent: ', (current / count * 100).toFixed(2) + '%');
      return fetch('https://httpbin.org/post', {
        method: 'POST',
        body: chunk,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
    });
  }
});
```

## license
Code released under [the MIT license](https://github.com/afeiship/file-chunker/blob/master/LICENSE.txt).

[version-image]: https://img.shields.io/npm/v/@jswork/file-chunker
[version-url]: https://npmjs.org/package/@jswork/file-chunker

[license-image]: https://img.shields.io/npm/l/@jswork/file-chunker
[license-url]: https://github.com/afeiship/file-chunker/blob/master/LICENSE.txt

[size-image]: https://img.shields.io/bundlephobia/minzip/@jswork/file-chunker
[size-url]: https://github.com/afeiship/file-chunker/blob/master/dist/file-chunker.min.js

[download-image]: https://img.shields.io/npm/dm/@jswork/file-chunker
[download-url]: https://www.npmjs.com/package/@jswork/file-chunker
