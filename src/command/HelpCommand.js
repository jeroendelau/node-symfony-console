const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const DescriptorHelper = require('../helper/DescriptorHelper');
const InputArgument = require('../input/InputArgument');
const InputOption = require('../input/InputOption');

const Command = require('./Command');

class HelpCommand extends Command
{

  constructor(name = null)
  {
    super(name);
    this.command = null;
  }
  configure()
  {
    this.ignoreValidationErrors();

    this
      .setName('help')
      .setDefinition([
        new InputArgument('command_name', InputArgument.OPTIONAL, 'The command name', 'help'),
        new InputOption('format', null, InputOption.VALUE_REQUIRED, 'The output format (txt, xml, json, or md)', 'txt'),
        new InputOption('raw', null, InputOption.VALUE_NONE, 'To output raw command help'),
      ])
      .setDescription('Displays help for a command')
      .setHelp(`The <info>%command.name%</info> command displays help for a given command:

  <info>%command.full_name% list</info>

You can also output the help in other formats by using the <comment>--format</comment> option:

  <info>%command.full_name% --format=xml list</info>

To display the list of available commands, please use the <info>list</info> command.`
      );
  }

  setCommand(command)
  {
    this.command = command;
  }

  execute(input, output)
  {
    if (null === this.command)
    {
      this.command = this.getApplication().find(input.getArgument('command_name'));
    }

    let helper = new DescriptorHelper();
    helper.describe(output, this.command, {
      'format': input.getOption('format'),
      'raw_text': input.getOption('raw'),
    });

    this.command = null;

    return 0;
  }

}

module.exports = HelpCommand;
