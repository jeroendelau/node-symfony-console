const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;


const NullOutputFormatter = require('../../src/formatter/NullOutputFormatter');
const NullOutputFormatterStyle = require('../../src/formatter/NullOutputFormatterStyle');
const OutputFormatterStyle = require('../../src/formatter/OutputFormatterStyle');

describe('#NullOutputFormatter', () =>
{
  it('testFormat', () =>
  {
    let formatter = new NullOutputFormatter();

    let message = 'this message will not be changed';
    formatter.format(message);

    assert.deepEqual('this message will not be changed', message);
  });

  it('testGetStyle', () =>
  {
    let formatter = new NullOutputFormatter();
    let style = formatter.getStyle('null')
    assert.instanceOf(style, NullOutputFormatterStyle);
    assert.deepEqual(style, formatter.getStyle('null'));
  });

  it('testSetStyle', () =>
  {
    let formatter = new NullOutputFormatter();
    let style = new OutputFormatterStyle();
    formatter.setStyle('null', style);
    assert.notDeepEqual(formatter.getStyle('null'), style);
  });

  it('testHasStyle', () =>
  {
    let formatter = new NullOutputFormatter();
    assert.isFalse(formatter.hasStyle('null'));
  });

  it('testIsDecorated', () =>
  {
    let formatter = new NullOutputFormatter();
    assert.isFalse(formatter.isDecorated());
  });

  it('testSetDecorated', () =>
  {
    let formatter = new NullOutputFormatter();
    formatter.setDecorated(true);
    assert.isFalse(formatter.isDecorated());
  });


});
  