const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const {trim} = require('../../src/PhpPolyfill');
const {fixtureContent} = require('../UtilTool');

const Application = require('../../src//Application');
const CommandTester = require('../../src/tester/CommandTester');

const FooCommand = require('../fixtures/FooCommand');
const Foo6Command = require('../fixtures/Foo6Command');

describe('#ListCommand', () =>
{
  it('testExecuteListsCommands', async () =>
  {
    let application = new Application();
    let commandTester = new CommandTester(command = application.get('list'));
    await commandTester.execute({'command': command.getName()}, {'decorated': false});

    assert.match(commandTester.getDisplay(), /help\s{2,}Displays help for a command/, '.execute() returns a list of available commands');
  });

  it('testExecuteListsCommandsWithRawOption', async () =>
  {
    let application = new Application();
    let commandTester = new CommandTester(command = application.get('list'));
    await commandTester.execute({'command': command.getName(), '--raw': true});
    let output = `help   Displays help for a command
list   Lists commands
`

    assert.deepEqual(output, commandTester.getDisplay(true));
  });

  it('testExecuteListsCommandsWithNamespaceArgument', async () =>
  {
    let application = new Application();
    application.add(new FooCommand());
    
    const command = application.get('list');
    let commandTester = new CommandTester(command);
    await commandTester.execute({'command': command.getName(), 'namespace': 'foo', '--raw': true});
    let output = `foo:bar   The foo:bar command
`;
    assert.deepEqual(output, commandTester.getDisplay(true));
  });

  it('testExecuteListsCommandsOrder', async () =>
  {
    let application = new Application();
    application.add(new Foo6Command());
    const command = application.get('list');
    let commandTester = new CommandTester(command);
    await commandTester.execute({'command': command.getName()}, {'decorated': false});
    let output =`Console Tool

Usage:
  command [options] [arguments]

Options:
  -h, --help            Display this help message
  -q, --quiet           Do not output any message
  -V, --version         Display this application version
      --ansi            Force ANSI output
      --no-ansi         Disable ANSI output
  -n, --no-interaction  Do not ask any interactive question
  -v|vv|vvv, --verbose  Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

Available commands:
  help      Displays help for a command
  list      Lists commands
 0foo
  0foo:bar  0foo:bar command`;
    assert.deepEqual(output, trim(commandTester.getDisplay(true)));
  });

  it('testExecuteListsCommandsOrderRaw', async () =>
  {
    let application = new Application();
    application.add(new Foo6Command());
    let command = application.get('list');
    
    let commandTester = new CommandTester(command);
    await commandTester.execute({'command': command.getName(), '--raw': true});
    let output = `help       Displays help for a command
list       Lists commands
0foo:bar   0foo:bar command`;
    assert.deepEqual(trim(commandTester.getDisplay(true)), output);
  });


});
  