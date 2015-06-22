/* global describe, it */
'use strict';

const tagsearch = require('./tagsearch');
const chai = require('chai');
const expect = chai.expect;

describe('tagsearch', function() {
  it('exports a function', function() {
    expect(tagsearch).to.be.a('function');
  });

  it('returns an object that contains a unique array of tags', function() {
    expect(tagsearch(['a', 'a', 'b', 'c', 'b'])).to.have.property('tags').deep.equal(['a', 'b', 'c']);
  });

  describe('matches', function() {
    it('returns an array of matches', function() {
      const t = tagsearch(['slim', 'shady']);

      expect(t.matches('i am the real slim shady')).to.deep.equal([
        { start: 14, end: 18, tag: 'slim', original: 'slim' },
        { start: 19, end: 24, tag: 'shady', original: 'shady' }
      ]);
    });

    it('returns an empty array if no matches were found', function() {
      const t = tagsearch(['slim', 'shady']);

      expect(t.matches('i am eminem')).to.deep.equal([]);
    });

    it('is not case-sensitive', function() {
      const t = tagsearch(['slim', 'shady']);

      expect(t.matches('i am the real Slim shady')).to.deep.equal([
        { start: 14, end: 18, tag: 'slim', original: 'Slim' },
        { start: 19, end: 24, tag: 'shady', original: 'shady' }
      ]);
    });

    it('finds all matches', function() {
      const t = tagsearch(['slim', 'shady']);

      expect(t.matches('i am the real slim shady, yes i am the real shady')).to.deep.equal([
        { start: 14, end: 18, tag: 'slim', original: 'slim' },
        { start: 19, end: 24, tag: 'shady', original: 'shady' },
        { start: 44, end: 49, tag: 'shady', original: 'shady' }
      ]);
    });

    it('finds matches within matches', function() {
      const t = tagsearch(['slim', 's', 'shady']);
      const matches = t.matches('slim shady');

      expect(matches).to.deep.include({ start: 0, end: 4, tag: 'slim', original: 'slim' });
      expect(matches).to.deep.include({ start: 5, end: 10, tag: 'shady', original: 'shady' });
      expect(matches).to.deep.include({ start: 0, end: 1, tag: 's', original: 's' });
      expect(matches).to.deep.include({ start: 5, end: 6, tag: 's', original: 's' });
    });

    it('finds overlapping matches', function() {
      const t = tagsearch(['sh-shady', 'sh', 'sh-sh-shady']);
      const matches = t.matches('sh-sh-shady');

      expect(matches).to.deep.include({ start: 0, end: 11, tag: 'sh-sh-shady', original: 'sh-sh-shady' });
      expect(matches).to.deep.include({ start: 3, end: 11, tag: 'sh-shady', original: 'sh-shady' });
      expect(matches).to.deep.include({ start: 0, end: 2, tag: 'sh', original: 'sh' });
      expect(matches).to.deep.include({ start: 3, end: 5, tag: 'sh', original: 'sh' });
      expect(matches).to.deep.include({ start: 6, end: 8, tag: 'sh', original: 'sh' });
    });
  });

  describe('highlight', function() {
    it('replaces matches with the result of a specified wrapping function', function() {
      const t = tagsearch(['slim', 'shady']);
      const h = t.highlight('i am the real slim shady', () => 'beep');

      expect(h).to.equal('i am the real beep beep');
    });

    it('replaces nothing if no tags match', function() {
      const t = tagsearch(['slim', 'shady']);
      const h = t.highlight('i am eminem', () => 'beep');

      expect(h).to.equal('i am eminem');
    });

    it('compensates for overlapping results', function() {
      const t = tagsearch(['slim', 'shady', 's']);
      const h = t.highlight('i am the real slim shady', () => 'beep');

      expect(h).to.equal('i am the real beep beep');
    });

    it('passes each match to the wrapping function', function() {
      const t = tagsearch(['slim', 'shady', 's']);
      const h = t.highlight('i am the real slim shady', match => `<em>${match.original}</em>`);

      expect(h).to.equal('i am the real <em>slim</em> <em>shady</em>');
    });

    it('wraps each match in `strong`-tags if no wrapping function is specified', function() {
      const t = tagsearch(['slim', 'shady', 's']);
      const h = t.highlight('i am the real slim shady');

      expect(h).to.equal('i am the real <strong>slim</strong> <strong>shady</strong>');
    });
  });
});
