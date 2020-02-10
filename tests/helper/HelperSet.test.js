const mocha = require('mocha');
const chai = require('chai');
const sinon = require('sinon');
const {assert} = chai;

const forEach = require('lodash/forEach');

const Command = require('../../src/command/Command');
const HelperSet = require('../../src/helper/HelperSet');
const DebugFormatterHelper = require('../../src/helper/DebugFormatterHelper');

describe('#HelperSet', () =>
{
  it('testConstructor', () =>
  {
    let mock_helper = getGenericMockHelper('fake_helper');
    helperset = new HelperSet({'fake_helper_alias': mock_helper});

    assert.deepEqual(mock_helper, helperset.get('fake_helper_alias'), '__construct sets given helper to helpers');
    assert.isTrue(helperset.has('fake_helper_alias'), '__construct sets helper alias for given helper');
  });

  it('testSet', () =>
  {
    let helperset = new HelperSet();
    helperset.set(getGenericMockHelper('fake_helper', helperset));
    assert.isTrue(helperset.has('fake_helper'), '.set() adds helper to helpers');

    helperset = new HelperSet();
    helperset.set(getGenericMockHelper('fake_helper_01', helperset));
    helperset.set(getGenericMockHelper('fake_helper_02', helperset));
    assert.isTrue(helperset.has('fake_helper_01'), '.set() will set multiple helpers on consecutive calls');
    assert.isTrue(helperset.has('fake_helper_02'), '.set() will set multiple helpers on consecutive calls');

    helperset = new HelperSet();
    helperset.set(getGenericMockHelper('fake_helper', helperset), 'fake_helper_alias');
    assert.isTrue(helperset.has('fake_helper'), '.set() adds helper alias when set');
    assert.isTrue(helperset.has('fake_helper_alias'), '.set() adds helper alias when set');
  });

  it('testHas', () =>
  {
    let helperset = new HelperSet({'fake_helper_alias': getGenericMockHelper('fake_helper')});
    assert.isTrue(helperset.has('fake_helper'), '.has() finds set helper');
    assert.isTrue(helperset.has('fake_helper_alias'), '.has() finds set helper by alias');
  });

  it('testGet', () =>
  {
    let helper_01 = getGenericMockHelper('fake_helper_01');
    helper_02 = getGenericMockHelper('fake_helper_02');
    let helperset = new HelperSet({'fake_helper_01_alias': helper_01, 'fake_helper_02_alias': helper_02});
    assert.deepEqual(helper_01, helperset.get('fake_helper_01'), '.get() returns correct helper by name');
    assert.deepEqual(helper_01, helperset.get('fake_helper_01_alias'), '.get() returns correct helper by alias');
    assert.deepEqual(helper_02, helperset.get('fake_helper_02'), '.get() returns correct helper by name');
    assert.deepEqual(helper_02, helperset.get('fake_helper_02_alias'), '.get() returns correct helper by alias');

    helperset = new HelperSet();
    try
    {
      helperset.get('foo');
      this.fail('.get() throws Error when helper not found');
    } catch (e)
    {
      assert.instanceOf( e, Error.prototype.constructor, '.get() throws Error when helper not found');
      assert.instanceOf( e, Error.prototype.constructor,'.get() throws domain specific exception when helper not found');
      assert.deepEqual(e.message, 'The helper "foo" is not defined.', '.get() throws Error when helper not found');
    }
  });

  it('testSetCommand', () =>
  {
    let cmd_01 = new Command('foo');
    cmd_02 = new Command('bar');

    let helperset = new HelperSet();
    helperset.setCommand(cmd_01);
    assert.deepEqual(cmd_01, helperset.getCommand(), '.setCommand() stores given command');

    helperset = new HelperSet();
    helperset.setCommand(cmd_01);
    helperset.setCommand(cmd_02);
    assert.deepEqual(cmd_02, helperset.getCommand(), '.setCommand() overwrites stored command with consecutive calls');
  });

  it('testGetCommand', () =>
  {
    let cmd = new Command('foo');
    helperset = new HelperSet();
    helperset.setCommand(cmd);
    assert.deepEqual(cmd, helperset.getCommand(), '.getCommand() retrieves stored command');
  });

  it('testIteration', () =>
  {
    let helperset = new HelperSet();
    helperset.set(getGenericMockHelper('fake_helper_01', helperset));
    helperset.set(getGenericMockHelper('fake_helper_02', helperset));

    let helpers = ['fake_helper_01', 'fake_helper_02'];
    i = 0;

    for(let helper of helperset)
    {
      assert.deepEqual(helpers[i++], helper.getName());
    }
  });

  function getGenericMockHelper(name, helperset)
  {

    let mock = sinon.createStubInstance(DebugFormatterHelper);

    mock.getName.returns(name);
    if (helperset)
    {
      mock.setHelperSet.withArgs(helperset);
    }

    return mock;
  }

});
