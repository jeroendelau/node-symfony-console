const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const _ = require('lodash');
const Application = require('..//Application');
const Command = require('../command/Command');

const GLOBAL_NAMESPACE = '_global';

class ApplicationDescription
{
  constructor(application, namespace = null, showHidden = false)
  {
    this.namespaces = null;
    this.commands = null;
    this.aliases = null;
    this.application = application;
    this.namespace = namespace;
    this.showHidden = showHidden;
  }


  static get GLOBAL_NAMESPACE()
  {
    return GLOBAL_NAMESPACE;
  }


  getNamespaces()
  {
    if (null === this.namespaces)
    {
      this.inspectApplication();
    }

    return this.namespaces;
  }

  getCommands()
  {
    if (null === this.commands)
    {
      this.inspectApplication();
    }

    return this.commands;
  }

  getCommand(name)
  {
    if (!isset(this.commands[name]) && !isset(this.aliases[name]))
    {
      throw new Error(sprintf('Command %s does not exist + ', name));
    }

    return isset(this.commands[name]) ? this.commands[name] : this.aliases[name];
  }

  inspectApplication()
  {
    this.commands = {};
    this.namespaces = {};
    this.aliases = {};

    let all = this.application.all(this.namespace ? this.application.findNamespace(this.namespace) : null);
    forEach(this.sortCommands(all),  (commands, namespace) =>
    {
      let names = [];

      /** @var Command command */
      forEach(commands,  (command, name) =>
      {
        if (!command.getName() || (!this.showHidden && command.isHidden()))
        {
          return;
        }

        if (command.getName() === name)
        {
          this.commands[name] = command;
        } else
        {
          this.aliases[name] = command;
        }

        names.push(name);
      });

      this.namespaces[namespace] = {'id': namespace, 'commands': names};
    });
  }

  sortCommands(commands)
  {
    let namespacedCommands = {};
    let globalCommands = {};
    let sortedCommands = {};
    forEach(commands,  (command, name) =>
    {
      let key = this.application.extractNamespace(name, 1);
      if (in_array(key, ['', ApplicationDescription.GLOBAL_NAMESPACE], true))
      {
        globalCommands[name] = command;
      } else
      {
        if(!namespacedCommands[key]){
          namespacedCommands[key] = {};
        }
        namespacedCommands[key][name] = command;
      }
    });

    if (count(globalCommands) !== 0)
    {
      globalCommands = _(globalCommands).toPairs().sortBy(0).fromPairs().value();
      sortedCommands[ApplicationDescription.GLOBAL_NAMESPACE] = globalCommands;
    }

    if (namespacedCommands)
    {
      namespacedCommands = _(namespacedCommands).toPairs().sortBy(0).fromPairs().value();
      forEach(namespacedCommands, function (commandsSet, key)
      {
        commandsSet = _(commandsSet).toPairs().sortBy(0).fromPairs().value();
        sortedCommands[key] = commandsSet;
      });
    }

    return sortedCommands;
  }

}

module.exports = ApplicationDescription;
