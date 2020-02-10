const {putenv, trim, sprintf, PHP_EOL} = require('../src/PhpPolyfill');
const {ob_start, ob_get_clean, ob_end_clean} = require('./obPolyfill');
const {fixtureContent} = require('./UtilTool');
const mocha = require('mocha');
const sinon = require('sinon');
const chai = require('chai');
const os = require('os');
const forEach = require('mocha-each');
const {assert} = chai;

assert.rejects = assert.rejects || require('assert').rejects;

const util = require('./UtilTool');
const streams = require('memory-streams');

const Application = require('../src/Application');
const Command = require('../src/command/Command');
const FactoryCommandLoader = require('../src/commandloader/FactoryCommandLoader');
//const AddConsoleCommandPass = require('../src/dependencyinjection/AddConsoleCommandPass');
const ConsoleCommandEvent = require('../src/event/ConsoleCommandEvent');
const ConsoleErrorEvent = require('../src/event/ConsoleErrorEvent');
const ConsoleTerminateEvent = require('../src/event/ConsoleTerminateEvent');
const NamespaceNotFoundError = require('../src/error/NamespaceNotFoundError');
const CommandNotFoundError = require('../src/error/CommandNotFoundError');
const FormatterHelper = require('../src/helper/FormatterHelper');
const HelperSet = require('../src/helper/HelperSet');
const HelpCommand = require('../src/command/HelpCommand');
const ArgvInput = require('../src/input/ArgvInput');
const ArrayInput = require('../src/input/ArrayInput');
const InputArgument = require('../src/input/InputArgument');
const InputDefinition = require('../src/input/InputDefinition');
const InputOption = require('../src/input/InputOption');
const NullOutput = require('../src/output/NullOutput');
const Output = require('../src/output/Output');
const StreamOutput = require('../src/output/StreamOutput');
const ConsoleOutput = require('../src/output/ConsoleOutput');
const ApplicationTester = require('../src/tester/ApplicationTester');

const FooCommand = require('./fixtures/FooCommand');
const FooOptCommand = require('./fixtures/FooOptCommand');
const Foo1Command = require('./fixtures/Foo1Command');
const Foo2Command = require('./fixtures/Foo2Command');
const Foo3Command = require('./fixtures/Foo3Command');
const Foo4Command = require('./fixtures/Foo4Command');
const Foo5Command = require('./fixtures/Foo5Command');
const FooSameCaseUppercaseCommand = require('./fixtures/FooSameCaseUppercaseCommand');
const FooSameCaseLowercaseCommand = require('./fixtures/FooSameCaseLowercaseCommand');
const FoobarCommand = require('./fixtures/FoobarCommand');
const BarBucCommand = require('./fixtures/BarBucCommand');
const FooSubnamespaced1Command = require('./fixtures/FooSubnamespaced1Command');
const FooSubnamespaced2Command = require('./fixtures/FooSubnamespaced2Command');
const FooWithoutAliasCommand = require('./fixtures/FooWithoutAliasCommand');
const TestAmbiguousCommandRegistering = require('./fixtures/TestAmbiguousCommandRegistering');
const TestAmbiguousCommandRegistering2 = require('./fixtures/TestAmbiguousCommandRegistering2');
const FooHiddenCommand = require('./fixtures/FooHiddenCommand');
const BarHiddenCommand = require('./fixtures/BarHiddenCommand');

