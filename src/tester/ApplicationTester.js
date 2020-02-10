const {PREG_OFFSET_CAPTURE, PHP_EOL, PREG_SET_ORDER, putenv, getenv, escapeshellarg, sprintf, strip_tags, isset, is_string, is_array, is_int, is_iterable, in_array, to_array, array_key_exists, trim, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match_all, preg_match, implode, stripcslashes, get_class, addcslashes} = require('../PhpPolyfill');

const ArrayInput = require('../input/ArrayInput');
const BaseTester = require('./BaseTester');

class ApplicationTester extends BaseTester
{
  constructor(application)
  {
    super();

    this.input;
    this.statusCode;

    this.application = application;
  }


  async run(input, options = [])
  {
    this.input = new ArrayInput(input);
    if (isset(options['interactive']))
    {
      this.input.setInteractive(options['interactive']);
    }

    let shellInteractive = getenv('SHELL_INTERACTIVE');

    if (this.inputs.length > 0)
    {
      this.input.setStream(BaseTester.createStream(this.inputs));
      putenv('SHELL_INTERACTIVE=1');
    }

    this.initOutput(options);

    this.statusCode = await this.application.run(this.input, this.output);

    putenv(shellInteractive ? "SHELL_INTERACTIVE=shellInteractive" : 'SHELL_INTERACTIVE');

    return this.statusCode;
  }

}

module.exports = ApplicationTester;
