const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

class Helper
{
  setHelperSet(helperSet = null)
  {
    this.helperSet = helperSet;
  }

  getHelperSet()
  {
    return this.helperSet;
  }

  static strlen(string)
  {
    if (string === null || string === undefined)
    {
      return 0;
    }

    return String(string).length;

    // if (false === encoding = mb_detect_encoding(string, null, true))
    // {
    //   return strlen;
    // }

    // return mb_strwidth(string, encoding).toString();
  }

  static substr(string, from, length = null)
  {
    return substr(string, from, length);

    // if (false === encoding = mb_detect_encoding(string, null, true))
    // {
    //   return substr(string, from, length);
    // }

    // return mb_substr(string, from, length, encoding);
  }

  static formatTime(secs)
  {
    const timeFormats = [
      [0, '< 1 sec'],
      [1, '1 sec'],
      [2, 'secs', 1],
      [60, '1 min'],
      [120, 'mins', 60],
      [3600, '1 hr'],
      [7200, 'hrs', 3600],
      [86400, '1 day'],
      [172800, 'days', 86400],
    ];

    var res = 0;
    forEach(timeFormats, (format, index) =>
    {
      if (secs >= format[0])
      {
        if ((isset(timeFormats[index + 1]) && secs < timeFormats[index + 1][0])
          || index == count(timeFormats) - 1
        )
        {
          if (2 == count(format))
          {
            res = format[1];
            return false;
          }

          res = Math.floor(secs / format[2]) + ' ' + format[1];
          return false;
        }
      }
    });
    return res;
  }

  static formatMemory(memory)
  {
    if (memory >= 1024 * 1024 * 1024)
    {
      return sprintf('%.1f GiB', memory / 1024 / 1024 / 1024);
    }

    if (memory >= 1024 * 1024)
    {
      return sprintf('%.1f MiB', memory / 1024 / 1024);
    }

    if (memory >= 1024)
    {
      return sprintf('%d KiB', memory / 1024);
    }

    return sprintf('%d B', memory);
  }

  static strlenWithoutDecoration(formatter, string)
  {
    return Helper.strlen(Helper.removeDecoration(formatter, string));
  }

  static removeDecoration(formatter, string)
  {
    let isDecorated = formatter.isDecorated();
    formatter.setDecorated(false);
    // remove <...> formatting
    string = formatter.format(string);
    // remove already formatted characters
    string = string.replace(/\x1B\[[^m]*m/g, '');
    formatter.setDecorated(isDecorated);

    return string;
  }

}

module.exports = Helper;
