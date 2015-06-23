'use strict';

const execAll = require('regexp.execall');
const assign = require('object.assign');
const flatten = require('flatten');
const uniq = require('array-uniq');

const tagsearch = function(tags) {
  tags = uniq(tags).map(tag => tag.replace(/[\/\\^$*+?.()|[\]{}]/g, '\\$&'));

  const t = {
    tags,

    exec(input) {
      const matches = t.matches(input);

      return {
        tags,
        matches,
        highlight: t.highlight.bind(null, input, matches)
      };
    },

    matches(input) {
      return flatten(tags.map(matchesForTag))
        .sort((m1, m2) => m1.start - m2.start);

        function matchesForTag(tag) {
          return execAll(new RegExp(tag, 'ig'), input).map(match => {
            const original = match[0];
            const start = match.index;
            const end = start + original.length;

            return { start, end, tag, original };
          });
        }
    },

    highlight(string, wrap) {
      const matches = Array.isArray(wrap) ? wrap : t.matches(string)
        // remove overlaps
        .map((match, i, arr) => i > 0 ? assign({}, match, { start: Math.max(arr[i - 1].end, match.start) }) : match)
        // remove overlapped matches
        .filter(match => match.start < match.end);

      if (!matches.length) {
        return string;
      }

      if (Array.isArray(wrap)) {
        wrap = arguments[2];
      }

      wrap = wrap || function wrap(match) {
        return '<strong>' + match.original + '</strong>';
      };

      const firstPart = string.substr(0, matches[0].start);
      const lastPart = string.substr(matches[matches.length - 1].end);
      const partsInBetween = flatten(matches.map((match, i) => {
        const wrapped = wrap(match);

        if (i > 0) {
          const prev = matches[i - 1];
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
