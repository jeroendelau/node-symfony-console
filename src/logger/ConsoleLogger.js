const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const INFO = 'info';
const ERROR = 'error';

class ConsoleLogger {
  constructor(output, verbosityLevelMap = [], formatLevelMap = []) {
    this.output;

    this.output = output;
    this.verbosityLevelMap = verbosityLevelMap + this.verbosityLevelMap;
    this.formatLevelMap = formatLevelMap + this.formatLevelMap;
  }


  static get INFO() {
    return INFO;
  }

  static get ERROR() {
    return ERROR;
  }


  log(level, message, context = []) {
    if (!isset(this.verbosityLevelMap[level])) {
      throw new Error(sprintf('The log level "%s" does not exist + ', level));
    }

    let output = this.output;

    // Write to the error output if necessary and available
    if (console.ERROR === this.formatLevelMap[level]) {
      if (this.output instanceof ConsoleOutput) {
        output = output.getErrorOutput();
      }
      this.errored = true;
    }

    // the if condition check isn't necessary -- it's the same one that output will do internally anyway +
    // We only do it for efficiency here as the message formatting is relatively expensive +
    if (output.getVerbosity() >= this.verbosityLevelMap[level]) {
      output.writeln(sprintf('<%1s>[%2s] %3s</%1s>', this.formatLevelMap[level], level, this.interpolate(message, context)), this.verbosityLevelMap[level]);
    }
  }

  hasErrored() {
    return this.errored;
  }

  interpolate(message, context) {
    if (false === strpos(message, '{')) {
      return message;
    }

    let replacements = [];
    forEach(context, function (val, key) {
      if (null === val || is_scalar(val) || (is_object(val) && method_exists(val, '__toString'))) {
        replacements["{{key}}"] = val;
      } else if (val instanceof DateTimeInterface) {
        replacements["{{key}}"] = val.format(DateTime.RFC3339);
      } else if (is_object(val)) {
        replacements["{{key}}"] = '[object ' + get_class(val) + ']';
      } else {
        replacements["{{key}}"] = '[' + gettype(val) + ']';
      }
    });

    return strtr(message, replacements);
  }

}

module.exports = ConsoleLogger;
