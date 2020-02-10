//  class ConsoleEvent extends Event {
class ConsoleEvent
{
  constructor(command = null, input, output)
  {
    this.command = command;
    this.input = input;
    this.output = output;
  }

  getCommand()
  {
    return this.command;
  }

  getInput()
  {
    return this.input;
  }

  getOutput()
  {
    return this.output;
  }
}

module.exports = ConsoleEvent;
