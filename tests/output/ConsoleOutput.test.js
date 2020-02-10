const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;


const OutputFormatter = require('../../src/formatter/OutputFormatter');
const ConsoleOutput = require('../../src/output/ConsoleOutput');
const Output = require('../../src/output/Output');

describe('#ConsoleOutput', () =>
{
  it('testConstructor', () =>
  {
    let output = new ConsoleOutput(Output.VERBOSITY_QUIET, true);
    assert.deepEqual(Output.VERBOSITY_QUIET, output.getVerbosity(), '__construct() takes the verbosity as its first argument');
    assert.deepEqual(output.getFormatter(), output.getErrorOutput().getFormatter(), '__construct() takes a formatter or null as the third argument');
  });

  it('testSetFormatter', () =>
  {
    let output = new ConsoleOutput();
    outputFormatter = new OutputFormatter();
    output.setFormatter(outputFormatter);
    assert.deepEqual(outputFormatter, output.getFormatter());
  });

  it('testSetVerbosity', () =>
  {
    let output = new ConsoleOutput();
    output.setVerbosity(Output.VERBOSITY_VERBOSE);
    assert.deepEqual(Output.VERBOSITY_VERBOSE, output.getVerbosity());
  });

});
