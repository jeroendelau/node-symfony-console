const {sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, substr, array_shift, array_unshift, strpos} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const find = require('lodash/find');

const Input = require('./Input');

class ArgvInput extends Input
{

  constructor(argv = null, definition = null)
  {
    if (null === argv)
    {
      argv = process.argv;
    }

    // strip the application name and file
    argv = argv.splice(2);

    super(definition);

    this.tokens = argv;
  }

  setTokens(tokens)
  {
    this.tokens = tokens;
  }

  parse()
  {
    let parseOptions = true;
    this.parsed = [...this.tokens];

    while (this.parsed.length > 0)
    {
      let token = this.parsed.shift();
      if (parseOptions && '' == token)
      {
        this.parseArgument(token);
      } else if (parseOptions && '--' == token)
      {
        parseOptions = false;
      } else if (parseOptions && 0 === token.indexOf('--'))
      {
        this.parseLongOption(token);
      } else if (parseOptions && '-' === token[0] && '-' !== token)
      {
        this.parseShortOption(token);
      } else
      {
        this.parseArgument(token);
      }
    }
  }

  parseShortOption(token)
  {
    let name = substr(token, 1);
    if (name.length > 1)
    {
      if (this.definition.hasShortcut(name[0]) && this.definition.getOptionForShortcut(name[0]).acceptValue())
      {
        // an option with a value (with no space)
        this.addShortOption(name[0], substr(name, 1));
      } else
      {
        this.parseShortOptionSet(name);
      }
    } else
    {
      this.addShortOption(name, null);
    }
  }

  parseShortOptionSet(name)
  {
    let len = name.length;
    for (let i = 0; i < len; ++i)
    {
      if (!this.definition.hasShortcut(name[i]))
      {
        //let encoding = mb_detect_encoding(name, null, true);
        //throw new Error(sprintf('The "-%s" option does not exist + ', false === encoding ? name[i] : mb_substr(name, i, 1, encoding)));
        throw new Error(sprintf('The "-%s" option does not exist.', name[i]));
      }

      let option = this.definition.getOptionForShortcut(name[i]);
      if (option.acceptValue())
      {
        this.addLongOption(option.getName(), i === len - 1 ? null : substr(name, i + 1));

        break;
      } else
      {
        this.addLongOption(option.getName(), null);
      }
    }
  }

  parseLongOption(token)
  {
    const name = token.substring(2);
    const pos = name.indexOf('=');
    if (pos > -1)
    {
      let value = name.substring(pos + 1);
      if (0 === value.length)
      {
        //this.parsed.unshift(null);
        this.parsed.unshift(value);
      }
      this.addLongOption(name.substring(0, pos), value);
    } else
    {
      this.addLongOption(name, null);
    }
  }

  parseArgument(token)
  {
    let c = count(this.arguments);

    // if input is expecting another argument, add it
    if (this.definition.hasArgument(c))
    {
      let arg = this.definition.getArgument(c);
      this.arguments[arg.getName()] = arg.isArray() ? [token] : token;

      // if last argument isArray(), append token to last argument
    } else if (this.definition.hasArgument(c - 1) && this.definition.getArgument(c - 1).isArray())
    {
      let arg = this.definition.getArgument(c - 1);
      this.arguments[arg.getName()].push(token);

      // unexpected argument
    } else
    {
      let all = this.definition.getArguments();
      if (count(all)
      )
      {
        throw new Error(sprintf('Too many arguments, expected arguments "%s".', Object.keys(all).join('" "')));
      }

      throw new Error(sprintf('No arguments expected, got "%s".', token));
    }
  }

  addShortOption(shortcut, value)
  {
    if (!this.definition.hasShortcut(shortcut))
    {
      throw new Error(sprintf('The "-%s" option does not exist.', shortcut));
    }

    this.addLongOption(this.definition.getOptionForShortcut(shortcut).getName(), value);
  }

