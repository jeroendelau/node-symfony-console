const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;

// Catch promisses
const nassert = require('assert');

const forEach = require('mocha-each');
const {PHP_EOL, sprintf, isset} = require('../../src/PhpPolyfill');
const Application = require('../../src//Application');
const Command = require('../../src/command/Command');
const FormatterHelper = require('../../src/helper/FormatterHelper');
const InputArgument = require('../../src/input/InputArgument');
const InputDefinition = require('../../src/input/InputDefinition');
const InputOption = require('../../src/input/InputOption');
const StringInput = require('../../src/input/StringInput');
const NullOutput = require('../../src/output/NullOutput');
const CommandTester = require('../../src/tester/CommandTester');

const TestCommand = require('../fixtures/TestCommand');

describe('#Command', () =>
{
  it('testConstructor', () =>
  {
    let command = new Command('foo:bar');
    assert.deepEqual('foo:bar', command.getName(), '__construct() takes the command name as its first argument');
  });

  it('testCommandNameCannotBeEmpty', () =>
  {

    assert.throws(() =>
    {
      (new Application()).add(new Command());
    }, 'The command defined in "Command" cannot have an empty name.');

  });

  it('testSetApplication', () =>
  {
    let application = new Application();
    let command = new TestCommand();
    command.setApplication(application);
    assert.deepEqual(application, command.getApplication(), '.setApplication() sets the current application');
    assert.deepEqual(application.getHelperSet(), command.getHelperSet());
  });

  it('testSetApplicationNull', () =>
  {
    let command = new TestCommand();
    command.setApplication(null);
    assert.isNull(command.getHelperSet());
  });

  it('testSetGetDefinition', () =>
  {
    let command = new TestCommand();
    ret = command.setDefinition(definition = new InputDefinition());
    assert.deepEqual(command, ret, '.setDefinition() implements a fluent interface');
    assert.deepEqual(definition, command.getDefinition(), '.setDefinition() sets the current InputDefinition instance');
    command.setDefinition([new InputArgument('foo'), new InputOption('bar')]);
    assert.isTrue(command.getDefinition().hasArgument('foo'), '.setDefinition() also takes an array of InputArguments and InputOptions as an argument');
    assert.isTrue(command.getDefinition().hasOption('bar'), '.setDefinition() also takes an array of InputArguments and InputOptions as an argument');
    command.setDefinition(new InputDefinition());
  });

  it('testAddArgument', () =>
  {
    let command = new TestCommand();
    ret = command.addArgument('foo');
    assert.deepEqual(command, ret, '.addArgument() implements a fluent interface');
    assert.isTrue(command.getDefinition().hasArgument('foo'), '.addArgument() adds an argument to the command');
  });

  it('testAddOption', () =>
  {
    let command = new TestCommand();
    ret = command.addOption('foo');
    assert.deepEqual(command, ret, '.addOption() implements a fluent interface');
    assert.isTrue(command.getDefinition().hasOption('foo'), '.addOption() adds an option to the command');
  });

  it('testSetHidden', () =>
  {
    let command = new TestCommand();
    command.setHidden(true);
    assert.isTrue(command.isHidden());
  });

  it('testGetNamespaceGetNameSetName', () =>
  {
    let command = new TestCommand();
    assert.deepEqual('namespace:name', command.getName(), '.getName() returns the command name');
    command.setName('foo');
    assert.deepEqual('foo', command.getName(), '.setName() sets the command name');

    let ret = command.setName('foobar:bar');
    assert.deepEqual(command, ret, '.setName() implements a fluent interface');
    assert.deepEqual('foobar:bar', command.getName(), '.setName() sets the command name');
  });

  forEach(provideInvalidCommandNames()).it('testInvalidCommandNames %s', (name) =>
  {
    assert.throws(() =>
    {
      let command = new TestCommand();
      command.setName(name);
    }, sprintf('Command name "%s" is invalid.', name));

  });

  it('testGetSetDescription', () =>
  {
    let command = new TestCommand();
    assert.deepEqual('description', command.getDescription(), '.getDescription() returns the description');
    let ret = command.setDescription('description1');
    assert.deepEqual(command, ret, '.setDescription() implements a fluent interface');
    assert.deepEqual('description1', command.getDescription(), '.setDescription() sets the description');
  });

  it('testGetSetHelp', () =>
  {
    let command = new TestCommand();
    assert.deepEqual('help', command.getHelp(), '.getHelp() returns the help');
    let ret = command.setHelp('help1');
    assert.deepEqual(command, ret, '.setHelp() implements a fluent interface');
    assert.deepEqual('help1', command.getHelp(), '.setHelp() sets the help');
    command.setHelp('');
    assert.deepEqual('', command.getHelp(), '.getHelp() does not fall back to the description');
  });

  it('testGetProcessedHelp', () =>
  {
    let command = new TestCommand();
    command.setHelp('The %command.name% command does...  Example: php %command.full_name%.');
    assert.include(command.getProcessedHelp(), 'The namespace:name command does...', '.getProcessedHelp() replaces %command.name% correctly');
    assert.notInclude(command.getProcessedHelp(), '%command.full_name%', '.getProcessedHelp() replaces %command.full_name%');

    command = new TestCommand();
    command.setHelp('');
    assert.include(command.getProcessedHelp(), 'description', '.getProcessedHelp() falls back to the description');

    command = new TestCommand();
    command.setHelp('The %command.name% command does... Example: php %command.full_name%.');
    let application = new Application();
    application.add(command);
    application.setFallbackCommand('namespace:name', true);
    assert.include(command.getProcessedHelp(), 'The namespace:name command does...',  '.getProcessedHelp() replaces %command.name% correctly in single command applications');
    assert.notInclude(command.getProcessedHelp(), '%command.full_name%', '.getProcessedHelp() replaces %command.full_name% in single command applications');
  });

  it('testGetSetAliases', () =>
  {
    let command = new TestCommand();
    assert.deepEqual(['name'], command.getAliases(), '.getAliases() returns the aliases');
    let ret = command.setAliases(['name1']);
    assert.deepEqual(command, ret, '.setAliases() implements a fluent interface');
    assert.deepEqual(['name1'], command.getAliases(), '.setAliases() sets the aliases');
  });

  it('testGetSynopsis', () =>
  {
    let command = new TestCommand();
    command.addOption('foo');
    command.addArgument('bar');
    assert.deepEqual('namespace:name [--foo] [--] [<bar>]', command.getSynopsis(), '.getSynopsis() returns the synopsis');
  });

  it('testAddGetUsages', () =>
  {
    let command = new TestCommand();
    command.addUsage('foo1');
    command.addUsage('foo2');
    assert.include(command.getUsages(), 'namespace:name foo1');
    assert.include(command.getUsages(), 'namespace:name foo2',);
  });

  it('testGetHelper', () =>
  {
    let application = new Application();
    command = new TestCommand();
    command.setApplication(application);
    let formatterHelper = new FormatterHelper();
    assert.deepEqual(formatterHelper.getName(), command.getHelper('formatter').getName(), '.getHelper() returns the correct helper');
  });

  it('testGetHelperWithoutHelperSet', () =>
  {

    assert.throws(() =>
    {
      let command = new TestCommand();
      command.getHelper('formatter');
    }, 'Cannot retrieve helper "formatter" because there is no HelperSet defined.');

  });

  it('testMergeApplicationDefinition', () =>
  {
    let application1 = new Application();
    application1.getDefinition().addArguments([new InputArgument('foo')]);
    application1.getDefinition().addOptions([new InputOption('bar')]);
    let command = new TestCommand();
    command.setApplication(application1);
    command.setDefinition(definition = new InputDefinition([new InputArgument('bar'), new InputOption('foo')]));

    command.mergeApplicationDefinition(command);
    assert.isTrue(command.getDefinition().hasArgument('foo'), '.mergeApplicationDefinition() merges the application arguments and the command arguments');
    assert.isTrue(command.getDefinition().hasArgument('bar'), '.mergeApplicationDefinition() merges the application arguments and the command arguments');
    assert.isTrue(command.getDefinition().hasOption('foo'), '.mergeApplicationDefinition() merges the application options and the command options');
    assert.isTrue(command.getDefinition().hasOption('bar'), '.mergeApplicationDefinition() merges the application options and the command options');

    command.mergeApplicationDefinition(command);
    assert.deepEqual(3, command.getDefinition().getArgumentCount(), '.mergeApplicationDefinition() does not try to merge twice the application arguments and options');
  });

  it('testMergeApplicationDefinitionWithoutArgsThenWithArgsAddsArgs', () =>
  {
    let application1 = new Application();
    application1.getDefinition().addArguments([new InputArgument('foo')]);
    application1.getDefinition().addOptions([new InputOption('bar')]);
    let command = new TestCommand();
    command.setApplication(application1);
    let definition = new InputDefinition([])
    command.setDefinition(definition);

    command.mergeApplicationDefinition(false);
    assert.isTrue(command.getDefinition().hasOption('bar'), '.mergeApplicationDefinition(false) merges the application and the command options');
    assert.isFalse(command.getDefinition().hasArgument('foo'), '.mergeApplicationDefinition(false) does not merge the application arguments');

    command.mergeApplicationDefinition(true);
    assert.isTrue(command.getDefinition().hasArgument('foo'), '.mergeApplicationDefinition(true) merges the application arguments and the command arguments');

    command.mergeApplicationDefinition();
    assert.deepEqual(2, command.getDefinition().getArgumentCount(), '.mergeApplicationDefinition() does not try to merge twice the application arguments');
  });

  it('testRunInteractive', async () =>
  {
    let tester = new CommandTester(new TestCommand());

    await tester.execute([], {'interactive': true});

    assert.deepEqual('interact called' + PHP_EOL + 'execute called' + PHP_EOL, tester.getDisplay(), '.run() calls the interact() method if the input is interactive');
  });

  it('testRunNonInteractive', () =>
  {
    let tester = new CommandTester(new TestCommand()
      )
    ;

    tester.execute([], {'interactive': false});

    assert.deepEqual('execute called' + PHP_EOL, tester.getDisplay(), '.run() does not call the interact() method if the input is not interactive');
  });

  it('testExecuteMethodNeedsToBeOverridden', async() =>
  {

    await nassert.rejects(async() => {
      let command = new Command('foo');
      return command.run(new StringInput(''), new NullOutput());
    }, {message: 'You must override the execute() method in the concrete command class.'},
      '.execute() throws error if not overwritten');

  });

  it('testRunWithInvalidOption', async () =>
  {

    await nassert.rejects( async() =>
    {
      let command = new TestCommand();
      let tester = new CommandTester(command);
      return tester.execute({'--bar': true});
    }, {message: 'The "--bar" option does not exist.'}, 
      '.execute() errors on invalid option');
  });

  it('testRunWithApplication', async () =>
  {
    let command = new TestCommand();
    command.setApplication(new Application());
    let exitCode = await command.run(new StringInput(''), new NullOutput());

    assert.deepEqual(0, exitCode, '.run() returns an integer exit code');
  });

  it('testRunReturnsAlwaysInteger', async () =>
  {
    let command = new TestCommand();

    assert.deepEqual(0, await command.run(new StringInput(''), new NullOutput()));
  });

  it('testSetCode', async () =>
  {
    let command = new TestCommand();
    let ret = command.setCode(function (input, output)
    {
      output.writeln('from the code...');
    });

    assert.deepEqual(command, ret, '.setCode() implements a fluent interface');
    let tester = new CommandTester(command);
    await tester.execute([]);
    assert.deepEqual('interact called' + PHP_EOL + 'from the code...' + PHP_EOL, tester.getDisplay());
  });

  function provideInvalidCommandNames()
  {
    return [
      [''],
      ['foo:'],
    ];
  }

  function getSetCodeBindToClosureTests()
  {
    return [
      [true, 'not bound to the command'],
      [false, 'bound to the command'],
    ];
  }

  function createClosure()
  {
    return (input, output) =>
    {
      output.writeln(!isset(this.global) ? 'bound to the command' : 'not bound to the command');
    };
  }

  function callableMethodCommand()
  {
    output.writeln('from the code...');
  }

});
