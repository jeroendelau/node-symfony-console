const {escapeshellarg, getenv, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const availableForegroundColors = {
  'black' : {'set' : 30, 'unset' : 39},
  'red' : {'set' : 31, 'unset' : 39},
  'green' : {'set' : 32, 'unset' : 39},
  'yellow' : {'set' : 33, 'unset' : 39},
  'blue' : {'set' : 34, 'unset' : 39},
  'magenta' : {'set' : 35, 'unset' : 39},
  'cyan' : {'set' : 36, 'unset' : 39},
  'white' : {'set' : 37, 'unset' : 39},
  'fallback' : {'set' : 39, 'unset' : 39},
};

const availableBackgroundColors = {
  'black' : {'set' : 40, 'unset' : 49},
  'red' : {'set' : 41, 'unset' : 49},
  'green' : {'set' : 42, 'unset' : 49},
  'yellow' : {'set' : 43, 'unset' : 49},
  'blue' : {'set' : 44, 'unset' : 49},
  'magenta' : {'set' : 45, 'unset' : 49},
  'cyan' : {'set' : 46, 'unset' : 49},
  'white' : {'set' : 47, 'unset' : 49},
  'fallback' : {'set' : 49, 'unset' : 49},
};

const availableOptions = {
  'bold' : {'set' : 1, 'unset' : 22},
  'underscore' : {'set' : 4, 'unset' : 24},
  'blink' : {'set' : 5, 'unset' : 25},
  'reverse' : {'set' : 7, 'unset' : 27},
  'conceal' : {'set' : 8, 'unset' : 28},
};

class OutputFormatterStyle
{
  constructor(foreground = null, background = null, options = [])
  {
    this.foreground = null;
    this.background = null;
    this.href = null;
    this.handlesHrefGracefully = null;
    this.options = [];

    if (null !== foreground)
    {
      this.setForeground(foreground);
    }
    if (null !== background)
    {
      this.setBackground(background);
    }
    if (count(options))
    {
      this.setOptions(options);
    }
  }

  setForeground(color = null)
  {
    if (null === color)
    {
      this.foreground = null;

      return;
    }

    if (!isset(availableForegroundColors[color]))
    {
      throw new Error(sprintf('Invalid foreground color specified: "%s" +  Expected one of (%s)', color, implode(', ', Object.keys(availableForegroundColors))));
    }

    this.foreground = availableForegroundColors[color];
  }

  setBackground(color = null)
  {
    if (null === color)
    {
      this.background = null;

      return;
    }

    if (!isset(availableBackgroundColors[color]))
    {
      throw new Error(sprintf('Invalid background color specified: "%s" +  Expected one of (%s)', color, implode(', ', Object.keys(availableBackgroundColors))));
    }

    this.background = availableBackgroundColors[color];
  }

  setHref(url)
  {
    this.href = url;
  }

  setOption(option)
  {
    if (!isset(availableOptions[option]))
    {
      throw new Error(sprintf('Invalid option specified: "%s" +  Expected one of (%s)', option, implode(', ', Object.keys(availableOptions))));
    }

    if (!in_array(availableOptions[option], this.options))
    {
      this.options.push(availableOptions[option]);
    }
  }

  unsetOption(option)
  {
    if (!isset(availableOptions[option]))
    {
      throw new Error(sprintf('Invalid option specified: "%s" +  Expected one of (%s)', option, implode(', ', Object.keys(availableOptions))));
    }

    let pos = this.options.indexOf(availableOptions[option]);
    if (false !== pos)
    {
      this.options.splice(pos, 1);
    }
  }

  setOptions(options)
  {
    this.options = [];

    forEach(options,  (option) =>
    {
      this.setOption(option);
    });
  }

  apply(text)
  {
    let setCodes = [];
    let unsetCodes = [];

    if (null === this.handlesHrefGracefully)
    {
      this.handlesHrefGracefully = 'JetBrains-JediTerm' !== getenv('TERMINAL_EMULATOR') && !getenv('KONSOLE_VERSION');
    }

    if (null !== this.foreground)
    {
      setCodes.push(this.foreground.set);
      unsetCodes.push(this.foreground.unset);
    }
    if (null !== this.background)
    {
      setCodes.push(this.background.set);
      unsetCodes.push(this.background.unset);
    }

    forEach(this.options, function (option)
    {
      setCodes.push(option['set']);
      unsetCodes.push(option['unset']);
    });

    if (null !== this.href && this.handlesHrefGracefully)
    {
      text = `\x1B]8;;${this.href}\x1B\\${text}\x1B]8;;\x1B\\`;
    }

    if (0 === count(setCodes))
    {
      return text;
    }

    return sprintf("\x1B[%sm%s\x1B[%sm", implode(';', setCodes), text, implode(';', unsetCodes));
  }
}

module.exports = OutputFormatterStyle;
