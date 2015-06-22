# tagsearch

[![Travis Build](http://img.shields.io/travis/maximilianschmitt/tagsearch.svg?style=flat)](https://travis-ci.org/maximilianschmitt/tagsearch) [![Code Coverage](https://img.shields.io/coveralls/maximilianschmitt/tagsearch.svg)](https://coveralls.io/r/maximilianschmitt/tagsearch) [![npm](https://img.shields.io/npm/dm/tagsearch.svg)](https://www.npmjs.com/package/tagsearch)

Search a string with a set of tags.

## Installation

```
$ npm i tagsearch -S
```

## Usage

### t.matches(string)

`matches` is not case-sensitive and finds all matches within a string.

```js
const t = tagsearch(['slim', 's', 'shady']);
const matches = t.matches('slim shady');

expect(matches).to.deep.equal([
  { start: 0, end: 4, tag: 'slim', original: 'slim' }
  { start: 5, end: 10, tag: 'shady', original: 'shady' },
  { start: 0, end: 1, tag: 's', original: 's' },
  { start: 5, end: 6, tag: 's', original: 's' }
]);
```

### t.highlight(string[, wrappingFunction])

`highlight` wraps every match in `strong`-tags by default:

```js
const t = tagsearch(['slim', 'shady', 's']);
const h = t.highlight('i am the real slim shady');

expect(h).to.equal('i am the real <strong>slim</strong> <strong>shady</strong>');
```

You can specify your own wrapping function:

```js
const t = tagsearch(['slim', 'shady', 's']);
const h = t.highlight('i am the real slim shady', match => `<em>${match.original}</em>`);

expect(h).to.equal('i am the real <em>slim</em> <em>shady</em>');
```
