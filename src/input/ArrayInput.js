const {sprintf, isset, is_string, is_array, is_int, in_array, to_array, strpos, substr, escapeshellarg, implode} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const find = require('lodash/find');

const Input = require('./Input');
const InputDefinition = require('./InputDefinition');

class ArrayInput extends Input
{
  constructor(parameters, definition = null)
  {
    super(definition);

    this.parameters = is_string(parameters) ? [parameters] : parameters;
    if (null === definition)
    {
      this.definition = new InputDefinition();
    } else
    {
      this.bind(definition);
      // this.validate();
    }
  }

  getFirstArgument()
  {
    const el = find(this.parameters, function (value, param)
    {
      return !(param && is_string(param) && '-' === param[0]);
    });

    return el ? el : null;
  }

  hasParameterOption(values, onlyParams = false)
  {
    values = to_array(values);

    var res = false;

    forEach(this.parameters, function (v, k)
    {
      if (!is_int(k))
      {
        v = k;
      }

      if (onlyParams && '--' === v)
      {
        res = false;
        return false;
      }

      if (in_array(v, values))
      {
        res = true;
        return false;
      }
    });

    return res;
  }

  getParameterOption(values, fallback = false, onlyParams = false)
  {
    values = to_array(values);

    let res = fallback;

    forEach(this.parameters, function (v, k)
    {
      if (onlyParams && ('--' === k || (is_int(k) && '--' === v)))
      {
        return false;
      }

      if (is_int(k))
      {
        if (in_array(v, values))
        {
          res = true;
          return false;
        }
      } else if (in_array(k, values))
      {
        res = v;
        return false;
      }
    });

    return res;
  }

  toString()
  {
    let params = [];
    forEach(this.parameters, (val, param) =>
    {
      if (param && is_string(param) && '-' === param[0])
      {
        if (is_array(val))
        {
          forEach(val, (v) =>
          {
            params.push(param + ('' != v ? '=' + Input.escapeToken(v) : ''));
          });
        } else
        {
          params.push(param + ((val && '' != val) ? '=' + Input.escapeToken(val) : ''));
        }
      } else
      {
        params.push(is_array(val) ? implode(' ', val.map(Input.escapeToken)) : Input.escapeToken(val));
      }
    });

    return implode(' ', params);
  }

  parse()
  {
    forEach(this.parameters, (value, key) =>
    {
      if ('--' === key)
      {
        return false
      }
      if (0 === strpos(key, '--'))
      {
        this.addLongOption(substr(key, 2), value);
      } else if (0 === strpos(key, '-'))
      {
        this.addShortOption(substr(key, 1), value);
      } else
      {
        this.addArgument(key, value);
      }
    });
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

    if (null === value)
    {
      if (option.isValueRequired())
      {
        throw new Error(sprintf('The "--%s" option requires a value.', name));
      }

      if (!option.isValueOptional())
      {
        let value = true;
      }
    }

    this.options[name] = value;
  }

  addArgument(name, value)
  {
    if (!this.definition.hasArgument(name))
    {
      throw new Error(sprintf('The "%s" argument does not exist.', name));
    }

    this.arguments[name] = value;
  }
}

module.exports = ArrayInput;
