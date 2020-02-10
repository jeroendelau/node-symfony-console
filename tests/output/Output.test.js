const mocha = require('mocha');
const forEach = require('mocha-each');
const chai = require('chai');
const {assert} = chai;


const OutputFormatterStyle = require('../../src/formatter/OutputFormatterStyle');
const Output = require('../../src/output/Output');

describe('#Output', () =>
{
  it('testConstructor', () =>
  {
    let output = new TestOutput(Output.VERBOSITY_QUIET, true);
    assert.deepEqual(Output.VERBOSITY_QUIET, output.getVerbosity(), '__construct() takes the verbosity as its first argument');
    assert.isTrue(output.isDecorated(), '__construct() takes the decorated flag as its second argument');
  });

  it('testSetIsDecorated', () =>
  {
    let output = new TestOutput();
    output.setDecorated(true);
    assert.isTrue(output.isDecorated(), 'setDecorated() sets the decorated flag');
  });

  it('testSetGetVerbosity', () =>
  {
    let output = new TestOutput();
    output.setVerbosity(Output.VERBOSITY_QUIET);
    assert.deepEqual(Output.VERBOSITY_QUIET, output.getVerbosity(), '.setVerbosity() sets the verbosity');

    assert.isTrue(output.isQuiet());
    assert.isFalse(output.isVerbose());
    assert.isFalse(output.isVeryVerbose());
    assert.isFalse(output.isDebug());

    output.setVerbosity(Output.VERBOSITY_NORMAL);
    assert.isFalse(output.isQuiet());
    assert.isFalse(output.isVerbose());
    assert.isFalse(output.isVeryVerbose());
    assert.isFalse(output.isDebug());

    output.setVerbosity(Output.VERBOSITY_VERBOSE);
    assert.isFalse(output.isQuiet());
    assert.isTrue(output.isVerbose());
    assert.isFalse(output.isVeryVerbose());
    assert.isFalse(output.isDebug());

    output.setVerbosity(Output.VERBOSITY_VERY_VERBOSE);
    assert.isFalse(output.isQuiet());
    assert.isTrue(output.isVerbose());
    assert.isTrue(output.isVeryVerbose());
    assert.isFalse(output.isDebug());

    output.setVerbosity(Output.VERBOSITY_DEBUG);
    assert.isFalse(output.isQuiet());
    assert.isTrue(output.isVerbose());
    assert.isTrue(output.isVeryVerbose());
    assert.isTrue(output.isDebug());
  });

  it('testWriteWithVerbosityQuiet', () =>
  {
    let output = new TestOutput(Output.VERBOSITY_QUIET);
    output.writeln('foo');
    assert.deepEqual('', output.output, '.writeln() outputs nothing if verbosity is set to VERBOSITY_QUIET');
  });

  it('testWriteAnArrayOfMessages', () =>
  {
    let output = new TestOutput();
    output.writeln(['foo', 'bar']);
    assert.deepEqual("foo\nbar\n", output.output, '.writeln() can take an array of messages to output');
  });

  it('testWriteAnIterableOfMessages', () =>
  {
    let output = new TestOutput();
    output.writeln(generateMessages());
    assert.deepEqual("foo\nbar\n", output.output, '.writeln() can take an iterable of messages to output');
  });

  forEach(provideWriteArguments()).
  it('testWriteRawMessage %s', (message, type, expectedOutput) =>
  {
    let output = new TestOutput();
    output.writeln(message, type);
    assert.deepEqual(expectedOutput, output.output);
  });

  it('testWriteWithDecorationTurnedOff', () =>
  {
    let output = new TestOutput();
    output.setDecorated(false);
    output.writeln('<info>foo</info>');
    assert.deepEqual("foo\n", output.output, '.writeln() strips decoration tags if decoration is set to false');
  });

  it('testWriteDecoratedMessage', () =>
  {
    let fooStyle = new OutputFormatterStyle('yellow', 'red', ['blink']);
    output = new TestOutput();
    output.getFormatter().setStyle('FOO', fooStyle);
    output.setDecorated(true);
    output.writeln('<foo>foo</foo>');
    assert.deepEqual("\x1B[33;41;5mfoo\x1B[39;49;25m\n", output.output, '.writeln() decorates the output');
  });

  it('testWriteWithInvalidStyle', () =>
  {
    let output = new TestOutput();

    output.clear();
    output.write('<bar>foo</bar>');
    assert.deepEqual('<bar>foo</bar>', output.output, '.write() do nothing when a style does not exist');

    output.clear();
    output.writeln('<bar>foo</bar>');
    assert.deepEqual("<bar>foo</bar>\n", output.output, '.writeln() do nothing when a style does not exist');
  });

  forEach(verbosityProvider()).
  it('testWriteWithVerbosityOption %s, %s', (verbosity, expected, msg) =>
  {
    let output = new TestOutput();

    output.setVerbosity(verbosity);
    output.clear();
    output.write('1', false);
    output.write('2', false, Output.VERBOSITY_QUIET);
    output.write('3', false, Output.VERBOSITY_NORMAL);
    output.write('4', false, Output.VERBOSITY_VERBOSE);
    output.write('5', false, Output.VERBOSITY_VERY_VERBOSE);
    output.write('6', false, Output.VERBOSITY_DEBUG);
    assert.deepEqual(expected, output.output, msg);
  });


  function* generateMessages()
  {
    yield 'foo';
    yield 'bar';
  }

  function provideWriteArguments()
  {
    return [
      ['<info>foo</info>', Output.OUTPUT_RAW, "<info>foo</info>\n"],
      ['<info>foo</info>', Output.OUTPUT_PLAIN, "foo\n"],
    ];
  }

  function verbosityProvider()
  {
    return [
      [Output.VERBOSITY_QUIET, '2', '.write() in QUIET mode only outputs when an explicit QUIET verbosity is passed'],
      [Output.VERBOSITY_NORMAL, '123', '.write() in NORMAL mode outputs anything below an explicit VERBOSE verbosity'],
      [Output.VERBOSITY_VERBOSE, '1234', '.write() in VERBOSE mode outputs anything below an explicit VERY_VERBOSE verbosity'],
      [Output.VERBOSITY_VERY_VERBOSE, '12345', '.write() in VERY_VERBOSE mode outputs anything below an explicit DEBUG verbosity'],
      [Output.VERBOSITY_DEBUG, '123456', '.write() in DEBUG mode outputs everything'],
    ];
  }
});


class TestOutput extends Output
{
  constructor(verbosity, decorated, formatter)
  {
    super(verbosity, decorated, formatter);
    this.output = '';
  }


  clear()
  {
    this.output = '';
  }

  doWrite(message, newline)
  {
    this.output += `${message}${newline ? "\n" : ''}`;
  }
}
