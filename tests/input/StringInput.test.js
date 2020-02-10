const mocha = require('mocha');
const forEach = require('mocha-each');
const chai = require('chai');
const {assert} = chai;

const {escapeshellarg} = require('../../src/PhpPolyfill');

const InputDefinition = require('../../src/input/InputDefinition');
const InputOption = require('../../src/input/InputOption');
const StringInput = require('../../src/input/StringInput');

describe('#StringInput', () =>
{
  const data = getTokenizeData();

  forEach(getTokenizeData()).
  it('input "%s" results in tokens "%s"', (inputx, tokens, message) =>
  {
      let input = new StringInput(inputx);
      //let r = new \ReflectionClass('Symfony\Component\Console\Input\ArgvInput');
      //let p = r.getProperty('tokens');
      //p.setAccessible(true);
      assert.deepEqual(tokens, input.tokens, message);
  });

  it('testInputOptionWithGivenString', () =>
  {
    let definition = new InputDefinition(
      [new InputOption('foo', null, InputOption.VALUE_REQUIRED)]
    );

    // call to bind
    let input = new StringInput('--foo=bar');
    input.bind(definition);
    assert.deepEqual('bar', input.getOption('foo'));
  });

  it('testToString', () =>
  {
    let input = new StringInput('-f foo');
    assert.deepEqual('-f foo', input.toString());

    input = new StringInput('-f --bar=foo "a b c d"');
    assert.deepEqual('-f --bar=foo ' + escapeshellarg('a b c d'), input.toString());

    input = new StringInput('-f --bar=foo \'a b c d\' ' + "'A\nB\\'C'");
    assert.deepEqual('-f --bar=foo ' + escapeshellarg('a b c d') + ' ' + escapeshellarg("A\nB'C"), input.toString());
  });


  function getTokenizeData()
  {
    return [
      ['', [], '.tokenize() parses an empty string'],
      ['foo', ['foo'], '.tokenize() parses arguments'],
      ['  foo  bar  ', ['foo', 'bar'], '.tokenize() ignores whitespaces between arguments'],
      ['"quoted"', ['quoted'], '.tokenize() parses quoted arguments'],
      ["'quoted'", ['quoted'], '.tokenize() parses quoted arguments'],
      ["'a\rb\nc\td'", ["a\rb\nc\td"], '.tokenize() parses whitespace chars in strings'],
      ["'a'\r'b'\n'c'\t'd'", ['a', 'b', 'c', 'd'], '.tokenize() parses whitespace chars between arguments as spaces'],
      ['\\"quoted\\"', ['"quoted"'], '.tokenize() parses escaped-quoted arguments'],
      ["\\'quoted\\'", ['\'quoted\''], '.tokenize() parses escaped-quoted arguments'],
      ['-a', ['-a'], '.tokenize() parses short options'],
      ['-azc', ['-azc'], '.tokenize() parses aggregated short options'],
      ['-awithavalue', ['-awithavalue'], '.tokenize() parses short options with a value'],
      ['-a"foo bar"', ['-afoo bar'], '.tokenize() parses short options with a value'],
      ['-a"foo bar""foo bar"', ['-afoo barfoo bar'], '.tokenize() parses short options with a value'],
      ['-a\'foo bar\'', ['-afoo bar'], '.tokenize() parses short options with a value'],
      ['-a\'foo bar\'\'foo bar\'', ['-afoo barfoo bar'], '.tokenize() parses short options with a value'],
      ['-a\'foo bar\'"foo bar"', ['-afoo barfoo bar'], '.tokenize() parses short options with a value'],
      ['--long-option', ['--long-option'], '.tokenize() parses long options'],
      ['--long-option=foo', ['--long-option=foo'], '.tokenize() parses long options with a value'],
      ['--long-option="foo bar"', ['--long-option=foo bar'], '.tokenize() parses long options with a value'],
      ['--long-option="foo bar""another"', ['--long-option=foo baranother'], '.tokenize() parses long options with a value'],
      ['--long-option=\'foo bar\'', ['--long-option=foo bar'], '.tokenize() parses long options with a value'],
      ["--long-option='foo bar''another'", ['--long-option=foo baranother'], '.tokenize() parses long options with a value'],
      ["--long-option='foo bar'\"another\"", ['--long-option=foo baranother'], '.tokenize() parses long options with a value'],
      ['foo -a -ffoo --long bar', ['foo', '-a', '-ffoo', '--long', 'bar'], '.tokenize() parses when several arguments and options'],
    ];
  }

});
