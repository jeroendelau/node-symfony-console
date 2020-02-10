const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const Application = require('..//Application');
const Command = require('../command/Command');
const Helper = require('../helper/Helper');
const InputArgument = require('../input/InputArgument');
const InputDefinition = require('../input/InputDefinition');
const InputOption = require('../input/InputOption');

const Descriptor = require('./Descriptor');

class MarkdownDescriptor extends Descriptor
{
  describe(output, object, options = [])
  {
    let decorated = output.isDecorated();
    output.setDecorated(false);

    super.describe(output, object, options);

    output.setDecorated(decorated);
  }

  write(content, decorated = true)
  {
    super.write(content, decorated);
  }

  describeInputArgument(argument, options = [])
  {
    this.write(
      '#### `' + (argument.getName() || '<none>') + "`\n\n"
      + (argument.getDescription() ? preg_replace('/\s*[\r\n]\s*/', "\n", argument.getDescription()) + "\n\n" : '')
      + '* Is required: ' + (argument.isRequired() ? 'yes' : 'no') + "\n"
      + '* Is array: ' + (argument.isArray() ? 'yes' : 'no') + "\n"
      + '* Fallback: `' + str_replace("\n", '', var_export(argument.getFallback(), true)) + '`'
    );
  }

  describeInputOption(option, options = [])
  {
    let name = '--' + option.getName();
    if (option.getShortcut())
    {
      name += '|-' + str_replace('|', '|-', option.getShortcut()) + '';
    }

    this.write(
      '#### `' + name + '`' + "\n\n"
      + (option.getDescription() ? preg_replace('/\s*[\r\n]\s*/', "\n", option.getDescription()) + "\n\n" : '')
      + '* Accept value: ' + (option.acceptValue() ? 'yes' : 'no') + "\n"
      + '* Is value required: ' + (option.isValueRequired() ? 'yes' : 'no') + "\n"
      + '* Is multiple: ' + (option.isArray() ? 'yes' : 'no') + "\n"
      + '* Fallback: `' + str_replace("\n", '', var_export(option.getFallback(), true)) + '`'
    );
  }

  describeInputDefinition(definition, options = [])
  {
    let showArguments = count(definition.getArguments());
    if (showArguments > 0)
    {
      this.write('### Arguments');
      forEach(definition.getArguments(), function (argument)
      {
        this.write("\n\n");
        let describeInputArgument = this.describeInputArgument(argument)
        if (null !== describeInputArgument)
        {
          this.write(describeInputArgument);
        }
      });
    }

    if (count(definition.getOptions()) > 0)
    {
      if (showArguments)
      {
        this.write("\n\n");
      }

      this.write('### Options');
      forEach(definition.getOptions(), function (option)
      {
        this.write("\n\n");
        let describeInputOption = this.describeInputOption(option)
        if (null !== describeInputOption)
        {
          this.write(describeInputOption);
        }
      });
    }
  }

  describeCommand(command, options = [])
  {
    command.getSynopsis();
    command.mergeApplicationDefinition(false);

    this.write(
      '`' + command.getName() + "`\n"
      + str_repeat('-', Helper.strlen(command.getName()) + 2) + "\n\n"
      + (command.getDescription() ? command.getDescription() + "\n\n" : '')
      + '### Usage' + "\n\n"
      + array_reduce(array_merge([command.getSynopsis()], command.getAliases(), command.getUsages()), function (carry, usage)
      {
        return carry + '* `' + usage + '`' + "\n";
      })
    );
    let help = command.getProcessedHelp();
    if (help)
    {
      this.write("\n");
      this.write(help);
    }

    if (command.getNativeDefinition())
    {
      this.write("\n\n");
      this.describeInputDefinition(command.getNativeDefinition());
    }
  }

  describeApplication(application, options = [])
  {
    let describedNamespace = isset(options['namespace']) ? options['namespace'] : null;
    description = new ApplicationDescription(application, describedNamespace);
    let title = this.getApplicationTitle(application);

    this.write(title + "\n" + str_repeat('=', Helper.strlen(title)));

    forEach(description.getNamespaces(), function (namespace)
    {
      if (ApplicationDescription.GLOBAL_NAMESPACE !== namespace['id'])
      {
        this.write("\n\n");
        this.write('**' + namespace['id'] + ':**');
      }

      this.write("\n\n");
      this.write(implode("\n", array_map(function (commandName)
      {
        return sprintf('* [`%s`](#%s)', commandName, str_replace(':', '', description.getCommand(commandName).getName()));
      }, namespace['commands'])));
    });

    forEach(description.getCommands(), function (command)
    {
      this.write("\n\n");
      let describeCommand = this.describeCommand(command)
      if (null !== describeCommand)
      {
        this.write(describeCommand);
      }
    });
  }

  getApplicationTitle(application)
  {
    if ('UNKNOWN' !== application.getName())
    {
      if ('UNKNOWN' !== application.getVersion())
      {
        return sprintf('%s %s', application.getName(), application.getVersion());
      }

      return application.getName();
    }

    return 'Console Tool';
  }

}

module.exports = MarkdownDescriptor;
