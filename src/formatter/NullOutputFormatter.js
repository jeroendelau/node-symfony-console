const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');


const NullOutputFormatterStyle = require('./NullOutputFormatterStyle');

class NullOutputFormatter
{
  format(message)
  {
    // do nothing
  }

  getStyle(name)
  {
    if (this.style)
    {
      return this.style;
    }
    // to comply with the interface we must return a OutputFormatterStyleInterface
    return this.style = new NullOutputFormatterStyle();
  }

  hasStyle(name)
  {
    return false;
  }

  isDecorated()
  {
    return false;
  }

  setDecorated(decorated)
  {
    // do nothing
  }

  setStyle(name, style)
  {
    // do nothing
  }

}

module.exports = NullOutputFormatter;
  