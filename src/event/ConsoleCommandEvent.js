const ConsoleEvent = require('./ConsoleEvent');
const RETURN_CODE_DISABLED = 113;

class ConsoleCommandEvent extends ConsoleEvent
{
  static get RETURN_CODE_DISABLED()
  {
    return RETURN_CODE_DISABLED;
  }

  disableCommand()
  {
    return this.commandShouldRun = false;
  }

  enableCommand()
  {
    return this.commandShouldRun = true;
  }

  commandShouldRun()
  {
    return this.commandShouldRun;
  }

}

module.exports = ConsoleCommandEvent;
