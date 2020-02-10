const mocha = require('mocha');
const forEach = require('mocha-each');
const chai = require('chai');
const {assert} = chai;

const {escapeshellarg} = require('../../src/PhpPolyfill');

const ArrayInput = require('../../src/input/ArrayInput');
const InputArgument = require('../../src/input/InputArgument');
const InputDefinition = require('../../src/input/InputDefinition');
const InputOption = require('../../src/input/InputOption');

describe('#ArrayInput', () =>
{
  it('testGetFirstArgument', () =>
  {
    let input = new ArrayInput([]);
    assert.isNull(input.getFirstArgument(), '.getFirstArgument() returns null if no argument were passed');
    input = new ArrayInput({'name': 'Fabien'});
    assert.deepEqual('Fabien', input.getFirstArgument(), '.getFirstArgument() returns the first passed argument');
    input = new ArrayInput({'--foo': 'bar', 'name': 'Fabien'});
    assert.deepEqual('Fabien', input.getFirstArgument(), '.getFirstArgument() returns the first passed argument');
  });

  it('testHasParameterOption', () =>
  {
    let input = new ArrayInput({'name': 'Fabien', '--foo': 'bar'});
    assert.isTrue(input.hasParameterOption('--foo'), '.hasParameterOption() returns true if an option is present in the passed parameters');
    assert.isFalse(input.hasParameterOption('--bar'), '.hasParameterOption() returns false if an option is not present in the passed parameters');

    input = new ArrayInput(['--foo']);
    assert.isTrue(input.hasParameterOption('--foo'), '.hasParameterOption() returns true if an option is present in the passed parameters');

    input = new ArrayInput(['--foo', '--', '--bar']);
    assert.isTrue(input.hasParameterOption('--bar'), '.hasParameterOption() returns true if an option is present in the passed parameters');
    assert.isFalse(input.hasParameterOption('--bar', true), '.hasParameterOption() returns false if an option is present in the passed parameters after an end of options signal');
  });

  it('testGetParameterOption', () =>
  {
    let input = new ArrayInput({'name': 'Fabien', '--foo': 'bar'});
    assert.deepEqual('bar', input.getParameterOption('--foo'), '.getParameterOption() returns the option of specified name');
    assert.deepEqual('fallback', input.getParameterOption('--bar', 'fallback'), '.getParameterOption() returns the fallback value if an option is not present in the passed parameters');

   // input = new ArrayInput({'Fabien', '--foo': 'bar'});
   // assert.deepEqual('bar', input.getParameterOption('--foo'), '.getParameterOption() returns the option of specified name');

   // input = new ArrayInput({'--foo', '--', '--bar': 'woop'});
   // assert.deepEqual('woop', input.getParameterOption('--bar'), '.getParameterOption() returns the correct value if an option is present in the passed parameters');
   // assert.deepEqual('fallback', input.getParameterOption('--bar', 'fallback', true), '.getParameterOption() returns the fallback value if an option is present in the passed parameters after an end of options signal');
  });

  it('testParseArguments', () =>
  {
    let input = new ArrayInput({'name': 'foo'}, new InputDefinition([new InputArgument('name')]));

    assert.deepEqual({'name': 'foo'}, input.getArguments(), '.parse() parses required arguments');
  });

  forEach(provideOptions()).
  it('testParseOptions input %j', (xinput, options, expectedOptions, message) =>
  {
    let input = new ArrayInput(xinput, new InputDefinition(options));

    assert.deepEqual(expectedOptions, input.getOptions(), message);
  });

  forEach(provideInvalidInput()).
  it('testParseInvalidInput %j', (parameters, definition, expectedExceptionMessage) =>
  {

    assert.throws(() =>
    {
      new ArrayInput(parameters, definition);
    }, expectedExceptionMessage);

  });

  it('testToString', () =>
  {
    let input = new ArrayInput({
      '-f': null,
      '-b': 'bar',
      '--foo': 'b a z',
      '--lala': null,
      'test': 'Foo',
      'test2': "A\nB'C"
    });
    assert.deepEqual('-f -b=bar --foo=' + escapeshellarg('b a z') + ' --lala Foo ' + escapeshellarg("A\nB'C"), input.toString());

    input = new ArrayInput({'-b': ['bval_1', 'bval_2'], '--f': ['fval_1', 'fval_2']});
    assert.deepEqual('-b=bval_1 -b=bval_2 --f=fval_1 --f=fval_2', input.toString());

    input = new ArrayInput({'array_arg': ['val_1', 'val_2']});
    assert.deepEqual('val_1 val_2', input.toString());
  });


  function provideOptions()
  {
    return [
      [
        {'--foo': 'bar'},
        [new InputOption('foo')],
        {'foo': 'bar'},
        '.parse() parses long options',
      ],
      [
        {'--foo': 'bar'},
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL, '', 'fallback')],
        {'foo': 'bar'},
        '.parse() parses long options with a fallback value',
      ],
      [
        [],
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL, '', 'fallback')],
        {'foo': 'fallback'},
        '.parse() uses the fallback value for long options with value optional which are not passed',
      ],
      [
        {'--foo': null},
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL, '', 'fallback')],
        {'foo': null},
        '.parse() parses long options with a fallback value',
      ],
      [
        {'-f': 'bar'},
        [new InputOption('foo', 'f')],
        {'foo': 'bar'},
        '.parse() parses short options',
      ],
      [
        {'--': null, '-f': 'bar'},
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL, '', 'fallback')],
        {'foo': 'fallback'},
        '.parse() does not parse opts after an end of options signal',
      ],
      [
        {'--': null},
        [],
        {},
        '.parse() does not choke on end of options signal',
      ],
    ];
  }

  function provideInvalidInput()
  {
    return [
      [
        {'foo': 'foo'},
        new InputDefinition([new InputArgument('name')]),
        'The "foo" argument does not exist.',
      ],
      [
        {'--foo': null},
        new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_REQUIRED)]),
        'The "--foo" option requires a value.',
      ],
      [
        {'--foo': 'foo'},
        new InputDefinition(),
        'The "--foo" option does not exist.',
      ],
      [
        {'-o': 'foo'},
        new InputDefinition(),
        'The "-o" option does not exist.',
      ],
    ];
  }

});
