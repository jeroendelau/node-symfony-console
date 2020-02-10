const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;

const InputArgument = require('../../src/input/InputArgument');

describe('#InputArgument', () =>
{
  it('testConstructor', () =>
  {
    let argument = new InputArgument('foo');
    assert.deepEqual('foo', argument.getName(), '__construct() takes a name as its first argument');
  });

  it('testModes', () =>
  {
    let argument = new InputArgument('foo');
    assert.isFalse(argument.isRequired(), '__construct() gives a "InputArgument.OPTIONAL" mode by fallback');

    argument = new InputArgument('foo', null);
    assert.isFalse(argument.isRequired(), '__construct() can take "InputArgument.OPTIONAL" as its mode');

    argument = new InputArgument('foo', InputArgument.OPTIONAL);
    assert.isFalse(argument.isRequired(), '__construct() can take "InputArgument.OPTIONAL" as its mode');

    argument = new InputArgument('foo', InputArgument.REQUIRED);
    assert.isTrue(argument.isRequired(), '__construct() can take "InputArgument.REQUIRED" as its mode');
  });

  it('testInvalidModes', () =>
  {

    assert.throws(() =>
    {
      new InputArgument('foo', '-1');
    }, 'Argument mode "-1" is not valid.');

  });

  it('testIsArray', () =>
  {
    let argument = new InputArgument('foo', InputArgument.IS_ARRAY);
    assert.isTrue(argument.isArray(), '.isArray() returns true if the argument can be an array');
    argument = new InputArgument('foo', InputArgument.OPTIONAL | InputArgument.IS_ARRAY);
    assert.isTrue(argument.isArray(), '.isArray() returns true if the argument can be an array');
    argument = new InputArgument('foo', InputArgument.OPTIONAL);
    assert.isFalse(argument.isArray(), '.isArray() returns false if the argument can not be an array');
  });

  it('testGetDescription', () =>
  {
    let argument = new InputArgument('foo', null, 'Some description');
    assert.deepEqual('Some description', argument.getDescription(), '.getDescription() return the message description');
  });

  it('testGetDefault', () =>
  {
    let argument = new InputArgument('foo', InputArgument.OPTIONAL, '', 'fallback');
    assert.deepEqual('fallback', argument.getFallback(), '.getFallback() return the fallback value');
  });

  it('testSetDefault', () =>
  {
    let argument = new InputArgument('foo', InputArgument.OPTIONAL, '', 'fallback');
    argument.setFallback(null);
    assert.isNull(argument.getFallback(), '.setFallback() can reset the fallback value by passing null');
    argument.setFallback('another');
    assert.deepEqual('another', argument.getFallback(), '.setFallback() changes the fallback value');

    argument = new InputArgument('foo', InputArgument.OPTIONAL | InputArgument.IS_ARRAY);
    argument.setFallback([1, 2]);
    assert.deepEqual([1, 2], argument.getFallback(), '.setFallback() changes the fallback value');
  });

  it('testSetDefaultWithRequiredArgument', () =>
  {

    assert.throws(() =>
    {
      let argument = new InputArgument('foo', InputArgument.REQUIRED);
      argument.setFallback('fallback');
    }, 'Cannot set a fallback value except for InputArgument.OPTIONAL mode.');

  });

  it('testSetDefaultWithArrayArgument', () =>
  {

    assert.throws(() =>
    {
      let argument = new InputArgument('foo', InputArgument.IS_ARRAY);
      argument.setFallback('fallback');
    }, 'A fallback value for an array argument must be an array.');

  });

});
