const Command = require('../../src/command/Command');

class FooHiddenCommand extends Command
{
  configure()
  {
    this
      .setName('foo:hidden')
      .setAliases(['afoohidden'])
      .setHidden(true)
    ;
  }

  execute(input, output)
  {
    return 0;
  }

}

module.exports = FooHiddenCommand;
