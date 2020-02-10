const PCRE = require('pcre-to-regexp');
const size = require('lodash/size');
const os = require("os");
const path = require("path");
const nodeRange = require('range').range;
const cloneDeep = require('lodash/cloneDeep');

const PREG_OFFSET_CAPTURE = 256;
const PREG_SET_ORDER = 2;
const PREG_PATTERN_ORDER = 1;

const STR_PAD_LEFT = 0
const STR_PAD_RIGHT = 1
const STR_PAD_BOTH = 2

const PHP_EOL = os.EOL;

module.exports.getenv = (name) => {
  return process.env[name] || false;
};

module.exports.putenv = (name, value) => {
  if (!value) {
    value = name.split("=")[1];
    name = name.split("=")[0];
  }
  return process.env[name] = value;
};


module.exports.PREG_OFFSET_CAPTURE = PREG_OFFSET_CAPTURE;
module.exports.PREG_SET_ORDER = PREG_SET_ORDER;
module.exports.PREG_PATTERN_ORDER = PREG_PATTERN_ORDER;

module.exports.STR_PAD_LEFT = STR_PAD_LEFT;
module.exports.STR_PAD_RIGHT = STR_PAD_RIGHT;
module.exports.STR_PAD_BOTH = STR_PAD_BOTH;

module.exports.PHP_EOL = PHP_EOL;
module.exports.DIRECTORY_SEPARATOR = path.sep;

module.exports.ord = require('locutus/php/strings/ord');
module.exports.strtr = require('locutus/php/strings/strtr');

module.exports.range = function (start, end, step = 1) {
  //const count = Math.ceil((end-start) / step) + 1;
  const r = [];
  for (let i = start; i <= end; i += step) {
    r[i] = i;
  }
  return r;
}

module.exports.escapeshellarg = require('escapeshellarg');

module.exports.sprintf = require('sprintf-js').sprintf;

module.exports.strip_tags = require('striptags');

module.exports.str_pad = function (string, length, pad_string = " ", pad_type = STR_PAD_RIGHT) {
  switch (pad_type) {
    case STR_PAD_LEFT:
      return string.padStart(length, pad_string);
    case STR_PAD_RIGHT:
      return string.padEnd(length, pad_string);
    case  STR_PAD_BOTH:
      let res = (length - string.length / 2);
      return string.padStart(Math.floor(res), pad_string).padEnd(Math.ceil(res), pad_string);
  }
}

