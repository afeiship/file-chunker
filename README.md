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
import fileChunker from '@jswork/file-chunker';

fileChunker(1024);

// [1000, 0, 20, 4]
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
