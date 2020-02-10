const Command = require('../../src/command/Command');

class FooWithoutAliasCommand extends Command
{
  configure()
  {
    this
      .setName('foo')
      .setDescription('The foo command')
    ;
  }

  execute(input, output)
  {
    output.writeln('called');
    return 0;
  }
}

module.exports = FooWithoutAliasCommand;
