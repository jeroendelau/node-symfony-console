const Command = require('../../src/command/Command');

class DescriptorCommand4 extends Command
{
  configure()
  {
    this
      .setName('descriptor:command4')
      .setAliases(['descriptor:alias_command4', 'command4:descriptor'])
    ;
  }
}

module.exports = DescriptorCommand4;
