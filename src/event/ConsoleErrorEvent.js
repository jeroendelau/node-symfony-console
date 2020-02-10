const ConsoleEvent = require('./ConsoleEvent');

class ConsoleErrorEvent extends ConsoleEvent
{
  constructor(input, output, error, command = null)
  {
    super(command, input, output);
    this.error;
    this.exitCode;
    this.error = error;
  }

  getError()
  {
    return this.error;
  }

  setError(error)
  {
    this.error = error;
  }

  setExitCode(exitCode)
  {
    this.exitCode = exitCode;

    // let r = new \ReflectionProperty(this.error, 'code');
    r.setAccessible(true);
    r.setValue(this.error, this.exitCode);
  }

  getExitCode()
  {
    return null !== this.exitCode ? this.exitCode : (is_int(this.error.getCode()) && 0 !== this.error.getCode() ? this.error.getCode() : 1);
  }

}

module.exports = ConsoleErrorEvent;
