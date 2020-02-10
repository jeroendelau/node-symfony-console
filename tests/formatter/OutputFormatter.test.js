const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const forEach = require('mocha-each');
const {substr, getenv, putenv} = require('../../src/PhpPolyfill');

const OutputFormatter = require('../../src/formatter/OutputFormatter');
const OutputFormatterStyle = require('../../src/formatter/OutputFormatterStyle');

describe('#OutputFormatter', () =>
{
  it('testEmptyTag', () =>
  {
    let formatter = new OutputFormatter(true);
    assert.deepEqual(formatter.format('foo<>bar'), 'foo<>bar');
  });

  it('testLGCharEscaping', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.deepEqual(formatter.format('foo\\<bar'), 'foo<bar');
    assert.deepEqual(formatter.format('foo << bar'), 'foo << bar');
    assert.deepEqual(formatter.format('foo << bar \\'), 'foo << bar \\');
    assert.deepEqual(formatter.format('foo << <info>bar \\ baz</info> \\'), "foo << \x1B[32mbar \\ baz\x1B[39m \\");
    assert.deepEqual(formatter.format('\\<info>some info\\</info>'), '<info>some info</info>');
    assert.deepEqual(OutputFormatter.escape('<info>some info</info>'), '\\<info>some info\\</info>');

    assert.deepEqual(
      formatter.format(`<comment>Symfony\\Component\\Console does work very well!</comment>`),
      "\x1B[33mSymfony\\Component\\Console does work very well!\x1B[39m"
    );
  });

  it('testBundledStyles', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.isTrue(formatter.hasStyle('error'));
    assert.isTrue(formatter.hasStyle('info'));
    assert.isTrue(formatter.hasStyle('comment'));
    assert.isTrue(formatter.hasStyle('question'));

    assert.deepEqual(
      "\x1B[37;41msome error\x1B[39;49m",
      formatter.format('<error>some error</error>')
    );
    assert.deepEqual(
      "\x1B[32msome info\x1B[39m",
      formatter.format('<info>some info</info>')
    );
    assert.deepEqual(
      "\x1B[33msome comment\x1B[39m",
      formatter.format('<comment>some comment</comment>')
    );
    assert.deepEqual(
      "\x1B[30;46msome question\x1B[39;49m",
      formatter.format('<question>some question</question>')
    );
  });

  it('testNestedStyles', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.deepEqual(
      "\x1B[37;41msome \x1B[39;49m\x1B[32msome info\x1B[39m\x1B[37;41m error\x1B[39;49m",
      formatter.format('<error>some <info>some info</info> error</error>')
    );
  });

  it('testAdjacentStyles', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.deepEqual(
      "\x1B[37;41msome error\x1B[39;49m\x1B[32msome info\x1B[39m",
      formatter.format('<error>some error</error><info>some info</info>')
    );
  });

  it('testStyleMatchingNotGreedy', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.deepEqual(
      "(\x1B[32m>=2 + 0,<2 + 3\x1B[39m)",
      formatter.format('(<info>>=2 + 0,<2 + 3</info>)')
    );
  });

  it('testStyleEscaping', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.deepEqual(
      formatter.format('(<info>' + OutputFormatter.escape('z>=2.0,<\\<<a2.3\\') + '</info>)'),
      "(\x1B[32mz>=2.0,<<<a2.3\\\x1B[39m)"
    );

    assert.deepEqual(
      formatter.format('<info>' + OutputFormatter.escape('<error>some error</error>') + '</info>'),
      "\x1B[32m<error>some error</error>\x1B[39m"
    );
  });

  it('testDeepNestedStyles', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.deepEqual(
      "\x1B[37;41merror\x1B[39;49m\x1B[32minfo\x1B[39m\x1B[33mcomment\x1B[39m\x1B[37;41merror\x1B[39;49m",
      formatter.format('<error>error<info>info<comment>comment</info>error</error>')
    );
  });

  it('testNewStyle', () =>
  {
    let formatter = new OutputFormatter(true);

    let style = new OutputFormatterStyle('blue', 'white');
    formatter.setStyle('test', style);

    assert.deepEqual(style, formatter.getStyle('test'));
    assert.notInclude(style, formatter.getStyle('info'));

    style = new OutputFormatterStyle('blue', 'white');
    formatter.setStyle('b', style);

    assert.deepEqual("\x1B[34;47msome \x1B[39;49m\x1B[34;47mcustom\x1B[39;49m\x1B[34;47m msg\x1B[39;49m", formatter.format('<test>some <b>custom</b> msg</test>'));
  });

  it('testRedefineStyle', () =>
  {
    let formatter = new OutputFormatter(true);

    let style = new OutputFormatterStyle('blue', 'white');
    formatter.setStyle('info', style);

    assert.deepEqual(formatter.format('<info>some custom msg</info>'), "\x1B[34;47msome custom msg\x1B[39;49m",);
  });

  it('testInlineStyle', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.deepEqual(formatter.format('<fg=blue;bg=red>some text</>'), "\x1B[34;41msome text\x1B[39;49m",);
    assert.deepEqual(formatter.format('<fg=blue;bg=red>some text</fg=blue;bg=red>'), "\x1B[34;41msome text\x1B[39;49m",);
  });

  forEach(provideInlineStyleOptionsCases()).it('testInlineStyleOptions %s', (tag, expected = null, input = null) =>
  {
    let styleString = substr(tag, 1, -1);
    let formatter = new OutputFormatter(true);
    let result = formatter.createStyleFromString(styleString);
    if (null === expected)
    {
      assert.isNull(result);
      let expected = tag + input + '</' + styleString + '>';
      assert.deepEqual(formatter.format(expected), expected,);
    } else
    {
      /* @var OutputFormatterStyle result */
      assert.instanceOf(result, OutputFormatterStyle);
      assert.deepEqual(formatter.format(tag + input + '</>'), expected,);
      assert.deepEqual(formatter.format(tag + input + '</' + styleString + '>'), expected,);
    }
  });

  it('testNonStyleTag', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.deepEqual(formatter.format('<info>some <tag> <setting=value> styled <p>single-char tag</p></info>'), "\x1B[32msome \x1B[39m\x1B[32m<tag>\x1B[39m\x1B[32m \x1B[39m\x1B[32m<setting=value>\x1B[39m\x1B[32m styled \x1B[39m\x1B[32m<p>\x1B[39m\x1B[32msingle-char tag\x1B[39m\x1B[32m</p>\x1B[39m",);
  });

  it('testFormatLongString', () =>
  {
    let formatter = new OutputFormatter(true);
    let long = '\\'.repeat(14000);
    assert.deepEqual(formatter.format('<error>some error</error>' + long), "\x1B[37;41msome error\x1B[39;49m" + long,);
  });

  it('testFormatToStringObject', () =>
  {
    let formatter = new OutputFormatter(false);
    assert.deepEqual(
      'some info', formatter.format(new TableCell())
    );
  });

  it('testFormatterHasStyles', () =>
  {
    let formatter = new OutputFormatter(false);

    assert.isTrue(formatter.hasStyle('error'));
    assert.isTrue(formatter.hasStyle('info'));
    assert.isTrue(formatter.hasStyle('comment'));
    assert.isTrue(formatter.hasStyle('question'));
  });

  forEach(provideDecoratedAndNonDecoratedOutput()).it('testNotDecoratedFormatter %s', (input, expectedNonDecoratedOutput, expectedDecoratedOutput, terminalEmulator = 'foo') =>
  {
    let prevTerminalEmulator = getenv('TERMINAL_EMULATOR');
    putenv('TERMINAL_EMULATOR=' + terminalEmulator);

    try
    {
      assert.deepEqual(expectedDecoratedOutput, (new OutputFormatter(true)).format(input));
      assert.deepEqual(expectedNonDecoratedOutput, (new OutputFormatter(false)).format(input));
    } finally
    {
      putenv('TERMINAL_EMULATOR' + (prevTerminalEmulator ? "=prevTerminalEmulator" : ''));
    }
  });

  it('testContentWithLineBreaks', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.deepEqual(`\x1B[32m
some text\x1B[39m`
      , formatter.format(`<info>
some text</info>`
      ));

    assert.deepEqual(`\x1B[32msome text
\x1B[39m`
      , formatter.format(`<info>some text
</info>`
      ));

    assert.deepEqual(`\x1B[32m
some text
\x1B[39m`
      , formatter.format(`<info>
some text
</info>`
      ));

    assert.deepEqual(`\x1B[32m
some text
more text
\x1B[39m`
      , formatter.format(`<info>
some text
more text
</info>`
      ));
  });

  it('testFormatAndWrap', () =>
  {
    let formatter = new OutputFormatter(true);

    assert.deepEqual(formatter.formatAndWrap('foo<error>bar</error> baz', 2), "fo\no\x1B[37;41mb\x1B[39;49m\n\x1B[37;41mar\x1B[39;49m\nba\nz",);
    assert.deepEqual(formatter.formatAndWrap('pre <error>foo bar baz</error> post', 2), "pr\ne \x1B[37;41m\x1B[39;49m\n\x1B[37;41mfo\x1B[39;49m\n\x1B[37;41mo \x1B[39;49m\n\x1B[37;41mba\x1B[39;49m\n\x1B[37;41mr \x1B[39;49m\n\x1B[37;41mba\x1B[39;49m\n\x1B[37;41mz\x1B[39;49m \npo\nst",);
    assert.deepEqual(formatter.formatAndWrap('pre <error>foo bar baz</error> post', 3), "pre\x1B[37;41m\x1B[39;49m\n\x1B[37;41mfoo\x1B[39;49m\n\x1B[37;41mbar\x1B[39;49m\n\x1B[37;41mbaz\x1B[39;49m\npos\nt",);
    assert.deepEqual(formatter.formatAndWrap('pre <error>foo bar baz</error> post', 4), "pre \x1B[37;41m\x1B[39;49m\n\x1B[37;41mfoo \x1B[39;49m\n\x1B[37;41mbar \x1B[39;49m\n\x1B[37;41mbaz\x1B[39;49m \npost",);
    assert.deepEqual(formatter.formatAndWrap('pre <error>foo bar baz</error> post', 5), "pre \x1B[37;41mf\x1B[39;49m\n\x1B[37;41moo ba\x1B[39;49m\n\x1B[37;41mr baz\x1B[39;49m\npost",);
    assert.deepEqual(formatter.formatAndWrap('Lorem <error>ipsum</error> dolor <info>sit</info> amet', 4), "Lore\nm \x1B[37;41mip\x1B[39;49m\n\x1B[37;41msum\x1B[39;49m \ndolo\nr \x1B[32msi\x1B[39m\n\x1B[32mt\x1B[39m am\net",);
    assert.deepEqual(formatter.formatAndWrap('Lorem <error>ipsum</error> dolor <info>sit</info> amet', 8), "Lorem \x1B[37;41mip\x1B[39;49m\n\x1B[37;41msum\x1B[39;49m dolo\nr \x1B[32msit\x1B[39m am\net",);
    //assert.deepEqual(\x1B[37;41mamet\x1B[39;49m et \x1B[32mlauda\x1B[39m\n\x1B[32mntium\x1B[39m architecto", formatter.formatAndWrap('Lorem <error>ipsum</error> dolor <info>sit</info>, <error>amet</error> et <info>laudantium</info> architecto', 18),"Lorem \x1B[37;41mipsum\x1B[39;49m dolor \x1B[32m\x1B[39m\n\x1B[32msit\x1B[39m,);

    formatter = new OutputFormatter();

    assert.deepEqual(formatter.formatAndWrap('foo<error>bar</error> baz', 2), "fo\nob\nar\nba\nz",);
    assert.deepEqual(formatter.formatAndWrap('pre <error>foo bar baz</error> post', 2), "pr\ne \nfo\no \nba\nr \nba\nz \npo\nst",);
    assert.deepEqual(formatter.formatAndWrap('pre <error>foo bar baz</error> post', 3), "pre\nfoo\nbar\nbaz\npos\nt",);
    assert.deepEqual(formatter.formatAndWrap('pre <error>foo bar baz</error> post', 4), "pre \nfoo \nbar \nbaz \npost",);
    assert.deepEqual(formatter.formatAndWrap('pre <error>foo bar baz</error> post', 5), "pre f\noo ba\nr baz\npost",);
  });


  function provideInlineStyleOptionsCases()
  {
    return [
      ['<unknown=_unknown_>'],
      ['<unknown=_unknown_;a=1;b>'],
      ['<fg=green;>', "\x1B[32m[test]\x1B[39m", '[test]'],
      ['<fg=green;bg=blue;>', "\x1B[32;44ma\x1B[39;49m", 'a'],
      ['<fg=green;options=bold>', "\x1B[32;1mb\x1B[39;22m", 'b'],
      ['<fg=green;options=reverse;>', "\x1B[32;7m<a>\x1B[39;27m", '<a>'],
      ['<fg=green;options=bold,underscore>', "\x1B[32;1;4mz\x1B[39;22;24m", 'z'],
      ['<fg=green;options=bold,underscore,reverse;>', "\x1B[32;1;4;7md\x1B[39;22;24;27m", 'd'],
    ];
  }

  function provideInlineStyleTagsWithUnknownOptions()
  {
    return [
      ['<options=abc;>', 'abc'],
      ['<options=abc,def;>', 'abc'],
      ['<fg=green;options=xyz;>', 'xyz'],
      ['<fg=green;options=efg,abc>', 'efg'],
    ];
  }

  function provideDecoratedAndNonDecoratedOutput()
  {
    return [
      ['<error>some error</error>', 'some error', "\x1B[37;41msome error\x1B[39;49m"],
      ['<info>some info</info>', 'some info', "\x1B[32msome info\x1B[39m"],
      ['<comment>some comment</comment>', 'some comment', "\x1B[33msome comment\x1B[39m"],
      ['<question>some question</question>', 'some question', "\x1B[30;46msome question\x1B[39;49m"],
      ['<fg=red>some text with inline style</>', 'some text with inline style', "\x1B[31msome text with inline style\x1B[39m"],
      ['<href=idea://open/?file=/path/SomeFile + php&line=12>some URL</>', 'some URL', "\x1B]8;;idea://open/?file=/path/SomeFile + php&line=12\x1B\\some URL\x1B]8;;\x1B\\"]
    ];
  };

  function __toString()
  {
    return '<info>some info</info>';
  }

});

class TableCell
{
  toString()
  {
    return '<info>some info</info>';
  }
}
