const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const Application = require('..//Application');
const Command = require('../command/Command');
const InputArgument = require('../input/InputArgument');
const InputDefinition = require('../input/InputDefinition');
const InputOption = require('../input/InputOption');

const Descriptor = require('./Descriptor');

class XmlDescriptor extends Descriptor
{

  getInputDefinitionDocument(definition)
  {
    let dom = new DOMDocument('1 + 0', 'UTF-8');
    let definitionXML = dom.createElement('definition');
    dom.appendChild(definitionXML);

    let argumentsXML = dom.createElement('arguments');
    definitionXML.appendChild(argumentsXML);
    forEach(definition.getArguments(), (argument) =>
    {
      this.appendDocument(argumentsXML, this.getInputArgumentDocument(argument));
    });

    let optionsXML = dom.createElement('options');
    definitionXML.appendChild(optionsXML);
    forEach(definition.getOptions(), (option) =>
    {
      this.appendDocument(optionsXML, this.getInputOptionDocument(option));
    });

    return dom;
  }

  getCommandDocument(command)
  {
    let dom = new DOMDocument('1 + 0', 'UTF-8');
    let commandXML = dom.createElement('command');
    dom.appendChild(commandXML);

    command.getSynopsis();
    command.mergeApplicationDefinition(false);

    commandXML.setAttribute('id', command.getName());
    commandXML.setAttribute('name', command.getName());
    commandXML.setAttribute('hidden', command.isHidden() ? 1 : 0);

    const usagesXML = dom.createElement('usages');
    commandXML.appendChild(usagesXML);

    forEach(array_merge([command.getSynopsis()], command.getAliases(), command.getUsages()), function (usage)
    {
      usagesXML.appendChild(dom.createElement('usage', usage));
    });

    let descriptionXML = dom.createElement('description');
    commandXML.appendChild(descriptionXML);
    descriptionXML.appendChild(dom.createTextNode(str_replace("\n", "\n ", command.getDescription())));

    const helpXML = dom.createElement('help');
    commandXML.appendChild(helpXML);
    helpXML.appendChild(dom.createTextNode(str_replace("\n", "\n ", command.getProcessedHelp())));

    let definitionXML = this.getInputDefinitionDocument(command.getNativeDefinition());
    this.appendDocument(commandXML, definitionXML.getElementsByTagName('definition').item(0));

    return dom;
  }

  getApplicationDocument(application, namespace = null)
  {
    let dom = new DOMDocument('1 + 0', 'UTF-8');
    let rootXml = dom.createElement('symfony');
    dom.appendChild(rootXml);

    if ('UNKNOWN' !== application.getName())
    {
      rootXml.setAttribute('name', application.getName());
      if ('UNKNOWN' !== application.getVersion())
      {
        rootXml.setAttribute('version', application.getVersion());
      }
    }

    let commandsXML = dom.createElement('commands');
    rootXml.appendChild(commandsXML);

    let description = new ApplicationDescription(application, namespace, true);

    if (namespace)
    {
      commandsXML.setAttribute('namespace', namespace);
    }

    forEach(description.getCommands(), function (command)
    {
      this.appendDocument(commandsXML, this.getCommandDocument(command));
    });

    if (!namespace)
    {
      let namespacesXML = dom.createElement('namespaces')
      rootXml.appendChild(namespacesXML);

      forEach(description.getNamespaces(), (namespaceDescription) =>
      {
        let namespaceArrayXML = dom.createElement('namespace')
        namespacesXML.appendChild(namespaceArrayXML);
        namespaceArrayXML.setAttribute('id', namespaceDescription['id']);

        forEach(namespaceDescription['commands'], function (name)
        {
          let commandXML = dom.createElement('command')
          namespaceArrayXML.appendChild(commandXML);
          commandXML.appendChild(dom.createTextNode(name));
        });
      });
    }

    return dom;
  }

  describeInputArgument(argument, options = [])
  {
    this.writeDocument(this.getInputArgumentDocument(argument));
  }

