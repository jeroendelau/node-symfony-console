const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const StreamOutput = require('./StreamOutput');
const ConsoleSectionOutput = require('./ConsoleSectionOutput');


class ConsoleOutput extends StreamOutput
{
  constructor(verbosity = ConsoleOutput.VERBOSITY_NORMAL, decorated = null, formatter = null)
  {
    //super(this.openOutputStream(), verbosity, decorated, formatter);
    super(process.stdout, verbosity, decorated, formatter);
    this.consoleSectionOutputs = [];
    let actualDecorated = this.isDecorated();
    this.stderr = new StreamOutput(this.openErrorStream(), verbosity, decorated, this.getFormatter());

    if (null === decorated)
    {
      this.setDecorated(actualDecorated && this.stderr.isDecorated());
    }
  }


  section()
  {
    return new ConsoleSectionOutput(this.getStream(), this.consoleSectionOutputs, this.getVerbosity(), this.isDecorated(), this.getFormatter());
  }

  setDecorated(decorated)
  {
    super.setDecorated(decorated);
    this.stderr.setDecorated(decorated);
  }

  setFormatter(formatter)
  {
    super.setFormatter(formatter);
    this.stderr.setFormatter(formatter);
  }

  setVerbosity(level)
  {
    super.setVerbosity(level);
    this.stderr.setVerbosity(level);
  }

  getErrorOutput()
  {
    return this.stderr;
  }

  setErrorOutput(error)
  {
    this.stderr = error;
  }

  hasStdoutSupport()
  {
    return false === this.isRunningOS400();
  }

  hasStderrSupport()
  {
    return false === this.isRunningOS400();
  }

  isRunningOS400()
  {
    let checks = [process.platform];
    return false !== strpos(implode(';', checks).toUpperCase(), 'OS400');
  }

  openOutputStream()
  {
    if (!this.hasStdoutSupport())
    {
      return fopen('php://output', 'w');
    }

    //return @fopen('php://stdout', 'w') ? : fopen('php://output', 'w');
  }

  openErrorStream()
  {
    return this.hasStderrSupport() ? process.stderr : process.stdout;
  }

}

module.exports = ConsoleOutput;
