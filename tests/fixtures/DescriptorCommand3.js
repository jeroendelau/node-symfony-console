const Command = require('../../src/command/Command');

class DescriptorCommand3 extends Command
{
  configure()
  {
    this
      .setName('descriptor:command3')
      .setDescription('command 3 description')
      .setHelp('command 3 help')
      .setHidden(true)
    ;
  }

}

module.exports = DescriptorCommand3;
