const Command = require('../../src/command/Command');
const InputArgument = require('../../src/input/InputArgument');
const InputOption = require('../../src/input/InputOption');

class DescriptorCommand2 extends Command
{
  configure()
  {
    this
      .setName('descriptor:command2')
      .setDescription('command 2 description')
      .setHelp('command 2 help')
      .addUsage('-o|--option_name <argument_name>')
      .addUsage('<argument_name>')
      .addArgument('argument_name', InputArgument.REQUIRED)
      .addOption('option_name', 'o', InputOption.VALUE_NONE)
    ;
  }
}

module.exports = DescriptorCommand2;
