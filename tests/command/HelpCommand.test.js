const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;


const Application = require('../../src//Application');
const HelpCommand = require('../../src/command/HelpCommand');
const ListCommand = require('../../src/command/ListCommand');
const CommandTester = require('../../src/tester/CommandTester');

describe('#HelpCommand', () =>
{
  it('testExecuteForCommandAlias', async () =>
  {
    let command = new HelpCommand();
    command.setApplication(new Application());
    let commandTester = new CommandTester(command);
    await commandTester.execute({'command_name': 'li'}, {'decorated': false});
    assert.include(commandTester.getDisplay(), 'list [options] [--] [<namespace>]', '.execute() returns a text help for the given command alias');
    assert.include(commandTester.getDisplay(), 'format=FORMAT', '.execute() returns a text help for the given command alias');
    assert.include(commandTester.getDisplay(), 'raw', '.execute() returns a text help for the given command alias');
  });

  it('testExecuteForCommand', async () =>
  {
    let command = new HelpCommand();
    commandTester = new CommandTester(command);
    command.setCommand(new ListCommand());
    await commandTester.execute([], {'decorated': false});
    assert.include(commandTester.getDisplay(), 'list [options] [--] [<namespace>]', '.execute() returns a text help for the given command');
    assert.include(commandTester.getDisplay(), 'format=FORMAT', '.execute() returns a text help for the given command');
    assert.include(commandTester.getDisplay(), 'raw', '.execute() returns a text help for the given command');
  });

  it('testExecuteForApplicationCommand', async () =>
  {
    let application = new Application();
    commandTester = new CommandTester(application.get('help'));
    await commandTester.execute({'command_name': 'list'});
    assert.include(commandTester.getDisplay(), 'list [options] [--] [<namespace>]', '.execute() returns a text help for the given command');
    assert.include(commandTester.getDisplay(), 'format=FORMAT', '.execute() returns a text help for the given command');
    assert.include(commandTester.getDisplay(), 'raw', '.execute() returns a text help for the given command');
  });
});
  