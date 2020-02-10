const Command = require('../../src/command/Command');

class FoobarCommand extends Command
{
  configure()
  {
    this
      .setName('foobar:foo')
      .setDescription('The foobar:foo command')
    ;
  }

  execute(input, output)
  {
    this.input = input;
    this.output = output;

    return 0;
  }
}

module.exports = FoobarCommand;
