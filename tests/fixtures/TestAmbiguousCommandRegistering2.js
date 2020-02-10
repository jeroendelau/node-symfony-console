const Command = require('../../src/command/Command');

class TestAmbiguousCommandRegistering2 extends Command
{
  configure()
  {
    this
      .setName('test-ambiguous2')
      .setDescription('The test-ambiguous2 command')
    ;
  }

  execute(input, output)
  {
    output.write('test-ambiguous2');

    return 0;
  }
}

module.exports = TestAmbiguousCommandRegistering2;
