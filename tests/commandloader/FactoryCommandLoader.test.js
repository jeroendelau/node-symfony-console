const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;

const Command = require('../../src/command/Command');
const FactoryCommandLoader = require('../../src/commandloader/FactoryCommandLoader');

describe('#FactoryCommandLoader', () =>
{
  it('testHas', () =>
  {
    let loader = new FactoryCommandLoader({
      'foo': function ()
      {
        return new Command('foo');
      },
      'bar': function ()
      {
        return new Command('bar');
      },
    });

    assert.isTrue(loader.has('foo'));
    assert.isTrue(loader.has('bar'));
    assert.isFalse(loader.has('baz'));
  });

  it('testGet', () =>
  {
    let loader = new FactoryCommandLoader({
      'foo': function ()
      {
        return new Command('foo');
      },
      'bar': function ()
      {
        return new Command('bar');
      },
    });

    assert.instanceOf(loader.get('foo'), Command);
    assert.instanceOf(loader.get('bar'), Command);
  });

  it('testGetUnknownCommandThrows', () =>
  {

    assert.throws(() =>
    {
      (new FactoryCommandLoader([])).get('unknown');
    }, '');

  });

  it('testGetCommandNames', () =>
  {
    let loader = new FactoryCommandLoader({
      'foo': function ()
      {
        return new Command('foo');
      },
      'bar': function ()
      {
        return new Command('bar');
      },
    });

    assert.deepEqual(['foo', 'bar'], loader.getNames());
  });


});
