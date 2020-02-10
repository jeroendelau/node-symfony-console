const Command = require('../../src/command/Command');

class FooCommand extends Command
{
  configure()
  {
    this
      .setName('foo:bar')
      .setDescription('The foo:bar command')
      .setAliases(['afoobar'])
    ;
  }

  interact(input, output)
  {
    output.writeln('interact called');
  }

  execute(input, output)
  {
    this.input = input;
    this.output = output;

    output.writeln('called');

    return 0;
  }
}

module.exports = FooCommand;
