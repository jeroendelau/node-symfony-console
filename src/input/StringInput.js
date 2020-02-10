const {escapeshellarg, sprintf, str_replace, stripcslashes, preg_match, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const REGEX_STRING = '([^\\s]+?)(?:\\s|(?<!\\\\)"|(?<!\\\\)\'|$)';
const REGEX_QUOTED_STRING = '(?:"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'([^\'\\\\]*(?:\\\\.[^\'\\\\]*)*)\')';

const ArgvInput = require('./ArgvInput');

class StringInput extends ArgvInput
{
  constructor(input)
  {
    super([]);
    this.setTokens(this.tokenize(input));
  }


  static get REGEX_STRING()
  {
    return REGEX_STRING;
  }

  static get REGEX_QUOTED_STRING()
  {
    return REGEX_QUOTED_STRING;
  }


  tokenize(input)
  {
    let tokens = [];
    let length = strlen(input);
    let cursor = 0;
    let match = [];
    while (cursor < length)
    {
      if (preg_match('/\\s+/A', input, match, null, cursor))
      {
      } else if (preg_match('/([^="\'\\s]+?)(=?)(' + StringInput.REGEX_QUOTED_STRING + '+)/A', input, match, null, cursor))
      {
        tokens.push(match[1] + match[2] + stripcslashes(str_replace(['"\'', '\'"', '\'\'', '""'], '', substr(match[3], 1, strlen(match[3]) - 2))));
      } else if (preg_match('/' + StringInput.REGEX_QUOTED_STRING + '/A', input, match, null, cursor))
      {
        tokens.push(stripcslashes(substr(match[0], 1, strlen(match[0]) - 2)));
      } else if (preg_match('/' + StringInput.REGEX_STRING + '/A', input, match, null, cursor))
      {
        tokens.push(stripcslashes(match[1]));
      } else
      {
        // should never happen
        throw new Error(sprintf('Unable to parse input near "... %s ..."', substr(input, cursor, 10)));
      }

      cursor += strlen(match[0]);
    }

    return tokens;
  }

}

module.exports = StringInput;
