const Command = require('../../src/command/Command');
const InputArgument = require('../../src/input/InputArgument');
const InputOption = require('../../src/input/InputOption');

class DescriptorCommandMbString extends Command
{
  configure()
  {
    this
      .setName('descriptor:åèä')
      .setDescription('command åèä description')
      .setHelp('command åèä help')
      .addUsage('-o|--option_name <argument_name>')
      .addUsage('<argument_name>')
      .addArgument('argument_åèä', InputArgument.REQUIRED)
      .addOption('option_åèä', 'o', InputOption.VALUE_NONE)
    ;
  }
}

module.exports = DescriptorCommandMbString;
