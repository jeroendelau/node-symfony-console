const {escapeshellarg,strip_tags, preg_replace, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const intersection = require('lodash/intersection');
const flatten = require('lodash/flatten');
const Application = require('..//Application');
const Command = require('../command/Command');
const OutputFormatter = require('../formatter/OutputFormatter');
const Helper = require('../helper/Helper');
const InputArgument = require('../input/InputArgument');
const InputDefinition = require('../input/InputDefinition');
const InputOption = require('../input/InputOption');
const ApplicationDescription = require('../descriptor/ApplicationDescription');

const Descriptor = require('./Descriptor');

class TextDescriptor extends Descriptor
{

  describeInputArgument(argument, options = [])
  {
    let fallback = '';
    if (null !== argument.getFallback() && (!is_array(argument.getFallback()) || count(argument.getFallback())))
    {
      fallback = sprintf('<comment> [fallback: %s]</comment>', this.formatFallbackValue(argument.getFallback()));
    }

    let totalWidth = isset(options['total_width']) ? options['total_width'] : Helper.strlen(argument.getName());
    let spacingWidth = totalWidth - strlen(argument.getName());

    this.writeText(sprintf('  <info>%s</info>  %s%s%s',
      argument.getName(),
      ' '.repeat(spacingWidth),
      // + let 4 = 2 spaces before <info>, 2 spaces after </info>
      argument.getDescription().replace(/\s*[\r\n]\s*/g, "\n" + ' '.repeat(totalWidth + 4)),
      fallback
    ), options);
  }

  describeInputOption(option, options = [])
  {
    let fallback = '';
    if (option.acceptValue() && null !== option.getFallback() && (!is_array(option.getFallback()) || count(option.getFallback())))
    {
      fallback = sprintf('<comment> [fallback: %s]</comment>', this.formatFallbackValue(option.getFallback()));
    }

    let value = '';
    if (option.acceptValue())
    {
      value = '=' + option.getName().toUpperCase();

      if (option.isValueOptional())
      {
        value = '[' + value + ']';
      }
    }

    let totalWidth = isset(options['total_width']) ? options['total_width'] : this.calculateTotalWidthForOptions([option]);
    let synopsis = sprintf('%s%s',
      option.getShortcut() ? sprintf('-%s, ', option.getShortcut()) : '    ',
      sprintf('--%s%s', option.getName(), value)
    );

    let spacingWidth = totalWidth - Helper.strlen(synopsis);

    this.writeText(sprintf('  <info>%s</info>  %s%s%s%s',
      synopsis,
      ' '.repeat(spacingWidth),
      // + let 4 = 2 spaces before <info>, 2 spaces after </info>
      option.getDescription().replace(/\s*[\r\n]\s*/g, "\n" + ' '.repeat(totalWidth + 4)),
      fallback,
      option.isArray() ? '<comment> (multiple values allowed)</comment>' : ''
    ), options);
  }

  describeInputDefinition(definition, options = [])
  {
    let totalWidth = this.calculateTotalWidthForOptions(definition.getOptions());
    forEach(definition.getArguments(), (argument) =>
    {
      totalWidth = Math.max(totalWidth, Helper.strlen(argument.getName()));
    });

    if (count(definition.getArguments()) > 0)
    {
      this.writeText('<comment>Arguments:</comment>', options);
      this.writeText("\n");
      forEach(definition.getArguments(),  (argument) =>
      {
        this.describeInputArgument(argument, {...options, ...{'total_width': totalWidth}});
        this.writeText("\n");
      });
    }

    if (count(definition.getArguments()) > 0 && count(definition.getOptions()) > 0)
    {
      this.writeText("\n");
    }

    if (count(definition.getOptions()) > 0)
    {
      let laterOptions = [];

      this.writeText('<comment>Options:</comment>', options);
      forEach(definition.getOptions(), (option) =>
      {
        if (strlen(option.getShortcut()) > 1)
        {
          laterOptions.push(option);
          return;
        }
        this.writeText("\n");
        this.describeInputOption(option, {...options, ...{'total_width': totalWidth}});
      });
      forEach(laterOptions, (option) =>
      {
        this.writeText("\n");
        this.describeInputOption(option, {...options, ...{'total_width': totalWidth}});
      });
    }
  }

  describeCommand(command, options = [])
  {
    command.getSynopsis(true);
    command.getSynopsis(false);
    command.mergeApplicationDefinition(false);

    let description = command.getDescription();
    if (description)
    {
      this.writeText('<comment>Description:</comment>', options);
      this.writeText("\n");
      this.writeText('  ' + description);
      this.writeText("\n\n");
    }

    this.writeText('<comment>Usage:</comment>', options);
    forEach([...[command.getSynopsis(true)], ...command.getAliases(), ...command.getUsages()], (usage) =>
    {
      this.writeText("\n");
      this.writeText('  ' + OutputFormatter.escape(usage), options);
    });
    this.writeText("\n");

    let definition = command.getNativeDefinition();
    if (definition.getOptions() || definition.getArguments())
    {
      this.writeText("\n");
      this.describeInputDefinition(definition, options);
      this.writeText("\n");
    }

    let help = command.getProcessedHelp();
    if (help && help !== description)
    {
      this.writeText("\n");
      this.writeText('<comment>Help:</comment>', options);
      this.writeText("\n");
      this.writeText('  ' + str_replace("\n", "\n  ", help), options);
      this.writeText("\n");
    }
  }

  describeApplication(application, options = [])
  {
    let describedNamespace = isset(options['namespace']) ? options['namespace'] : false;
    let description = new ApplicationDescription(application, describedNamespace);

    let commands;
    let namespaces;

    if (isset(options['raw_text']) && options['raw_text'])
    {
      let width = this.getColumnWidth(description.getCommands());

      forEach(description.getCommands(), (command) =>
      {
        this.writeText(sprintf(`%-${width}s %s`, command.getName(), command.getDescription()), options);
        this.writeText("\n");
      });
    } else
    {
      let help = application.getHelp();
      if ('' != help)
      {
        this.writeText(`${help}\n\n`, options);
      }

      this.writeText("<comment>Usage:</comment>\n", options);
      this.writeText("  command [options] [arguments]\n\n", options);

      this.describeInputDefinition(new InputDefinition(application.getDefinition().getOptions()), options);

      this.writeText("\n");
      this.writeText("\n");

      commands = description.getCommands();
      namespaces = description.getNamespaces();
      if (describedNamespace && namespaces)
      {
        // make sure all alias commands are included when describing a specific namespace

        let describedNamespaceInfo = namespaces[Object.keys(namespaces).shift()];
        forEach(describedNamespaceInfo['commands'],  (name) =>
        {
          commands[name] = description.getCommand(name);
        });
      }

      // calculate max +  width based on available commands per namespace
      let x = Object.values(namespaces).map((namespace) =>
      {
        let a = namespace['commands'];
        let b = Object.keys(commands);
        let x = intersection(namespace['commands'], Object.keys(commands));
        return intersection(namespace['commands'], Object.keys(commands));
      });

      let width = this.getColumnWidth(flatten(x));

      if (describedNamespace)
      {
        this.writeText(sprintf('<comment>Available commands for the "%s" namespace:</comment>', describedNamespace), options);
      } else
      {
        this.writeText('<comment>Available commands:</comment>', options);
      }

      forEach(namespaces, (namespace) =>
      {
        namespace['commands'] = namespace['commands'].filter(  (name) =>
        {
          return isset(commands[name]);
        });

        if (!namespace['commands'] || namespace['commands'].length === 0)
        {
          return;
        }

        if (!describedNamespace && ApplicationDescription.GLOBAL_NAMESPACE !== namespace['id'])
        {
          this.writeText("\n");
          this.writeText(' <comment>' + namespace['id'] + '</comment>', options);
        }

        forEach(namespace['commands'], (name) =>
        {
          this.writeText("\n");
          let spacingWidth = width - Helper.strlen(name);
          let command = commands[name];
          let commandAliases = name === command.getName() ? this.getCommandAliasesText(command) : '';
          this.writeText(sprintf('  <info>%s</info>%s%s', name, ' '.repeat(spacingWidth), commandAliases + command.getDescription()), options);
        });
      });

      this.writeText("\n");
    }
  }

  writeText(content, options = [])
  {
    this.write(
      isset(options['raw_text']) && options['raw_text'] ? strip_tags(content) : content,
      isset(options['raw_output']) ? !options['raw_output'] : true
    );
  }

  getCommandAliasesText(command)
  {
    let text = '';
    let aliases = command.getAliases();

    if (aliases.length > 0)
    {
      text = '[' + implode('|', aliases) + '] ';
    }

    return text;
  }

  formatFallbackValue(fallback)
  {
    if (Infinity === fallback)
    {
      return 'Infinity';
    }

    if (is_string(fallback))
    {
      fallback = OutputFormatter.escape(fallback);
    } else if (is_array(fallback))
    {
      forEach(fallback, function (value, key)
      {
        if (is_string(value))
        {
          let fallback
          [key] = OutputFormatter.escape(value);
        }
      });
    }

    return str_replace('\\\\', '\\', JSON.stringify(fallback));
  }

  getColumnWidth(commands)
  {
    let widths = [];

    forEach(commands, function (command)
    {
      if (command instanceof Command)
      {
        widths.push(Helper.strlen(command.getName()));
        forEach(command.getAliases(), function (alias)
        {
          widths.push(Helper.strlen(alias));
        });
      } else
      {
        widths.push(Helper.strlen(command));
      }
    });
    return widths.length > 0 ? Math.max(...widths) + 2 : 0;
  }

  calculateTotalWidthForOptions(options)
  {
    let totalWidth = 0;
    forEach(options, function (option)
    {
      // "-" + shortcut + ", --" + name
      let nameLength = 1 + Math.max(Helper.strlen(option.getShortcut()), 1) + 4 + Helper.strlen(option.getName());

      if (option.acceptValue())
      {
        let valueLength = 1 + Helper.strlen(option.getName()); // = + value
        valueLength += option.isValueOptional() ? 2 : 0; // [ + ]

        nameLength += valueLength;
      }
      totalWidth = Math.max(totalWidth, nameLength);
    });

    return totalWidth;
  }

}

module.exports = TextDescriptor;