module.exports.str_split = function (str, length) {
  return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

const array_replace_recursive = function (arr) { // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/array_replace_recursive/
  // original by: Brett Zamir (https://brett-zamir.me)
  //   example 1: array_replace_recursive({'citrus' : ['orange'], 'berries' : ['blackberry', 'raspberry']}, {'citrus' : ['pineapple'], 'berries' : ['blueberry']})
  //   returns 1: {citrus : ['pineapple'], berries : ['blueberry', 'raspberry']}

  var i = 0
  var p = ''
  var argl = arguments.length
  var retObj

  if (argl < 2) {
    throw new Error('There should be at least 2 arguments passed to array_replace_recursive()')
  }

  // Although docs state that the arguments are passed in by reference,
  // it seems they are not altered, but rather the copy that is returned
  // So we make a copy here, instead of acting on arr itself
  if (Object.prototype.toString.call(arr) === '[object Array]') {
    retObj = [];
    for (p in arr) {
      let i = Number.parseInt(p);
      retObj[i] = (arr[i]);
    }
  } else {
    retObj = {}
    for (p in arr) {
      retObj[p] = arr[p]
    }
  }

  for (i = 1; i < argl; i++) {
    for (p in arguments[i]) {
      if (retObj[p] && typeof retObj[p] === 'object') {
        retObj[p] = array_replace_recursive(retObj[p], arguments[i][p])
      } else {
        retObj[p] = arguments[i][p]
      }
    }
  }

  return retObj
};

module.exports.array_replace_recursive = array_replace_recursive;

module.exports.array_fill = function(start, count, content){
  let r = [];
  for( let i = start ; i < start + count ; i++){
    r[i] = cloneDeep(content);
  }
  return r;  
}

module.exports.iterator_to_array = (x) => {
  return Array.from(x);
};

module.exports.isset = function (variable) {
  return typeof variable !== 'undefined' && variable !== null;
};

module.exports.is_bool = (mixedVar) => {
  return (typeof mixedVar === 'boolean');
};


module.exports.is_string = (mixedVar) => {
  return (typeof mixedVar === 'string');
};

module.exports.is_array = (mixedVar) => {
  return Array.isArray(mixedVar);
};


module.exports.is_int = (mixedVar) => {
  return Number.isInteger(mixedVar);
};

module.exports.is_iterable = (obj) => {

  // checks for null and undefined
  if (obj == null) {
    return false;
  }

  //strings are not iterable in PHP
  if (typeof obj === 'string') {
    return false;
  }

  return typeof obj[Symbol.iterator] === 'function';
};


module.exports.in_array = (v, values) => {
  return values.indexOf(v) >= 0;
};

module.exports.to_array = (mixedVar) => {
  return mixedVar instanceof Array ? mixedVar : [mixedVar];
};

module.exports.array_key_exists = (v, values) => {
  return typeof values[v] !== 'undefined';
};

const trim = (str, mask = " \\t\\n\\r\\0\\x0B") => {
  const start = new RegExp(`^([${mask}]*)`);
  const end = new RegExp(`([${mask}]*)$`);
  return str.replace(start, "").replace(end, "");
}

module.exports.trim = trim;

module.exports.rtrim = (str, mask = " \\t\\n\\r\\0\\x0B") => {
  const end = new RegExp(`([${mask}]*)$`);
  return str.replace(end, "");
}

module.exports.ltrim = (str, mask = " \\t\\n\\r\\0\\x0B") => {
  const start = new RegExp(`^([${mask}]*)`);
  return str.replace(start, "");
}

module.exports.count = (mixedVar) => {
  return size(mixedVar);
};

module.exports.array_shift = (arr) => {
  return arr.shift()
};

module.exports.array_unshift = (arr, val) => {
  return arr.unshift(val)
};

module.exports.substr_count = (chars, find) => {
  return chars.split(find).length - 1;
};

module.exports.substr = (str, index, length) => {
  if (index < 0) {
    index = str.length + index;
  }

  if (Number.isInteger(length)) {
    if (length < 0) {
      return str.substring(index, str.length + length);
    } else {
      return str.substring(index, index + length);
    }
  }
  return str.substring(index);
};

module.exports.strpos = (str, search) => {
  let res = String(str).indexOf(search);
  return res === -1 ? false : res;
};

module.exports.wordwrap = function(str, width = 75, newline ="\n", cut = false ) {
  
  if (str == null) {
    return str;
  }
  
  const maxSizeRegExString = '.{1,' + width + '}';
  const wordFindRegExString = '([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  
  const wordSearch = new RegExp(`${maxSizeRegExString}${wordFindRegExString}`, 'g');
  let lines = (str.match(wordSearch) || []).map(l => trim(l));
  
  if(cut){
    const maxSizeSearch = new RegExp(`${maxSizeRegExString}`, 'g');
    lines = lines.reduce((a,line) => { return [...a, ...line.match(maxSizeSearch) || []];}, []);
  }

  var result = lines.map(function(line) {
    if (line.slice(-1) === '\n') {
      line = line.slice(0, line.length - 1);
    }
    return line;
  }).join(newline);

  //if (options.trim === true) {
    result = result.replace(/[ \t]*$/gm, '');
  //}
  
  return result;
};


module.exports.strlen = (str) => {
  if (!str) {
    return 0;
  }
  return str.length;
};

module.exports.str_replace = (search, replace, subject, count) => {
  search = Array.isArray(search) ? search : [search];
  //replace = Array.isArray(replace) ? replace : [replace];

  for (let i = 0; i < search.length; i++) {
    const s = search[i];
    const r = Array.isArray(replace) ? replace[i] ? replace[i] : null : replace;

    const reg = new RegExp(s, "g");

    subject = subject.replace(reg, r);
  }


  return subject;
};

module.exports.preg_match_all = (pattern, subject, matches = [], flags = PREG_PATTERN_ORDER, offset = 0) => {
  subject = subject.substring(offset);

  // parts.push(regexMods);
  matches.length = 0;


  let regexp = pattern instanceof RegExp ? pattern : toRegex(pattern, "g").regexp;

  if (!regexp.global) {
    regexp = new RegExp(regexp.source, regexp.flags + "g");
  }

  while ((m = regexp.exec(subject)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regexp.lastIndex) {
      regexp.lastIndex++;
    }

    let res = [];

    // The result can be accessed through the `m`-variable.
    if (flags === PREG_OFFSET_CAPTURE || flags === PREG_PATTERN_ORDER) {
      m.forEach((match, groupIndex) => {
        if (!matches[groupIndex]) {
          matches.push([]);
        }
        if (flags === PREG_OFFSET_CAPTURE) {
          matches[groupIndex].push([match, m.index]);
        } else {
          matches[groupIndex].push(match);
        }
      });
    } else if (flags === PREG_SET_ORDER) {
      matches.push(m);
    }
  }
  return matches.length > 0;
};

module.exports.preg_match = (pattern, subject, matches = [], flags, offset = 0) => {
  subject = subject.substring(offset);

  // parts.push(regexMods);
  matches.length = 0;

  const regexp = pattern instanceof RegExp ? pattern : toRegex(pattern).regexp;

  const found = 0;
  if ((m = regexp.exec(subject)) !== null) {
    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      matches.push(match);
      //console.log(`Found match, group ${groupIndex}: ${match}`);
    });

    return 1;
  }

  return 0;
};

