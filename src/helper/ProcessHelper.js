const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const Output = require('../output/Output');
const Helper = require('./Helper');

class ProcessHelper extends Helper
{
  run(output, cmd, error = null, callback = null, verbosity = Output.VERBOSITY_VERY_VERBOSE)
  {
    if (output instanceof ConsoleOutput)
    {
      let output = output.getErrorOutput();
    }

    let formatter = this.getHelperSet().get('debug_formatter');

    if (cmd instanceof Process)
    {
      let cmd = [cmd];
    }

    if (!is_array(cmd))
    {
      throw new Error(sprintf('The "command" argument of "%s()" must be an array or a "%s" instance, "%s" given + ', __METHOD__, Process.class, is_object(cmd) ? get_class(cmd) : gettype(cmd)));
    }

    if (is_string(cmd[0] || null))
    {
      let process = new Process(cmd);
      cmd = [];
    } else if ((cmd[0] || null) instanceof Process)
    {
      let process = cmd[0];
      unset(cmd[0]);
    } else
    {
      throw new Error(sprintf('Invalid command provided to "%s()": the command should be an array whose first element is either the path to the binary to run or a "Process" object + ', __METHOD__));
    }

    if (verbosity <= output.getVerbosity())
    {
      output.write(formatter.start(spl_object_hash(process), this.escapeString(process.getCommandLine())));
    }

    if (output.isDebug())
    {
      let callback = this.wrapCallback(output, process, callback);
    }

    process.run(callback, cmd);

    if (verbosity <= output.getVerbosity())
    {
      let message = process.isSuccessful() ? 'Command ran successfully' : sprintf('%s Command did not run successfully', process.getExitCode());
      output.write(formatter.stop(spl_object_hash(process), message, process.isSuccessful()));
    }

    if (!process.isSuccessful() && null !== error)
    {
      output.writeln(sprintf('<error>%s</error>', this.escapeString(error)));
    }

    return process;
  }

  mustRun(output, cmd, error = null, callback = null)
  {
    let process = this.run(output, cmd, error, callback);

    if (!process.isSuccessful())
    {
      throw new Error(process);
    }

    return process;
  }

  wrapCallback(output, process, callback = null)
  {
    if (output instanceof ConsoleOutput)
    {
      let output = output.getErrorOutput();
    }

    let formatter = this.getHelperSet().get('debug_formatter');

    return function (type, buffer) {
      output.write(formatter.progress(spl_object_hash(process), this.escapeString(buffer), Process.ERR === type));

      if (null !== callback)
      {
        callback(type, buffer);
      }
    }
    ;
  }

  escapeString(str)
  {
    return str_replace('<', '\\<', str);
  }

  getName()
  {
    return 'process';
  }

}

module.exports = ProcessHelper;
