const COMMAND = 'console.command';
const TERMINATE = 'console.terminate';
const ERROR = 'console.error';

class ConsoleEvents
{
  static get COMMAND()
  {
    return COMMAND;
  }

  static get TERMINATE()
  {
    return TERMINATE;
  }

  static get ERROR()
  {
    return ERROR;
  }
}

module.exports = ConsoleEvents;
