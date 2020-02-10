const ConsoleEvent = require('./ConsoleEvent');

class ConsoleTerminateEvent extends ConsoleEvent
{
  constructor(command, input, output, exitCode)
  {
    super(command, input, output);
    this.exitCode;
    this.setExitCode(exitCode);
  }

  setExitCode(exitCode)
  {
    this.exitCode = exitCode;
  }

  getExitCode()
  {
    return this.exitCode;
  }

}

module.exports = ConsoleTerminateEvent;