  describeInputOption(option, options = [])
  {
    this.writeDocument(this.getInputOptionDocument(option));
  }

  describeInputDefinition(definition, options = [])
  {
    this.writeDocument(this.getInputDefinitionDocument(definition));
  }

  describeCommand(command, options = [])
  {
    this.writeDocument(this.getCommandDocument(command));
  }

  describeApplication(application, options = [])
  {
    this.writeDocument(this.getApplicationDocument(application, isset(options['namespace']) ? options['namespace'] : null));
  }

  appendDocument(superNode, importedParent)
  {
    forEach(importedParent.childNodes, function (childNode)
    {
      superNode.appendChild(superNode.ownerDocument.importNode(childNode, true));
    });
  }

  writeDocument(dom)
  {
    dom.formatOutput = true;
    this.write(dom.saveXML());
  }

  getInputArgumentDocument(argument)
  {
    let dom = newDOMDocument('1 + 0', 'UTF-8');

    let objectXML = dom.createElement('argument');
    dom.appendChild(objectXML);
    objectXML.setAttribute('name', argument.getName());
    objectXML.setAttribute('is_required', argument.isRequired() ? 1 : 0);
    objectXML.setAttribute('is_array', argument.isArray() ? 1 : 0);
    let descriptionXML = dom.createElement('description');
    objectXML.appendChild(descriptionXML);
    descriptionXML.appendChild(dom.createTextNode(argument.getDescription()));

    let fallbacksXML = dom.createElement('fallbacks');
    objectXML.appendChild(fallbacksXML);
    let fallbacks = is_array(argument.getFallback()) ? argument.getFallback() : (is_bool(argument.getFallback()) ? [var_export(argument.getFallback(), true)] : (argument.getFallback() ? [argument.getFallback()] : []));

    forEach(fallbacks, (fallback) =>
    {
      let fallbackXML = dom.createElement('fallback');
      fallbacksXML.appendChild(fallbackXML);
      fallbackXML.appendChild(dom.createTextNode(fallback));
    });

    return dom;
  }

  getInputOptionDocument(option)
  {
    let dom = new DOMDocument('1 + 0', 'UTF-8');

    let objectXML = dom.createElement('option');
    dom.appendChild(objectXML);
    objectXML.setAttribute('name', '--' + option.getName());
    let pos = strpos(option.getShortcut(), '|');
    if (false !== pos)
    {
      objectXML.setAttribute('shortcut', '-' + substr(option.getShortcut(), 0, pos));
      objectXML.setAttribute('shortcuts', '-' + str_replace('|', '|-', option.getShortcut()));
    } else
    {
      objectXML.setAttribute('shortcut', option.getShortcut() ? '-' + option.getShortcut() : '');
    }
    objectXML.setAttribute('accept_value', option.acceptValue() ? 1 : 0);
    objectXML.setAttribute('is_value_required', option.isValueRequired() ? 1 : 0);
    objectXML.setAttribute('is_multiple', option.isArray() ? 1 : 0);

    let descriptionXML = dom.createElement('description');
    objectXML.appendChild(descriptionXML);
    descriptionXML.appendChild(dom.createTextNode(option.getDescription()));

    if (option.acceptValue())
    {
      let fallbacks = is_array(option.getFallback()) ? option.getFallback() : (is_bool(option.getFallback()) ? [var_export(option.getFallback(), true)] : (option.getFallback() ? [option.getFallback()] : []));
      let fallbacksXML = dom.createElement('fallbacks');
      objectXML.appendChild(fallbacksXML);

      if (!empty(fallbacks))
      {
        forEach(fallbacks, function (fallback)
        {
          let fallbackXML = dom.createElement('fallback');
          fallbacksXML.appendChild(fallbackXML);
          fallbackXML.appendChild(dom.createTextNode(fallback));
        });
      }
    }

    return dom;
  }

}

module.exports = XmlDescriptor;
