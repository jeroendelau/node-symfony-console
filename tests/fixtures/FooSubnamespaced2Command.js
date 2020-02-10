const Command = require('../../src/command/Command');

class FooSubnamespaced2Command extends Command
{
  configure()
  {
    this
      .setName('foo:go:bret')
      .setDescription('The foo:bar:go command')
      .setAliases(['foobargo'])
    ;
  }

  execute(input, output)
  {
    this.input = input;
    this.output = output;

    return 0;
  }
}

module.exports = FooSubnamespaced2Command;
