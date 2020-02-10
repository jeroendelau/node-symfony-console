const {putenv, trim, sprintf, PHP_EOL} = require('../../src/PhpPolyfill');

const mocha = require('mocha');
const sinon = require('sinon');
const mockStreams = require('stream-mock');
const chai = require('chai');
const {assert} = chai;


const OutputFormatter = require('../../src/formatter/OutputFormatter');
const QuestionHelper = require('../../src/helper/QuestionHelper');
const ConsoleSectionOutput = require('../../src/output/ConsoleSectionOutput');
const Output = require('../../src/output/Output');
const StreamOutput = require('../../src/output/StreamOutput');
const Question = require('../../src/question/Question');
const stdOutMock = require('../stdOutMock');

const Input = require('../../src/input/Input');


/**
 process.stdout.write('* This is some text');
 process.stdout.write('* and some more');
 process.stdout.write('* and another line');
 process.stdout.write('$THIS LINE DOESNT MATCH'); // Won't be cached

 assert.equals(mockConsole.getConsoleOuput(), '* This is some text\n* and some more\n* and another line');
 process.stdout.clearLine();
 process.stdout.moveCursor(0, -1);
 process.stdout.clearScreenDown();

 assert.equals(mockConsole.getConsoleOutput(), '* This is some text\n* and some more');

 mockConsole.resetStdout();
 **/
describe('#ConsoleSectionOutput', () => {

  it('testClearAll', () => {
    const sections = [];
    let stdout = new stdOutMock();

    const output = new ConsoleSectionOutput(stdout, sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());

    output.writeln('Foo' + PHP_EOL + 'Bar');
    output.clear();

    //output.getStream().cursorTo(0);
    assert.deepEqual(stdout.toString(), '');
  });

  it('testClearNumberOfLines', () => {
    const sections = [];
    const stdout = new stdOutMock();

    const output = new ConsoleSectionOutput(stdout, sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());

    output.writeln("Foo\nBar\nBaz\nFooBar");
    output.clear(2);

    //rewind(output.getStream());
    assert.deepEqual("Foo\nBar\nBaz\nFooBar" + PHP_EOL + sprintf("\x1b[%dA", 2) + "\x1b[0J", stdout.rawInput);
  });

  it('testClearNumberOfLinesWithMultipleSections', () => {
    const stdout = new stdOutMock();
    const output = new StreamOutput(stdout);
    const sections = [];
    const output1 = new ConsoleSectionOutput(output.getStream(), sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());
    const output2 = new ConsoleSectionOutput(output.getStream(), sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());

    output2.writeln('Foo');
    output2.writeln('Bar');
    output2.clear(1);
    output1.writeln('Baz');

    assert.deepEqual('Foo' + PHP_EOL + 'Bar' + PHP_EOL + "\x1b[1A\x1b[0J\x1B[1A\x1B[0J" + 'Baz' + PHP_EOL + 'Foo' + PHP_EOL, stdout.rawInput);
  });

  it('testClearPreservingEmptyLines', () => {
    const stdout = new stdOutMock();
    const output = new StreamOutput(stdout);
    const sections = [];
    const output1 = new ConsoleSectionOutput(output.getStream(), sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());
    const output2 = new ConsoleSectionOutput(output.getStream(), sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());

    output2.writeln(PHP_EOL + 'foo');
    output2.clear(1);
    output1.writeln('bar');

    assert.deepEqual(PHP_EOL + 'foo' + PHP_EOL + "\x1b[1A\x1b[0J\x1b[1A\x1b[0J" + 'bar' + PHP_EOL + PHP_EOL, stdout.rawInput);
  });

  it('testOverwrite', () => {
    const stdout = new stdOutMock();
    const sections = [];
    const output = new ConsoleSectionOutput(stdout, sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());

    output.writeln('Foo');
    output.overwrite('Bar');
    assert.deepEqual("Bar" + PHP_EOL, stdout.toString());
    assert.deepEqual('Foo' + PHP_EOL + "\x1b[1A\x1b[0JBar" + PHP_EOL, stdout.rawInput);
  });

  it('testOverwriteMultipleLines', () => {
    const stdout = new stdOutMock();
    const sections = [];
    const output = new ConsoleSectionOutput(stdout, sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());

    output.writeln('Foo' + PHP_EOL + 'Bar' + PHP_EOL + 'Baz');
    output.overwrite('Bar');


    assert.deepEqual('Foo' + PHP_EOL + 'Bar' + PHP_EOL + 'Baz' + PHP_EOL + sprintf("\x1b[%dA", 3) + "\x1b[0J" + 'Bar' + PHP_EOL, stdout.rawInput);
  });

  it('testAddingMultipleSections', () => {
    const stdout = new stdOutMock();
    const sections = [];
    new ConsoleSectionOutput(stdout, sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());
    new ConsoleSectionOutput(stdout, sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());

    assert.lengthOf(sections, 2);
  });

  it('testMultipleSectionsOutput', () => {
    const stdout = new stdOutMock();
    const output = new StreamOutput(stdout);
    const sections = [];
    const output1 = new ConsoleSectionOutput(output.getStream(), sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());
    const output2 = new ConsoleSectionOutput(output.getStream(), sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());

    output1.writeln('Foo');
    output2.writeln('Bar');

    output1.overwrite('Baz');
    assert.deepEqual(stdout.toString(), 'Baz' + PHP_EOL + 'Bar' + PHP_EOL);

    output2.overwrite('Foobar');
    assert.deepEqual(stdout.toString(), 'Baz' + PHP_EOL + 'Foobar' + PHP_EOL);

    assert.deepEqual('Foo' + PHP_EOL + 'Bar' + PHP_EOL + "\x1b[2A\x1b[0JBar" + PHP_EOL + "\x1b[1A\x1b[0JBaz" + PHP_EOL + 'Bar' + PHP_EOL + "\x1b[1A\x1b[0JFoobar" + PHP_EOL, stdout.rawInput);
  });

  it('testClearSectionContainingQuestion', async () => {
    let inputStream = new mockStreams.DuplexMock();
    inputStream.write("Batman & Robin\n");

    const input = sinon.createStubInstance(Input);
    const stdout = new mockStreams.ObjectWritableMock()
    //let input = this.getMockBuilder(StreamableInputInterface.class).getMock();
    input.isInteractive.returns(true);
    input.getStream.returns(inputStream);

    const sections = [];
    const output = new ConsoleSectionOutput(stdout, sections, Output.VERBOSITY_NORMAL, true, new OutputFormatter());

    (await new QuestionHelper()).ask(input, output, new Question('What\'s your favorite super hero?'));
    output.clear();

    assert.include(stdout.data.join(""), 'What\'s your favorite super hero?');
    //assert.deepEqual(stdout.rawInput, 'What\'s your favorite super hero?' + PHP_EOL + "\x1b[1A\x1b[0J");
    //assert.deepEqual(stdout.rawInput, 'What\'s your favorite super hero?' + PHP_EOL + "\x1b[2A\x1b[0J");
  });

});
