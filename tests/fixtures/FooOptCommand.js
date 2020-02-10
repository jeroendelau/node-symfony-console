const Command = require('../../src/command/Command');
const InputOption = require('../../src/input/InputOption');

class FooOptCommand extends Command
{
  configure()
  {
    this
      .setName('foo:bar')
      .setDescription('The foo:bar command')
      .setAliases(['afoobar'])
      .addOption('fooopt', 'fo', InputOption.VALUE_OPTIONAL, 'fooopt description')
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
    output.writeln(this.input.getOption('fooopt'));

    return 0;
  }
}

module.exports = FooOptCommand;
