const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;

// Catch promisses
assert.rejects = assert.rejects || require('assert').rejects;

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

xdescribe('Process title, not sure how to ports', () => {
  it('testRunWithProcessTitle', async () => {
    let command = new TestCommand();
    command.setApplication(new Application());
    command.setProcessTitle('foo');
    assert.deepEqual(0, command.run(new StringInput(''), new NullOutput()));
    if (function_exists('cli_set_process_title')) {
      //if (null === @cli_get_process_title() && 'Darwin' === PHP_OS)
      //{
      //  this.markTestSkipped('Running "cli_get_process_title" as an unprivileged user is not supported on MacOS.');
      //}
      assert.deepEqual('foo', cli_get_process_title());
    }
  });
});

xdescribe('Closure Binding on Command', () =>
{
  forEach(getSetCodeBindToClosureTests()).
  it('testSetCodeBindToClosure', async (previouslyBound, expected) =>
  {
    let code = createClosure();
    if (previouslyBound)
    {
      code = code.bind(this);
    }

    let command = new TestCommand();
    command.setCode(code);
    let tester = new CommandTester(command);
    await tester.execute([]);
    assert.deepEqual(tester.getDisplay(), 'interact called' + PHP_EOL + expected + PHP_EOL);
  });

  it('testSetCodeWithStaticClosure', () =>
  {
    let command = new TestCommand();
    command.setCode(console.createClosure());
    let tester = new CommandTester(command);
    tester.execute([]);

    assert.deepEqual( tester.getDisplay(), 'interact called' + PHP_EOL + 'bound' + PHP_EOL);
  });

  it('testSetCodeWithNonClosureCallable', () =>
  {
    let command = new TestCommand();
    let ret = command.setCode([this, 'callableMethodCommand']);
    assert.deepEqual(command, ret, '.setCode() implements a fluent interface');
    let tester = new CommandTester(command);
    tester.execute([]);
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
