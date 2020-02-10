const Command = require('../../src/command/Command');

class FooLock2Command extends Command
{
  configure()
  {
    this.setName('foo:lock2');
  }

  execute(input, output)
  {
    try
    {
      this.lock();
      this.lock();
    } catch (e)
    {
      return 1;
    }

    return 2;
  }

}

module.exports = FooLock2Command;
