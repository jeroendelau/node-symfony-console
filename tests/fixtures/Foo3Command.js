const Command = require('../../src/command/Command');

class Foo3Command extends Command
{
  configure()
  {
    this
      .setName('foo3:bar')
      .setDescription('The foo3:bar command')
    ;
  }

  execute(input, output)
  {
    try
    {
      try
      {
        throw new Error('First exception <p>this is html</p>');
      } catch (e)
      {
        throw new Error('Second exception <comment>comment</comment>', 0, e);
      }
    } catch (e)
    {
      throw new Error('Third exception <fg=blue;bg=red>comment</>', 404, e);
    }

    return 0;
  }

}

module.exports = Foo3Command;
