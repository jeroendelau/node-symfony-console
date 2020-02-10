const {sprintf, isset, is_int} = require('../PhpPolyfill');
const InputOption = require('./InputOption');
const forEach = require('lodash/forEach');

class InputDefinition {
  /**
   * @param array definition An array of InputArgument and InputOption instance
   */
  constructor(definition = []) {
    this.arguments;
    this.requiredCount;
    this.hasAnArrayArgument = false;
    this.hasOptional;
    this.options;
    this.shortcuts;

    this.setDefinition(definition);
  }

  /**
   * Sets the definition of the input.
   */
  setDefinition(definition) {
    var args = [];
    var options = [];

    forEach(definition,(item) => {
      if (item instanceof InputOption) {
        options.push(item);
      } else {
        args.push(item);
      }
    });

    this.setArguments(args);
    this.setOptions(options);
  }

  /**
   * Sets the InputArgument objects.
   *
   * @param InputArgument[] arguments An array of InputArgument objects
   */
  setArguments(args = []) {
    this.arguments = {};
    this.requiredCount = 0;
    this.hasOptional = false;
    this.hasAnArrayArgument = false;
    this.addArguments(args);
  }

  /**
   * Adds an array of InputArgument objects.
   *
   * @param InputArgument[] arguments An array of InputArgument objects
   */
  addArguments(args = []) {
    if (null !== args) {
      forEach(args,argument => this.addArgument(argument));
    }
  }

  /**
   * @throws Error When incorrect argument is given
   */
  addArgument(argument) {
    if (isset(this.arguments[argument.getName()])) {
      throw new Error(sprintf('An argument with name "%s" already exists.', argument.getName()));
    }

    if (this.hasAnArrayArgument) {
      throw new Error('Cannot add an argument after an array argument.');
    }

    if (argument.isRequired() && this.hasOptional) {
      throw new Error('Cannot add a required argument after an optional one.');
    }

    if (argument.isArray()) {
      this.hasAnArrayArgument = true;
    }

    if (argument.isRequired()) {
      ++this.requiredCount;
    } else {
      this.hasOptional = true;
    }

    this.arguments[argument.getName()] = argument;
  }

  /**
   * Returns an InputArgument by name or by position.
   *
   * @param string|int name The InputArgument name or position
   *
   * @return InputArgument An InputArgument object
   *
   * @throws Error When argument given doesn't exist
   */
  getArgument(name) {
    if (!this.hasArgument(name)) {
      throw new Error(sprintf('The "%s" argument does not exist.', name));
    }

    let args = is_int(name) ? Object.values(this.arguments) : this.arguments;

    return args[name];
  }

  /**
   * Returns true if an InputArgument object exists by name or position.
   *
   * @param string|int name The InputArgument name or position
   *
   * @return boolean true if the InputArgument object exists, false otherwise
   */
  hasArgument(name) {
    let args = is_int(name) ? Object.values(this.arguments) : this.arguments;
    return isset(args[name]);
  }


  /**
   * Returns true if the definitions contains InputArguments
   *
   * @return boolean true if there are InputArguments objects, false otherwise
   */
  hasArguments() {
    return Object.keys(this.arguments).length > 0;
  }

  /**
   * Gets the array of InputArgument objects.
   *
   * @return InputArgument[] An array of InputArgument objects
   */
  getArguments() {
    return this.arguments;
  }

  /**
   * Returns the number of Inputargs.
   *
   * @return int The number of Inputargs
   */
  getArgumentCount() {
     return this.hasAnArrayArgument ? Number.MAX_SAFE_INTEGER : Object.keys(this.arguments).length;
  }

  /**
   * Returns the number of required Inputargs.
   *
   * @return int The number of required Inputargs
   */
  getArgumentRequiredCount() {
    return this.requiredCount;
  }

  /**
   * Gets the fallback values.
   *
   * @return array An array of fallback values
   */
  getArgumentFallbacks() {
    const values = {};
    forEach(this.arguments, (argument) => {
      values[argument.getName()] = argument.getFallback();
    });

    return values;
  }

  /**
   * Sets the InputOption objects.
   *
   * @param InputOption[] options An array of InputOption objects
   */
  setOptions(options = []) {
    this.options = {};
    this.shortcuts = {};
    this.addOptions(options);
  }

