const {escapeshellarg, sprintf, preg_grep, trim, getenv, putenv, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('./PhpPolyfill');
const forEach = require('lodash/forEach');
const _ = require('lodash');
const levenshtein = require('js-levenshtein');

const Command = require('./command/Command');
const CommandNotFoundError = require('./error/CommandNotFoundError');
const NamespaceNotFoundError = require('./error/NamespaceNotFoundError');
//const CommandLoaderInterface = require('./commandloader/CommandLoaderInterface');
const ConsoleCommandEvent = require('./event/ConsoleCommandEvent');
const ConsoleErrorEvent = require('./event/ConsoleErrorEvent');
const ConsoleTerminateEvent = require('./event/ConsoleTerminateEvent');
const OutputFormatter = require('./formatter/OutputFormatter');
const DebugFormatterHelper = require('./helper/DebugFormatterHelper');
const FormatterHelper = require('./helper/FormatterHelper');
const Helper = require('./helper/Helper');
const HelperSet = require('./helper/HelperSet');
const ProcessHelper = require('./helper/ProcessHelper');
const QuestionHelper = require('./helper/QuestionHelper');
const ArgvInput = require('./input/ArgvInput');
const ArrayInput = require('./input/ArrayInput');
const InputArgument = require('./input/InputArgument');
const InputDefinition = require('./input/InputDefinition');
const InputOption = require('./input/InputOption');
const ConsoleOutput = require('./output/ConsoleOutput');
const Output = require('./output/Output');
const SymfonyStyle = require('./style/SymfonyStyle');

const Terminal = require('./Terminal');

class Application
{
  constructor(name = 'UNKNOWN', version = 'UNKNOWN')
  {
    this.wantHelps = false;
    this.runningCommand = null;
    this.commandLoader = null;
    this.autoExit = true;
    this.definition = null;
    this.helperSet = null;
    this.dispatcher = null;
    this.defaultCommand = null;
    this.singleCommand = false;
    this.initialized = null;

    this.commands = {};
    this.name = name;
    this.version = version;
    this.terminal = new Terminal();
    this.fallbackCommand = 'list';
    this.catchExceptions = true;

    // Set application command name
    // that is used in the help function
    this.command = false;
  }

  setDispatcher(dispatcher)
  {
    this.dispatcher = dispatcher;
  }

  setCommandLoader(commandLoader)
  {
    this.commandLoader = commandLoader;
  }

  async run(input = null, output = null)
  {
    var exitCode;

    putenv('LINES=' + this.terminal.getHeight());
    putenv('COLUMNS=' + this.terminal.getWidth());

    if (null === input)
    {
      input = new ArgvInput();
    }

    if (null === output)
    {
      output = new ConsoleOutput();
    }

    this.configureIO(input, output);

    try
    {
      exitCode = await this.doRun(input, output);
    } catch (e)
    {
      if (!this.catchExceptions)
      {
        throw e;
      }

      if (output.getErrorOutput)
      {
        this.renderThrowable(e, output.getErrorOutput());
      } else
      {
        this.renderThrowable(e, output);
      }

      exitCode = Number.parseInt(e.code);
      if (!Number.isNaN(exitCode))
      {
        //exitCode = Number.parseInt(exitCode);
        if (0 === exitCode)
        {
          exitCode = 1;
        }
      } else
      {
        exitCode = 1;
      }
    }

    if (this.autoExit)
    {
      if (exitCode > 255)
      {
        exitCode = 255;
      }

      process.exit(exitCode);
    }

    return exitCode;
  }

  async doRun(input, output)
  {
    var command = null;
    if (true === input.hasParameterOption(['--version', '-V'], true))
    {
      output.writeln(this.getLongVersion());
      return 0;
    }

    try
    {
      // Makes ArgvInput.getFirstArgument() able to distinguish an option from an argument +
      input.bind(this.getDefinition());
    } catch (e)
    {
      // Errors must be ignored, full binding/validation happens later when the command is known +
    }

    let name = this.getCommandName(input);
    if (true === input.hasParameterOption(['--help', '-h'], true))
    {
      if (!name)
      {
        name = 'help';
        input = new ArrayInput({'command_name': this.fallbackCommand});
      } else
      {
        this.wantHelps = true;
      }
    }

    if (!name)
    {
      name = this.fallbackCommand;
      let definition = this.getDefinition();
      definition.setArguments(
        Object.assign(
          definition.getArguments(),
          {'command': new InputArgument('command', InputArgument.OPTIONAL, definition.getArgument('command').getDescription(), name)},
        )
      );
    }

    try
    {
      this.runningCommand = null;
      // the command name MUST be the first element of the input
      command = this.find(name);
    } catch (e)
    {
      const alternatives = e.getAlternatives && e.getAlternatives();
      let x = e instanceof CommandNotFoundError;
      let y = !(e instanceof NamespaceNotFoundError);
      let ns = !(x && y);
      let alt = alternatives.length !== 1;
      //let i =  !input.isInteractive();
      if (!(e instanceof CommandNotFoundError && !(e instanceof NamespaceNotFoundError)) || alternatives.length !== 1 || !input.isInteractive())
      {
        if (null !== this.dispatcher)
        {
          const ev = new ConsoleErrorEvent(input, output, e);
          this.dispatcher.dispatch(ev, ConsoleEvents.ERROR);

          if (0 === ev.getExitCode())
          {
            return 0;
          }

          let e = ev.getError();
        }

        throw e;
      }

      let alternative = alternatives[0];

      let style = new SymfonyStyle(input, output);
      style.block(sprintf("\nCommand \"%s\" is not defined.\n", name), null, 'error');
      if (!await style.confirm(sprintf('Do you want to run "%s" instead? ', alternative), false))
      {
        if (null !== this.dispatcher)
        {
          let ev = new ConsoleErrorEvent(input, output, e);
          this.dispatcher.dispatch(ev, ConsoleEvents.ERROR);

          return ev.getExitCode();
        }

        return 1;
      }

      command = this.find(alternative);
    }

    this.runningCommand = command;
    let exitCode = await this.doRunCommand(command, input, output);
    this.runningCommand = null;

    return exitCode;
  }

  reset()
  {
  }

  setHelperSet(helperSet)
  {
    this.helperSet = helperSet;
  }

  getHelperSet()
  {
    if (!this.helperSet)
    {
      this.helperSet = this.getFallbackHelperSet();
    }

    return this.helperSet;
  }

  setDefinition(definition)
  {
    this.definition = definition;
  }

  getDefinition()
  {
    if (!this.definition)
    {
      this.definition = this.getFallbackInputDefinition();
    }

    if (this.singleCommand)
    {
      let inputDefinition = this.definition;
      inputDefinition.setArguments();

      return inputDefinition;
    }

    return this.definition;
  }

  getHelp()
  {
    return this.getLongVersion();
  }

  areExceptionsCaught()
  {
    return this.catchExceptions;
  }

  setCatchExceptions(boolean)
  {
    this.catchExceptions = boolean;
  }

  isAutoExitEnabled()
  {
    return this.autoExit;
  }

  setAutoExit(boolean)
  {
    this.autoExit = boolean;
  }

  getName()
  {
    return this.name;
  }

  setName(name)
  {
    this.name = name;
  }

  getVersion()
  {
    return this.version;
  }

  setVersion(version)
  {
    this.version = version;
  }

  getLongVersion()
  {
    if ('UNKNOWN' !== this.getName())
    {
      if ('UNKNOWN' !== this.getVersion())
      {
        return sprintf('%s <info>%s</info>', this.getName(), this.getVersion());
      }

      return this.getName();
    }

    return 'Console Tool';
  }

  register(name)
  {
    return this.add(new Command(name));
  }

  addCommands(commands)
  {
    forEach(commands, (command) =>
    {
      this.add(command);
    });
  }

  add(command)
  {
    this.init();

    command.setApplication(this);

    if (!command.isEnabled())
    {
      command.setApplication(null);

      return null;
    }

    // Will throw if the command is not correctly initialized +
    command.getDefinition();

    if (!command.getName() || command.getName() === null)
    {
      throw new Error(sprintf('The command defined in "%s" cannot have an empty name.', command.constructor.name));
    }

    this.commands[command.getName()] = command;

    forEach(command.getAliases(), (alias) =>
    {
      this.commands[alias] = command;
    });

    return command;
  }

  get(name)
  {
    this.init();

    if (!this.has(name))
    {
      throw new CommandNotFoundError(sprintf('The command "%s" does not exist.', name));
    }

    let command = this.commands[name];

    if (this.wantHelps)
    {
      this.wantHelps = false;

      let helpCommand = this.get('help');
      helpCommand.setCommand(command);

      return helpCommand;
    }

    return command;
  }

  has(name)
  {
    this.init();

    return isset(this.commands[name]) || Boolean(this.commandLoader && this.commandLoader.has(name) && this.add(this.commandLoader.get(name)));
  }

  getNamespaces()
  {
    let namespaces = [];
    forEach(this.all(), (command) =>
    {
      if (command.isHidden())
      {
        return;
      }

      namespaces = [...namespaces, ...this.extractAllNamespaces(command.getName())];

      forEach(command.getAliases(), (alias) =>
      {
        namespaces = [...namespaces, ...this.extractAllNamespaces(alias)];
      });
    });

    return namespaces.filter((elem, pos) =>
    {
      const dupe = namespaces.indexOf(elem) !== pos;
      return elem && !dupe;
    });
  }

  findNamespace(namespace)
  {
    let allNamespaces = this.getNamespaces();
    let parts = namespace.match(/([^:]+|)/g);
    let pattern = parts.map(ns => ns + '[^:]*').join(":").replace(/\[\^\:\]\*\:\[\^\:\]\*/g, '[^:]*[^:]*');


    //console.log(`"${namespace}"`, parts, pattern);
    let regexp = new RegExp(`^${pattern}`);
    let namespaces = preg_grep(regexp, allNamespaces);

    if (namespaces.length === 0)
    {
      let message = sprintf('There are no commands defined in the "%s" namespace.', namespace);

      const alternatives = this.findAlternatives(namespace, allNamespaces);
      if (alternatives)
      {
        if (1 == count(alternatives))
        {
          message += "\n\nDid you mean this?\n    ";
        } else
        {
          message += "\n\nDid you mean one of these?\n    ";
        }

        message += alternatives.join("\n    ");
      }

      throw new NamespaceNotFoundError(message, alternatives);
    }

    let exact = namespaces.indexOf(namespace) >= 0;
    if (count(namespaces) > 1 && !exact)
    {
      throw new NamespaceNotFoundError(sprintf("The namespace \"%s\" is ambiguous.\nDid you mean one of these?\n%s", namespace, this.getAbbreviationSuggestions(namespaces)), namespaces);
    }

    return exact ? namespace : namespaces[0] ? namespaces[0] : false;
  }

  find(name)
  {
    this.init();
    let aliases = [];
    forEach(this.commands, (command) =>
    {
      forEach(command.getAliases(), (alias) =>
      {
        if (!this.has(alias))
        {
          this.commands[alias] = command;
        }
      });
    });

    if (this.has(name))
    {
      return this.get(name);
    }

    let allCommands = this.commandLoader ? [...this.commandLoader.getNames(), ...Object.keys(this.commands)] : Object.keys(this.commands);
    let parts = name.match(/([^:]+|)/g);
    let pattern = parts.map(ns => ns + '[^:]*').join(":").replace(/\[\^\:\]\*\:\[\^\:\]\*/g, '[^:]*[^:]*');

    let regexp = new RegExp(`^${pattern}`);
    let regexpi = new RegExp(`^${pattern}`, 'i');
    let regexpns = new RegExp(`^${pattern}$`, 'i');

    let commands = preg_grep(regexp, allCommands);
    if (commands.length === 0)
    {
      commands = preg_grep(regexpi, allCommands);
    }

    let altCommands = preg_grep(regexpns, commands);
    let alternatives = [];

    // if no commands matched or we just matched namespaces
    if (commands.length === 0 || altCommands.length < 1)
    {
      const pos = name.indexOf(':');
      if (pos >= 0)
      {
        // check if a namespace exists and contains commands
        this.findNamespace(substr(name, 0, pos));
      }

      let message = sprintf('Command "%s" is not defined.', name);
      alternatives = this.findAlternatives(name, allCommands);
      if (alternatives.length > 0)
      {
        // remove hidden commands
        alternatives = alternatives.filter((name) =>
        {
          return !this.get(name).isHidden();
        });

        if (1 == count(alternatives))
        {
          message += "\n\nDid you mean this?\n    ";
        } else
        {
          message += "\n\nDid you mean one of these?\n    ";
        }
        message += implode("\n    ", alternatives);
      }

      throw new CommandNotFoundError(message, Object.values(alternatives));
    }

    // filter out aliases for commands which are already on the list
    let commandList = {};
    if (count(commands) > 1)
    {
      commandList = this.commandLoader ? {...this.commandLoader.getNames().reduce((a,b, c)=> (a[b]=c,a),{}), ...this.commands} : this.commands;
      commands = _.filter(commands, (nameOrAlias, pos) =>
        {
          const dupe = commands.indexOf(nameOrAlias) !== pos;
          if (!(commandList[nameOrAlias] instanceof Command))
          {
            commandList[nameOrAlias] = this.commandLoader.get(nameOrAlias);``
          }

          let commandName = commandList[nameOrAlias].getName();
          aliases[nameOrAlias] = commandName;

          return !dupe && (commandName === nameOrAlias || !in_array(commandName, commands));
        }
      );
    }

    if (count(commands) > 1)
    {
      let usableWidth = this.terminal.getWidth() - 10;
      let abbrevs = Object.values(commands);
      let maxLen = 0;
      forEach(abbrevs, function (abbrev)
      {
        maxLen = Math.max(Helper.strlen(abbrev), maxLen);
      });
      abbrevs = Object.values(commands).map((cmd) =>
      {
        if (commandList[cmd].isHidden())
        {
          commands.splice(commands.indexOf(cmd), 1);
          // unset(commands[array_search(cmd, commands)]);
          return false;
        }
        let abbrev = cmd.padEnd(maxLen, ' ') + ' ' + commandList[cmd].getDescription();
        return Helper.strlen(abbrev) > usableWidth ? Helper.substr(abbrev, 0, usableWidth - 3) + '...' : abbrev;
      });

      if (count(commands) > 1)
      {
        let suggestions = this.getAbbreviationSuggestions(abbrevs.filter(a => Boolean(a)));
        throw new CommandNotFoundError(sprintf("Command \"%s\" is ambiguous.\nDid you mean one of these?\n%s", name, suggestions), Object.values(commands));
      }
    }

    let command = this.get(commands);
    if (command.isHidden())
    {
      throw new CommandNotFoundError(sprintf('The command "%s" does not exist.', name));
    }

    return command;
  }

  all(namespace = null)
  {
    this.init();

    if (null === namespace)
    {
      if (!this.commandLoader)
      {
        return this.commands;
      }

      let commands = {...this.commands};
      forEach(this.commandLoader.getNames(), (name) =>
      {
        if (!isset(commands[name]) && this.has(name))
        {
          commands[name] = this.get(name);
        }
      });

      return commands;
    }

    const commands = {};
    forEach(this.commands, (command, name) =>
    {
      let match = namespace.match(/\:/g) || [];
      if (namespace === this.extractNamespace(name, match.length + 1))
      {
        commands[name] = command;
      }
    });

    if (this.commandLoader)
    {
      forEach(this.commandLoader.getNames(), (name) =>
      {
        let match = namespace.match(/\:/g) || [];
        if (!isset(commands[name]) && namespace === this.extractNamespace(name, match.length + 1) && this.has(name))
        {
          commands[name] = this.get(name);
        }
      });
    }

    return commands;
  }

  static getAbbreviations(names)
  {
    let abbrevs = [];
    forEach(names, function (name)
    {
      for (let len = strlen(name); len > 0; --len)
      {
        const abbrev = substr(name, 0, len);
        abbrevs[abbrev].push(name);
      }
    });

    return abbrevs;
  }

  renderThrowable(e, output)
  {
    output.writeln('', Output.VERBOSITY_QUIET);

    this.doRenderThrowable(e, output);

    if (null !== this.runningCommand)
    {
      output.writeln(sprintf('<info>%s</info>', sprintf(this.runningCommand.getSynopsis(), this.getName())), Output.VERBOSITY_QUIET);
      output.writeln('', Output.VERBOSITY_QUIET);
    }
  }

  doRenderThrowable(e, output)
  {
    var messages;

    while (e)
    {
      //let message = trim(e.stack);
      let message = trim(e.message);
      let title;
      let len = -1;

      if ('' === message || Output.VERBOSITY_VERBOSE <= output.getVerbosity())
      {
        let className = e.constructor.prototype.constructor.name;
        let code = e.code;

        className = 'c' === className[0] && 0 === strpos(className, "class@anonymous\0") ? get_super_class(className) + '@anonymous' : className;
        title = sprintf('  [%s%s]  ', className, 0 !== code ? ' (' + code + ')' : '');
        len = Helper.strlen(title);
      } else
      {
        let len = 0;
      }

      if (false !== strpos(message, "class@anonymous\0"))
      {
        message = preg_replace_callback('/class@anonymous\x00 + *?\ + php(?:0x?|:)[0-9a-fA-F]++/', function (m)
        {
          return class_exists(m[0], false) ? get_super_class(m[0]) + '@anonymous' : m[0];
        }, message);
      }

      let width = this.terminal.getWidth() ? this.terminal.getWidth() - 1 : PHP_INT_MAX;
      let lines = [];

      forEach('' !== message ? message.split(/\r?\n/g) : [], (line) =>
      {
        forEach(this.splitStringByWidth(line, width - 4), (line) =>
        {
          // pre-format lines to get the right string length
          let lineLength = Helper.strlen(line) + 4;
          lines.push([line, lineLength]);

          len = Math.max(lineLength, len);
        });
      });

      messages = [];
      if (e.getLine || Output.VERBOSITY_VERBOSE <= output.getVerbosity())
      {
        let loc = this.toBacktrace(e).pop();
        messages.push(sprintf('<comment>%s</comment>', OutputFormatter.escape(sprintf('In %s line %s:', loc.func || basename(loc.path) || 'n/a', loc.line || 'n/a'))));
      }

      const emptyLine = sprintf('<error>%s</error>', ' '.repeat(len));
      messages.push(emptyLine);
      if ('' === message || Output.VERBOSITY_VERBOSE <= output.getVerbosity())
      {
        messages.push(sprintf('<error>%s%s</error>', title, ' '.repeat(Math.max(0, len - Helper.strlen(title)))));
      }
      forEach(lines, function (line)
      {
        messages.push(sprintf('<error>  %s  %s</error>', OutputFormatter.escape(line[0]), ' '.repeat(len - line[1])));
      });
      messages.push(emptyLine);
      messages.push('');

      output.writeln(messages, Output.VERBOSITY_QUIET);

      if (Output.VERBOSITY_VERBOSE <= output.getVerbosity())
      {
        output.writeln('<comment>Error trace:</comment>', Output.VERBOSITY_QUIET);

        // exception related properties
        let trace = this.toBacktrace(e);

        for (let i = 0, count = trace.length; i < count; ++i)
        {
          //output.writeln(trace[i], Output.VERBOSITY_QUIET);
          //let className = isset(trace[i]['class']) ? trace[i]['class'] : '';
          //let type = isset(trace[i]['type']) ? trace[i]['type'] : '';

          let fName = trace[i]['func'] ? trace[i]['func'] : '';
          let file = trace[i]['path'] ? trace[i]['path'] : 'n/a';
          let line = trace[i]['line'] ? trace[i]['line'] : 'n/a';

          output.writeln(sprintf(' %s at <info>%s:%s</info>',  fName ? fName + '()' : '', file, line), Output.VERBOSITY_QUIET);
        }

        output.writeln('', Output.VERBOSITY_QUIET);
      }
      // e = e.getPrevious();
      //throw(e);
      e = false;

    }
  }

  configureIO(input, output)
  {
    if (true === input.hasParameterOption(['--ansi'], true))
    {
      output.setDecorated(true);
    } else if (true === input.hasParameterOption(['--no-ansi'], true))
    {
      output.setDecorated(false);
    }

    if (true === input.hasParameterOption(['--no-interaction', '-n'], true))
    {
      input.setInteractive(false);
    } else
    {
      let inputStream = null;

      if (input.getStream)
      {
        inputStream = input.getStream();
      }

      inputStream = !inputStream && process.stdin ? process.stdin : inputStream;

      if ((!inputStream || !inputStream.isTTY) && false === getenv('SHELL_INTERACTIVE'))
      {
        input.setInteractive(false);
      }
    }

    let shellVerbosity = getenv('SHELL_VERBOSITY');
    switch (shellVerbosity)
    {
      case -1:
        output.setVerbosity(Output.VERBOSITY_QUIET);
        break;
      case 1:
        output.setVerbosity(Output.VERBOSITY_VERBOSE);
        break;
      case 2:
        output.setVerbosity(Output.VERBOSITY_VERY_VERBOSE);
        break;
      case 3:
        output.setVerbosity(Output.VERBOSITY_DEBUG);
        break;
      default:
        shellVerbosity = 0;
        break;
    }

    if (true === input.hasParameterOption(['--quiet', '-q'], true))
    {
      output.setVerbosity(Output.VERBOSITY_QUIET);
      shellVerbosity = -1;
    } else
    {
      if (input.hasParameterOption('-vvv', true) || input.hasParameterOption('--verbose=3', true) || 3 === input.getParameterOption('--verbose', false, true))
      {
        output.setVerbosity(Output.VERBOSITY_DEBUG);
        shellVerbosity = 3;
      } else if (input.hasParameterOption('-vv', true) || input.hasParameterOption('--verbose=2', true) || 2 === input.getParameterOption('--verbose', false, true))
      {
        output.setVerbosity(Output.VERBOSITY_VERY_VERBOSE);
        shellVerbosity = 2;
      } else if (input.hasParameterOption('-v', true) || input.hasParameterOption('--verbose=1', true) || input.hasParameterOption('--verbose', true) || input.getParameterOption('--verbose', false, true))
      {
        output.setVerbosity(Output.VERBOSITY_VERBOSE);
        shellVerbosity = 1;
      }
    }

    if (-1 === shellVerbosity)
    {
      input.setInteractive(false);
    }

    putenv('SHELL_VERBOSITY=' + shellVerbosity);
    //_ENV['SHELL_VERBOSITY'] = shellVerbosity;
    //_SERVER['SHELL_VERBOSITY'] = shellVerbosity;
  }

  async doRunCommand(command, input, output)
  {
    forEach(command.getHelperSet(), function (helper)
    {
      if (helper.setInput)
      {
        helper.setInput(input);
      }
    });

    if (null === this.dispatcher)
    {
      return command.run(input, output);
    }

    let e = null;
    // bind before the console + command event, so the listeners have access to input options/arguments
    try
    {
      command.mergeApplicationDefinition();
      input.bind(command.getDefinition());
    } catch (e)
    {
      // ignore invalid options/arguments for now, to allow the event listeners to customize the InputDefinition
    }

    let event = new ConsoleCommandEvent(command, input, output);
    let exitCode = null;

    try
    {
      this.dispatcher.dispatch(event, ConsoleEvents.COMMAND);

      if (event.commandShouldRun())
      {
        let exitCode = await command.run(input, output);
      } else
      {
        exitCode = ConsoleCommandEvent.RETURN_CODE_DISABLED;
      }
    } catch (e)
    {
      event = new ConsoleErrorEvent(input, output, e, command);
      this.dispatcher.dispatch(event, ConsoleEvents.ERROR);
      e = event.getError();
      exitCode = event.getExitCode();
      if (0 === exitCode)
      {
        e = null;
      }
    }

    event = new ConsoleTerminateEvent(command, input, output, exitCode);
    this.dispatcher.dispatch(event, ConsoleEvents.TERMINATE);

    if (null !== e)
    {
      throw e;
    }

    return event.getExitCode();
  }

  getCommandName(input)
  {
    return this.singleCommand ? this.fallbackCommand : input.getFirstArgument();
  }

  getFallbackInputDefinition()
  {
    return new InputDefinition([
      new InputArgument('command', InputArgument.REQUIRED, 'The command to execute'),

      new InputOption('--help', '-h', InputOption.VALUE_NONE, 'Display this help message'),
      new InputOption('--quiet', '-q', InputOption.VALUE_NONE, 'Do not output any message'),
      new InputOption('--verbose', '-v|vv|vvv', InputOption.VALUE_NONE, 'Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug'),
      new InputOption('--version', '-V', InputOption.VALUE_NONE, 'Display this application version'),
      new InputOption('--ansi', '', InputOption.VALUE_NONE, 'Force ANSI output'),
      new InputOption('--no-ansi', '', InputOption.VALUE_NONE, 'Disable ANSI output'),
      new InputOption('--no-interaction', '-n', InputOption.VALUE_NONE, 'Do not ask any interactive question'),
    ]);
  }

  getFallbackCommands()
  {
    //Down here to prevent circular loading
    const HelpCommand = require('./command/HelpCommand');
    const ListCommand = require('./command/ListCommand');

    return [new HelpCommand(), new ListCommand()];
  }

  getFallbackHelperSet()
  {
    return new HelperSet([
      new FormatterHelper(),
      new DebugFormatterHelper(),
      new ProcessHelper(),
      new QuestionHelper(),
    ]);
  }

  getAbbreviationSuggestions(abbrevs)
  {
    return '    ' + implode("\n    ", abbrevs);
  }

  extractNamespace(name, limit = null)
  {
    const parts = name.split(':');
    parts.pop();
    const clippable = null === limit ? parts : parts.slice(0, limit);
    return clippable.join(':');
  }

  findAlternatives(name, collection)
  {
    let threshold = 1e3;
    let alternatives = {};

    let collectionParts = {};
    forEach(collection, (item) =>
    {
      collectionParts[item] = item.split(/\:/g);
    });

    forEach(name.split(/\:/g), (subname, i) =>
    {
      forEach(collectionParts, (parts, collectionName) =>
      {
        let exists = isset(alternatives[collectionName]);
        if (!isset(parts[i]) && exists)
        {
          alternatives[collectionName] += threshold;
          return;
        } else if (!isset(parts[i]))
        {
          return;
        }

        let lev = levenshtein(subname, parts[i]);
        if (lev <= strlen(subname) / 3 || '' !== subname && false !== strpos(parts[i], subname))
        {
          alternatives[collectionName] = exists ? alternatives[collectionName] + lev : lev;
        } else if (exists)
        {
          alternatives[collectionName] += threshold;
        }
      });
    });

    forEach(collection, (item) =>
    {
      let lev = levenshtein(name, item);
      if (lev <= strlen(name) / 3 || false !== strpos(item, name))
      {
        alternatives[item] = isset(alternatives[item]) ? alternatives[item] - lev : lev;
      }
    });

    const filteredAlternatives = _.pickBy(alternatives, (lev) =>
      {
        return lev < 2 * threshold;
      }
    );

    alternatives = _(filteredAlternatives).toPairs().sortBy(0).fromPairs().value();
    // ksort(alternatives, SORT_NATURAL | SORT_FLAG_CASE);

    return Object.keys(alternatives);
  }

  setFallbackCommand(commandName, isSingleCommand = false)
  {
    this.fallbackCommand = commandName;

    if (isSingleCommand)
    {
      // Ensure the command exist
      this.find(commandName);

      this.singleCommand = true;
    }

    return this;
  }

  isSingleCommand()
  {
    return this.singleCommand;
  }

  splitStringByWidth(string, width)
  {
    // str_split is not suitable for multi-byte characters, we should use preg_split to get char array properly +
    // additionally, array_slice() is not enough as some character has doubled width +
    // we need a function to split string not by character count but by string width
    //let encoding = mb_detect_encoding(string, null, true)
    let encoding = false;
    if (false === encoding)
    {
      const regexep = new RegExp(`.{1,${width}}`, "g");
      return string === "" ? [""] : string.match(regexep);
    }

    //let utf8String = mb_convert_encoding(string, 'utf8', encoding);
    let utf8String = string;
    let lines = [];
    let line = '';

    let offset = 0;
    while (preg_match('/ + {1,10000}/u', utf8String, m, 0, offset))
    {
      offset += strlen(m[0]);

      forEach(preg_split('//u', m[0]), function (char)
      {
        // test if char could be appended to current line
        if (mb_strwidth(line + char, 'utf8') <= width)
        {
          line += char;
          return;
        }
        // if not, push current line to array and make new line
        lines.push(str_pad(line, width));
        line = char;
      });
    }

    lines.push(count(lines) ? str_pad(line, width) : line);

    mb_convert_variables(encoding, 'utf8', lines);

    return lines;
  }

  extractAllNamespaces(name)
  {
    // -1 as third argument is needed to skip the command short name when exploding
    let parts = name.split(/\:/g);
    parts.pop();
    let namespaces = [];

    forEach(parts, (part) =>
    {
      if (count(namespaces))
      {
        namespaces.push(namespaces + ':' + part);
      } else
      {
        namespaces.push(part);
      }
    });

    return namespaces;
  }

  init()
  {
    if (this.initialized)
    {
      return;
    }
    this.initialized = true;

    forEach(this.getFallbackCommands(), (command) =>
    {
      this.add(command);
    });
  }

  toBacktrace(e){
    let stack = e.stack;
    const regex = /at ((.+) \()?(.+)\:([0-9]*)\:([0-9]*)/gm;

    let m;
    let lines = [];
    while ((m = regex.exec(stack)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      lines.push({
          func: m[2],
          path: m[3],
          line: m[4],
          col: m[5]
        });
    }

    return lines;
  }
}

module.exports = Application;
