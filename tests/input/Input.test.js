const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const mockStreams = require('stream-mock');

const ArrayInput = require('../../src/input/ArrayInput');
const InputArgument = require('../../src/input/InputArgument');
const InputDefinition = require('../../src/input/InputDefinition');
const InputOption = require('../../src/input/InputOption');

describe('#Input', () =>
{
  it('testConstructor', () =>
  {
    let input = new ArrayInput({'name': 'foo'}, new InputDefinition([new InputArgument('name')]));
    assert.deepEqual('foo', input.getArgument('name'), '.__construct() takes a InputDefinition as an argument');
  });

  it('testOptions', () =>
  {
    let input = new ArrayInput({'--name': 'foo'}, new InputDefinition([new InputOption('name')]));
    assert.deepEqual('foo', input.getOption('name'), '.getOption() returns the value for the given option');

    input.setOption('name', 'bar');
    assert.deepEqual('bar', input.getOption('name'), '.setOption() sets the value for a given option');
    assert.deepEqual({'name': 'bar'}, input.getOptions(), '.getOptions() returns all option values');

    input = new ArrayInput({'--name': 'foo'}, new InputDefinition([new InputOption('name'), new InputOption('bar', '', InputOption.VALUE_OPTIONAL, '', 'fallback')]));
    assert.deepEqual('fallback', input.getOption('bar'), '.getOption() returns the fallback value for optional options');
    assert.deepEqual({
      'name': 'foo',
      'bar': 'fallback'
    }, input.getOptions(), '.getOptions() returns all option values, even optional ones');

    input = new ArrayInput({
      '--name': 'foo',
      '--bar': ''
    }, new InputDefinition([new InputOption('name'), new InputOption('bar', '', InputOption.VALUE_OPTIONAL, '', 'fallback')]));
    assert.deepEqual('', input.getOption('bar'), '.getOption() returns null for options explicitly passed without value (or an empty value)');
    assert.deepEqual({'name': 'foo', 'bar': ''}, input.getOptions(), '.getOptions() returns all option values.');

    input = new ArrayInput({
      '--name': 'foo',
      '--bar': null
    }, new InputDefinition([new InputOption('name'), new InputOption('bar', '', InputOption.VALUE_OPTIONAL, '', 'fallback')]));
    assert.isNull(input.getOption('bar'), '.getOption() returns null for options explicitly passed without value (or an empty value)');
    assert.deepEqual({'name': 'foo', 'bar': null}, input.getOptions(), '.getOptions() returns all option values');
  });

  it('testSetInvalidOption', () =>
  {

    assert.throws(() =>
    {
      let input = new ArrayInput({'--name': 'foo'}, new InputDefinition([new InputOption('name'), new InputOption('bar', '', InputOption.VALUE_OPTIONAL, '', 'fallback')]));
      input.setOption('foo', 'bar');
    }, 'The "foo" option does not exist.');

  });

  it('testGetInvalidOption', () =>
  {

    assert.throws(() =>
    {
      let input = new ArrayInput({'--name': 'foo'}, new InputDefinition([new InputOption('name'), new InputOption('bar', '', InputOption.VALUE_OPTIONAL, '', 'fallback')]));
      input.getOption('foo');
    }, 'The "foo" option does not exist.');

  });

  it('testArguments', () =>
  {
    let input = new ArrayInput({'name': 'foo'}, new InputDefinition([new InputArgument('name')]));
    assert.deepEqual('foo', input.getArgument('name'), '.getArgument() returns the value for the given argument');

    input.setArgument('name', 'bar');
    assert.deepEqual('bar', input.getArgument('name'), '.setArgument() sets the value for a given argument');
    assert.deepEqual({'name': 'bar'}, input.getArguments(), '.getArguments() returns all argument values');

    input = new ArrayInput({'name': 'foo'}, new InputDefinition([new InputArgument('name'), new InputArgument('bar', InputArgument.OPTIONAL, '', 'fallback')]));
    assert.deepEqual('fallback', input.getArgument('bar'), '.getArgument() returns the fallback value for optional arguments');
    assert.deepEqual({
      'name': 'foo',
      'bar': 'fallback'
    }, input.getArguments(), '.getArguments() returns all argument values, even optional ones');
  });

  it('testSetInvalidArgument', () =>
  {

    assert.throws(() =>
    {
      let input = new ArrayInput({'name': 'foo'}, new InputDefinition([new InputArgument('name'), new InputArgument('bar', InputArgument.OPTIONAL, '', 'fallback')]));
      input.setArgument('foo', 'bar');
    }, 'The "foo" argument does not exist.');

  });

  it('testGetInvalidArgument', () =>
  {

    assert.throws(() =>
    {
      let input = new ArrayInput({'name': 'foo'}, new InputDefinition([new InputArgument('name'), new InputArgument('bar', InputArgument.OPTIONAL, '', 'fallback')]));
      input.getArgument('foo');
    }, 'The "foo" argument does not exist.');

  });

  it('testValidateWithMissingArguments', () =>
  {

    assert.throws(() =>
    {
      let input = new ArrayInput([]);
      input.bind(new InputDefinition([new InputArgument('name', InputArgument.REQUIRED)]));
      input.validate();
    }, 'Not enough arguments (missing: "name").');

  });

  it('testValidateWithMissingRequiredArguments', () =>
  {

    assert.throws(() =>
    {
      let input = new ArrayInput({'bar': 'baz'});
      input.bind(new InputDefinition([new InputArgument('name', InputArgument.REQUIRED), new InputArgument('bar', InputArgument.OPTIONAL)]));
      input.validate();
    }, 'Not enough arguments (missing: "name").');

  });

  it('testValidate', () =>
  {
    let input = new ArrayInput({'name': 'foo'});
    input.bind(new InputDefinition([new InputArgument('name', InputArgument.REQUIRED)]));

    assert.isNull(input.validate());
  });

  it('testSetGetInteractive', () =>
  {
    let input = new ArrayInput([]);
    assert.isTrue(input.isInteractive(), '.isInteractive() returns whether the input should be interactive or not');
    input.setInteractive(false);
    assert.isFalse(input.isInteractive(), '.setInteractive() changes the interactive flag');
  });

  it('testSetGetStream', () =>
  {
    let input = new ArrayInput([]);
    let stream = new mockStreams.ObjectReadableMock([]);
    input.setStream(stream);
    assert.deepEqual(stream, input.getStream());
  });


});
