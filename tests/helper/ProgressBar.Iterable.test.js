const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const forEach = require('mocha-each');
const delay = require('delay');

const {iterator_to_array, rtrim, putenv, PHP_EOL, getenv} = require('../../src/PhpPolyfill');

const OutputFormatter = require('../../src/formatter/OutputFormatter');
const Helper = require('../../src/helper/Helper');
const ProgressBar = require('../../src/helper/ProgressBar');
const ConsoleSectionOutput = require('../../src/output/ConsoleSectionOutput');
const StreamOutput = require('../../src/output/StreamOutput');
const stdOutMock = require('../stdOutMock');
const Terminal = require('../../src/Terminal');


// Not sure this is required in node
describe('#ProgressBar with itterator', () => {


  xit('testIterate', () => {
    let output = getOutputStream();
    let bar = new ProgressBar(output, 0, 0);
    
    assert.deepEqual([1, 2], iterator_to_array(bar.iterate([1, 2])));

    assert.deepEqual(
      ' 0/2 [>---------------------------]   0%' +
      generateOutput(' 1/2 [==============>-------------]  50%') +
      generateOutput(' 2/2 [============================] 100%'),
      output.getStream().rawInput
    );
  });

  xit('testIterateUncountable', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);

    assert.deepEqual([1, 2], iterator_to_array(bar.iterate((function* () {
      yield 1;
      yield 2;
    })())));


    assert.deepEqual(
      '    0 [>---------------------------]' +
      generateOutput('    1 [->--------------------------]') +
      generateOutput('    2 [->-------------------------]') +
      generateOutput('    2 [============================]'),
      output.getStream().rawInput
    );
  });

  function getOutputStream(decorated = true, verbosity = StreamOutput.VERBOSITY_NORMAL) {
    return new StreamOutput(new stdOutMock({columns : 3000}), verbosity, decorated);
  }

  function generateOutput(expected) {
    const count = (expected.match(/\n/g) || []).length;
    return "\x0D\x1B[2K" + (count ? "\x1B[1A\x1B[2K".repeat(count) : '') + expected;
  }
  
  var colSize = getenv('COLUMNS');
  
  before(() => {
    putenv('COLUMNS=120');
  });

  after(() => {
    assert.rejects = (`colSize ${colSize}`);
    putenv(colSize ? 'COLUMNS=' + colSize : 'COLUMNS');
  });

  function provideFormat() {
    return [
      ['normal'],
      ['verbose'],
      ['very_verbose'],
      ['debug'],
    ];
  }
});
