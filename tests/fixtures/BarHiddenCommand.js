const Command = require('../../src/command/Command');

class BarHiddenCommand extends Command
{
  configure()
  {
    this
      .setName('bar:hidden')
      .setAliases(['abarhidden'])
      .setHidden(true)
    ;
  }

  execute(input, output)
  {
    return 0;
  }
}

module.exports = BarHiddenCommand;
