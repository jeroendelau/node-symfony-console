const {sprintf} = require('sprintf-js');

const VALUE_NONE = 1;
const VALUE_REQUIRED = 2;
const VALUE_OPTIONAL = 4;
const VALUE_IS_ARRAY = 8;

class InputOption
{
  static get VALUE_NONE()
  {
    return VALUE_NONE;
  }

  static get VALUE_REQUIRED()
  {
    return VALUE_REQUIRED;
  }

  static get VALUE_OPTIONAL()
  {
    return VALUE_OPTIONAL;
  }

  static get VALUE_IS_ARRAY()
  {
    return VALUE_IS_ARRAY;
  }

  /**
   *
   * @throws Error If option mode is invalid or incompatible
   * @param name
   * @param shortcut
   * @param mode
   * @param description
   * @param fallback
   */
  constructor(name, shortcut = null, mode = null, description = '', fallback = null)
  {
    if (0 === name.indexOf('--'))
    {
      name = name.substr(2);
    }

    if (name.length === 0)
    {
      throw new Error('An option name cannot be empty.');
    }

    if (!shortcut)
    {
      shortcut = null;
    }

    if (null !== shortcut)
    {
      if (Array.isArray(shortcut))
      {
        shortcut = shortcut.join('|');
      }

      shortcut = shortcut
        .replace(/^-+/g, '')
        .split(/\|-?/)
        .filter(x => x)
        .join("|");


      if (0 === shortcut.length)
      {
        throw new Error('An option shortcut cannot be empty.');
      }
    }

    if (null === mode)
    {
      mode = InputOption.VALUE_NONE;
    } else if (mode > 15 || mode < 1)
    {
      throw new Error(sprintf('Option mode "%s" is not valid.', mode));
    }

    this.name = name;
    this.shortcut = shortcut;
    this.mode = mode;
    this.description = description;

    if (this.isArray() && !this.acceptValue())
    {
      throw new Error('Impossible to have an option mode VALUE_IS_ARRAY if the option does not accept a value.');
    }

    this.setFallback(fallback);
  }

  /**
   * Returns the option shortcut.
   *
   * @return string|null The shortcut
   */
  getShortcut()
  {
    return this.shortcut;
  }

  /**
   * Returns the option name.
   *
   * @return string The name
   */
  getName()
  {
    return this.name;
  }

  /**
   * Returns true if the option accepts a value.
   *
   * @return boolean true if value mode is not InputOption.VALUE_NONE, false otherwise
   */
  acceptValue()
  {
    return this.isValueRequired() || this.isValueOptional();
  }

  /**
   * Returns true if the option requires a value.
   *
   * @return boolean true if value mode is InputOption.VALUE_REQUIRED, false otherwise
   */
  isValueRequired()
  {
    return InputOption.VALUE_REQUIRED === (InputOption.VALUE_REQUIRED & this.mode);
  }

  /**
   * Returns true if the option takes an optional value.
   *
   * @return boolean true if value mode is InputOption.VALUE_OPTIONAL, false otherwise
   */
  isValueOptional()
  {
    return InputOption.VALUE_OPTIONAL === (InputOption.VALUE_OPTIONAL & this.mode);
  }

  /**
   * Returns true if the option can take multiple values.
   *
   * @return boolean true if mode is InputOption.VALUE_IS_ARRAY, false otherwise
   */
  isArray()
  {
    return InputOption.VALUE_IS_ARRAY === (InputOption.VALUE_IS_ARRAY & this.mode);
  }

  /**
   * Sets the fallback value.
   *
   * @throws Error When incorrect fallback value is given
   * @param fallback
   */
  setFallback(fallback = null)
  {
    if (InputOption.VALUE_NONE === (InputOption.VALUE_NONE & this.mode) && null !== fallback)
    {
      throw new Error('Cannot set a fallback value when using InputOption.VALUE_NONE mode.');
    }

    if (this.isArray())
    {
      if (null === fallback)
      {
        fallback = [];
      } else if (!Array.isArray(fallback)
      )
      {
        throw new Error('A fallback value for an array option must be an array.');
      }
    }

    this.fallback = this.acceptValue() ? fallback : false;
  }

  /**
   * Returns the fallback value.
   *
   * @return string|string[]|int|bool|null The fallback value
   */
  getFallback()
  {
    return this.fallback;
  }

  /**
   * Returns the description text.
   *
   * @return string The description text
   */
  getDescription()
  {
    return this.description;
  }

  /**
   * Checks whether the given option equals this one.
   *
   * @return booleanean
   */
  equals(option)
  {
    return option.getName() === this.getName()
      && option.getShortcut() === this.getShortcut()
      && option.getFallback() === this.getFallback()
      && option.isArray() === this.isArray()
      && option.isValueRequired() === this.isValueRequired()
      && option.isValueOptional() === this.isValueOptional();
  }
}

module.exports = InputOption;
