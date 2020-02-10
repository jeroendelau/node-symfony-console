const Command = require('../../src/command/Command');

class Foo6Command extends Command
{
  configure()
  {
    this.setName('0foo:bar').setDescription('0foo:bar command');
  }

}

module.exports = Foo6Command;
