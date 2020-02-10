const Command = require('../../src/command/Command');
const InputArgument = require('../../src/input/InputArgument');
const InputOption = require('../../src/input/InputOption');

class Foo1Command extends Command
{
  configure()
  {
    this
      .setName('foo:bar1')
      .setDescription('The foo:bar1 command')
      .setAliases(['afoobar1'])
    ;
  }

  execute(input, output)
  {
    this.input = input;
    this.output = output;

    return 0;
  }

}

module.exports = Foo1Command;