  /**
   * Adds an array of InputOption objects.
   *
   * @param InputOption[] options An array of InputOption objects
   */
  addOptions(options = []) {
    forEach(options, (option) => { this.addOption(option); });
  }

  /**
   * @throws Error When option given already exist
   */
  addOption(option) {
    if (isset(this.options[option.getName()]) && !option.equals(this.options[option.getName()])) {
      throw new Error(sprintf('An option named "%s" already exists.', option.getName()));
    }

    if (option.getShortcut()) {
      let shortCuts = option.getShortcut()
        .split('|');
      forEach(shortCuts, (shortcut) => {
        if (isset(this.shortcuts[shortcut]) && !option.equals(this.options[this.shortcuts[shortcut]])) {
          throw new Error(sprintf('An option with shortcut "%s" already exists.', shortcut));
        }
      });
    }

    this.options[option.getName()] = option;
    if (option.getShortcut()) {
      let shortCuts = option.getShortcut()
        .split('|');
      forEach(shortCuts, (shortcut) => {
        this.shortcuts[shortcut] = option.getName();
      });
    }
  }

  /**
   * Returns an InputOption by name.
   *
   * @return InputOption A InputOption object
   *
   * @throws Error When option given doesn't exist
   */
  getOption(name) {
    if (!this.hasOption(name)) {
      throw new Error(sprintf('The "--%s" option does not exist.', name));
    }

    return this.options[name];
  }

  /**
   * Returns true if an InputOption object exists by name.
   *
   * This method can't be used to check if the user included the option when
   * executing the command (use getOption() instead).
   *
   * @return boolean true if the InputOption object exists, false otherwise
   */
  hasOption(name) {
    return isset(this.options[name]);
  }

  /**
   * Returns true if the definitions contains InputOptions
   *
   * @return boolean true if there are InputOption objects, false otherwise
   */
  hasOptions() {
    return Object.keys(this.options).length > 0;
  }

  /**
   * Gets the array of InputOption objects.
   *
   * @return InputOption[] An array of InputOption objects
   */
  getOptions() {
    return this.options;
  }

  /**
   * Returns true if an InputOption object exists by shortcut.
   *
   * @return boolean true if the InputOption object exists, false otherwise
   */
  hasShortcut(name) {
    return isset(this.shortcuts[name]);
  }

  /**
   * Gets an InputOption by shortcut.
   *
   * @return InputOption An InputOption object
   */
  getOptionForShortcut(shortcut) {
    return this.getOption(this.shortcutToName(shortcut));
  }

  /**
   * Gets an array of fallback values.
   *
   * @return array An array of all fallback values
   */
  getOptionFallbacks() {
    const values = {};
    forEach(this.options, (option) => {
      values[option.getName()] = option.getFallback();
    });

    return values;
  }

  /**
   * Returns the InputOption name given a shortcut.
   *
   * @throws Error When option given does not exist
   *
   * @internal
   */
  shortcutToName(shortcut) {
    if (!isset(this.shortcuts[shortcut])) {
      throw new Error(sprintf('The "-%s" option does not exist.', shortcut));
    }

    return this.shortcuts[shortcut];
  }

  /**
   * Gets the synopsis.
   *
   * @return string The synopsis
   */
  getSynopsis(short = false) {
    var elements = [];

    if (short && this.hasOptions()) {
      elements.push('[options]');
    } else if (!short) {
      forEach(this.getOptions(), (option) => {
        let value = '';
        if (option.acceptValue()) {
          value = sprintf(
            ' %s%s%s',
            option.isValueOptional() ? '[' : '',
            option.getName().toUpperCase(),
            option.isValueOptional() ? ']' : ''
          );
        }

        var shortcut = option.getShortcut() ? sprintf('-%s|', option.getShortcut()) : '';
        elements.push(sprintf('[%s--%s%s]', shortcut, option.getName(), value));
      });
    }

    if (elements.length && this.hasArguments()) {
      elements.push('[--]');
    }

    var tail = '';

      forEach(this.getArguments(), (argument) => {
        var element = '<' + argument.getName() + '>';
        if (argument.isArray()) {
          element += '...';
        }

        if (!argument.isRequired()) {
          element = '[' + element;
          tail += ']';
        }

        elements.push(element);
      });

    return elements.join(' ') + tail;
  }
}

module.exports = InputDefinition;
