const Command = require('../../src/command/Command');

class TestAmbiguousCommandRegistering extends Command
{
  configure()
  {
    this
      .setName('test-ambiguous')
      .setDescription('The test-ambiguous command')
      .setAliases(['test'])
    ;
  }

  execute(input, output)
  {
    output.write('test-ambiguous');

    return 0;
  }

}

module.exports = TestAmbiguousCommandRegistering;
