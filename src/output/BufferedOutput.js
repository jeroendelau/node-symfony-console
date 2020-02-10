const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const os = require('os');

const Output = require('./Output');

class BufferedOutput extends Output
{
  constructor(verbosity = Output.VERBOSITY_NORMAL, decorated = false, formatter = null)
  {
    super(verbosity, decorated, formatter);
    this.buffer = "";
  }
  fetch()
  {
    let content = this.buffer || "";
    this.buffer = '';

    return content;
  }

  doWrite(message, newline)
  {
    this.buffer += message;

    if (newline)
    {
      this.buffer += os.EOL;
    }
  }

}

module.exports = BufferedOutput;
