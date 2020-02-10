const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const {putenv, getenv} = require('../../src/PhpPolyfill');

const OutputFormatterStyle = require('../../src/formatter/OutputFormatterStyle');

describe('#OutputFormatterStyle', () =>
{
  it('testConstructor', () =>
  {
    let style = new OutputFormatterStyle('green', 'black', ['bold', 'underscore']);
    assert.deepEqual("\x1B[32;40;1;4mfoo\x1B[39;49;22;24m", style.apply('foo'));

    style = new OutputFormatterStyle('red', null, ['blink']);
    assert.deepEqual("\x1B[31;5mfoo\x1B[39;25m", style.apply('foo'));

    style = new OutputFormatterStyle(null, 'white');
    assert.deepEqual("\x1B[47mfoo\x1B[49m", style.apply('foo'));
  });

  it('testForeground', () =>
  {

    assert.throws(() =>
    {
      let style = new OutputFormatterStyle();
      style.setForeground('black');
      assert.deepEqual("\x1B[30mfoo\x1B[39m", style.apply('foo'));
      style.setForeground('blue');
      assert.deepEqual("\x1B[34mfoo\x1B[39m", style.apply('foo'));
      style.setForeground('fallback');
      assert.deepEqual("\x1B[39mfoo\x1B[39m", style.apply('foo'));
      style.setForeground('undefined-color');
    }, '');

  });

  it('testBackground', () =>
  {

    assert.throws(() =>
    {
      let style = new OutputFormatterStyle();
      style.setBackground('black');
      assert.deepEqual("\x1B[40mfoo\x1B[49m", style.apply('foo'));
      style.setBackground('yellow');
      assert.deepEqual("\x1B[43mfoo\x1B[49m", style.apply('foo'));
      style.setBackground('fallback');
      assert.deepEqual("\x1B[49mfoo\x1B[49m", style.apply('foo'));
      style.setBackground('undefined-color');
    }, '');

  });

  it('testOptions', () =>
  {
    let style = new OutputFormatterStyle();

    style.setOptions(['reverse', 'conceal']);
    assert.deepEqual("\x1B[7;8mfoo\x1B[27;28m", style.apply('foo'));

    style.setOption('bold');
    assert.deepEqual("\x1B[7;8;1mfoo\x1B[27;28;22m", style.apply('foo'));

    style.unsetOption('reverse');
    assert.deepEqual("\x1B[8;1mfoo\x1B[28;22m", style.apply('foo'));

    style.setOption('bold');
    assert.deepEqual("\x1B[8;1mfoo\x1B[28;22m", style.apply('foo'));

    style.setOptions(['bold']);
    assert.deepEqual("\x1B[1mfoo\x1B[22m", style.apply('foo'));

    try
    {
      style.setOption('foo');
      this.fail('.setOption() throws an \Error when the option does not exist in the available options');
    } catch (e)
    {
      assert.instanceOf( e, Error, '.setOption() throws an \Error when the option does not exist in the available options');
      assert.include(e.message, 'Invalid option specified: "foo"', '.setOption() throws an \Error when the option does not exist in the available options');
    }

    try
    {
      style.unsetOption('foo');
      this.fail('.unsetOption() throws an \Error when the option does not exist in the available options');
    } catch (e)
    {
      assert.instanceOf( e, Error, '.unsetOption() throws an \Error when the option does not exist in the available options');
      assert.include( e.message, 'Invalid option specified: "foo"', '.unsetOption() throws an Error when the option does not exist in the available options');
    }
  });

  it('testHref', () =>
  {
    let prevTerminalEmulator = getenv('TERMINAL_EMULATOR');
    putenv('TERMINAL_EMULATOR');

    let style = new OutputFormatterStyle();

    try
    {
      style.setHref('idea://open/?file=/path/SomeFile.php&line=12');
      assert.deepEqual(style.apply('some URL'), `\x1B]8;;idea://open/?file=/path/SomeFile.php&line=12\x1B\\some URL\x1B]8;;\x1B\\`);
    } finally
    {
      putenv('TERMINAL_EMULATOR' + (prevTerminalEmulator ? "=$prevTerminalEmulator" : ''));
    }
  });


});
