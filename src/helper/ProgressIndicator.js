const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const Helper = require('./Helper');

const Output = require('../output/Output');

var formats;
var formatters;

class ProgressIndicator
{
  constructor(output, format = null, indicatorChangeInterval = 100, indicatorValues = null)
  {
    this.output;
    this.message;
    this.indicatorCurrent;
    this.indicatorUpdateTime;

    this.output = output;

    if (null === format)
    {
      format = this.determineBestFormat();
    }

    if (null === indicatorValues)
    {
      indicatorValues = ['-', '\\', '|', '/'];
    }

    indicatorValues = Object.values(indicatorValues);

    if (2 > count(indicatorValues))
    {
      throw new Error('Must have at least 2 indicator value characters + ');
    }

    this.format = this.constructor.getFormatDefinition(format);
    this.indicatorChangeInterval = indicatorChangeInterval;
    this.indicatorValues = indicatorValues;
    this.startTime = Math.floor(new Date().getTime() / 1000);
  }


  setMessage(message)
  {
    this.message = message;

    this.display();
  }

  start(message)
  {
    if (this.started)
    {
      throw new Error('Progress indicator already started + ');
    }

    this.message = message;
    this.started = true;
    this.startTime =  this.startTime = Math.floor(new Date().getTime() / 1000);
    this.indicatorUpdateTime = this.getCurrentTimeInMilliseconds() + this.indicatorChangeInterval;
    this.indicatorCurrent = 0;

    this.display();
  }

  advance()
  {
    if (!this.started)
    {
      throw new Error('Progress indicator has not yet been started + ');
    }

    if (!this.output.isDecorated())
    {
      return;
    }

    let currentTime = this.getCurrentTimeInMilliseconds();

    if (currentTime < this.indicatorUpdateTime)
    {
      return;
    }

    this.indicatorUpdateTime = currentTime + this.indicatorChangeInterval;
    ++this.indicatorCurrent;

    this.display();
  }

  finish(message)
  {
    if (!this.started)
    {
      throw new Error('Progress indicator has not yet been started + ');
    }

    this.message = message;
    this.display();
    this.output.writeln('');
    this.started = false;
  }

  static getFormatDefinition(name)
  {
    if (!formats)
    {
      formats = this.prototype.constructor.initFormats();
    }
    return isset(formats[name]) ? formats[name] : null;
  }

  static setPlaceholderFormatterDefinition(name, callable)
  {
    if (!formatters)
    {
      formatters = this.prototype.constructor.initPlaceholderFormatters();
    }
    formatters[name] = callable;
  }

  static getPlaceholderFormatterDefinition(name)
  {
    if (!formatters)
    {
      formatters = this.prototype.constructor.initPlaceholderFormatters();
    }
    return isset(formatters[name]) ? formatters[name] : null;
  }

  display()
  {
    if (Output.VERBOSITY_QUIET === this.output.getVerbosity())
    {
      return;
    }

    let callback =  (match, p1, p2) =>
    {
      let formatter = this.constructor.getPlaceholderFormatterDefinition(p1);
      if (formatter)
      {
        return formatter(this);
      }

      return match;
    };
    let str = this.format === null ? "" : this.format;
    this.overwrite(str.replace(/%([a-z\-_]+)(?:\:([^%]+))?%/gi, callback));
  }

  determineBestFormat()
  {
    switch (this.output.getVerbosity())
    {
      // Output.VERBOSITY_QUIET: display is disabled anyway
      case Output.VERBOSITY_VERBOSE:
        return this.output.isDecorated() ? 'verbose' : 'verbose_no_ansi';
      case Output.VERBOSITY_VERY_VERBOSE:
      case Output.VERBOSITY_DEBUG:
        return this.output.isDecorated() ? 'very_verbose' : 'very_verbose_no_ansi';
        default:
          return this.output.isDecorated() ? 'normal' : 'normal_no_ansi';
    }
  }

  overwrite(message)
  {
    if (this.output.isDecorated())
    {
      this.output.write("\x0D\x1B[2K");
      this.output.write(message);
    } else
    {
      this.output.writeln(message);
    }
  }

  getCurrentTimeInMilliseconds()
  {
    return new Date().getTime();
  }

  static initPlaceholderFormatters()
  {
    return {
      'indicator': (indicator) =>
      {
        return indicator.indicatorValues[indicator.indicatorCurrent % count(indicator.indicatorValues)];
      },
      'message': (indicator) =>
      {
        return indicator.message;
      },
      'elapsed': (indicator) =>
      {
        return Helper.formatTime( Math.floor(new Date().getTime() / 1000) - indicator.startTime);
      },
      'memory': () =>
      {
        return Helper.formatMemory(process.memoryUsage().heapUsed);
      },
    };
  }

  static initFormats()
  {
    return {
      'normal': ' %indicator% %message%',
      'normal_no_ansi': ' %message%',

      'verbose': ' %indicator% %message% (%elapsed:6s%)',
      'verbose_no_ansi': ' %message% (%elapsed:6s%)',

      'very_verbose': ' %indicator% %message% (%elapsed:6s%, %memory:6s%)',
      'very_verbose_no_ansi': ' %message% (%elapsed:6s%, %memory:6s%)',
    };
  }

}

module.exports = ProgressIndicator;
