const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const Command = require('../command/Command');

class HelperSet
{
  [Symbol.iterator]() {
    return Object.values(this.helpers)[Symbol.iterator]();
  }
  constructor(helpers = [])
  {
    //this.command;
    this.helpers = {};
    forEach(helpers, (helper, alias) =>
    {
      this.set(helper, is_int(alias) ? null : alias);
    });
  }

  set(helper, alias = null)
  {
    this.helpers[helper.getName()] = helper;
    if (null !== alias)
    {
      this.helpers[alias] = helper;
    }
    helper.setHelperSet(this);
  }

  has(name)
  {
    return isset(this.helpers[name]);
  }

  get(name)
  {
    if (!this.has(name))
    {
      throw new Error(sprintf('The helper "%s" is not defined.', name));
    }
    return this.helpers[name];
  }

  setCommand(command = null)
  {
    this.command = command;
  }

  getCommand()
  {
    return this.command;
  }

  getIterator()
  {
    return Object.values(this.helpers);
  }
}

module.exports = HelperSet;
