const Command = require('../../src/command/Command');

class FooSameCaseUppercaseCommand extends Command
{
  configure()
  {
    this.setName('foo:BAR').setDescription('foo:BAR command');
  }
}

module.exports = FooSameCaseUppercaseCommand;
