const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;

var thismulti;
var thisfoo;
var thisbar;
var thisfoo1;
var thisfoo2;

const InputArgument = require('../../src/input/InputArgument');
const InputDefinition = require('../../src/input/InputDefinition');
const InputOption = require('../../src/input/InputOption');

describe('#InputDefinition', () =>
{
  it('testConstructorArguments', () =>
  {
    initializeArguments();

    let definition = new InputDefinition();
    assert.deepEqual({}, definition.getArguments(), '__construct() creates a new InputDefinition object');

    definition = new InputDefinition([thisfoo, thisbar]);
    assert.deepEqual({
      'foo': thisfoo,
      'bar': thisbar
    }, definition.getArguments(), '__construct() takes an array of InputArgument objects as its first argument');
  });

  it('testConstructorOptions', () =>
  {
    initializeOptions();

    let definition = new InputDefinition();
    assert.deepEqual({}, definition.getOptions(), '__construct() creates a new InputDefinition object');

    definition = new InputDefinition([thisfoo, thisbar]);
    assert.deepEqual({
      'foo': thisfoo,
      'bar': thisbar
    }, definition.getOptions(), '__construct() takes an array of InputOption objects as its first argument');
  });

  it('testSetArguments', () =>
  {
    initializeArguments();

    let definition = new InputDefinition();
    definition.setArguments([thisfoo]);
    assert.deepEqual({'foo': thisfoo}, definition.getArguments(), '.setArguments() sets the array of InputArgument objects');
    definition.setArguments([thisbar]);

    assert.deepEqual({'bar': thisbar}, definition.getArguments(), '.setArguments() clears all InputArgument objects');
  });

  it('testAddArguments', () =>
  {
    initializeArguments();

    let definition = new InputDefinition();
    definition.addArguments([thisfoo]);
    assert.deepEqual({'foo': thisfoo}, definition.getArguments(), '.addArguments() adds an array of InputArgument objects');
    definition.addArguments([thisbar]);
    assert.deepEqual({
      'foo': thisfoo,
      'bar': thisbar
    }, definition.getArguments(), '.addArguments() does not clear existing InputArgument objects');
  });

  it('testAddArgument', () =>
  {
    initializeArguments();

    let definition = new InputDefinition();
    definition.addArgument(thisfoo);
    assert.deepEqual({'foo': thisfoo}, definition.getArguments(), '.addArgument() adds a InputArgument object');
    definition.addArgument(thisbar);
    assert.deepEqual({
      'foo': thisfoo,
      'bar': thisbar
    }, definition.getArguments(), '.addArgument() adds a InputArgument object');
  });

  it('testArgumentsMustHaveDifferentNames', () =>
  {

    assert.throws(() =>
    {
      initializeArguments();
      let definition = new InputDefinition();
      definition.addArgument(thisfoo);
      definition.addArgument(thisfoo1);
    }, 'An argument with name "foo" already exists.');

  });

  it('testArrayArgumentHasToBeLast', () =>
  {

    assert.throws(() =>
    {
      initializeArguments();
      let definition = new InputDefinition();
      definition.addArgument(new InputArgument('fooarray', InputArgument.IS_ARRAY));
      definition.addArgument(new InputArgument('anotherbar'));
    }, 'Cannot add an argument after an array argument.');

  });

  it('testRequiredArgumentCannotFollowAnOptionalOne', () =>
  {

    assert.throws(() =>
    {
      initializeArguments();
      let definition = new InputDefinition();
      definition.addArgument(thisfoo);
      definition.addArgument(thisfoo2);
    }, 'Cannot add a required argument after an optional one.');

  });

  it('testGetArgument', () =>
  {
    initializeArguments();

    let definition = new InputDefinition();
    definition.addArguments([thisfoo]);
    assert.deepEqual(thisfoo, definition.getArgument('foo'), '.getArgument() returns a InputArgument by its name');
  });

  it('testGetInvalidArgument', () =>
  {

    assert.throws(() =>
    {
      initializeArguments();
      let definition = new InputDefinition();
      definition.addArguments([thisfoo]);
      definition.getArgument('bar');
    }, 'The "bar" argument does not exist.');

  });

  it('testHasArgument', () =>
  {
    initializeArguments();

    let definition = new InputDefinition();
    definition.addArguments([thisfoo]);

    assert.isTrue(definition.hasArgument('foo'), '.hasArgument() returns true if a InputArgument exists for the given name');
    assert.isFalse(definition.hasArgument('bar'), '.hasArgument() returns false if a InputArgument exists for the given name');
  });

  it('testGetArgumentRequiredCount', () =>
  {
    initializeArguments();

    let definition = new InputDefinition();
    definition.addArgument(thisfoo2);
    assert.deepEqual(1, definition.getArgumentRequiredCount(), '.getArgumentRequiredCount() returns the number of required arguments');
    definition.addArgument(thisfoo);
    assert.deepEqual(1, definition.getArgumentRequiredCount(), '.getArgumentRequiredCount() returns the number of required arguments');
  });

  it('testGetArgumentCount', () =>
  {
    initializeArguments();

    let definition = new InputDefinition();
    definition.addArgument(thisfoo2);
    assert.deepEqual(1, definition.getArgumentCount(), '.getArgumentCount() returns the number of arguments');
    definition.addArgument(thisfoo);
    assert.deepEqual(2, definition.getArgumentCount(), '.getArgumentCount() returns the number of arguments');
  });

  it('testGetArgumentDefaults', () =>
  {
    let definition = new InputDefinition([
      new InputArgument('foo1', InputArgument.OPTIONAL),
      new InputArgument('foo2', InputArgument.OPTIONAL, '', 'fallback'),
      new InputArgument('foo3', InputArgument.OPTIONAL | InputArgument.IS_ARRAY),
      //  new InputArgument('foo4', InputArgument.OPTIONAL | InputArgument.IS_ARRAY, '', [1, 2]),
    ]);
    assert.deepEqual({
      'foo1': null,
      'foo2': 'fallback',
      'foo3': []
    }, definition.getArgumentFallbacks(), '.getArgumentFallbacks() return the fallback values for each argument');

    definition = new InputDefinition([
      new InputArgument('foo4', InputArgument.OPTIONAL | InputArgument.IS_ARRAY, '', [1, 2]),
    ]);
    assert.deepEqual({'foo4': [1, 2]}, definition.getArgumentFallbacks(), '.getArgumentFallbacks() return the fallback values for each argument');
  });

  it('testSetOptions', () =>
  {
    initializeOptions();

    let definition = new InputDefinition([thisfoo]);
    assert.deepEqual({'foo': thisfoo}, definition.getOptions(), '.setOptions() sets the array of InputOption objects');
    definition.setOptions([thisbar]);
    assert.deepEqual({'bar': thisbar}, definition.getOptions(), '.setOptions() clears all InputOption objects');
  });

  it('testSetOptionsClearsOptions', () =>
  {

    assert.throws(() =>
    {
      initializeOptions();
      let definition = new InputDefinition([thisfoo]);
      definition.setOptions([thisbar]);
      definition.getOptionForShortcut('f');
    }, 'The "-f" option does not exist.');

  });

  it('testAddOptions', () =>
  {
    initializeOptions();

    let definition = new InputDefinition([thisfoo]);
    assert.deepEqual({'foo': thisfoo}, definition.getOptions(), '.addOptions() adds an array of InputOption objects');
    definition.addOptions([thisbar]);
    assert.deepEqual({
      'foo': thisfoo,
      'bar': thisbar
    }, definition.getOptions(), '.addOptions() does not clear existing InputOption objects');
  });

  it('testAddOption', () =>
  {
    initializeOptions();

    let definition = new InputDefinition();
    definition.addOption(thisfoo);
    assert.deepEqual({'foo': thisfoo}, definition.getOptions(), '.addOption() adds a InputOption object');
    definition.addOption(thisbar);
    assert.deepEqual({
      'foo': thisfoo,
      'bar': thisbar
    }, definition.getOptions(), '.addOption() adds a InputOption object');
  });

  it('testAddDuplicateOption', () =>
  {

    assert.throws(() =>
    {
      initializeOptions();
      let definition = new InputDefinition();
      definition.addOption(thisfoo);
      definition.addOption(thisfoo2);
    }, 'An option named "foo" already exists.');

  });

  it('testAddDuplicateShortcutOption', () =>
  {

    assert.throws(() =>
    {
      initializeOptions();
      let definition = new InputDefinition();
      definition.addOption(thisfoo);
      definition.addOption(thisfoo1);
    }, 'An option with shortcut "f" already exists.');

  });

  it('testGetOption', () =>
  {
    initializeOptions();

    let definition = new InputDefinition([thisfoo]);
    assert.deepEqual(thisfoo, definition.getOption('foo'), '.getOption() returns a InputOption by its name');
  });

  it('testGetInvalidOption', () =>
  {

    assert.throws(() =>
    {
      initializeOptions();
      let definition = new InputDefinition([thisfoo]);
      definition.getOption('bar');
    }, 'The "--bar" option does not exist.');

  });

  it('testHasOption', () =>
  {
    initializeOptions();

    let definition = new InputDefinition([thisfoo]);
    assert.isTrue(definition.hasOption('foo'), '.hasOption() returns true if a InputOption exists for the given name');
    assert.isFalse(definition.hasOption('bar'), '.hasOption() returns false if a InputOption exists for the given name');
  });

  it('testHasShortcut', () =>
  {
    initializeOptions();

    let definition = new InputDefinition([thisfoo]);
    assert.isTrue(definition.hasShortcut('f'), '.hasShortcut() returns true if a InputOption exists for the given shortcut');
    assert.isFalse(definition.hasShortcut('b'), '.hasShortcut() returns false if a InputOption exists for the given shortcut');
  });

  it('testGetOptionForShortcut', () =>
  {
    initializeOptions();

    let definition = new InputDefinition([thisfoo]);
    assert.deepEqual(thisfoo, definition.getOptionForShortcut('f'), '.getOptionForShortcut() returns a InputOption by its shortcut');
  });

  it('testGetOptionForMultiShortcut', () =>
  {
    initializeOptions();

    let definition = new InputDefinition([thismulti]);
    assert.deepEqual(thismulti, definition.getOptionForShortcut('m'), '.getOptionForShortcut() returns a InputOption by its shortcut');
    assert.deepEqual(thismulti, definition.getOptionForShortcut('mmm'), '.getOptionForShortcut() returns a InputOption by its shortcut');
  });

  it('testGetOptionForInvalidShortcut', () =>
  {

    assert.throws(() =>
    {
      initializeOptions();
      let definition = new InputDefinition([thisfoo]);
      definition.getOptionForShortcut('l');
    }, 'The "-l" option does not exist.');

  });

  it('testGetOptionDefaults', () =>
  {
    let definition = new InputDefinition([
      new InputOption('foo1', null, InputOption.VALUE_NONE),
      new InputOption('foo2', null, InputOption.VALUE_REQUIRED),
      new InputOption('foo3', null, InputOption.VALUE_REQUIRED, '', 'fallback'),
      new InputOption('foo4', null, InputOption.VALUE_OPTIONAL),
      new InputOption('foo5', null, InputOption.VALUE_OPTIONAL, '', 'fallback'),
      new InputOption('foo6', null, InputOption.VALUE_OPTIONAL | InputOption.VALUE_IS_ARRAY),
      new InputOption('foo7', null, InputOption.VALUE_OPTIONAL | InputOption.VALUE_IS_ARRAY, '', [1, 2]),
    ]);
    let fallbacks = {
      'foo1': false,
      'foo2': null,
      'foo3': 'fallback',
      'foo4': null,
      'foo5': 'fallback',
      'foo6': [],
      'foo7': [1, 2],
    };
    assert.deepEqual(fallbacks, definition.getOptionFallbacks(), '.getOptionFallbacks() returns the fallback values for all options');
  });

  it('testGetSynopsis', () =>
  {
    let data = getGetSynopsisData();
    data.forEach(([definition, expectedSynopsis, message]) => {
      assert.deepEqual(expectedSynopsis, definition.getSynopsis(), message ? '.getSynopsis() '.message : '');
    });
  });

  it('testGetShortSynopsis', () =>
  {
    let definition = new InputDefinition([new InputOption('foo'), new InputOption('bar'), new InputArgument('cat')]);
    assert.deepEqual('[options] [--] [<cat>]', definition.getSynopsis(true), '.getSynopsis(true) groups options in [options]');
  });


  function getGetSynopsisData()
  {
    return [
      [new InputDefinition([new InputOption('foo')]), '[--foo]', 'puts optional options in square brackets'],
      [new InputDefinition([new InputOption('foo', 'f')]), '[-f|--foo]', 'separates shortcut with a pipe'],
      [new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_REQUIRED)]), '[-f|--foo FOO]', 'uses shortcut as value placeholder'],
      [new InputDefinition([new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL)]), '[-f|--foo [FOO]]', 'puts optional values in square brackets'],

      [new InputDefinition([new InputArgument('foo', InputArgument.REQUIRED)]), '<foo>', 'puts arguments in angle brackets'],
      [new InputDefinition([new InputArgument('foo')]), '[<foo>]', 'puts optional arguments in square brackets'],
      [new InputDefinition([new InputArgument('foo'), new InputArgument('bar')]), '[<foo> [<bar>]]', 'chains optional arguments inside brackets'],
      [new InputDefinition([new InputArgument('foo', InputArgument.IS_ARRAY)]), '[<foo>...]', 'uses an ellipsis for array arguments'],
      [new InputDefinition([new InputArgument('foo', InputArgument.REQUIRED | InputArgument.IS_ARRAY)]), '<foo>...', 'uses an ellipsis for required array arguments'],

      [new InputDefinition([new InputOption('foo'), new InputArgument('foo', InputArgument.REQUIRED)]), '[--foo] [--] <foo>', 'puts [--] between options and arguments'],
    ];
  }

  function initializeArguments()
  {
    thisfoo = new InputArgument('foo');
    thisbar = new InputArgument('bar');
    thisfoo1 = new InputArgument('foo');
    thisfoo2 = new InputArgument('foo2', InputArgument.REQUIRED);
  }

  function initializeOptions()
  {
    thisfoo = new InputOption('foo', 'f');
    thisbar = new InputOption('bar', 'b');
    thisfoo1 = new InputOption('fooBis', 'f');
    thisfoo2 = new InputOption('foo', 'p');
    thismulti = new InputOption('multi', 'm|mm|mmm');
  }

});
