const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const NullOutputFormatter = require('../formatter/NullOutputFormatter');
const Output = require('./Output');

class NullOutput
{

  setFormatter(formatter)
  {
    // do nothing
  }

  getFormatter()
  {
    if (this.formatter)
    {
      return this.formatter;
    }
    // to comply with the interface we must return a OutputFormatterInterface
    return this.formatter = new NullOutputFormatter();
  }

  setDecorated(decorated)
  {
    // do nothing
  }

  isDecorated()
  {
    return false;
  }

  setVerbosity(level)
  {
    // do nothing
  }

  getVerbosity()
  {
    return Output.VERBOSITY_QUIET;
  }

  isQuiet()
  {
    return true;
  }

  isVerbose()
  {
    return false;
  }

  isVeryVerbose()
  {
    return false;
  }

  isDebug()
  {
    return false;
  }

  writeln(messages, options)
  {
    // do nothing
  }

  write(messages, newline = false)
  {
    // do nothing
  }

}

module.exports = NullOutput;
