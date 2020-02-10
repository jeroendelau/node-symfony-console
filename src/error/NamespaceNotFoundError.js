const CommandNotFoundError = require('./CommandNotFoundError');
class NamespaceNotFoundError extends CommandNotFoundError
{

}

module.exports = NamespaceNotFoundError;
