const Command = require('../../src/command/Command');

class Foo4Command extends Command
{
  configure()
  {
    this.setName('foo3:bar:toh');
  }
}

module.exports = Foo4Command;
