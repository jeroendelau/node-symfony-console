const {escapeshellarg, strip_tags, sprintf, is_iterable, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const OutputFormatter = require('../formatter/OutputFormatter');

const VERBOSITY_QUIET = 16;
const VERBOSITY_NORMAL = 32;
const VERBOSITY_VERBOSE = 64;
const VERBOSITY_VERY_VERBOSE = 128;
const VERBOSITY_DEBUG = 256;

const OUTPUT_NORMAL = 1;
const OUTPUT_RAW = 2;
const OUTPUT_PLAIN = 4;

class Output {

  static get VERBOSITY_QUIET() {
    return VERBOSITY_QUIET;
  }

  static get VERBOSITY_NORMAL() {
    return VERBOSITY_NORMAL;
  }

  static get VERBOSITY_VERBOSE() {
    return VERBOSITY_VERBOSE;
  }

  static get VERBOSITY_VERY_VERBOSE() {
    return VERBOSITY_VERY_VERBOSE;
  }

  static get VERBOSITY_DEBUG() {
    return VERBOSITY_DEBUG;
  }

  static get OUTPUT_NORMAL() {
    return OUTPUT_NORMAL;
  }

  static get OUTPUT_RAW() {
    return OUTPUT_RAW;
  }

  static get OUTPUT_PLAIN() {
    return OUTPUT_PLAIN;
  }

  constructor(verbosity = Output.VERBOSITY_NORMAL, decorated = false, formatter = null) {
    this.verbosity = null === verbosity ? Output.VERBOSITY_NORMAL : verbosity;
    this.formatter = formatter || new OutputFormatter();
    this.formatter.setDecorated(decorated);
  }


  setFormatter(formatter) {
    this.formatter = formatter;
  }

  getFormatter() {
    return this.formatter;
  }

  setDecorated(decorated) {
    this.formatter.setDecorated(decorated);
  }

  isDecorated() {
    return this.formatter.isDecorated();
  }

  setVerbosity(level) {
    this.verbosity = level;
  }

  getVerbosity() {
    return this.verbosity;
  }

  isQuiet() {
    return Output.VERBOSITY_QUIET === this.verbosity;
  }

  isVerbose() {
    return Output.VERBOSITY_VERBOSE <= this.verbosity;
  }

  isVeryVerbose() {
    return Output.VERBOSITY_VERY_VERBOSE <= this.verbosity;
  }

  isDebug() {
    return Output.VERBOSITY_DEBUG <= this.verbosity;
  }

  writeln(messages, options = Output.OUTPUT_NORMAL) {
    this.write(messages, true, options);
  }

  write(messages, newline = false, options = Output.OUTPUT_NORMAL) {
    const verbosities = Output.VERBOSITY_QUIET | Output.VERBOSITY_NORMAL | Output.VERBOSITY_VERBOSE | Output.VERBOSITY_VERY_VERBOSE | Output.VERBOSITY_DEBUG;
    const verbosity = verbosities & options || Output.VERBOSITY_NORMAL;

    if (verbosity > this.getVerbosity()) {
      return;
    }

    messages = this.format(messages, options);
    messages.forEach(m => this.doWrite(m, newline));
  }

  format(messages, options = Output.OUTPUT_NORMAL) {
    //messages = Array.isArray(messages) ? messages : [messages];
    if (!is_iterable(messages)) {
      messages = [messages];
    }

    let types = Output.OUTPUT_NORMAL | Output.OUTPUT_RAW | Output.OUTPUT_PLAIN;
    let type = types & options || Output.OUTPUT_NORMAL;

    const formatted = [];
    for (let message of messages) {
      switch (type) {
        case Output.OUTPUT_NORMAL:
          message = this.formatter.format(message);
          break;
        case Output.OUTPUT_RAW:
          break;
        case Output.OUTPUT_PLAIN:
          message = strip_tags(this.formatter.format(message));
          break;
      }
      formatted.push(message);
    }

    return formatted;
  }
}

module.exports = Output;
