const Command = require('../../src/command/Command');

class Foo2Command extends Command
{
  configure()
  {
    this
      .setName('foo1:bar')
      .setDescription('The foo1:bar command')
      .setAliases(['afoobar2'])
    ;
  }

  execute(input, output)
  {
    return 0;
  }

}

module.exports = Foo2Command;