module.exports.preg_grep = (regexp, subjects) => {
  return subjects.reduce(
    (all, ns) => {
      if (ns.match(regexp)) {
        all.push(ns);
      }
      return all;
    }, []);
}

function toRegex(pattern, addmods = "") {
  let parts = pattern.split('/');
  parts.shift();
  let pcreMods = parts.pop();
  let regexMods = addmods;

  for (let i = 0; i < pcreMods.length; i++) {
    let mod = pcreMods.charAt(i);
    switch (mod) {
      case "A":
        parts[0] = '^' + parts[0];
        break;
      case "x":
        break;
      default:
        regexMods += mod;
    }
  }

  const exp = parts.join('/');
  //console.log(pattern, regexMods, parts.join('/'));
  return {
    exp: parts.join('/'),
    mods: regexMods,
    regexp: new RegExp(parts.join('/'), regexMods)
  };
}

module.exports.implode = (conn, arr) => {
  return arr.join(conn);
};

module.exports.stripcslashes = (str) => {
  return str.replace(/\\./g, function (match) {
    return (new Function('return "' + match + '"'))() || match;
  });
};

module.exports.get_class = (obj) => {
  return obj.prototype.constructor.name;
};

module.exports.addcslashes = (str, charlist) => {
  //  discuss at: https://locutus.io/php/addcslashes/
  // original by: Brett Zamir (https://brett-zamir.me)
  //      note 1: We show double backslashes in the return value example
  //      note 1: code below because a JavaScript string will not
  //      note 1: render them as backslashes otherwise
  //   example 1: addcslashes('foo[ ]', 'A..z'); // Escape all ASCII within capital A to lower z range, including square brackets
  //   returns 1: "\\f\\o\\o\\[ \\]"
  //   example 2: addcslashes("zoo['.']", 'z..A'); // Only escape z, period, and A here since not a lower-to-higher range
  //   returns 2: "\\zoo['\\.']"
  //   _example 3: addcslashes("@a\u0000\u0010\u00A9", "\0..\37!@\x7F..\377"); // Escape as octals those specified and less than 32 (0x20) or greater than 126 (0x7E), but not otherwise
  //   _returns 3: '\\@a\\000\\020\\302\\251'
  //   _example 4: addcslashes("\u0020\u007E", "\40..\175"); // Those between 32 (0x20 or 040) and 126 (0x7E or 0176) decimal value will be backslashed if specified (not octalized)
  //   _returns 4: '\\ ~'
  //   _example 5: addcslashes("\r\u0007\n", '\0..\37'); // Recognize C escape sequences if specified
  //   _returns 5: "\\r\\a\\n"
  //   _example 6: addcslashes("\r\u0007\n", '\0'); // Do not recognize C escape sequences if not specified
  //   _returns 6: "\r\u0007\n"

  var target = ''
  var chrs = []
  var i = 0
  var j = 0
  var c = ''
  var next = ''
  var rangeBegin = ''
  var rangeEnd = ''
  var chr = ''
  var begin = 0
  var end = 0
  var octalLength = 0
  var postOctalPos = 0
  var cca = 0
  var escHexGrp = []
  var encoded = ''
  var percentHex = /%([\dA-Fa-f]+)/g

  var _pad = function (n, c) {
    if ((n = n + '').length < c) {
      return new Array(++c - n.length).join('0') + n
    }
    return n
  }

  for (i = 0; i < charlist.length; i++) {
    c = charlist.charAt(i)
    next = charlist.charAt(i + 1)
    if (c === '\\' && next && (/\d/).test(next)) {
      // Octal
      rangeBegin = charlist.slice(i + 1).match(/^\d+/)[0]
      octalLength = rangeBegin.length
      postOctalPos = i + octalLength + 1
      if (charlist.charAt(postOctalPos) + charlist.charAt(postOctalPos + 1) === '..') {
        // Octal begins range
        begin = rangeBegin.charCodeAt(0)
        if ((/\\\d/).test(charlist.charAt(postOctalPos + 2) + charlist.charAt(postOctalPos + 3))) {
          // Range ends with octal
          rangeEnd = charlist.slice(postOctalPos + 3).match(/^\d+/)[0]
          // Skip range end backslash
          i += 1
        } else if (charlist.charAt(postOctalPos + 2)) {
          // Range ends with character
          rangeEnd = charlist.charAt(postOctalPos + 2)
        } else {
          throw new Error('Range with no end point')
        }
        end = rangeEnd.charCodeAt(0)
        if (end > begin) {
          // Treat as a range
          for (j = begin; j <= end; j++) {
            chrs.push(String.fromCharCode(j))
          }
        } else {
          // Supposed to treat period, begin and end as individual characters only, not a range
          chrs.push('.', rangeBegin, rangeEnd)
        }
        // Skip dots and range end (already skipped range end backslash if present)
        i += rangeEnd.length + 2
      } else {
        // Octal is by itself
        chr = String.fromCharCode(parseInt(rangeBegin, 8))
        chrs.push(chr)
      }
      // Skip range begin
      i += octalLength
    } else if (next + charlist.charAt(i + 2) === '..') {
      // Character begins range
      rangeBegin = c
      begin = rangeBegin.charCodeAt(0)
      if ((/\\\d/).test(charlist.charAt(i + 3) + charlist.charAt(i + 4))) {
        // Range ends with octal
        rangeEnd = charlist.slice(i + 4).match(/^\d+/)[0]
        // Skip range end backslash
        i += 1
      } else if (charlist.charAt(i + 3)) {
        // Range ends with character
        rangeEnd = charlist.charAt(i + 3)
      } else {
        throw new Error('Range with no end point')
      }
      end = rangeEnd.charCodeAt(0)
      if (end > begin) {
        // Treat as a range
        for (j = begin; j <= end; j++) {
          chrs.push(String.fromCharCode(j))
        }
      } else {
        // Supposed to treat period, begin and end as individual characters only, not a range
        chrs.push('.', rangeBegin, rangeEnd)
      }
      // Skip dots and range end (already skipped range end backslash if present)
      i += rangeEnd.length + 2
    } else {
      // Character is by itself
      chrs.push(c)
    }
  }

  for (i = 0; i < str.length; i++) {
    c = str.charAt(i)
    if (chrs.indexOf(c) !== -1) {
      target += '\\'
      cca = c.charCodeAt(0)
      if (cca < 32 || cca > 126) {
        // Needs special escaping
        switch (c) {
          case '\n':
            target += 'n'
            break
          case '\t':
            target += 't'
            break
          case '\u000D':
            target += 'r'
            break
          case '\u0007':
            target += 'a'
            break
          case '\v':
            target += 'v'
            break
          case '\b':
            target += 'b'
            break
          case '\f':
            target += 'f'
            break
          default:
            // target += _pad(cca.toString(8), 3);break; // Sufficient for UTF-16
            encoded = encodeURIComponent(c)

            // 3-length-padded UTF-8 octets
            if ((escHexGrp = percentHex.exec(encoded)) !== null) {
              // already added a slash above:
              target += _pad(parseInt(escHexGrp[1], 16).toString(8), 3)
            }
            while ((escHexGrp = percentHex.exec(encoded)) !== null) {
              target += '\\' + _pad(parseInt(escHexGrp[1], 16).toString(8), 3)
            }
            break
        }
      } else {
        // Perform regular backslashed escaping
        target += c
      }
    } else {
      // Just add the character unescaped
      target += c
    }
  }

  return target
}
