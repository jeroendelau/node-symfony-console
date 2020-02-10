const {putenv, trim, sprintf, PHP_EOL} = require('../src/PhpPolyfill');
const {ob_start, ob_get_clean, ob_end_clean} = require('./obPolyfill');
const {fixtureContent} = require('./UtilTool');
const mocha = require('mocha');
const sinon = require('sinon');
const chai = require('chai');
const os = require('os');
const forEach = require('mocha-each');
const {assert} = chai;

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

describe('#Application', () => {
  it('testConstructor', async () => {
    let application = new Application('foo', 'bar');
    assert.deepEqual('foo', application.getName(), '__construct() takes the application name as its first argument');
    assert.deepEqual('bar', application.getVersion(), '__construct() takes the application version as its second argument');
    assert.deepEqual(['help', 'list'], Object.keys(application.all()), '__construct() registered the help and list commands by fallback');
  });

  it('testSetGetName', async () => {
    let application = new Application();
    application.setName('foo');
    assert.deepEqual('foo', application.getName(), '.setName() sets the name of the application');
  });

  it('testSetGetVersion', async () => {
    let application = new Application();
    application.setVersion('bar');
    assert.deepEqual('bar', application.getVersion(), '.setVersion() sets the version of the application');
  });

  it('testGetLongVersion', async () => {
    let application = new Application('foo', 'bar');
    assert.deepEqual('foo <info>bar</info>', application.getLongVersion(), '.getLongVersion() returns the long version of the application');
  });

  it('testHelp', async () => {
    let application = new Application();
    assert.deepEqual(util.fixtureContent('application_gethelp.txt'), normalizeLineBreaks(application.getHelp()), '.getHelp() returns a help message');
  });

  it('testAll', async () => {
    let application = new Application();
    let commands = application.all();
    assert.instanceOf(commands['help'], HelpCommand, '.all() returns the registered commands');

    application.add(new FooCommand());
    commands = application.all('foo');
    assert.lengthOf(Object.values(commands), 1, '.all() takes a namespace as its first argument');
  });

  it('testAllWithCommandLoader', async () => {
    let application = new Application();
    let commands = application.all();
    assert.instanceOf(commands['help'], HelpCommand, '.all() returns the registered commands');

    application.add(new FooCommand());
    commands = application.all('foo');
    assert.lengthOf(Object.values(commands), 1, '.all() takes a namespace as its first argument');

    application.setCommandLoader(new FactoryCommandLoader({
      'foo:bar1': function () {
        return new Foo1Command();
      },
    }));
    commands = application.all('foo');
    assert.lengthOf(Object.values(commands), 2, '.all() takes a namespace as its first argument');
    assert.instanceOf(commands['foo:bar'], FooCommand, '.all() returns the registered commands');
    assert.instanceOf(commands['foo:bar1'], Foo1Command, '.all() returns the registered commands');
  });

  it('testRegister', async () => {
    let application = new Application();
    command = application.register('foo');
    assert.deepEqual('foo', command.getName(), '.register() registers a new command');
  });

  it('testRegisterAmbiguous', async () => {
    let code = function (input, output) {
      output.writeln('It works!');
    };

    let application = new Application();
    application.setAutoExit(false);
    application
      .register('test-foo')
      .setAliases(['test'])
      .setCode(code);

    application
      .register('test-bar')
      .setCode(code);

    let tester = new ApplicationTester(application);
    await tester.run(['test']);
    assert.include(tester.getDisplay(true), "It works!");
  });

  it('testAdd', async () => {
    let application = new Application();
    application.add(foo = new FooCommand());
    commands = application.all();
    assert.deepEqual(foo, commands['foo:bar'], '.add() registers a command');

    application = new Application();
    application.addCommands([foo = new FooCommand(), foo1 = new Foo1Command()]);
    commands = application.all();
    assert.deepEqual([foo, foo1], [commands['foo:bar'], commands['foo:bar1']], '.addCommands() registers an array of commands');
  });

  /**
   * impossible in nodes
  xit('testAddCommandWithEmptyConstructor', async () => {

    assert.throws(() => {
      let application = new Application();
      application.add(new Foo5Command());
    }, 'Command class "Foo5Command" is not correctly initialized.  You probably forgot to call the super constructor.');

  });
   **/

  it('testHasGet', async () => {
    let application = new Application();
    assert.isTrue(application.has('list'), '.has() returns true if a named command is registered');
    assert.isFalse(application.has('afoobar'), '.has() returns false if a named command is not registered');

    application.add(foo = new FooCommand());
    assert.isTrue(application.has('afoobar'), '.has() returns true if an alias is registered');
    assert.deepEqual(foo, application.get('foo:bar'), '.get() returns a command by name');
    assert.deepEqual(foo, application.get('afoobar'), '.get() returns a command by alias');

    application = new Application();
    application.add(foo = new FooCommand());
    // simulate --help
    //let r = new ReflectionObject(application);
    // p = r.getProperty('wantHelps');
    // p.setAccessible(true);
    // p.setValue(application, true);
    application.wantHelps = true;
    let command = application.get('foo:bar');
    assert.instanceOf(command, HelpCommand, '.get() returns the help command if --help is provided as the input');
  });

  it('testHasGetWithCommandLoader', async () => {
    let application = new Application();
    assert.isTrue(application.has('list'), '.has() returns true if a named command is registered');
    assert.isFalse(application.has('afoobar'), '.has() returns false if a named command is not registered');

    application.add(foo = new FooCommand());
    assert.isTrue(application.has('afoobar'), '.has() returns true if an alias is registered');
    assert.deepEqual(foo, application.get('foo:bar'), '.get() returns a command by name');
    assert.deepEqual(foo, application.get('afoobar'), '.get() returns a command by alias');

    application.setCommandLoader(new FactoryCommandLoader({
      'foo:bar1': function () {
        return new Foo1Command();
      },
    }));

    assert.isTrue(application.has('afoobar'), '.has() returns true if an instance is registered for an alias even with command loader');
    assert.deepEqual(foo, application.get('foo:bar'), '.get() returns an instance by name even with command loader');
    assert.deepEqual(foo, application.get('afoobar'), '.get() returns an instance by alias even with command loader');
    assert.isTrue(application.has('foo:bar1'), '.has() returns true for commands registered in the loader');

    const foo1 = application.get('foo:bar1')
    assert.instanceOf(foo1, Foo1Command, '.get() returns a command by name from the command loader');
    assert.isTrue(application.has('afoobar1'), '.has() returns true for commands registered in the loader');
    assert.deepEqual(foo1, application.get('afoobar1'), '.get() returns a command by name from the command loader');
  });

  it('testSilentHelp', async () => {
    let application = new Application();
    application.setAutoExit(false);
    application.setCatchExceptions(false);

    let tester = new ApplicationTester(application);
    await tester.run({'-h': true, '-q': true}, {'decorated': false});

    assert.isEmpty(tester.getDisplay(true));
  });

  it('testGetInvalidCommand', () => {
    assert.throws( () => {
      let application = new Application();
      application.get('foofoo');
    }, 'The command "foofoo" does not exist.');

  });

  it('testGetNamespaces', async () => {
    let application = new Application();
    application.add(new FooCommand());
    application.add(new Foo1Command());
    assert.deepEqual(['foo'], application.getNamespaces(), '.getNamespaces() returns an array of unique used namespaces');
  });

  it('testFindNamespace', async () => {
    let application = new Application();
    application.add(new FooCommand());
    assert.deepEqual('foo', application.findNamespace('foo'), '.findNamespace() returns the given namespace if it exists');
    assert.deepEqual('foo', application.findNamespace('f'), '.findNamespace() finds a namespace given an abbreviation');
    application.add(new Foo2Command());
    assert.deepEqual('foo', application.findNamespace('foo'), '.findNamespace() returns the given namespace if it exists');
  });

  it('testFindNamespaceWithSubnamespaces', async () => {
    let application = new Application();
    application.add(new FooSubnamespaced1Command());
    application.add(new FooSubnamespaced2Command());
    assert.deepEqual('foo', application.findNamespace('foo'), '.findNamespace() returns commands even if the commands are only contained in subnamespaces');
  });

  it('testFindAmbiguousNamespace',  () => {
    let expectedMsg = "The namespace \"f\" is ambiguous.\nDid you mean one of these?\n    foo\n    foo1";

    assert.throws(() => {
      let application = new Application();
      application.add(new BarBucCommand());
      application.add(new FooCommand());
      application.add(new Foo2Command());
      application.findNamespace('f');
    }, expectedMsg);

  });

  it('testFindNonAmbiguous', async () => {
    let application = new Application();
    application.add(new TestAmbiguousCommandRegistering());
    application.add(new TestAmbiguousCommandRegistering2());
    assert.deepEqual('test-ambiguous', application.find('test').getName());
  });

  it('testFindInvalidNamespace', async () => {

    assert.throws(() => {
      let application = new Application();
      application.findNamespace('bar');
    }, 'There are no commands defined in the "bar" namespace.');

  });

  it('testFindUniqueNameButNamespaceName', async () => {
    let commandName = 'foo1';
    assert.throws( () => {
      let application = new Application();
      application.add(new FooCommand());
      application.add(new Foo1Command());
      application.add(new Foo2Command());
      application.find(commandName);
    }, 'Command "foo1" is not defined');

  });

  it('testFind', async () => {
    let application = new Application();
    application.add(new FooCommand());

    assert.instanceOf(application.find('foo:bar'), FooCommand, '.find() returns a command if its name exists');
    assert.instanceOf(application.find('h'), HelpCommand, '.find() returns a command if its name exists');
    assert.instanceOf(application.find('f:bar'), FooCommand, '.find() returns a command if the abbreviation for the namespace exists');
    assert.instanceOf(application.find('f:b'), FooCommand, '.find() returns a command if the abbreviation for the namespace and the command name exist');
    assert.instanceOf(application.find('a'), FooCommand, '.find() returns a command if the abbreviation exists for an alias');
  });

  it('testFindCaseSensitiveFirst', async () => {
    let application = new Application();
    application.add(new FooSameCaseUppercaseCommand());
    application.add(new FooSameCaseLowercaseCommand());

    assert.instanceOf(application.find('f:B'), FooSameCaseUppercaseCommand, '.find() returns a command if the abbreviation is the correct case');
    assert.instanceOf(application.find('f:BAR'), FooSameCaseUppercaseCommand, '.find() returns a command if the abbreviation is the correct case');
    assert.instanceOf(application.find('f:b'), FooSameCaseLowercaseCommand, '.find() returns a command if the abbreviation is the correct case');
    assert.instanceOf(application.find('f:bar'), FooSameCaseLowercaseCommand, '.find() returns a command if the abbreviation is the correct case');
  });

  it('testFindCaseInsensitiveAsFallback', async () => {
    let application = new Application();
    application.add(new FooSameCaseLowercaseCommand());

    assert.instanceOf(application.find('f:b'), FooSameCaseLowercaseCommand, '.find() returns a command if the abbreviation is the correct case');
    assert.instanceOf(application.find('f:B'), FooSameCaseLowercaseCommand, '.find() will fallback to case insensitivity');
    assert.instanceOf(application.find('FoO:BaR'), FooSameCaseLowercaseCommand, '.find() will fallback to case insensitivity');
  });

  it('testFindCaseInsensitiveSuggestions', () => {

    assert.throws(() => {
      let application = new Application();
      application.add(new FooSameCaseLowercaseCommand());
      application.add(new FooSameCaseUppercaseCommand());
      assert.instanceOf(application.find('FoO:BaR'), FooSameCaseLowercaseCommand, '.find() will find two suggestions with case insensitivity');
    }, 'Command "FoO:BaR" is ambiguous');

  });

  it('testFindWithCommandLoader', async () => {
    let application = new Application();
    let f = function () {
      return new FooCommand();
    };
    application.setCommandLoader(new FactoryCommandLoader({
      'foo:bar': f,
    }));

    assert.instanceOf(application.find('foo:bar'), FooCommand, '.find() returns a command if its name exists');
    assert.instanceOf(application.find('h'), HelpCommand, '.find() returns a command if its name exists');
    assert.instanceOf(application.find('f:bar'), FooCommand, '.find() returns a command if the abbreviation for the namespace exists');
    assert.instanceOf(application.find('f:b'), FooCommand, '.find() returns a command if the abbreviation for the namespace and the command name exist');
    assert.instanceOf(application.find('a'), FooCommand, '.find() returns a command if the abbreviation exists for an alias');
  });

  forEach(provideAmbiguousAbbreviations()).it('testFindWithAmbiguousAbbreviations %s throws %s', (abbreviation, expectedExceptionMessage) => {
    assert.throws(() => {
      putenv('COLUMNS=120');
      let application = new Application();
      application.add(new FooCommand());
      application.add(new Foo1Command());
      application.add(new Foo2Command());
      application.find(abbreviation);
    }, expectedExceptionMessage);

  });

  it('testFindWithAmbiguousAbbreviationsFindsCommandIfAlternativesAreHidden', async () => {
    let application = new Application();

    application.add(new FooCommand());
    application.add(new FooHiddenCommand());

    assert.instanceOf(application.find('foo:'), FooCommand);
  });

  it('testFindCommandEqualNamespace', async () => {
    let application = new Application();
    application.add(new Foo3Command());
    application.add(new Foo4Command());

    assert.instanceOf(application.find('foo3:bar'), Foo3Command, '.find() returns the good command even if a namespace has same name');
    assert.instanceOf(application.find('foo3:bar:toh'), Foo4Command, '.find() returns a command even if its namespace equals another command name');
  });

  it('testFindCommandWithAmbiguousNamespacesButUniqueName', async () => {
    let application = new Application();
    application.add(new FooCommand());
    application.add(new FoobarCommand());

    assert.instanceOf(application.find('f:f'), FoobarCommand);
  });

  it('testFindCommandWithMissingNamespace', async () => {
    let application = new Application();
    application.add(new Foo4Command());

    assert.instanceOf(application.find('f::t'), Foo4Command);
  });

  forEach(provideInvalidCommandNamesSingle()).it('testFindAlternativeExceptionMessageSingle %s', (name) => {

    assert.throws(() => {
      let application = new Application();
      application.add(new Foo3Command());
      application.find(name);
    }, 'Did you mean this');

  });

  it('testDontRunAlternativeNamespaceName', async () => {
    let application = new Application();
    application.add(new Foo1Command());
    application.setAutoExit(false);
    let tester = new ApplicationTester(application);
    await tester.run({'command': 'foos:bar1'}, {'decorated': false});
    assert.deepEqual(tester.getDisplay(true), `
                                                          
  There are no commands defined in the "foos" namespace.  
                                                          
  Did you mean this?                                      
      foo                                                 
                                                          

`);
  });

  it('testCanRunAlternativeCommandName', async () => {
    let application = new Application();
    application.add(new FooWithoutAliasCommand());
    application.setAutoExit(false);
    let tester = new ApplicationTester(application);
    tester.setInputs(['y']);
    await tester.run({'command': 'foos'}, {'decorated': false});
    let display = trim(tester.getDisplay(true));
    assert.include(display, 'Command "foos" is not defined');
    // assert.include(display, 'Do you want to run "foo" instead?  (yes/no) [no]:');
    assert.include(display, 'Do you want to run "foo" instead?');
    assert.include(display, 'called');
  });

  it('testDontRunAlternativeCommandName', async () => {
    let application = new Application();
    application.add(new FooWithoutAliasCommand());
    application.setAutoExit(false);
    let tester = new ApplicationTester(application);
    tester.setInputs(['n']);
    let exitCode = await tester.run({'command': 'foos'}, {'decorated': false});
    assert.deepEqual(1, exitCode);
    let display = trim(tester.getDisplay(true));
    assert.include(display, 'Command "foos" is not defined');
    //assert.include(display, 'Do you want to run "foo" instead?  (yes/no) [no]:');
    assert.include(display, 'Do you want to run "foo" instead?');
  });

  it('testFindAlternativeExceptionMessageMultiple', async () => {
    putenv('COLUMNS=120');
    let application = new Application();
    application.add(new FooCommand());
    application.add(new Foo1Command());
    application.add(new Foo2Command());

    // Command + plural
    try {
      application.find('foo:baR');
      this.fail('.find() throws a Error if command does not exist, with alternatives');
    } catch (e) {
      assert.instanceOf(e, Error, '.find() throws a Error if command does not exist, with alternatives');
      assert.match(e.message, /Did you mean one of these/, '.find() throws a Error if command does not exist, with alternatives');
      assert.match(e.message, /foo1:bar/);
      assert.match(e.message, /foo:bar/);
    }

    // Namespace + plural
    try {
      application.find('foo2:bar');
      this.fail('.find() throws a Error if command does not exist, with alternatives');
    } catch (e) {
      assert.instanceOf(e, Error, '.find() throws a Error if command does not exist, with alternatives');
      assert.match(e.message, /Did you mean one of these/, '.find() throws a Error if command does not exist, with alternatives');
      assert.match(e.message, /foo1/);
    }

    application.add(new Foo3Command());
    application.add(new Foo4Command());

    // Subnamespace + plural
    try {
      application.find('foo3:');
      this.fail('.find() should throw an Symfony\Component\Console\Error\Error if a command is ambiguous because of a subnamespace, with alternatives');
    } catch (e) {
      //assert.instanceOf(Error.prototype.constructor, e);
      assert.match(e.message, /foo3:bar/);
      assert.match(e.message, /foo3:bar:toh/);
    }
  });

  it('testFindAlternativeCommands', async () => {
    let application = new Application();

    application.add(new FooCommand());
    application.add(new Foo1Command());
    application.add(new Foo2Command());

    let commandName = 'Unknown command'
    try {
      application.find(commandName);
      this.fail('.find() throws a Error if command does not exist');
    } catch (e) {
      //assert.instanceOf( e,'Symfony\Component\Console\Error\Error', '.find() throws a Error if command does not exist');
      assert.deepEqual([], e.getAlternatives());
      assert.deepEqual(sprintf('Command "%s" is not defined.', commandName), e.message, '.find() throws a Error if command does not exist, without alternatives');
    }

    // Test if "bar1" command throw a "Error" and does not contain
    // "foo:bar" as alternative because "bar1" is too far from "foo:bar"
    commandName = 'bar1';
    try {
      application.find(commandName);
      this.fail('.find() throws a Error if command does not exist');
    } catch (e) {
      //assert.instanceOf( e,'Symfony\Component\Console\Error\Error', '.find() throws a Error if command does not exist');
      assert.deepEqual(['afoobar1', 'foo:bar1'], e.getAlternatives());

      let rx = new RegExp(sprintf('Command \"%s\" is not defined.', commandName));

      assert.match(e.message, rx, '.find() throws a Error if command does not exist, with alternatives');
      assert.match(e.message, /afoobar1/, '.find() throws a Error if command does not exist, with alternative : "afoobar1"');
      assert.match(e.message, /foo:bar1/, '.find() throws a Error if command does not exist, with alternative : "foo:bar1"');
      assert.notMatch(e.message, /foo:bar(?!1)/, '.find() throws a Error if command does not exist, without "foo:bar" alternative');
    }
  });

  it('testFindAlternativeCommandsWithAnAlias', async () => {
    let fooCommand = new FooCommand();
    fooCommand.setAliases(['foo2']);

    let application = new Application();
    application.setCommandLoader(new FactoryCommandLoader({
      'foo3': function () {
        return fooCommand;
      },
    }));
    application.add(fooCommand);

    let result = application.find('foo');

    assert.deepEqual(fooCommand, result);
  });

  it('testFindAlternativeNamespace', async () => {
    let application = new Application();

    application.add(new FooCommand());
    application.add(new Foo1Command());
    application.add(new Foo2Command());
    application.add(new Foo3Command());

    try {
      application.find('Unknown-namespace:Unknown-command');
      this.fail('.find() throws a Error if namespace does not exist');
    } catch (e) {
      //assert.instanceOf( e,'Symfony\Component\Console\Error\Error', '.find() throws a Error if namespace does not exist');
      assert.deepEqual([], e.getAlternatives());
      assert.include(e.message, 'There are no commands defined in the "Unknown-namespace" namespace.', '.find() throws a Error if namespace does not exist, without alternatives');
    }

    try {
      application.find('foo2:command');
      this.fail('.find() throws a NamespaceNotFoundError if namespace does not exist');
    } catch (e) {
      assert.instanceOf(e, NamespaceNotFoundError, '.find() throws a NamespaceNotFoundError if namespace does not exist');
      assert.instanceOf(e, NamespaceNotFoundError, 'Error extends from NamespaceNotFoundError');
      assert.lengthOf(e.getAlternatives(), 3);
      assert.include(e.getAlternatives(), 'foo');
      assert.include(e.getAlternatives(), 'foo1');
      assert.include(e.getAlternatives(), 'foo3');
      assert.match(e.message, /There are no commands defined in the "foo2" namespace./, '.find() throws a Error if namespace does not exist, with alternative');
      assert.match(e.message, /foo/, '.find() throws a Error if namespace does not exist, with alternative : "foo"');
      assert.match(e.message, /foo1/, '.find() throws a Error if namespace does not exist, with alternative : "foo1"');
      assert.match(e.message, /foo3/, '.find() throws a Error if namespace does not exist, with alternative : "foo3"');
    }
  });

  it('testFindAlternativesOutput', async () => {
    let application = new Application();

    application.add(new FooCommand());
    application.add(new Foo1Command());
    application.add(new Foo2Command());
    application.add(new Foo3Command());
    application.add(new FooHiddenCommand());

    let expectedAlternatives = [
      'afoobar',
      'afoobar1',
      'afoobar2',
      'foo1:bar',
      'foo3:bar',
      'foo:bar',
      'foo:bar1',
    ];

    try {
      application.find('foo');
      this.fail('.find() throws a CommandNotFoundError if command is not defined');
    } catch (e) {
      assert.instanceOf(e, CommandNotFoundError, '.find() throws a CommandNotFoundError if command is not defined');
      assert.deepEqual(expectedAlternatives, e.getAlternatives());
      //assert.match(/Command "foo" is not defined\..*Did you mean one of these\?.*/ms, e.message);
    }
  });

  it('testFindNamespaceDoesNotFailOnDeepSimilarNamespaces', async () => {
    let application = sinon.createStubInstance(Application);
    application.getNamespaces.returns(['foo:sublong', 'bar:sub']);
    application.findNamespace.restore();

    assert.deepEqual('foo:sublong', application.findNamespace('f:sub'));
  });

  it('testFindWithDoubleColonInNameThrowsException', async () => {
    assert.throws( () => {
      let application = new Application();
      application.add(new FooCommand());
      application.add(new Foo4Command());
      application.find('foo::bar');
    }, 'Command "foo::bar" is not defined.');

  });

  it('testFindHiddenWithExactName', async () => {
    let application = new Application();
    application.add(new FooHiddenCommand());

    assert.instanceOf(application.find('foo:hidden'), FooHiddenCommand);
    assert.instanceOf(application.find('afoohidden'), FooHiddenCommand);
  });

  it('testFindAmbiguousCommandsIfAllAlternativesAreHidden', async () => {
    let application = new Application();

    application.add(new FooCommand());
    application.add(new FooHiddenCommand());

    assert.instanceOf(application.find('foo:'), FooCommand);
  });

  it('testSetCatchExceptions', async () => {
    let application = new Application();
    application.setAutoExit(false);
    putenv('COLUMNS=120');
    let tester = new ApplicationTester(application);

    application.setCatchExceptions(true);
    assert.isTrue(application.areExceptionsCaught());

    await tester.run({'command': 'foo'}, {'decorated': false});
    assert.deepEqual(fixtureContent('application_renderexception1.txt'), tester.getDisplay(true), '.setCatchExceptions() sets the catch exception flag');

    await tester.run({'command': 'foo'}, {'decorated': false, 'capture_stderr_separately': true});
    assert.deepEqual(fixtureContent('application_renderexception1.txt'), tester.getErrorOutput(true), '.setCatchExceptions() sets the catch exception flag');
    assert.deepEqual('', tester.getDisplay(true));

    application.setCatchExceptions(false);
    try {
      await tester.run({'command': 'foo'}, {'decorated': false});
      this.fail('.Errors() sets the catch exception flag');
    } catch (e) {
      assert.instanceOf(e, Error, '.setCatchExceptions() sets the catch exception flag');
      assert.deepEqual('Command "foo" is not defined.', e.message, '.Errors() sets the catch exception flag');
    }
  });

  it('testAutoExitSetting', async () => {
    let application = new Application();
    assert.isTrue(application.isAutoExitEnabled());

    application.setAutoExit(false);
    assert.isFalse(application.isAutoExitEnabled());
  });

  it('testRenderException', async () => {
    let application = new Application();
    application.setAutoExit(false);
    putenv('COLUMNS=120');
    let tester = new ApplicationTester(application);

    await tester.run({'command': 'foo'}, {'decorated': false, 'capture_stderr_separately': true});
    assert.deepEqual(fixtureContent('application_renderexception1.txt'), tester.getErrorOutput(true), '.Error() renders a pretty exception');

    await tester.run({'command': 'foo'}, {
      'decorated': false,
      'verbosity': Output.VERBOSITY_VERBOSE,
      'capture_stderr_separately': true
    });
    assert.include(tester.getErrorOutput(), 'Error trace', '.Error() renders a pretty exception with a stack trace when verbosity is verbose');

    await tester.run({'command': 'list', '--foo': true}, {'decorated': false, 'capture_stderr_separately': true});
    assert.deepEqual(fixtureContent('application_renderexception2.txt'), tester.getErrorOutput(true), '.Error() renders the command synopsis when an exception occurs in the context of a command');

    application.add(new Foo3Command());
    tester = new ApplicationTester(application);
    await tester.run({'command': 'foo3:bar'}, {'decorated': false, 'capture_stderr_separately': true});
    // assert.deepEqual(fixtureContent('application_renderexception3.txt'), tester.getErrorOutput(true), '.Error() renders a pretty exceptions with previous exceptions');

    await tester.run({'command': 'foo3:bar'}, {'decorated': false, 'verbosity': Output.VERBOSITY_VERBOSE});
    // assert.match(tester.getDisplay(), /\[Error\]\s*First exception/, '.Error() renders a pretty exception without code exception when code exception is fallback and verbosity is verbose');
    // assert.match(tester.getDisplay(), /\[Error\]\s*Second exception/, '.Error() renders a pretty exception without code exception when code exception is 0 and verbosity is verbose');
    // assert.match(tester.getDisplay(), /\[Error \(404\)\]\s*Third exception/, '.Error() renders a pretty exception with code exception when code exception is 404 and verbosity is verbose');

    await tester.run({'command': 'foo3:bar'}, {'decorated': true});
    // assert.deepEqual(fixtureContent('application_renderexception3decorated.txt'), tester.getDisplay(true), '.Error() renders a pretty exceptions with previous exceptions');

    await tester.run({'command': 'foo3:bar'}, {'decorated': true, 'capture_stderr_separately': true});
    // assert.deepEqual(fixtureContent('application_renderexception3decorated.txt'), tester.getErrorOutput(true), '.Error() renders a pretty exceptions with previous exceptions');

    application = new Application();
    application.setAutoExit(false);
    putenv('COLUMNS=32');
    tester = new ApplicationTester(application);

    await tester.run({'command': 'foo'}, {'decorated': false, 'capture_stderr_separately': true});
    // assert.deepEqual(fixtureContent('application_renderexception4.txt'), tester.getErrorOutput(true), '.Error() wraps messages when they are bigger than the terminal');
    putenv('COLUMNS=120');
  });
  /**
   * overkill
   it('testRenderExceptionWithDoubleWidthCharacters', async () =>
   {
    let application = new Application();
    application.setAutoExit(false);
    putenv('COLUMNS=120');
    application.register('foo').setCode(function ()
    {
      throw new Error('エラーメッセージ');
    });
    let tester = new ApplicationTester(application);

    await tester.run({'command': 'foo'}, {'decorated': false, 'capture_stderr_separately': true});
    assert.deepEqual( tester.getErrorOutput(true), fixtureContent('application_renderexception_doublewidth1.txt'), '.Error() renders a pretty exceptions with previous exceptions');

    await tester.run({'command': 'foo'}, {'decorated': true, 'capture_stderr_separately': true});
    assert.deepEqual( tester.getErrorOutput(true), fixtureContent('application_renderexception_doublewidth1decorated.txt'),'.Error() renders a pretty exceptions with previous exceptions');

    application = new Application();
    application.setAutoExit(false);
    putenv('COLUMNS=32');
    application.register('foo').setCode(function ()
    {
      throw new Error('コマンドの実行中にエラーが発生しました。');
    });
    tester = new ApplicationTester(application);
    await tester.run({'command': 'foo'}, {'decorated': false, 'capture_stderr_separately': true});
    assert.isStringMatchesFormatFile(fixtureContent('application_renderexception_doublewidth2.txt'), tester.getErrorOutput(true), '.Error() wraps messages when they are bigger than the terminal');
    putenv('COLUMNS=120');
  });
   ***/

  it('testRun', async () => {
    let application = new Application();
    let command = new Foo1Command();

    application.setAutoExit(false);
    application.setCatchExceptions(false);
    application.add(command);
    let script = process.cwd() + '/app/console';
    process.argv = ['node', script, 'foo:bar1'];

    ob_start();
    await application.run();
    ob_end_clean();

    assert.instanceOf(command.input, ArgvInput, '.run() creates an ArgvInput by fallback if none is given');
    assert.instanceOf(command.output, ConsoleOutput, '.run() creates a ConsoleOutput by fallback if none is given');

    application = new Application();
    application.setAutoExit(false);
    application.setCatchExceptions(false);

    ensureStaticCommandHelp(application);
    let tester = new ApplicationTester(application);

    await tester.run([], {'decorated': false});
    assert.deepEqual(tester.getDisplay(true), fixtureContent('application_run1.txt'), '.run() runs the list command if no argument is passed');

    await tester.run({'--help': true}, {'decorated': false});
    assert.deepEqual(tester.getDisplay(true), fixtureContent('application_run2.txt'), '.run() runs the help command if --help is passed');

    await tester.run({'-h': true}, {'decorated': false});
    assert.deepEqual(tester.getDisplay(true), fixtureContent('application_run2.txt'), '.run() runs the help command if -h is passed');

    await tester.run({'command': 'list', '--help': true}, {'decorated': false});
    assert.deepEqual(tester.getDisplay(true), fixtureContent('application_run3.txt'), '.run() displays the help if --help is passed');

    await tester.run({'command': 'list', '-h': true}, {'decorated': false});
    assert.deepEqual(tester.getDisplay(true), fixtureContent('application_run3.txt'), '.run() displays the help if -h is passed');

    await tester.run({'--ansi': true});
    assert.isTrue(tester.getOutput().isDecorated(), '.run() forces color output if --ansi is passed');

    await tester.run({'--no-ansi': true});
    assert.isFalse(tester.getOutput().isDecorated(), '.run() forces color output to be disabled if --no-ansi is passed');

    await tester.run({'--version': true}, {'decorated': false});
    assert.deepEqual(tester.getDisplay(true), fixtureContent('application_run4.txt'), '.run() displays the program version if --version is passed');

    await tester.run({'-V': true}, {'decorated': false});
    assert.deepEqual(tester.getDisplay(true), fixtureContent('application_run4.txt'), '.run() displays the program version if -v is passed');

    await tester.run({'command': 'list', '--quiet': true});
    assert.deepEqual(tester.getDisplay(), '', '.run() removes all output if --quiet is passed');
    assert.isFalse(tester.getInput().isInteractive(), '.run() sets off the interactive mode if --quiet is passed');

    await tester.run({'command': 'list', '-q': true});
    assert.deepEqual(tester.getDisplay(), '', '.run() removes all output if -q is passed');
    assert.isFalse(tester.getInput().isInteractive(), '.run() sets off the interactive mode if -q is passed');

    await tester.run({'command': 'list', '--verbose': true});
    assert.deepEqual(tester.getOutput().getVerbosity(), Output.VERBOSITY_VERBOSE, '.run() sets the output to verbose if --verbose is passed');

    await tester.run({'command': 'list', '--verbose': 1});
    assert.deepEqual(tester.getOutput().getVerbosity(), Output.VERBOSITY_VERBOSE, '.run() sets the output to verbose if --verbose=1 is passed');

    await tester.run({'command': 'list', '--verbose': 2});
    assert.deepEqual(tester.getOutput().getVerbosity(), Output.VERBOSITY_VERY_VERBOSE, '.run() sets the output to very verbose if --verbose=2 is passed');

    await tester.run({'command': 'list', '--verbose': 3});
    assert.deepEqual(tester.getOutput().getVerbosity(), Output.VERBOSITY_DEBUG, '.run() sets the output to debug if --verbose=3 is passed');

    await tester.run({'command': 'list', '--verbose': 4});
    assert.deepEqual(tester.getOutput().getVerbosity(), Output.VERBOSITY_VERBOSE, '.run() sets the output to verbose if unknown --verbose level is passed');

    await tester.run({'command': 'list', '-v': true});
    assert.deepEqual(tester.getOutput().getVerbosity(), Output.VERBOSITY_VERBOSE, '.run() sets the output to verbose if -v is passed');

    await tester.run({'command': 'list', '-vv': true});
    assert.deepEqual(tester.getOutput().getVerbosity(), Output.VERBOSITY_VERY_VERBOSE, '.run() sets the output to verbose if -v is passed');

    await tester.run({'command': 'list', '-vvv': true});
    assert.deepEqual(tester.getOutput().getVerbosity(), Output.VERBOSITY_DEBUG, '.run() sets the output to verbose if -v is passed');

    application = new Application();
    application.setAutoExit(false);
    application.setCatchExceptions(false);
    application.add(new FooCommand());
    tester = new ApplicationTester(application);

    await tester.run({'command': 'foo:bar', '--no-interaction': true}, {'decorated': false});
    assert.deepEqual(tester.getDisplay(), 'called' + PHP_EOL, '.run() does not call interact() if --no-interaction is passed');

    await tester.run({'command': 'foo:bar', '-n': true}, {'decorated': false});
    assert.deepEqual(tester.getDisplay(), 'called' + PHP_EOL, '.run() does not call interact() if -n is passed');
  });

  it('testRunWithGlobalOptionAndNoCommand', async () => {
    let application = new Application();
    application.setAutoExit(false);
    application.setCatchExceptions(false);
    application.getDefinition().addOption(new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL));

    let output = new StreamOutput(new streams.WritableStream());
    let input = new ArgvInput(['node', 'file', '--foo', 'bar']);

    assert.deepEqual(0, await application.run(input, output));
  });

  it('testVerboseValueNotBreakArguments', async () => {
    let application = new Application();
    application.setAutoExit(false);
    application.setCatchExceptions(false);
    application.add(new FooCommand());

    let output = new StreamOutput(new streams.WritableStream());

    let input = new ArgvInput(['node', 'file', '-v', 'foo:bar']);
    application.run(input, output);

    assert.isOk(1);

    input = new ArgvInput(['node', 'file', '--verbose', 'foo:bar']);
    application.run(input, output);

    assert.isOk(1);
  });

  it('testRunReturnsIntegerExitCode', async () => {
    let exception = new Error('');
    exception.code = 4;

    let application = new Application();
    let stub = sinon.stub(application, 'doRun');
    stub.throws(exception);
    application.setAutoExit(false);

    let exitCode = await application.run(new ArrayInput([]), new NullOutput());

    assert.deepEqual(exitCode, 4, '.run() returns integer exit code extracted from raised exception');
  });
  
  it('testRunReturnsExitCodeOneForExceptionCodeZero', async () => {
    let exception = new Error('');
    exception.code = 0;

    let application = new Application();
    let stub = sinon.stub(application, 'doRun');
    stub.throws(exception);
    application.setAutoExit(false);

    let exitCode = await application.run(new ArrayInput([]), new NullOutput());

    assert.deepEqual(1, exitCode, '.run() returns exit code 1 when exception code is 0');
  });
  

  it('testAddingAlreadySetDefinitionElementData', async () => {

    assert.throws( () => {
      let application = new Application();
      application.setAutoExit(false);
      application.setCatchExceptions(false);
      application
        .register('foo')
        .setDefinition([def])
        .setCode(function (input, output) {
        })
      ;
      let input = new ArrayInput({'command': 'foo'});
      output = new NullOutput();
      application.run(input, output);
    }, '');


    it('testRunAllowsErrorListenersToSilenceTheException', async () => {
      let dispatcher = getDispatcher();
      dispatcher.addListener('console + error', function (event) {
        event.getOutput().write('silenced + ');

        event.setExitCode(0);
      });

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
      assert.isStringContainsString('before + error + silenced + after + ', tester.getDisplay());
      assert.deepEqual(ConsoleCommandEvent.RETURN_CODE_DISABLED, tester.getStatusCode());
    });

    it('testConsoleErrorEventIsTriggeredOnCommandNotFound', async () => {
      let dispatcher = new EventDispatcher();
      dispatcher.addListener('console + error', function (event) {
        assert.isNull(event.getCommand());
        assert.instanceOf(Error.class, event.getError());
        event.getOutput().write('silenced command not found');
      });

      let application = new Application();
      application.setDispatcher(dispatcher);
      application.setAutoExit(false);

      let tester = new ApplicationTester(application);
      await tester.run({'command': 'unknown'});
      assert.isStringContainsString('silenced command not found', tester.getDisplay());
      assert.deepEqual(1, tester.getStatusCode());
    });

    it('testErrorIsRethrownIfNotHandledByConsoleErrorEvent', async () => {
      let application = new Application();
      application.setAutoExit(false);
      application.setCatchExceptions(false);
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

    it('testRunWithErrorAndDispatcher', async () => {

      assert.throws(async () => {
        let application = new Application();
        application.setDispatcher(getDispatcher());
        application.setAutoExit(false);
        application.setCatchExceptions(false);
        application.register('dym').setCode(function (input, output) {
          output.write('dym + ');
          throw new Error('dymerr');
        });
        let tester = new ApplicationTester(application);
        await tester.run({'command': 'dym'});
        assert.isStringContainsString('before + dym + error + after + ', tester.getDisplay(), 'The PHP Error did not dispached events');
      }, 'error');

    });

    it('testRunDispatchesAllEventsWithError', async () => {
      let application = new Application();
      application.setDispatcher(getDispatcher());
      application.setAutoExit(false);

      application.register('dym').setCode(function (input, output) {
        output.write('dym + ');

        throw new Error('dymerr');
      });

      let tester = new ApplicationTester(application);
      await tester.run({'command': 'dym'});
      assert.isStringContainsString('before + dym + error + after + ', tester.getDisplay(), 'The PHP Error did not dispached events');
    });

    it('testRunWithErrorFailingStatusCode', async () => {
      let application = new Application();
      application.setDispatcher(getDispatcher());
      application.setAutoExit(false);

      application.register('dus').setCode(function (input, output) {
        output.write('dus + ');

        throw new Error('duserr');
      });

      let tester = new ApplicationTester(application);
      await tester.run({'command': 'dus'});
      assert.deepEqual(1, tester.getStatusCode(), 'Status code should be 1');
    });

    it('testRunWithDispatcherSkippingCommand', async () => {
      let application = new Application();
      application.setDispatcher(getDispatcher(true));
      application.setAutoExit(false);

      application.register('foo').setCode(function (input, output) {
        output.write('foo + ');
      });

      let tester = new ApplicationTester(application);
      exitCode = tester.run({'command': 'foo'});
      assert.isStringContainsString('before + after + ', tester.getDisplay());
      assert.deepEqual(ConsoleCommandEvent.RETURN_CODE_DISABLED, exitCode);
    });

    it('testRunWithDispatcherAccessingInputOptions', async () => {
      let noInteractionValue = null;
      quietValue = null;

      let dispatcher = getDispatcher();
      dispatcher.addListener('console + command', function (event) {
        let input = event.getInput();

        noInteractionValue = input.getOption('no-interaction');
        quietValue = input.getOption('quiet');
      });

      let application = new Application();
      application.setDispatcher(dispatcher);
      application.setAutoExit(false);

      application.register('foo').setCode(function (input, output) {
        output.write('foo + ');
      });

      let tester = new ApplicationTester(application);
      await tester.run({'command': 'foo', '--no-interaction': true});

      assert.isTrue(noInteractionValue);
      assert.isFalse(quietValue);
    });

    it('testRunWithDispatcherAddingInputOptions', async () => {
      let extraValue = null;

      let dispatcher = getDispatcher();
      dispatcher.addListener('console + command', function (event) {
        let definition = event.getCommand().getDefinition();
        input = event.getInput();

        definition.addOption(new InputOption('extra', null, InputOption.VALUE_REQUIRED));
        input.bind(definition);

        extraValue = input.getOption('extra');
      });

      let application = new Application();
      application.setDispatcher(dispatcher);
      application.setAutoExit(false);

      application.register('foo').setCode(function (input, output) {
        output.write('foo + ');
      });

      let tester = new ApplicationTester(application);
      await tester.run({'command': 'foo', '--extra': 'some test value'});

      assert.deepEqual('some test value', extraValue);
    });
  });

  it('testGetDefaultHelperSetReturnsDefaultValues', async () => {
    let application = new Application();
    application.setAutoExit(false);
    application.setCatchExceptions(false);

    let helperSet = application.getHelperSet();

    assert.isTrue(helperSet.has('formatter'));
  });

  it('testAddingSingleHelperSetOverwritesDefaultValues', async () => {
    let application = new Application();
    application.setAutoExit(false);
    application.setCatchExceptions(false);

    application.setHelperSet(new HelperSet([new FormatterHelper()]));

    let helperSet = application.getHelperSet();

    assert.isTrue(helperSet.has('formatter'));

    // no other fallback helper set should be returned
    assert.isFalse(helperSet.has('dialog'));
    assert.isFalse(helperSet.has('progress'));
  });

  it('testOverwritingDefaultHelperSetOverwritesDefaultValues', async () => {
    let application = new CustomApplication();
    application.setAutoExit(false);
    application.setCatchExceptions(false);

    application.setHelperSet(new HelperSet([new FormatterHelper()]));

    let helperSet = application.getHelperSet();

    assert.isTrue(helperSet.has('formatter'));

    // no other fallback helper set should be returned
    assert.isFalse(helperSet.has('dialog'));
    assert.isFalse(helperSet.has('progress'));
  });

  it('testGetDefaultInputDefinitionReturnsDefaultValues', async () => {
    let application = new Application();
    application.setAutoExit(false);
    application.setCatchExceptions(false);

    let inputDefinition = application.getDefinition();

    assert.isTrue(inputDefinition.hasArgument('command'));

    assert.isTrue(inputDefinition.hasOption('help'));
    assert.isTrue(inputDefinition.hasOption('quiet'));
    assert.isTrue(inputDefinition.hasOption('verbose'));
    assert.isTrue(inputDefinition.hasOption('version'));
    assert.isTrue(inputDefinition.hasOption('ansi'));
    assert.isTrue(inputDefinition.hasOption('no-ansi'));
    assert.isTrue(inputDefinition.hasOption('no-interaction'));
  });

  it('testOverwritingDefaultInputDefinitionOverwritesDefaultValues', async () => {
    let application = new CustomApplication();
    application.setAutoExit(false);
    application.setCatchExceptions(false);

    let inputDefinition = application.getDefinition();

    // check whether the fallback arguments and options are not returned any more
    assert.isFalse(inputDefinition.hasArgument('command'));

    assert.isFalse(inputDefinition.hasOption('help'));
    assert.isFalse(inputDefinition.hasOption('quiet'));
    assert.isFalse(inputDefinition.hasOption('verbose'));
    assert.isFalse(inputDefinition.hasOption('version'));
    assert.isFalse(inputDefinition.hasOption('ansi'));
    assert.isFalse(inputDefinition.hasOption('no-ansi'));
    assert.isFalse(inputDefinition.hasOption('no-interaction'));

    assert.isTrue(inputDefinition.hasOption('custom'));
  });

  it('testSettingCustomInputDefinitionOverwritesDefaultValues', async () => {
    let application = new Application();
    application.setAutoExit(false);
    application.setCatchExceptions(false);

    application.setDefinition(new InputDefinition([new InputOption('--custom', '-c', InputOption.VALUE_NONE, 'Set the custom input definition + ')]));

    let inputDefinition = application.getDefinition();

    // check whether the fallback arguments and options are not returned any more
    assert.isFalse(inputDefinition.hasArgument('command'));

    assert.isFalse(inputDefinition.hasOption('help'));
    assert.isFalse(inputDefinition.hasOption('quiet'));
    assert.isFalse(inputDefinition.hasOption('verbose'));
    assert.isFalse(inputDefinition.hasOption('version'));
    assert.isFalse(inputDefinition.hasOption('ansi'));
    assert.isFalse(inputDefinition.hasOption('no-ansi'));
    assert.isFalse(inputDefinition.hasOption('no-interaction'));

    assert.isTrue(inputDefinition.hasOption('custom'));
  });
  
  it('testRunWithError', async () => {
    let application = new Application();
    application.setAutoExit(false);
    application.setCatchExceptions(false);

    application.register('dym').setCode(function (input, output) {
      output.write('dym + ');

      throw new Error('dymerr');
    });

    let tester = new ApplicationTester(application);

    try {
      await tester.run({'command': 'dym'});
      this.fail('Error expected + ');
    } catch (e) {
      assert.deepEqual('dymerr', e.message);
    }
  });

  it('testSetRunCustomDefaultCommand', async () => {
    let command = new FooCommand();

    let application = new Application();
    application.setAutoExit(false);
    application.add(command);
    application.setFallbackCommand(command.getName());

    let tester = new ApplicationTester(application);
    await tester.run([], {'interactive': false});
    assert.deepEqual('called' + PHP_EOL, tester.getDisplay(), 'Application runs the fallback set command if different from \'list\' command');

    application = new CustomDefaultCommandApplication();
    application.setAutoExit(false);

    tester = new ApplicationTester(application);
    await tester.run([], {'interactive': false});

    assert.deepEqual('called' + PHP_EOL, tester.getDisplay(), 'Application runs the fallback set command if different from \'list\' command');
  });

  it('testSetRunCustomDefaultCommandWithOption', async () => {
    let command = new FooOptCommand();

    let application = new Application();
    application.setAutoExit(false);
    application.add(command);
    application.setFallbackCommand(command.getName());

    let tester = new ApplicationTester(application);
    await tester.run({'--fooopt': 'opt'}, {'interactive': false});

    assert.deepEqual('called' + PHP_EOL + 'opt' + PHP_EOL, tester.getDisplay(), 'Application runs the fallback set command if different from \'list\' command');
  });

  it('testSetRunCustomSingleCommand', async () => {
    let command = new FooCommand();

    let application = new Application();
    application.setAutoExit(false);
    application.add(command);
    application.setFallbackCommand(command.getName(), true);

    let tester = new ApplicationTester(application);

    await tester.run([]);
    assert.include(tester.getDisplay(), 'called');

    await tester.run({'--help': true});
    assert.include(tester.getDisplay(), 'The foo:bar command');
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
