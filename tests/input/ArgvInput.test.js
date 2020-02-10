const mocha = require('mocha');
const forEach = require('mocha-each');
const chai = require('chai');
const {assert} = chai;

const {escapeshellarg} = require('../../src/PhpPolyfill');

const ArgvInput = require('../../src/input/ArgvInput');
const InputArgument = require('../../src/input/InputArgument');
const InputDefinition = require('../../src/input/InputDefinition');
const InputOption = require('../../src/input/InputOption');

describe('#ArgvInput', () =>
{
  it('testConstructor', () =>
  {
    process.argv = ['/Users/Path/To/Node', '/Users/Path/To/filename','foo'];
    let input = new ArgvInput();
    //let r = new \ReflectionObject(input);
    //p = r.getProperty('tokens');
    //p.setAccessible(true);

    assert.deepEqual(['foo'], input.tokens, '__construct() automatically get its input from the argv server variable');
  });

  it('testParseArguments', () =>
  {
    let input = new ArgvInput(['/Users/Path/To/Node', '/Users/Path/To/filename','foo']);
    input.bind(new InputDefinition([new InputArgument('name')]));
    assert.deepEqual({'name': 'foo'}, input.getArguments(), '.parse() parses required arguments');

    input.bind(new InputDefinition([new InputArgument('name')]));
    assert.deepEqual({'name': 'foo'}, input.getArguments(), '.parse() is stateless');
  });

  forEach(provideOptions()).
  it('testValidInput test %s', (input, options, expectedOptions, message) =>
  {
      let ainput = new ArgvInput(input);
      ainput.bind(new InputDefinition(options));
      assert.deepEqual(expectedOptions, ainput.getOptions(), message);
  });

  forEach(provideInvalidInput()).
  it('testInvalidInput argv %s', (argv, definition, expectedExceptionMessage) =>
  {
      assert.throws(() =>
      {
        let input = new ArgvInput(argv);
        input.bind(definition);
      }, expectedExceptionMessage);
  });

  it('testParseArrayArgument', () =>
  {
    let input = new ArgvInput(['node' , 'file', 'foo', 'bar', 'baz', 'bat']);
    input.bind(new InputDefinition([new InputArgument('name', InputArgument.IS_ARRAY)]));

    assert.deepEqual({'name': ['foo', 'bar', 'baz', 'bat']}, input.getArguments(), '.parse() parses array arguments');
  });

  it('testParseArrayOption', () =>
  {
    let input = new ArgvInput(['node' , 'file', '--name=foo', '--name=bar', '--name=baz']);
    input.bind(new InputDefinition([new InputOption('name', null, InputOption.VALUE_OPTIONAL | InputOption.VALUE_IS_ARRAY)]));

    assert.deepEqual({'name': ['foo', 'bar', 'baz']}, input.getOptions(), '.parse() parses array options ("--option=value" syntax)');

    input = new ArgvInput(['node' , 'file', '--name', 'foo', '--name', 'bar', '--name', 'baz']);
    input.bind(new InputDefinition([new InputOption('name', null, InputOption.VALUE_OPTIONAL | InputOption.VALUE_IS_ARRAY)]));
    assert.deepEqual({'name': ['foo', 'bar', 'baz']}, input.getOptions(), '.parse() parses array options ("--option value" syntax)');

    input = new ArgvInput(['node' , 'file', '--name=foo', '--name=bar', '--name=']);
    input.bind(new InputDefinition([new InputOption('name', null, InputOption.VALUE_OPTIONAL | InputOption.VALUE_IS_ARRAY)]));
    assert.deepEqual({'name': ['foo', 'bar', '']}, input.getOptions(), '.parse() parses empty array options as null ("--option=value" syntax)');

    input = new ArgvInput(['node' , 'file', '--name', 'foo', '--name', 'bar', '--name', '--anotherOption']);
    input.bind(new InputDefinition([
      new InputOption('name', null, InputOption.VALUE_OPTIONAL | InputOption.VALUE_IS_ARRAY),
      new InputOption('anotherOption', null, InputOption.VALUE_NONE),
    ]));
    assert.deepEqual({
      'name': ['foo', 'bar', null],
      'anotherOption': true
    }, input.getOptions(), '.parse() parses empty array options ("--option value" syntax)');
  });

  it('testParseNegativeNumberAfterDoubleDash', () =>
  {
    let input = new ArgvInput(['node' , 'file', '--', '-1']);
    input.bind(new InputDefinition([new InputArgument('number')]));
    assert.deepEqual({'number': '-1'}, input.getArguments(), '.parse() parses arguments with leading dashes as arguments after having encountered a double-dash sequence');

    input = new ArgvInput(['node' , 'file', '-f', 'bar', '--', '-1']);
    input.bind(new InputDefinition([new InputArgument('number'), new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL)]));
    assert.deepEqual({'foo': 'bar'}, input.getOptions(), '.parse() parses arguments with leading dashes as options before having encountered a double-dash sequence');
    assert.deepEqual({'number': '-1'}, input.getArguments(), '.parse() parses arguments with leading dashes as arguments after having encountered a double-dash sequence');
  });

  it('testParseEmptyStringArgument', () =>
  {
    let input = new ArgvInput(['node' , 'file', '-f', 'bar', '']);
    input.bind(new InputDefinition([new InputArgument('empty'), new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL)]));

    assert.deepEqual({'empty': ''}, input.getArguments(), '.parse() parses empty string arguments');
  });

  it('testGetFirstArgument', () =>
  {
    let input = new ArgvInput(['node' , 'file', '-fbbar']);
    assert.isNull(input.getFirstArgument(), '.getFirstArgument() returns null when there is no arguments');

    input = new ArgvInput(['node' , 'file', '-fbbar', 'foo']);
    assert.deepEqual('foo', input.getFirstArgument(), '.getFirstArgument() returns the first argument from the raw input');

    input = new ArgvInput(['node' , 'file', '--foo', 'fooval', 'bar']);
    input.bind(new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputArgument('arg')]));
    assert.deepEqual('bar', input.getFirstArgument());

    input = new ArgvInput(['node' , 'file', '-bf', 'fooval', 'argval']);
    input.bind(new InputDefinition([new InputOption('bar', 'b', InputOption.VALUE_NONE), new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputArgument('arg')]));
    assert.deepEqual('argval', input.getFirstArgument());
  });

  it('testHasParameterOption', () =>
  {
    let input = new ArgvInput(['node' , 'file', '-f', 'foo']);
    assert.isTrue(input.hasParameterOption('-f'), '.hasParameterOption() returns true if the given short option is in the raw input');

    input = new ArgvInput(['node' , 'file', '-etest']);
    assert.isTrue(input.hasParameterOption('-e'), '.hasParameterOption() returns true if the given short option is in the raw input');
    assert.isFalse(input.hasParameterOption('-s'), '.hasParameterOption() returns true if the given short option is in the raw input');

    input = new ArgvInput(['node' , 'file', '--foo', 'foo']);
    assert.isTrue(input.hasParameterOption('--foo'), '.hasParameterOption() returns true if the given short option is in the raw input');

    input = new ArgvInput(['node' , 'file', 'foo']);
    assert.isFalse(input.hasParameterOption('--foo'), '.hasParameterOption() returns false if the given short option is not in the raw input');

    input = new ArgvInput(['node' , 'file', '--foo=bar']);
    assert.isTrue(input.hasParameterOption('--foo'), '.hasParameterOption() returns true if the given option with provided value is in the raw input');
  });

  it('testHasParameterOptionOnlyOptions', () =>
  {
    let input = new ArgvInput(['node' , 'file', '-f', 'foo']);
    assert.isTrue(input.hasParameterOption('-f', true), '.hasParameterOption() returns true if the given short option is in the raw input');

    input = new ArgvInput(['node' , 'file', '--foo', '--', 'foo']);
    assert.isTrue(input.hasParameterOption('--foo', true), '.hasParameterOption() returns true if the given long option is in the raw input');

    input = new ArgvInput(['node' , 'file', '--foo=bar', 'foo']);
    assert.isTrue(input.hasParameterOption('--foo', true), '.hasParameterOption() returns true if the given long option with provided value is in the raw input');

    input = new ArgvInput(['node' , 'file', '--', '--foo']);
    assert.isFalse(input.hasParameterOption('--foo', true), '.hasParameterOption() returns false if the given option is in the raw input but after an end of options signal');
  });

  it('testHasParameterOptionEdgeCasesAndLimitations', () =>
  {
    let input = new ArgvInput(['node' , 'file', '-fh']);
    // hasParameterOption does not know if the previous short option, -f,
    // takes a value or not +  If -f takes a value, then -fh does NOT include
    // -h; Otherwise it does +  Since we do not know which short options take
    // values, hasParameterOption does not support this use-case +
    assert.isFalse(input.hasParameterOption('-h'), '.hasParameterOption() returns true if the given short option is in the raw input');
    // hasParameterOption does detect that `-fh` contains `-f`, since
    // `-f` is the first short option in the set +
    assert.isTrue(input.hasParameterOption('-f'), '.hasParameterOption() returns true if the given short option is in the raw input');
    // The test below happens to pass, although it might make more sense
    // to disallow it, and require the use of
    // input.hasParameterOption('-f') && input.hasParameterOption('-h')
    // instead +
    assert.isTrue(input.hasParameterOption('-fh'), '.hasParameterOption() returns true if the given short option is in the raw input');
    // In theory, if -fh is supported, then -hf should also work +
    // However, this is not supported +
    assert.isFalse(input.hasParameterOption('-hf'), '.hasParameterOption() returns true if the given short option is in the raw input');

    input = new ArgvInput(['node' , 'file', '-f', '-h']);
    // If hasParameterOption('-fh') is supported for 'cli + php -fh', then
    // one might also expect that it should also be supported for
    // 'cli + php -f -h' +  However, this is not supported +
    assert.isFalse(input.hasParameterOption('-fh'), '.hasParameterOption() returns true if the given short option is in the raw input');
  });

  it('testNoWarningOnInvalidParameterOption', () =>
  {
    let input = new ArgvInput(['node' , 'file', '-edev']);

    assert.isTrue(input.hasParameterOption(['-e', '']));
    // No warning thrown
    assert.isFalse(input.hasParameterOption(['-m', '']));

    assert.deepEqual('dev', input.getParameterOption(['-e', '']));
    // No warning thrown
    assert.isFalse(input.getParameterOption(['-m', '']));
  });

  it('testToString', () =>
  {
    let input = new ArgvInput(['node' , 'file', '-f', 'foo']);
    assert.deepEqual('-f foo', input.toString());

    input = new ArgvInput(['node' , 'file', '-f', '--bar=foo', 'a b c d', "A\nB'C"]);
    assert.deepEqual('-f --bar=foo ' + escapeshellarg('a b c d') + ' ' + escapeshellarg("A\nB'C"), input.toString());
  });

  it('testGetParameterOptionEqualSign', () =>
  {
    provideGetParameterOptionValues().forEach(([argv, key, fallback, onlyParams, expected])=>{
      let input = new ArgvInput(argv);
      assert.deepEqual(expected, input.getParameterOption(key, fallback, onlyParams), '.getParameterOption() returns the expected value');
    });
  });

  it('testParseSingleDashAsArgument', () =>
  {
    let input = new ArgvInput(['node' , 'file', '-']);
    input.bind(new InputDefinition([new InputArgument('file')]));
    assert.deepEqual({'file': '-'}, input.getArguments(), '.parse() parses single dash as an argument');
  });

  it('testParseOptionWithValueOptionalGivenEmptyAndRequiredArgument', () =>
  {
    let input = new ArgvInput(['node' , 'file', '--foo=', 'bar']);
    input.bind(new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputArgument('name', InputArgument.REQUIRED)]));
    assert.deepEqual({'foo': ''}, input.getOptions(), '.parse() parses optional options with empty value as null');
    assert.deepEqual({'name': 'bar'}, input.getArguments(), '.parse() parses required arguments');

    input = new ArgvInput(['node' , 'file', '--foo=0', 'bar']);
    input.bind(new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputArgument('name', InputArgument.REQUIRED)]));
    assert.deepEqual({'foo': '0'}, input.getOptions(), '.parse() parses optional options with empty value as null');
    assert.deepEqual({'name': 'bar'}, input.getArguments(), '.parse() parses required arguments');
  });

  it('testParseOptionWithValueOptionalGivenEmptyAndOptionalArgument', () =>
  {
    let input = new ArgvInput(['node' , 'file', '--foo=', 'bar']);
    input.bind(new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputArgument('name', InputArgument.OPTIONAL)]));
    assert.deepEqual({'foo': ''}, input.getOptions(), '.parse() parses optional options with empty value as null');
    assert.deepEqual({'name': 'bar'}, input.getArguments(), '.parse() parses optional arguments');

    input = new ArgvInput(['node' , 'file', '--foo=0', 'bar']);
    input.bind(new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputArgument('name', InputArgument.OPTIONAL)]));
    assert.deepEqual({'foo': '0'}, input.getOptions(), '.parse() parses optional options with empty value as null');
    assert.deepEqual({'name': 'bar'}, input.getArguments(), '.parse() parses optional arguments');
  });


  function provideOptions()
  {
    return [
      [
        ['node' , 'file', '--foo'],
        [new InputOption('foo')],
        {'foo': true},
        '.parse() parses long options without a value',
      ],
      [
        ['node' , 'file', '--foo=bar'],
        [new InputOption('foo', 'f', InputOption.VALUE_REQUIRED)],
        {'foo': 'bar'},
        '.parse() parses long options with a required value (with let a = separator)',
      ],
      [
        ['node' , 'file', '--foo', 'bar'],
        [new InputOption('foo', 'f', InputOption.VALUE_REQUIRED)],
        {'foo': 'bar'},
        '.parse() parses long options with a required value (with a space separator)',
      ],
      [
        ['node' , 'file', '--foo='],
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL)],
        {'foo': ''},
        '.parse() parses long options with optional value which is empty (with a = separator) as empty string',
      ],
      [
        ['node' , 'file', '--foo=', 'bar'],
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputArgument('name', InputArgument.REQUIRED)],
        {'foo': ''},
        '.parse() parses long options with optional value without value specified or an empty string (with a = separator) followed by an argument as empty string',
      ],
      [
        ['node' , 'file', 'bar', '--foo'],
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputArgument('name', InputArgument.REQUIRED)],
        {'foo': null},
        '.parse() parses long options with optional value which is empty (with a = separator) preceded by an argument',
      ],
      [
        ['node' , 'file', '--foo', '', 'bar'],
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputArgument('name', InputArgument.REQUIRED)],
        {'foo': ''},
        '.parse() parses long options with optional value which is empty as empty string even followed by an argument',
      ],
      [
        ['node' , 'file', '--foo'],
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL)],
        {'foo': null},
        '.parse() parses long options with optional value specified with no separator and no value as null',
      ],
      [
        ['node' , 'file', '-f'],
        [new InputOption('foo', 'f')],
        {'foo': true},
        '.parse() parses short options without a value',
      ],
      [
        ['node' , 'file', '-fbar'],
        [new InputOption('foo', 'f', InputOption.VALUE_REQUIRED)],
        {'foo': 'bar'},
        '.parse() parses short options with a required value (with no separator)',
      ],
      [
        ['node' , 'file', '-f', 'bar'],
        [new InputOption('foo', 'f', InputOption.VALUE_REQUIRED)],
        {'foo': 'bar'},
        '.parse() parses short options with a required value (with a space separator)',
      ],
      [
        ['node' , 'file', '-f', ''],
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL)],
        {'foo': ''},
        '.parse() parses short options with an optional empty value',
      ],
      [
        ['node' , 'file', '-f', '', 'foo'],
        [new InputArgument('name'), new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL)],
        {'foo': ''},
        '.parse() parses short options with an optional empty value followed by an argument',
      ],
      [
        ['node' , 'file', '-f', '', '-b'],
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputOption('bar', 'b')],
        {'foo': '', 'bar': true},
        '.parse() parses short options with an optional empty value followed by an option',
      ],
      [
        ['node' , 'file', '-f', '-b', 'foo'],
        [new InputArgument('name'), new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputOption('bar', 'b')],
        {'foo': null, 'bar': true},
        '.parse() parses short options with an optional value which is not present',
      ],
      [
        ['node' , 'file', '-fb'],
        [new InputOption('foo', 'f'), new InputOption('bar', 'b')],
        {'foo': true, 'bar': true},
        '.parse() parses short options when they are aggregated as a single one',
      ],
      [
        ['node' , 'file', '-fb', 'bar'],
        [new InputOption('foo', 'f'), new InputOption('bar', 'b', InputOption.VALUE_REQUIRED)],
        {'foo': true, 'bar': 'bar'},
        '.parse() parses short options when they are aggregated as a single one and the last one has a required value',
      ],
      [
        ['node' , 'file', '-fb', 'bar'],
        [new InputOption('foo', 'f'), new InputOption('bar', 'b', InputOption.VALUE_OPTIONAL)],
        {'foo': true, 'bar': 'bar'},
        '.parse() parses short options when they are aggregated as a single one and the last one has an optional value',
      ],
      [
        ['node' , 'file', '-fbbar'],
        [new InputOption('foo', 'f'), new InputOption('bar', 'b', InputOption.VALUE_OPTIONAL)],
        {'foo': true, 'bar': 'bar'},
        '.parse() parses short options when they are aggregated as a single one and the last one has an optional value with no separator',
      ],
      [
        ['node' , 'file', '-fbbar'],
        [new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL), new InputOption('bar', 'b', InputOption.VALUE_OPTIONAL)],
        {'foo': 'bbar', 'bar': null},
        '.parse() parses short options when they are aggregated as a single one and one of them takes a value',
      ],
    ];
  }

  function provideInvalidInput()
  {
    return [
      [
        ['node' , 'file', '--foo'],
        new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_REQUIRED)]),
        'The "--foo" option requires a value.',
      ],
      [
        ['node' , 'file', '-f'],
        new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_REQUIRED)]),
        'The "--foo" option requires a value.',
      ],
      [
        ['node' , 'file', '-ffoo'],
        new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_NONE)]),
        'The "-o" option does not exist.',
      ],
      [
        ['node' , 'file', '--foo=bar'],
        new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_NONE)]),
        'The "--foo" option does not accept a value.',
      ],
      [
        ['node' , 'file', 'foo', 'bar'],
        new InputDefinition(),
        'No arguments expected, got "foo".',
      ],
      [
        ['node' , 'file', 'foo', 'bar'],
        new InputDefinition([new InputArgument('number')]),
        'Too many arguments, expected arguments "number".',
      ],
      [
        ['node' , 'file', 'foo', 'bar', 'zzz'],
        new InputDefinition([new InputArgument('number'), new InputArgument('county')]),
        'Too many arguments, expected arguments "number" "county".',
      ],
      [
        ['node' , 'file', '--foo'],
        new InputDefinition(),
        'The "--foo" option does not exist.',
      ],
      [
        ['node' , 'file', '-f'],
        new InputDefinition(),
        'The "-f" option does not exist.',
      ],
      [
        ['node' , 'file', '-1'],
        new InputDefinition([new InputArgument('number')]),
        'The "-1" option does not exist.',
      ],
      [
        ['node' , 'file', '-fЩ'],
        new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_NONE)]),
        'The "-Щ" option does not exist.',
      ],
    ];
  }

  function provideGetParameterOptionValues()
  {
    return [
      [['app/console', 'foo:bar'], '-e', 'fallback', false, 'fallback'],
      [['app/console', 'foo:bar', '-e', 'dev'], '-e', 'fallback', false, 'dev'],
      [['app/console', 'foo:bar', '--env=dev'], '--env', 'fallback', false, 'dev'],
      [['app/console', 'foo:bar', '-e', 'dev'], ['-e', '--env'], 'fallback', false, 'dev'],
      [['app/console', 'foo:bar', '--env=dev'], ['-e', '--env'], 'fallback', false, 'dev'],
      [['app/console', 'foo:bar', '--env=dev', '--en=1'], ['--en'], 'fallback', false, '1'],
      [['app/console', 'foo:bar', '--env=dev', '', '--en=1'], ['--en'], 'fallback', false, '1'],
      [['app/console', 'foo:bar', '--env', 'val'], '--env', 'fallback', false, 'val'],
      [['app/console', 'foo:bar', '--env', 'val', '--dummy'], '--env', 'fallback', false, 'val'],
      [['app/console', 'foo:bar', '--', '--env=dev'], '--env', 'fallback', false, 'dev'],
      [['app/console', 'foo:bar', '--', '--env=dev'], '--env', 'fallback', true, 'fallback'],
    ];
  }

});
