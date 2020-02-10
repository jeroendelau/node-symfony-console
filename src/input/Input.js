const {sprintf, escapeshellarg, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const filter = require('lodash/filter');

const InputDefinition = require('./InputDefinition');

class Input
{
  constructor(definition = null)
  {
    this.definition;
    this.stream;
    this.arguments = {};
    this.options = {};
    this.interactive = true;

    if (null === definition)
    {
      this.definition = new InputDefinition();
    } else
    {
      this.bind(definition);
      // this.validate();
    }
  }


  bind(definition)
  {
    this.arguments = {};
    this.options = {};
    this.definition = definition;

    this.parse();
  }

  validate()
  {
    const names = Object.keys(this.definition.getArguments());
    const missingArguments = filter(names, (name) => {
      return typeof this.arguments[name] === 'undefined' && this.definition.getArgument(name).isRequired();
    });

    if (missingArguments.length > 0) {
      throw new Error(sprintf('Not enough arguments (missing: "%s").', missingArguments.join(', ')));
    }
    return null;
  }


  isInteractive()
  {
    return this.interactive;
  }

  setInteractive(interactive)
  {
    this.interactive = interactive;
  }

  getArguments()
  {
    return Object.assign(this.definition.getArgumentFallbacks(), this.arguments);
  }

  getArgument(name)
  {
    if (!this.definition.hasArgument(name))
    {
      throw new Error(sprintf('The "%s" argument does not exist.', name));
    }

    return isset(this.arguments[name]) ? this.arguments[name] : this.definition.getArgument(name).getFallback();
  }

  setArgument(name, value)
  {
    if (!this.definition.hasArgument(name))
    {
      throw new Error(sprintf('The "%s" argument does not exist.', name));
    }

    this.arguments[name] = value;
  }

  hasArgument(name)
  {
    return this.definition.hasArgument(name);
  }

  getOptions()
  {
    return Object.assign({}, this.definition.getOptionFallbacks(), this.options);
  }

  getOption(name)
  {
    if (!this.definition.hasOption(name))
    {
      throw new Error(sprintf('The "%s" option does not exist.', name));
    }

    return array_key_exists(name, this.options) ? this.options[name] : this.definition.getOption(name).getFallback();
  }

  setOption(name, value)
  {
    if (!this.definition.hasOption(name))
    {
      throw new Error(sprintf('The "%s" option does not exist.', name));
    }

    this.options[name] = value;
  }

  hasOption(name)
  {
    return this.definition.hasOption(name);
  }

  static escapeToken(token)
  {
    if(token === null) return null;
    return token.match(/^[\w-]+$/) ? token : escapeshellarg(token);
  }

  setStream(stream)
  {
    this.stream = stream;
  }

  getStream()
  {
    return this.stream;
  }

}

module.exports = Input;
