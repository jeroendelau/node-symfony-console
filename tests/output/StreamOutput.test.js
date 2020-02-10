const mocha = require('mocha');
const chai = require('chai');
const os = require('os');
const {ob_start, ob_get_clean} = require('../obPolyfill');

const {assert} = chai;

var thisstream;

const Output = require('../../src/output/Output');
const StreamOutput = require('../../src/output/StreamOutput');

describe('#StreamOutput', () =>
{
  beforeEach(() =>
    {
      thisstream = process.stdout;
    }
  );

  afterEach(() =>
    {
      thisstream = null
    }
  );

  it('testConstructor', () =>
  {
    let output = new StreamOutput(thisstream, Output.VERBOSITY_QUIET, true);
    assert.deepEqual(Output.VERBOSITY_QUIET, output.getVerbosity(), '__construct() takes the verbosity as its first argument');
    assert.isTrue(output.isDecorated(), '__construct() takes the decorated flag as its second argument');
  });

  it('testStreamIsRequired', () =>
  {

    assert.throws(() =>
    {
      new StreamOutput('foo');
    }, 'The StreamOutput class needs a stream as its first argument.');

  });

  it('testGetStream', () =>
  {
    let output = new StreamOutput(thisstream);
    assert.deepEqual(thisstream, output.getStream(), '.getStream() returns the current stream');
  });

  it('testDoWrite', () =>
  {
    ob_start();
    let output = new StreamOutput(thisstream);
    output.writeln('foo');
    let buffer = ob_get_clean();

    assert.deepEqual('foo' + os.EOL, buffer, '.doWrite() writes to the stream');
  });


});
