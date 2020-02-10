const Command = require('../../src/command/Command');

class TestCommand extends Command
{
  configure()
  {
    this
      .setName('namespace:name')
      .setAliases(['name'])
      .setDescription('description')
      .setHelp('help')
    ;
  }

  async execute(input, output)
  {
    output.writeln('execute called');

    return 0;
  }

  async interact(input, output)
  {
    output.writeln('interact called');
  }

}

module.exports = TestCommand;