  addLongOption(name, value)
  {
    if (!this.definition.hasOption(name))
    {
      throw new Error(sprintf('The "--%s" option does not exist.', name));
    }

    let option = this.definition.getOption(name);

    if (null !== value && !option.acceptValue())
    {
      throw new Error(sprintf('The "--%s" option does not accept a value.', name));
    }

    if (in_array(value, ['', null], true) && option.acceptValue() && count(this.parsed))
    {
      // if option accepts an optional or mandatory argument
      // let's see if there is one provided
      let next = this.parsed.shift();
      if ((isset(next) && next.length > 0 && '-' !== next.charAt(0)) || in_array(next, ['', null], true))
      {
        value = next;
      } else
      {
        array_unshift(this.parsed, next);
      }
    }

    if (null === value)
    {
      if (option.isValueRequired())
      {
        throw new Error(sprintf('The "--%s" option requires a value.', name));
      }

      if (!option.isArray() && !option.isValueOptional())
      {
        value = true;
      }
    }

    if (option.isArray())
    {
      if (!isset(this.options[name]))
      {
        this.options[name] = [];
      }
      this.options[name].push(value);
    } else
    {
      this.options[name] = value;
    }
  }

  getFirstArgument()
  {
    let isOption = false;
    let res = find(this.tokens, (token, i) =>
    {
      if (is_string(token) && '-' === token.charAt(0))
      {
        if (false !== strpos(token, '=') || !isset(this.tokens[i + 1]))
        {
          return;
        }

        // If it's a long option, consider that everything after "--" is the option name +
        // Otherwise, use the last char (if it's a short option set, only the last one can take a value with space separator)
        let name = '-' === token.charAt(1) ? substr(token, 2) : substr(token, -1);
        if (!isset(this.options[name]) && !this.definition.hasShortcut(name))
        {
          // noop
        } else if ((isset(this.options[name]) || isset(this.options[name = this.definition.shortcutToName(name)])
          ) &&
          this.tokens[i + 1] === this.options[name]
        )
        {
          isOption = true;
        }

        return;
      }

      if (isOption)
      {
        isOption = false;
        return;
      }

      return true;
    });

    return res ? res : null;
  }

  hasParameterOption(values, onlyParams = false)
  {
    values = to_array(values);

    for (let i = 0; i < this.tokens.length; i++)
    {
      const token = this.tokens[i];
      if (onlyParams && '--' === token)
      {
        return false;
      }

      for (let j = 0; j < values.length; j++)
      {
        const value = values[j];
        // Options with values:
        //   For long options, test for '--option=' at beginning
        //   For short options, test for '-o' at beginning
        let leading = 0 === strpos(value, '--') ? value + '=' : value;
        if (token === value || '' !== leading && 0 === strpos(token, leading))
        {
          return true;
        }
      }
    }

    return false;
  }

  getParameterOption(values, fallback = false, onlyParams = false)
  {
    values = to_array(values);
    let tokens = [...this.tokens];

    while (0 < count(tokens))
    {
      let token = array_shift(tokens);
      if (onlyParams && '--' === token)
      {
        return fallback;
      }

      for (var j = 0; j < values.length; j++)
      {
        const value = values[j];
        if (token === value)
        {
          return array_shift(tokens);
        }
        // Options with values:
        //   For long options, test for '--option=' at beginning
        //   For short options, test for '-o' at beginning
        let leading = 0 === strpos(value, '--') ? value + '=' : value;
        if ('' !== leading && 0 === strpos(token, leading))
        {
          return substr(token, leading.length);
        }
      }
    }

    return fallback;
  }

  toString()
  {
    let tokens = this.tokens.map(function (token)
    {
      let match = token.match(/{^(-[^=]+=)( + +)}/);
      if (match)
      {
        return match[1] + this.escapeToken(match[2]);
      }

      if (token && '-' !== token[0])
      {
        return Input.escapeToken(token);
      }

      return token;
    },);

    return tokens.join(' ');
  }

}

module.exports = ArgvInput;
