class CommandNotFoundError extends Error
{
  constructor(message, alternatives = [], code = 0, previous = null)
  {
    super(message, code, previous);

    this.alternatives = alternatives;
  }

  getAlternatives()
  {
    return this.alternatives;
  }

}

module.exports = CommandNotFoundError;
