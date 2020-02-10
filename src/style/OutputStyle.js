const {escapeshellarg, PHP_EOL, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const ProgressBar = require('../helper/ProgressBar');
const ConsoleOutput = require('../output/ConsoleOutput');
const Output = require('../output/Output');


class OutputStyle
{
  constructor(output)
  {
    this.output = output;
  }

  newLine(count = 1)
  {
    this.output.write(PHP_EOL.repeat(count));
  }

  createProgressBar(max = 0)
  {
    return new ProgressBar(this.output, max);
  }

  write(messages, newline = false, type = Output.OUTPUT_NORMAL)
  {
    this.output.write(messages, newline, type);
  }

  writeln(messages, type = Output.OUTPUT_NORMAL)
  {
    this.output.writeln(messages, type);
  }

  format(messages, options = Output.OUTPUT_NORMAL) {
    return this.output.format(messages, options);
  }

  setVerbosity(level)
  {
    this.output.setVerbosity(level);
  }

  getVerbosity()
  {
    return this.output.getVerbosity();
  }

  setDecorated(decorated)
  {
    console.log(decorated);
    this.output.setDecorated(decorated);
  }

  isDecorated()
  {
    return this.output.isDecorated();
  }

  setFormatter(formatter)
  {
    this.output.setFormatter(formatter);
  }

  getFormatter()
  {
    return this.output.getFormatter();
  }

  isQuiet()
  {
    return this.output.isQuiet();
  }

  isVerbose()
  {
    return this.output.isVerbose();
  }

  isVeryVerbose()
  {
    return this.output.isVeryVerbose();
  }

  isDebug()
  {
    return this.output.isDebug();
  }

  getErrorOutput()
  {
    if (!this.output instanceof ConsoleOutput)
    {
      return this.output;
    }

    return this.output.getErrorOutput();
  }

}

module.exports = OutputStyle;
