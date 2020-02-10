const Command = require('../../src/command/Command');

class DescriptorCommand1 extends Command
{
  configure()
  {
    this
      .setName('descriptor:command1')
      .setAliases(['alias1', 'alias2'])
      .setDescription('command 1 description')
      .setHelp('command 1 help')
    ;
  }
}

module.exports = DescriptorCommand1;
