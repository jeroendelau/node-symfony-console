const Command = require('../../src/command/Command');

class FooSameCaseLowercaseCommand extends Command
{
  configure()
  {
    this.setName('foo:bar').setDescription('foo:bar command');
  }

}

module.exports = FooSameCaseLowercaseCommand;
