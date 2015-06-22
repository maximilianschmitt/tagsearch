'use strict';

var execAll = require('regexp.execall');
var assign = require('object.assign');
var flatten = require('flatten');
var uniq = require('array-uniq');

var tagsearch = function tagsearch(tags) {
  tags = uniq(tags);

  var t = {
    tags: tags,
    matches: function matches(input) {
      return flatten(tags.map(matchesForTag)).sort(function (m1, m2) {
        return m1.start - m2.start;
      });

      function matchesForTag(tag) {
        return execAll(new RegExp(tag, 'ig'), input).map(function (match) {
          var original = match[0];
          var start = match.index;
          var end = start + original.length;

          return { start: start, end: end, tag: tag, original: original };
        });
      }
    },
    highlight: function highlight(string, wrap) {
      var matches = t.matches(string)
      // remove overlaps
      .map(function (match, i, arr) {
        return i > 0 ? assign({}, match, { start: Math.max(arr[i - 1].end, match.start) }) : match;
      })
      // remove overlapped matches
      .filter(function (match) {
        return match.start < match.end;
      });

      if (!matches.length) {
        return string;
      }

      wrap = wrap || function wrap(match) {
        return '<strong>' + match.original + '</strong>';
      };

      var firstPart = string.substr(0, matches[0].start);
      var lastPart = string.substr(matches[matches.length - 1].end);
      var partsInBetween = flatten(matches.map(function (match, i) {
        var wrapped = wrap(match);

        if (i > 0) {
          var prev = matches[i - 1];
          return [string.substr(prev.end, match.start - prev.end), wrapped];
        }

        return wrapped;
      }));

      return [firstPart].concat(partsInBetween).concat(lastPart).join('');
    }
  };

  return t;
};

module.exports = tagsearch;
