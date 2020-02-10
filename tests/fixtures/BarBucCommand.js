const Command = require('../../src/command/Command');

class BarBucCommand extends Command
{
  configure()
  {
    this.setName('bar:buc');
  }
}

module.exports = BarBucCommand;
