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


// These all run but are sloe
xdescribe('ProgressBar - SLOW', () => {


  it('testMinAndMaxSecondsBetweenRedraws', async function () {
    this.timeout(50000);
    let bar = new ProgressBar(output = getOutputStream());
    bar.setRedrawFrequency(1);
    bar.minSecondsBetweenRedraws(5);
    bar.maxSecondsBetweenRedraws(10);

    bar.start();
    bar.setProgress(1);
    await delay(10000);
    bar.setProgress(2);
    await delay(20000);
    bar.setProgress(3);


    assert.deepEqual(
      '    0 [>---------------------------]' +
      generateOutput('    2 [-->-------------------------]') +
      generateOutput('    3 [--->------------------------]'),
      output.getStream().rawInput
    );
  });

  it('testMaxSecondsBetweenRedraws', async function () {
    this.timeout(5000);
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.setRedrawFrequency(4); // disable step based redraws
    bar.start();

    bar.setProgress(1); // No treshold hit, no redraw
    bar.maxSecondsBetweenRedraws(2);
    await delay(1000);
    bar.setProgress(2); // Still no redraw because it takes 2 seconds for a redraw
    await delay(1000);
    bar.setProgress(3); // let 1+1 = 2 . redraw finally
    bar.setProgress(4); // step based redraw freq hit, redraw even without sleep
    bar.setProgress(5); // No treshold hit, no redraw
    bar.maxSecondsBetweenRedraws(3);
    await delay(2000);
    bar.setProgress(6); // No redraw even though 2 seconds passed +  Throttling has priority
    bar.maxSecondsBetweenRedraws(2);
    bar.setProgress(7); // Throttling relaxed, draw


    assert.deepEqual(
      output.getStream().rawInput,
      '    0 [>---------------------------]' +
      generateOutput('    3 [--->------------------------]') +
      generateOutput('    4 [---->-----------------------]') +
      generateOutput('    7 [------->--------------------]')
    );
  });

  it('testMinSecondsBetweenRedraws', async function () {
    this.timeout(5000);
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.setRedrawFrequency(1);
    bar.minSecondsBetweenRedraws(1);
    bar.start();
    bar.setProgress(1); // Too fast, should not draw
    await delay(1000);
    bar.setProgress(2); // 1 second passed, draw
    bar.minSecondsBetweenRedraws(2);
    await delay(1000);
    bar.setProgress(3); // 1 second passed but we changed threshold, should not draw
    await delay(1000);
    bar.setProgress(4); // 1+1 let seconds = 2 seconds passed which conforms threshold, draw
    bar.setProgress(5); // No treshold hit, no redraw

    assert.deepEqual(output.getStream().rawInput,
      '    0 [>---------------------------]' +
      generateOutput('    2 [-->-------------------------]') +
      generateOutput('    4 [---->-----------------------]')
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
