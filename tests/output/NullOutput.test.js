const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;

const {ob_start, ob_get_clean} = require('../obPolyfill');
const pf = require('../obPolyfill');
const NullOutputFormatter = require('../../src/formatter/NullOutputFormatter');
const OutputFormatter = require('../../src/formatter/OutputFormatter');
const NullOutput = require('../../src/output/NullOutput');
const Output = require('../../src/output/Output');

describe('#NullOutput', () =>
{
  it('testConstructor', () =>
  {
    let output = new NullOutput();

    ob_start();
    output.write('foo');
    let buffer = ob_get_clean();

    assert.deepEqual('', buffer, '.write() does nothing (at least nothing is printed)');
    assert.isFalse(output.isDecorated(), '.isDecorated() returns false');
  });

  it('testVerbosity', () =>
  {
    let output = new NullOutput();
    assert.deepEqual(Output.VERBOSITY_QUIET, output.getVerbosity(), '.getVerbosity() returns VERBOSITY_QUIET for NullOutput by fallback');

    output.setVerbosity(Output.VERBOSITY_VERBOSE);
    assert.deepEqual(Output.VERBOSITY_QUIET, output.getVerbosity(), '.getVerbosity() always returns VERBOSITY_QUIET for NullOutput');
  });

  it('testGetFormatter', () =>
  {
    let output = new NullOutput();
    let formatter = output.getFormatter()
    assert.instanceOf(formatter, NullOutputFormatter);
    assert.deepEqual(formatter, output.getFormatter());
  });

  it('testSetFormatter', () =>
  {
    let output = new NullOutput();
    outputFormatter = new OutputFormatter();
    output.setFormatter(outputFormatter);
    assert.notDeepEqual(output.getFormatter(), outputFormatter);
  });

  it('testSetVerbosity', () =>
  {
    let output = new NullOutput();
    output.setVerbosity(Output.VERBOSITY_NORMAL);
    assert.deepEqual(Output.VERBOSITY_QUIET, output.getVerbosity());
  });

  it('testSetDecorated', () =>
  {
    let output = new NullOutput();
    output.setDecorated(true);
    assert.isFalse(output.isDecorated());
  });

  it('testIsQuiet', () =>
  {
    let output = new NullOutput();
    assert.isTrue(output.isQuiet());
  });

  it('testIsVerbose', () =>
  {
    let output = new NullOutput();
    assert.isFalse(output.isVerbose());
  });

  it('testIsVeryVerbose', () =>
  {
    let output = new NullOutput();
    assert.isFalse(output.isVeryVerbose());
  });

  it('testIsDebug', () =>
  {
    let output = new NullOutput();
    assert.isFalse(output.isDebug());
  });


});
