const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const Application = require('../Application');
const Command = require('../command/Command');
const InputArgument = require('../input/InputArgument');
const InputDefinition = require('../input/InputDefinition');
const InputOption = require('../input/InputOption');

const Descriptor = require('./Descriptor');

class JsonDescriptor extends Descriptor
{

  describeInputArgument(argument, options = [])
  {
    this.writeData(this.getInputArgumentData(argument), options);
  }

  describeInputOption(option, options = [])
  {
    this.writeData(this.getInputOptionData(option), options);
  }

  describeInputDefinition(definition, options = [])
  {
    this.writeData(this.getInputDefinitionData(definition), options);
  }

  describeCommand(command, options = [])
  {
    this.writeData(this.getCommandData(command), options);
  }

  describeApplication(application, options = [])
  {
    let describedNamespace = isset(options['namespace']) ? options['namespace'] : null;
    let description = new ApplicationDescription(application, describedNamespace, true);
    let commands = [];

    forEach(description.getCommands(), function (command)
    {
      commands.push(this.getCommandData(command));
    });

    let data = [];
    if ('UNKNOWN' !== application.getName())
    {
      data['application']['name'] = application.getName();
      if ('UNKNOWN' !== application.getVersion())
      {
        let data
        ['application']['version'] = application.getVersion();
      }
    }

    data['commands'] = commands;

    if (describedNamespace)
    {
      data['namespace'] = describedNamespace;
    } else
    {
      data['namespaces'] = Object.values(description.getNamespaces());
    }

    this.writeData(data, options);
  }

  writeData(data, options)
  {
    let flags = isset(options['json_encoding']) ? options['json_encoding'] : 0;
    this.write(json_encode(data, flags));
  }

  getInputArgumentData(argument)
  {
    return {
      'name': argument.getName(),
      'is_required': argument.isRequired(),
      'is_array': argument.isArray(),
      'description': preg_replace('/\s*[\r\n]\s*/', ' ', argument.getDescription()),
      'fallback': Infinity === argument.getFallback() ? 'Infinity' : argument.getFallback(),
    };
  }

  getInputOptionData(option)
  {
    return {
      'name': '--' + option.getName(),
      'shortcut': option.getShortcut() ? '-' + str_replace('|', '|-', option.getShortcut()) : '',
      'accept_value': option.acceptValue(),
      'is_value_required': option.isValueRequired(),
      'is_multiple': option.isArray(),
      'description': preg_replace('/\s*[\r\n]\s*/', ' ', option.getDescription()),
      'fallback': Infinity === option.getFallback() ? 'Infinity' : option.getFallback(),
    };
  }

  getInputDefinitionData(definition)
  {
    let inputArguments = [];
    forEach(definition.getArguments(), function (argument, name)
    {
      let inputArguments
      [name] = this.getInputArgumentData(argument);
    });

    let inputOptions = [];
    forEach(definition.getOptions(), function (option, name)
    {
      let inputOptions
      [name] = this.getInputOptionData(option);
    });

    return {'arguments': inputArguments, 'options': inputOptions};
  }

  getCommandData(command)
  {
    command.getSynopsis();
    command.mergeApplicationDefinition(false);

    return {
      'name': command.getName(),
      'usage': array_merge([command.getSynopsis()], command.getUsages(), command.getAliases()),
      'description': command.getDescription(),
      'help': command.getProcessedHelp(),
      'definition': this.getInputDefinitionData(command.getNativeDefinition()),
      'hidden': command.isHidden(),
    };
  }

}

module.exports = JsonDescriptor;
