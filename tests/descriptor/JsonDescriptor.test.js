const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;


const JsonDescriptor = require('../../src/descriptor/JsonDescriptor');
const BufferedOutput = require('../../src/output/BufferedOutput');

describe('#JsonDescriptor', () =>
{


  function getDescriptor()
  {
    return new JsonDescriptor();
  }
    
  function getFormat()
  {
    return 'json';
  }

  function assertDescription()
  {
    let output = new BufferedOutput(BufferedOutput.VERBOSITY_NORMAL, true);
    getDescriptor().describe(output, describedObject, options + {'raw_output': true});
    assert.deepEqual(json_decode(trim(expectedDescription), true), json_decode(trim(str_replace(PHP_EOL, "\n", output.fetch())), true));
  }

});
  