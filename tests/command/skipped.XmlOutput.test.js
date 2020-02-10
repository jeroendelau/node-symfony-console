const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const {trim} = require('../../src/PhpPolyfill');
const {fixtureContent} = require('../UtilTool');

const Application = require('../../src//Application');
const CommandTester = require('../../src/tester/CommandTester');

const FooCommand = require('../fixtures/FooCommand');
const Foo6Command = require('../fixtures/Foo6Command');

//XML formatting not implemented
xdescribe('#format XML output', () =>
{
  it('testExecuteListsCommandsWithXmlOption', async () =>
  {
    let application = new Application();
    let commandTester = new CommandTester(command = application.get('list'));
    await commandTester.execute({'command': command.getName(), '--format': 'xml'});
    assert.match( commandTester.getDisplay(), /<command id="list" name="list" hidden="0">/, '.execute() returns a list of available commands in XML if --xml is passed');
  });

  it('testExecuteForApplicationCommandWithXmlOption', () =>
  {
    let application = new Application();
    let commandTester = new CommandTester(application.get('help'));
    commandTester.execute({'command_name': 'list', '--format': 'xml'});
    assert.include(commandTester.getDisplay(), 'list [--raw] [--format FORMAT] [--] [&lt;namespace&gt;]', '.execute() returns a text help for the given command');
    assert.include(commandTester.getDisplay(), '<command', '.execute() returns an XML help text if --format=xml is passed');
  });

});
  