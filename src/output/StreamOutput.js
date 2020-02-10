const os = require('os');
const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const supportsColor = require('supports-color');

const Output = require('./Output');

class StreamOutput extends Output
{
  constructor(stream, verbosity = StreamOutput.VERBOSITY_NORMAL, decorated = null, formatter = null)
  {
    super(verbosity,decorated,formatter);

    if (!stream.write)
    {
      throw new Error('The StreamOutput class needs a stream as its first argument.');
    }

    this.stream = stream;

    if (null === decorated)
    {
      decorated = this.hasColorSupport();
      this.formatter.setDecorated(decorated);
    }
  }


  getStream()
  {
    return this.stream;
  }

  doWrite(message, newline)
  {
    if (newline)
    {
      message += os.EOL;
    }

    try{
      this.stream.write(message);
    }
    catch(e)
    {
      // should never happen
      throw new Error('Unable to write output.');
    }

    // I think we don't need this
    // fflush(this.stream);
  }

  hasColorSupport()
  {
    return true;
    // Follow https://no-color + org/
    if (isset(_SERVER['NO_COLOR']) || false !== getenv('NO_COLOR'))
    {
      return false;
    }

    if ('Hyper' === getenv('TERM_PROGRAM'))
    {
      return true;
    }

    if (DIRECTORY_SEPARATOR === '\\')
    {
      //return (function_exists('sapi_windows_vt100_support') && @sapi_windows_vt100_support(this.stream))
      return (function_exists('sapi_windows_vt100_support') )//&& @sapi_windows_vt100_support(this.stream))
      || false !== getenv('ANSICON')
      || 'ON' === getenv('ConEmuANSI')
      || 'xterm' === getenv('TERM');
    }

    return stream_isatty(this.stream);
  }

}

module.exports = StreamOutput;
