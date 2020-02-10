const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const DescriptorHelper = require('../helper/DescriptorHelper');
const InputArgument = require('../input/InputArgument');
const InputDefinition = require('../input/InputDefinition');
const InputOption = require('../input/InputOption');

const Command = require('./Command');

class ListCommand extends Command
{
  configure()
  {
    this
      .setName('list')
      .setDefinition(this.createDefinition())
      .setDescription('Lists commands')
      .setHelp(`The <info>%command.name%</info> command lists all commands:

  <info>php %command.full_name%</info>

You can also display the commands for a specific namespace:

  <info>php %command.full_name% test</info>

You can also output the information in other formats by using the <comment>--format</comment> option:

  <info>php %command.full_name% --format=xml</info>

It's also possible to get raw list of commands (useful for embedding command runner):

  <info>php %command.full_name% --raw</info>`);
  }

  getNativeDefinition()
  {
    return this.createDefinition();
  }

  execute(input, output)
  {
    let helper = new DescriptorHelper();
    helper.describe(output, this.getApplication(), {
      'format': input.getOption('format'),
      'raw_text': input.getOption('raw'),
      'namespace': input.getArgument('namespace'),
    });

    return 0;
  }

  createDefinition()
  {
    return new InputDefinition([
      new InputArgument('namespace', InputArgument.OPTIONAL, 'The namespace name'),
      new InputOption('raw', null, InputOption.VALUE_NONE, 'To output raw command list'),
      new InputOption('format', null, InputOption.VALUE_REQUIRED, 'The output format (txt, xml, json, or md)', 'txt'),
    ]);
  }

}

module.exports = ListCommand;
