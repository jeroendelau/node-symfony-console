const Command = require('../../src/command/Command');

class FooSubnamespaced1Command extends Command
{
  configure()
  {
    this
      .setName('foo:bar:baz')
      .setDescription('The foo:bar:baz command')
      .setAliases(['foobarbaz'])
    ;
  }

  execute(input, output)
  {
    this.input = input;
    this.output = output;

    return 0;
  }
}

module.exports = FooSubnamespaced1Command;
