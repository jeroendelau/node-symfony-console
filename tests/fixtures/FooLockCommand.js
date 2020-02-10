const Command = require('../../src/command/Command');

class FooLockCommand extends Command
{
  configure()
  {
    this.setName('foo:lock');
  }

  execute(input, output)
  {
    if (!this.lock())
    {
      return 1;
    }

    this.release();

    return 2;
  }

}

module.exports = FooLockCommand;