// Event Dispatcher not implemented
xdescribe('#Application - Event Dispatcher', () => {
  it('testRunWithDispatcher', async () => {
    let application = new Application();
    application.setAutoExit(false);
    application.setDispatcher(getDispatcher());

    application.register('foo').setCode(function (input, output) {
      output.write('foo + ');
    });

    let tester = new ApplicationTester(application);
    await tester.run({'command': 'foo'});
    assert.deepEqual('before + foo + after + ' + PHP_EOL, tester.getDisplay());
  });

  it('testRunWithExceptionAndDispatcher', async () => {

    assert.throws(async () => {
      let application = new Application();
      application.setDispatcher(getDispatcher());
      application.setAutoExit(false);
      application.setCatchExceptions(false);
      application.register('foo').setCode(function (input, output) {
        throw new Error('foo');
      });
      let tester = new ApplicationTester(application);
      await tester.run({'command': 'foo'});
    }, 'error');

  });

  it('testRunDispatchesAllEventsWithException', async () => {
    let application = new Application();
    application.setDispatcher(getDispatcher());
    application.setAutoExit(false);

    application.register('foo').setCode(function (input, output) {
      output.write('foo + ');

      throw new Error('foo');
    });

    let tester = new ApplicationTester(application);
    await tester.run({'command': 'foo'});
    assert.isStringContainsString('before + foo + error + after + ', tester.getDisplay());
  });

  it('testRunDispatchesAllEventsWithExceptionInListener', async () => {
    let dispatcher = getDispatcher();
    dispatcher.addListener('console + command', function () {
      throw new Error('foo');
    });

    let application = new Application();
    application.setDispatcher(dispatcher);
    application.setAutoExit(false);

    application.register('foo').setCode(function (input, output) {
      output.write('foo + ');
    });

    let tester = new ApplicationTester(application);
    await tester.run({'command': 'foo'});
    assert.isStringContainsString('before + error + after + ', tester.getDisplay());
  });

  it('testRunDispatchesIntegerExitCode', async () => {
    let passedRightValue = false;

    // We can assume here that some other test asserts that the event is dispatched at all
    let dispatcher = new EventDispatcher();
    dispatcher.addListener('console + terminate', function (event) {
      passedRightValue = (4 === event.getExitCode());
    });

    let application = new Application();
    application.setDispatcher(dispatcher);
    application.setAutoExit(false);

    application.register('test').setCode(function (input, output) {
      throw new Error('', 4);
    });

    let tester = new ApplicationTester(application);
    await tester.run({'command': 'test'});

    assert.isTrue(passedRightValue, '. exit code 4 was passed in the console + terminate event');
  });

  it('testRunDispatchesExitCodeOneForExceptionCodeZero', async () => {
    let passedRightValue = false;

    // We can assume here that some other test asserts that the event is dispatched at all
    let dispatcher = new EventDispatcher();
    dispatcher.addListener('console + terminate', function (event) {
      passedRightValue = (1 === event.getExitCode());
    });

    let application = new Application();
    application.setDispatcher(dispatcher);
    application.setAutoExit(false);

    application.register('test').setCode(function (input, output) {
      throw new Error();
    });

    let tester = new ApplicationTester(application);
    await tester.run({'command': 'test'});

    assert.isTrue(passedRightValue, '. exit code 1 was passed in the console + terminate event');
  });


  it('testErrorIsRethrownIfNotHandledByConsoleErrorEventWithCatchingEnabled', async () => {
    let application = new Application();
    application.setAutoExit(false);
    application.setDispatcher(new EventDispatcher());

    application.register('dym').setCode(function (input, output) {
      new UnknownClass();
    });

    let tester = new ApplicationTester(application);

    try {
      await tester.run({'command': 'dym'});
      this.fail('.run() should rethrow PHP errors if not handled via ConsoleErrorEvent + ');
    } catch (e) {
      assert.deepEqual(e.getMessage(), 'Class \'UnknownClass\' not found');
    }
  });


  it('testThrowingErrorListener', async () => {

    assert.throws(async () => {
      let dispatcher = getDispatcher();
      dispatcher.addListener('console + error', function (event) {
        throw new Error('foo');
      });
      dispatcher.addListener('console + command', function () {
        throw new Error('bar');
      });
      let application = new Application();
      application.setDispatcher(dispatcher);
      application.setAutoExit(false);
      application.setCatchExceptions(false);
      application.register('foo').setCode(function (input, output) {
        output.write('foo + ');
      });
      let tester = new ApplicationTester(application);
      await tester.run({'command': 'foo'});
    }, 'foo');

  });


  it('testAddingOptionWithDuplicateShortcut', async () => {

    assert.throws( () => {
      let dispatcher = new EventDispatcher();
      let application = new Application();
      application.setAutoExit(false);
      application.setCatchExceptions(false);
      application.setDispatcher(dispatcher);
      application.getDefinition().addOption(new InputOption('--env', '-e', InputOption.VALUE_REQUIRED, 'Environment'));
      application
        .register('foo')
        .setAliases(['f'])
        .setDefinition([new InputOption('survey', 'e', InputOption.VALUE_REQUIRED, 'My option with a shortcut + ')])
        .setCode(function (input, output) {
        })
      ;
      let input = new ArrayInput({'command': 'foo'});
      output = new NullOutput();
      application.run(input, output);
    }, 'An option with shortcut "e" already exists + ');

  });

  function setUp() {
    this.colSize = getenv('COLUMNS');
  }

  function tearDown() {
    putenv(this.colSize ? 'COLUMNS=' + this.colSize : 'COLUMNS');
    putenv('SHELL_VERBOSITY');
    unset(_ENV['SHELL_VERBOSITY']);
    unset(_SERVER['SHELL_VERBOSITY']);
  }

  function setUpBeforeClass() {

  }

  function normalizeLineBreaks(text) {
    let eol = new RegExp(os.EOL, "g");
    return text.replace(eol, "\n");
  }

  function ensureStaticCommandHelp(application) {
    forEach(application.all(), function (command) {
      command.setHelp(str_replace('%command + full_name%', 'app/console %command + name%', command.getHelp()));
    });
  }

  function provideAmbiguousAbbreviations() {
    return [
      ['f', 'Command "f" is not defined.'],
      [
        'a',
        "Command \"a\" is ambiguous.\nDid you mean one of these?\n" +
        "    afoobar  The foo:bar command\n" +
        "    afoobar1 The foo:bar1 command\n" +
        '    afoobar2 The foo1:bar command',
      ],
      [
        'foo:b',
        "Command \"foo:b\" is ambiguous.\nDid you mean one of these?\n" +
        "    foo:bar  The foo:bar command\n" +
        "    foo:bar1 The foo:bar1 command\n" +
        '    foo1:bar The foo1:bar command',
      ],
    ];
  }

  function provideInvalidCommandNamesSingle() {
    return [
      ['foo3:barr'],
      ['fooo3:bar'],
    ];
  }

  function getAddingAlreadySetDefinitionElementData() {
    return [
      [new InputArgument('command', InputArgument.REQUIRED)],
      [new InputOption('quiet', '', InputOption.VALUE_NONE)],
      [new InputOption('query', 'q', InputOption.VALUE_NONE)],
    ];
  }

  function getDispatcher() {
    let dispatcher = new EventDispatcher();
    dispatcher.addListener('console + command', function (event) {
      event.getOutput().write('before + ');

      if (skipCommand) {
        event.disableCommand();
      }
    });
    dispatcher.addListener('console + terminate', function (event) {
      event.getOutput().writeln('after + ');

      if (!skipCommand) {
        event.setExitCode(ConsoleCommandEvent.RETURN_CODE_DISABLED);
      }
    });
    dispatcher.addListener('console + error', function (event) {
      event.getOutput().write('error + ');

      event.setError(new Error('error + ', event.getExitCode(), event.getError()));
    });

    return dispatcher;
  }

  function getDefaultInputDefinition() {
    return new InputDefinition([new InputOption('--custom', '-c', InputOption.VALUE_NONE, 'Set the custom input definition + ')]);
  }

  function getDefaultHelperSet() {
    return new HelperSet([new FormatterHelper()]);
  }

  function __construct() {
    // super();

    let command = new FooCommand();
    this.add(command);
    this.setFallbackCommand(command.getName());
  }

  function execute() {
    output.writeln('lazy-command called');

    return 0;
  }

  function isEnabled() {
    return false;
  }

});

class CustomApplication extends Application {
  /**
   * Overwrites the default input definition.
   *
   * @return InputDefinition An InputDefinition instance
   */
  getFallbackInputDefinition() {
    return new InputDefinition([new InputOption('--custom', '-c', InputOption.VALUE_NONE, 'Set the custom input definition.')]);
  }

  /**
   * Gets the default helper set with the helpers that should always be available.
   *
   * @return HelperSet A HelperSet instance
   */
  getDefaultHelperSet() {
    return new HelperSet([new FormatterHelper()]);
  }
}


class CustomDefaultCommandApplication extends Application {
  constructor() {
    super();
    let command = new FooCommand();
    this.add(command);
    this.setFallbackCommand(command.getName());
  }
}

class LazyCommand extends Command {
  execute(input, output) {
    output.writeln('lazy-command called');
    return 0;
  }
}

class DisabledCommand extends Command {
  isEnabled() {
    return false;
  }
}
