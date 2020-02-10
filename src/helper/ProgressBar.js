const {escapeshellarg, PHP_EOL, rtrim, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const {Output, ConsoleOutput, ConsoleSectionOutput} =  require('../output');
const Helper =  require('./Helper');

const Terminal = require('../Terminal');

var formats;
var formatters;

class ProgressBar
{
  constructor(output, max = 0, minSecondsBetweenRedraws = 0.1)
  {


    this.barWidth = 28;
    this.barChar = null;
    this.emptyBarChar = '-';
    this.progressChar = '>';
    this.format = null;
    this.internalFormat = null;
    this.redrawFreq = 1;
    this.writeCount = null;
    this.lastWriteTime = null;
    this._minSecondsBetweenRedraws = 0;
    this._maxSecondsBetweenRedraws = 1;
    this.output = null;
    this.step = 0;
    this.max = null;
    this.startTime = null;
    this.stepWidth = null;
    this.percent = 0.0;
    this.formatLineCount = null;
    this.messages = {};
    this.shouldOverwrite = true;
    this.terminal = null;
    this.previousMessage = null;
    

    if (output instanceof ConsoleOutput)
    {
      let output = output.getErrorOutput();
    }

    this.output = output;
    this.setMaxSteps(max);
    this.terminal = new Terminal();

    if (0 < minSecondsBetweenRedraws)
    {
      this.redrawFreq = null;
      this._minSecondsBetweenRedraws = minSecondsBetweenRedraws;
    }

    if (!this.output.isDecorated())
    {
      // disable shouldOverwrite when output does not support ANSI codes +
      this.shouldOverwrite = false;

      // set a reasonable redraw frequency so output isn't flooded
      this.redrawFreq = null;
    }

    this.startTime = Math.floor(new Date().getTime() / 1000);
  }


  static setPlaceholderFormatterDefinition(name, callable)
  {
    if (!formatters)
    {
      formatters = this.initPlaceholderFormatters();
    }

    formatters[name] = callable;
  }

  static getPlaceholderFormatterDefinition(name)
  {
    if (!formatters)
    {
      formatters = this.initPlaceholderFormatters();
    }

    return isset(formatters[name]) ? formatters[name] : null;
  }

  static setFormatDefinition(name, format)
  {
    if (!formats)
    {
      formats = this.prototype.constructor.initFormats();
    }

    formats[name] = format;
  }

  static getFormatDefinition(name)
  {
    if (!formats)
    {
      formats = this.prototype.constructor.initFormats();
    }

    return isset(formats[name]) ? formats[name] : null;
  }

  setMessage(message, name = 'message')
  {
    this.messages[name] = message;
  }

  getMessage(name = 'message')
  {
    return this.messages[name];
  }

  getStartTime()
  {
    return this.startTime;
  }

  getMaxSteps()
  {
    return this.max;
  }

  getProgress()
  {
    return this.step;
  }

  getStepWidth()
  {
    return this.stepWidth;
  }

  getProgressPercent()
  {
    return this.percent;
  }

  getBarOffset()
  {
    return Math.floor(this.max ? this.percent * this.barWidth : (null === this.redrawFreq ? Math.min(5, this.barWidth / 15) * this.writeCount : this.step) % this.barWidth);
  }

  setBarWidth(size)
  {
    this.barWidth = Math.max(1, size);
  }

  getBarWidth()
  {
    return this.barWidth;
  }

  setBarCharacter(char)
  {
    this.barChar = char;
  }

  getBarCharacter()
  {
    if (null === this.barChar)
    {
      return this.max ? '=' : this.emptyBarChar;
    }

    return this.barChar;
  }

  setEmptyBarCharacter(char)
  {
    this.emptyBarChar = char;
  }

  getEmptyBarCharacter()
  {
    return this.emptyBarChar;
  }

  setProgressCharacter(char)
  {
    this.progressChar = char;
  }

  getProgressCharacter()
  {
    return this.progressChar;
  }

  setFormat(format)
  {
    this.format = null;
    this.internalFormat = format;
  }

  setRedrawFrequency(freq = null)
  {
    this.redrawFreq = null !== freq ? Math.max(1, freq) : null;
  }

  minSecondsBetweenRedraws(seconds)
  {
    this._minSecondsBetweenRedraws = seconds;
  }

  maxSecondsBetweenRedraws(seconds)
  {
    this._maxSecondsBetweenRedraws = seconds;
  }

  * iterate(iterable, max = null)
  {
    //if(iterable.length)
    this.start(max || (iterable.length) ? iterable.length : 0);

    forEach(iterable,  (value, key) =>
    {
      //yield {[key]: value};
      this.advance();
    });

    this.finish();
  }

  start(max = null)
  {
    this.startTime = Math.floor(new Date().getTime() / 1000);
    this.step = 0;
    this.percent = 0 + 0;

    if (null !== max)
    {
      this.setMaxSteps(max);
    }

    this.display();
  }

  advance(step = 1)
  {
    this.setProgress(this.step + step);
  }

  setOverwrite(overwrite)
  {
    this.shouldOverwrite = overwrite;
  }

  setProgress(step)
  {
    if (this.max && step > this.max)
    {
      this.max = step;
    } else if (step < 0)
    {
      step = 0;
    }

    let redrawFreq = this.redrawFreq || ((this.max || 10) / 10);
    let prevPeriod = Number.parseInt(this.step / redrawFreq);
    let currPeriod = Number.parseInt(step / redrawFreq);
    this.step = step;
    this.percent = this.max ? Number.parseFloat(this.step / this.max) : 0;
    let timeInterval = (new Date().getTime() / 1000) - this.lastWriteTime;

    // Draw regardless of other limits
    if (this.max === step)
    {
      this.display();

      return;
    }

    // Throttling
    if (timeInterval < this._minSecondsBetweenRedraws)
    {
      return;
    }

    // Draw each step period, but not too late
    if (prevPeriod !== currPeriod || timeInterval >= this._maxSecondsBetweenRedraws)
    {
      this.display();
    }
  }

  setMaxSteps(max)
  {
    this.format = null;
    this.max = Math.max(0, max);
    this.stepWidth = this.max ? Helper.strlen(this.max) : 4;
  }

  finish()
  {
    if (!this.max)
    {
      this.max = this.step;
    }

    if (this.step === this.max && !this.shouldOverwrite)
    {
      // prevent double 100% output
      return;
    }

    this.setProgress(this.max);
  }

  display()
  {
    if (Output.VERBOSITY_QUIET === this.output.getVerbosity())
    {
      return;
    }

    if (null === this.format)
    {
      this.setRealFormat(this.internalFormat || this.determineBestFormat());
    }

    this.overwrite(this.buildLine());
  }

  clear()
  {
    if (!this.shouldOverwrite)
    {
      return;
    }

    if (null === this.format)
    {
      this.setRealFormat(this.internalFormat || this.determineBestFormat());
    }

    this.overwrite('');
  }

  setRealFormat(format)
  {
    // try to use the _nomax variant if available
    if (!this.max && null !== this.constructor.getFormatDefinition(format + '_nomax'))
    {
      this.format = this.constructor.getFormatDefinition(format + '_nomax');
    } else if (null !== this.constructor.getFormatDefinition(format))
    {
      this.format = this.constructor.getFormatDefinition(format);
    } else
    {
      this.format = format;
    }
    this.formatLineCount = (this.format.match(/\n/g) || []).length;
  }

  overwrite(message)
  {
    if (this.previousMessage === message)
    {
      return;
    }

    let originalMessage = message;

    if (this.shouldOverwrite)
    {
      if (null !== this.previousMessage)
      {
        if (this.output instanceof ConsoleSectionOutput)
        {
          let lines = Math.floor(Helper.strlen(message) / this.terminal.getWidth()) + this.formatLineCount + 1;
          this.output.clear(lines);
        } else
        {
          // Erase previous lines
          if (this.formatLineCount > 0)
          {
            message = "\x1B[1A\x1B[2K".repeat(this.formatLineCount) + message;
          }

          // Move the _cursor to the beginning of the line and erase the line
          message = `\x0D\x1B[2K${message}`;
        }
      }
    } else if (this.step > 0)
    {
      message = PHP_EOL + message;
    }

    this.previousMessage = originalMessage;
    this.lastWriteTime = new Date().getTime() / 1000;

    this.output.write(message);
    ++this.writeCount;
  }

  determineBestFormat()
  {
    switch (this.output.getVerbosity())
    {
      // Output.VERBOSITY_QUIET: display is disabled anyway
      case Output.VERBOSITY_VERBOSE:
        return this.max ? 'verbose' : 'verbose_nomax';
      case Output.VERBOSITY_VERY_VERBOSE:
        return this.max ? 'very_verbose' : 'very_verbose_nomax';
      case Output.VERBOSITY_DEBUG:
        return this.max ? 'debug' : 'debug_nomax';
        default:
          return this.max ? 'normal' : 'normal_nomax';
    }
  }

  static initPlaceholderFormatters()
  {
    return {
      'bar': function (bar, output)
      {
        let completeBars = bar.getBarOffset() < 0 ? 0 : bar.getBarOffset();
        let display = bar.getBarCharacter().repeat(completeBars);
        if (completeBars < bar.getBarWidth())
        {
          let emptyBars = bar.getBarWidth() - completeBars - Helper.strlenWithoutDecoration(output.getFormatter(), bar.getProgressCharacter());
          display += bar.getProgressCharacter() + bar.getEmptyBarCharacter().repeat(emptyBars);
        }

        return display;
      },
      'elapsed': function (bar)
      {
        return Helper.formatTime(Math.floor(new Date().getTime() / 1000) - bar.getStartTime());
      },
      'remaining': function (bar)
      {
        let remaining = 0;
        if (!bar.getMaxSteps())
        {
          throw new Error('Unable to display the remaining time if the maximum number of steps is not set.');
        }

        if (bar.getProgress())
        {
          remaining = Math.round((Math.floor(new Date().getTime() / 1000) - bar.getStartTime()) / bar.getProgress() * (bar.getMaxSteps() - bar.getProgress()));
        }

        return Helper.formatTime(remaining);
      },
      'estimated': function (bar)
      {
        if (!bar.getMaxSteps())
        {
          throw new Error('Unable to display the estimated time if the maximum number of steps is not set.');
        }

        if (!bar.getProgress())
        {
          let estimated = 0;
        } else
        {
          let estimated = round((Math.floor(new Date().getTime() / 1000) - bar.getStartTime()) / bar.getProgress() * bar.getMaxSteps());
        }

        return Helper.formatTime(estimated);
      },
      'memory': function (bar)
      {
        return Helper.formatMemory(memory_get_usage(true));
      },
      'current': function (bar)
      {
        return String(bar.getProgress()).padStart(bar.getStepWidth(), ' ');
      },
      'max': function (bar)
      {
        return bar.getMaxSteps();
      },
      'percent': function (bar)
      {
        return Math.floor(bar.getProgressPercent() * 100);
      },
    };
  }

  static initFormats()
  {
    return {
      'normal': ' %current%/%max% [%bar%] %percent:3s%%',
      'normal_nomax': ' %current% [%bar%]',

      'verbose': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%',
      'verbose_nomax': ' %current% [%bar%] %elapsed:6s%',

      'very_verbose': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s%',
      'very_verbose_nomax': ' %current% [%bar%] %elapsed:6s%',

      'debug': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%',
      'debug_nomax': ' %current% [%bar%] %elapsed:6s% %memory:6s%',
    };
  }

  buildLine()
  {
    let regex = /%([a-z\-_]+)(?:\:([^%]+))?%/gi;
    let callback =  (match, p1, p2) =>
    {
      let formatter = this.constructor.getPlaceholderFormatterDefinition(p1);
      let text;
      if (formatter && formatter!== null)
      {
        text = formatter(this, this.output);
      } else if (isset(this.messages[p1]))
      {
        text = this.messages[p1];
      } else
      {
        return match;
      }

      if (isset(p2))
      {
        text = sprintf('%' + p2, text);
      }

      return text;
    };
    
    const line = this.format.replace(regex, callback);
    
    // gets string length for each sub line with multiline format
    let linesLength =  line.split("\n").map( (subLine) =>
    {
      return Helper.strlenWithoutDecoration(this.output.getFormatter(), rtrim(subLine, "\r"));
    });

    let linesWidth = Math.max(...linesLength);

    let terminalWidth = this.terminal.getWidth();
    if (linesWidth <= terminalWidth)
    {
      return line;
    }

    this.setBarWidth(this.barWidth - linesWidth + terminalWidth);


    return this.format.replace(regex, callback);
  }
}

module.exports = ProgressBar;
