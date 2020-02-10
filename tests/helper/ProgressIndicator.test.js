const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const forEach = require('mocha-each');
const delay = require('delay');

const {iterator_to_array, rtrim, putenv, PHP_EOL, getenv} = require('../../src/PhpPolyfill');

const ProgressIndicator = require('../../src/helper/ProgressIndicator');
const StreamOutput = require('../../src/output/StreamOutput');
const stdOutMock = require('../stdOutMock');
//const Terminal = require('../../src/Terminal');

describe('#ProgressIndicator', () =>
{
  it('testDefaultIndicator', async function()
  {
    this.timeout(80000);
    const output = getOutputStream()
    let bar = new ProgressIndicator(output);
    bar.start('Starting...');
    await delay(101);
    bar.advance();
    await delay(101);
    bar.advance();
    await delay(101);
    bar.advance();
    await delay(101);
    bar.advance();
    await delay(101);
    bar.advance();
    await delay(101);
    bar.setMessage('Advancing...');
    bar.advance();
    bar.finish('Done...');
    bar.start('Starting Again...');
    await delay(101);
    bar.advance();
    bar.finish('Done Again...');

   

    assert.deepEqual(
      output.getStream().rawInput,
      generateOutput(' - Starting...') +
      generateOutput(' \\ Starting...') +
      generateOutput(' | Starting...') +
      generateOutput(' / Starting...') +
      generateOutput(' - Starting...') +
      generateOutput(' \\ Starting...') +
      generateOutput(' \\ Advancing...') +
      generateOutput(' | Advancing...') +
      generateOutput(' | Done...') +
      PHP_EOL +
      generateOutput(' - Starting Again...') +
      generateOutput(' \\ Starting Again...') +
      generateOutput(' \\ Done Again...') +
      PHP_EOL
    );
  });

  it('testNonDecoratedOutput', () =>
  {
    const output = getOutputStream(false);
    let bar = new ProgressIndicator(output);

    bar.start('Starting...');
    bar.advance();
    bar.advance();
    bar.setMessage('Midway...');
    bar.advance();
    bar.advance();
    bar.finish('Done...');

   

    assert.deepEqual(
      ' Starting...' + PHP_EOL +
      ' Midway...' + PHP_EOL +
      ' Done...' + PHP_EOL + PHP_EOL,
      output.getStream().rawInput
    );
  });

  it('testCustomIndicatorValues', async function() {
    const output = getOutputStream();
    let bar = new ProgressIndicator(output, null, 100, ['a', 'b', 'c']);
    this.timeout(6000);
    bar.start('Starting...');
    await delay(101);
    bar.advance();
    await delay(101);
    bar.advance();
    await delay(101);
    bar.advance();

   

    assert.deepEqual(
      generateOutput(' a Starting...') +
      generateOutput(' b Starting...') +
      generateOutput(' c Starting...') +
      generateOutput(' a Starting...'),
      output.getStream().rawInput
    );
  });

  it('testCannotSetInvalidIndicatorCharacters', () =>
  {

    assert.throws(() =>
    {
      new ProgressIndicator(getOutputStream(), null, 100, ['1']);
    }, 'Must have at least 2 indicator value characters + ');

  });

  it('testCannotStartAlreadyStartedIndicator', () =>
  {

    assert.throws(() =>
    {
      let bar = new ProgressIndicator(getOutputStream());
      bar.start('Starting...');
      bar.start('Starting Again + ');
    }, 'Progress indicator already started + ');

  });

  it('testCannotAdvanceUnstartedIndicator', () =>
  {

    assert.throws(() =>
    {
      let bar = new ProgressIndicator(getOutputStream());
      bar.advance();
    }, 'Progress indicator has not yet been started + ');

  });

  it('testCannotFinishUnstartedIndicator', () =>
  {
    assert.throws(() =>
    {
      let bar = new ProgressIndicator(getOutputStream());
      bar.finish('Finished');
    }, 'Progress indicator has not yet been started + ');

  });
  
  forEach(provideFormat()).
  it('testFormats %s', (format) =>
  {
    const output = getOutputStream();
    let bar = new ProgressIndicator(output, format);
    bar.start('Starting...');
    bar.advance();
    
    assert.isNotEmpty(output.getStream().rawInput);
  });


  function provideFormat()
  {
    return [
      ['normal'],
      ['verbose'],
      ['very_verbose'],
      ['debug'],
    ];
  }

  function getOutputStream(decorated = true, verbosity = StreamOutput.VERBOSITY_NORMAL) {
    return new StreamOutput(new stdOutMock({columns : 3000}), verbosity, decorated);
  }

  function generateOutput(expected) {
    const count = (expected.match(/\n/g) || []).length;

    return "\x0D\x1B[2K" + (count ? "\x1B[%dA".repeat(count) : '') + expected;
  }

});
