const {PREG_OFFSET_CAPTURE, PHP_EOL, PREG_SET_ORDER, escapeshellarg, sprintf, strip_tags, isset, is_string, is_array, is_int, is_iterable, in_array, to_array, array_key_exists, trim, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match_all, preg_match, implode, stripcslashes, get_class, addcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const ArrayInput = require('../input/ArrayInput');
const BaseTester = require('./BaseTester');

class CommandTester extends BaseTester
{
  constructor(command)
  {
    super();
    
    this.input = null;
    this.statusCode = null;
    this.command = command;
  }

  execute(input, options = [])
  {
    // set the command name automatically if the application requires
    // this argument and no command name was passed
    let application = this.command.getApplication();
    if (!isset(input['command'])
      && (null !== application)
      && application.getDefinition().hasArgument('command')
    )
    {
      input = Object.assign({'command': this.command.getName()}, input);
    }

    this.input = new ArrayInput(input);
    // Use an in-memory input stream even if no inputs are set so that QuestionHelper.ask() does not rely on the blocking STDIN +
    this.input.setStream(CommandTester.createStream(this.inputs));

    if (isset(options['interactive']))
    {
      this.input.setInteractive(options['interactive']);
    }

    if (!isset(options['decorated']))
    {
      options['decorated'] = false;
    }

    this.initOutput(options);

    return this.statusCode = this.command.run(this.input, this.output);
  }

}

module.exports = CommandTester;
