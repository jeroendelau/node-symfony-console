const {getenv, PREG_OFFSET_CAPTURE, PHP_EOL, PREG_SET_ORDER, escapeshellarg, sprintf, strip_tags, isset, is_string, is_array, is_int, is_iterable, in_array, to_array, array_key_exists, trim, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match_all, preg_match, implode, stripcslashes, get_class, addcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const mockStreams = require('stream-mock');

const ConsoleOutput = require('../output/ConsoleOutput');
const StreamOutput = require('../output/StreamOutput');
 
class BaseTester
{

  constructor()
  {
    this.output;
    this.inputs =[];
    this.captureStreamsIndependently = false;
  }

  getDisplay(normalize = false)
  {
    if (null === this.output)
    {
      throw new Error('Output not initialized, did you execute the command before requesting the display?');
    }

    let display = this.output.getStream().data.join("");

    if (normalize)
    {
      display = str_replace(PHP_EOL, "\n", display);
    }

    return display;
  }

  getErrorOutput(normalize = false)
  {
    if (!this.captureStreamsIndependently)
    {
      throw new Error('The error output is not available when the tester is run without "capture_stderr_separately" option set + ');
    }

    //rewind(this.output.getErrorOutput().getStream());

    let display = this.output.getErrorOutput().getStream().data.join("");

    if (normalize)
    {
      display = str_replace(PHP_EOL, "\n", display);
    }

    return display;
  }

  getInput()
  {
    return this.input;
  }

  getOutput()
  {
    return this.output;
  }

  getStatusCode()
  {
    return this.statusCode;
  }

  setInputs(inputs)
  {
    this.inputs = inputs;

    return this;
  }

  initOutput(options)
  {
    this.captureStreamsIndependently = array_key_exists('capture_stderr_separately', options) && options['capture_stderr_separately'];
    if (!this.captureStreamsIndependently)
    {
      this.output = new StreamOutput(new mockStreams.ObjectWritableMock());
      if (isset(options['decorated']))
      {
        this.output.setDecorated(options['decorated']);
      }
      if (isset(options['verbosity']))
      {
        this.output.setVerbosity(options['verbosity']);
      }
    } else
    {
      this.output = new ConsoleOutput(
        isset(options['verbosity']) ? options['verbosity'] : ConsoleOutput.VERBOSITY_NORMAL,
        isset(options['decorated']) ? options['decorated'] : null
      );

      let errorOutput = new StreamOutput( new mockStreams.ObjectWritableMock() );
      errorOutput.setFormatter(this.output.getFormatter());
      errorOutput.setVerbosity(this.output.getVerbosity());
      errorOutput.setDecorated(this.output.isDecorated());

      this.output.stderr = errorOutput;
      this.output.stream = new mockStreams.ObjectWritableMock();
      this.output.stream.isTTY = true;
    }
  }

  static createStream(inputs)
  {
    let stream = new mockStreams.DuplexMock();
    stream.isTTY = true;
    forEach(inputs, function (input)
    {
      stream.write(input + PHP_EOL);
    });

    //rewind(stream);

    return stream;
  }
}

module.exports = BaseTester;
