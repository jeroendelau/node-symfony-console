const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const forEach = require('mocha-each');
const delay = require('delay');

const {iterator_to_array, rtrim, putenv, PHP_EOL, getenv} = require('../../src/PhpPolyfill');

const OutputFormatter = require('../../src/formatter/OutputFormatter');
const Helper = require('../../src/helper/Helper');
const ProgressBar = require('../../src/helper/ProgressBar');
const ConsoleSectionOutput = require('../../src/output/ConsoleSectionOutput');
const StreamOutput = require('../../src/output/StreamOutput');
const stdOutMock = require('../stdOutMock');
const Terminal = require('../../src/Terminal');


describe('#ProgressBar', () => {
  it('testMultipleStart', () => {
    const output = getOutputStream();
    let bar = new ProgressBar(output, 0, 0);
    bar.start();
    bar.advance();
    bar.start();

    assert.deepEqual(
      output.getStream().rawInput,
      '    0 [>---------------------------]' +
      generateOutput('    1 [->--------------------------]') +
      generateOutput('    0 [>---------------------------]'),
    );
  });

  it('testAdvance', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.start();
    bar.advance();


    assert.deepEqual(
      output.getStream().rawInput,
      '    0 [>---------------------------]' +
      generateOutput('    1 [->--------------------------]')
    );
  });

  it('testAdvanceWithStep', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.start();
    bar.advance(5);


    assert.deepEqual(
      output.getStream().rawInput,
      '    0 [>---------------------------]' +
      generateOutput('    5 [----->----------------------]')
    );
  });

  it('testAdvanceMultipleTimes', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.start();
    bar.advance(3);
    bar.advance(2);


    assert.deepEqual(
      output.getStream().rawInput,
      '    0 [>---------------------------]' +
      generateOutput('    3 [--->------------------------]') +
      generateOutput('    5 [----->----------------------]')
    );
  });

  it('testAdvanceOverMax', () => {
    let bar = new ProgressBar(output = getOutputStream(), 10, 0);
    bar.setProgress(9);
    bar.advance();
    bar.advance();


    assert.deepEqual(
      output.getStream().rawInput,
      '  9/10 [=========================>--]  90%' +
      generateOutput(' 10/10 [============================] 100%') +
      generateOutput(' 11/11 [============================] 100%')
    );
  });

  it('testRegress', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.start();
    bar.advance();
    bar.advance();
    bar.advance(-1);


    assert.deepEqual(
      output.getStream().rawInput,
      '    0 [>---------------------------]' +
      generateOutput('    1 [->--------------------------]') +
      generateOutput('    2 [-->-------------------------]') +
      generateOutput('    1 [->--------------------------]')
    );
  });

  it('testRegressWithStep', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.start();
    bar.advance(4);
    bar.advance(4);
    bar.advance(-2);


    assert.deepEqual(
      output.getStream().rawInput,
      '    0 [>---------------------------]' +
      generateOutput('    4 [---->-----------------------]') +
      generateOutput('    8 [-------->-------------------]') +
      generateOutput('    6 [------>---------------------]')
    );
  });

  it('testRegressMultipleTimes', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.start();
    bar.advance(3);
    bar.advance(3);
    bar.advance(-1);
    bar.advance(-2);


    assert.deepEqual(
      output.getStream().rawInput,
      '    0 [>---------------------------]' +
      generateOutput('    3 [--->------------------------]') +
      generateOutput('    6 [------>---------------------]') +
      generateOutput('    5 [----->----------------------]') +
      generateOutput('    3 [--->------------------------]')
    );
  });

  it('testRegressBelowMin', () => {
    let bar = new ProgressBar(output = getOutputStream(), 10, 0);
    bar.setProgress(1);
    bar.advance(-1);
    bar.advance(-1);


    assert.deepEqual(
      output.getStream().rawInput,
      '  1/10 [==>-------------------------]  10%' +
      generateOutput('  0/10 [>---------------------------]   0%'),
    );
  });

  it('testFormat', () => {
    expected =
      '  0/10 [>---------------------------]   0%' +
      generateOutput(' 10/10 [============================] 100%')
    ;

    // max in construct, no format
    let bar = new ProgressBar(output = getOutputStream(), 10, 0);
    bar.start();
    bar.advance(10);
    bar.finish();


    assert.deepEqual(expected, output.getStream().rawInput);

    // max in start, no format
    bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.start(10);
    bar.advance(10);
    bar.finish();


    assert.deepEqual(expected, output.getStream().rawInput);

    // max in construct, explicit format before
    bar = new ProgressBar(output = getOutputStream(), 10, 0);
    bar.setFormat('normal');
    bar.start();
    bar.advance(10);
    bar.finish();


    assert.deepEqual(expected, output.getStream().rawInput);

    // max in start, explicit format before
    bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.setFormat('normal');
    bar.start(10);
    bar.advance(10);
    bar.finish();


    assert.deepEqual(expected, output.getStream().rawInput);
  });

  it('testCustomizations', () => {
    let bar = new ProgressBar(output = getOutputStream(), 10, 0);
    bar.setBarWidth(10);
    bar.setBarCharacter('_');
    bar.setEmptyBarCharacter(' ');
    bar.setProgressCharacter('/');
    bar.setFormat(' %current%/%max% [%bar%] %percent:3s%%');
    bar.start();
    bar.advance();


    assert.deepEqual(
      '  0/10 [/         ]   0%' +
      generateOutput('  1/10 [_/        ]  10%'),
      output.getStream().rawInput
    );
  });

  it('testDisplayWithoutStart', () => {
    let bar = new ProgressBar(output = getOutputStream(), 50, 0);
    bar.display();


    assert.deepEqual(
      '  0/50 [>---------------------------]   0%',
      output.getStream().rawInput
    );
  });

  it('testDisplayWithQuietVerbosity', () => {
    let bar = new ProgressBar(output = getOutputStream(true, StreamOutput.VERBOSITY_QUIET), 50, 0);
    bar.display();


    assert.deepEqual(
      '',
      output.getStream().rawInput
    );
  });

  it('testFinishWithoutStart', () => {
    let bar = new ProgressBar(output = getOutputStream(), 50, 0);
    bar.finish();


    assert.deepEqual(
      ' 50/50 [============================] 100%',
      output.getStream().rawInput
    );
  });

  it('testPercent', () => {
    let bar = new ProgressBar(output = getOutputStream(), 50, 0);
    bar.start();
    bar.display();
    bar.advance();
    bar.advance();


    assert.deepEqual(
      '  0/50 [>---------------------------]   0%' +
      generateOutput('  1/50 [>---------------------------]   2%') +
      generateOutput('  2/50 [=>--------------------------]   4%'),
      output.getStream().rawInput
    );
  });

  it('testOverwriteWithShorterLine', () => {
    let output = getOutputStream()
    let bar = new ProgressBar(output, 50, 0);
    bar.setFormat(' %current%/%max% [%bar%] %percent:3s%%');
    bar.start();
    bar.display();
    bar.advance();

    // set shorter format
    bar.setFormat(' %current%/%max% [%bar%]');
    bar.advance();


    assert.deepEqual(
      '  0/50 [>---------------------------]   0%' +
      generateOutput('  1/50 [>---------------------------]   2%') +
      generateOutput('  2/50 [=>--------------------------]'),
      output.getStream().rawInput
    );
  });

  it('testOverwriteWithSectionOutput', () => {
    let sections = [];
    stream = getOutputStream(true);
    let output = new ConsoleSectionOutput(stream.getStream(), sections, stream.getVerbosity(), stream.isDecorated(), new OutputFormatter());

    let bar = new ProgressBar(output, 50, 0);
    bar.start();
    bar.display();
    bar.advance();
    bar.advance();


    assert.deepEqual(
      '  0/50 [>---------------------------]   0%' + PHP_EOL +
      "\x1b[1A\x1b[0J" + '  1/50 [>---------------------------]   2%' + PHP_EOL +
      "\x1b[1A\x1b[0J" + '  2/50 [=>--------------------------]   4%' + PHP_EOL,
      output.getStream().rawInput
    );
  });

  it('testOverwriteMultipleProgressBarsWithSectionOutputs', () => {
    const sections = [];
    const stream = getOutputStream(true);
    const output1 = new ConsoleSectionOutput(stream.getStream(), sections, stream.getVerbosity(), stream.isDecorated(), new OutputFormatter());
    const output2 = new ConsoleSectionOutput(stream.getStream(), sections, stream.getVerbosity(), stream.isDecorated(), new OutputFormatter());

    const progress = new ProgressBar(output1, 50, 0);
    const progress2 = new ProgressBar(output2, 50, 0);

    progress.start();
    progress2.start();

    progress2.advance();
    progress.advance();

    assert.deepEqual(
      stream.getStream().rawInput,
      '  0/50 [>---------------------------]   0%' + PHP_EOL +
      '  0/50 [>---------------------------]   0%' + PHP_EOL +
      "\x1b[1A\x1b[0J" + '  1/50 [>---------------------------]   2%' + PHP_EOL +
      "\x1b[2A\x1b[0J" + '  1/50 [>---------------------------]   2%' + PHP_EOL +
      "\x1b[1A\x1b[0J" + '  1/50 [>---------------------------]   2%' + PHP_EOL +
      '  1/50 [>---------------------------]   2%' + PHP_EOL
    );
  });

  it('testMultipleSectionsWithCustomFormat', async () => {
    const sections = [];
    const stream = getOutputStream(true);
    const output1 = new ConsoleSectionOutput(stream.getStream(), sections, stream.getVerbosity(), stream.isDecorated(), new OutputFormatter());
    const output2 = new ConsoleSectionOutput(stream.getStream(), sections, stream.getVerbosity(), stream.isDecorated(), new OutputFormatter());

    ProgressBar.setFormatDefinition('test', '%current%/%max% [%bar%] %percent:3s%% Fruitcake marzipan toffee. Cupcake gummi bears tart dessert ice cream chupa chups cupcake chocolate bar sesame snaps. Croissant halvah cookie jujubes powder macaroon. Fruitcake bear claw bonbon jelly beans oat cake pie muffin Fruitcake marzipan toffee.');
    putenv("COLUMNS=120");

    const progress = new ProgressBar(output1, 50, 0);
    const progress2 = new ProgressBar(output2, 50, 0);
    progress2.setFormat('test');

    progress.start();
    progress2.start();

    progress.advance();
    progress2.advance();

    assert.deepEqual(
      stream.getStream().rawInput,
      '  0/50 [>---------------------------]   0%' + PHP_EOL +
      ' 0/50 [>]   0% Fruitcake marzipan toffee. Cupcake gummi bears tart dessert ice cream chupa chups cupcake chocolate bar sesame snaps. Croissant halvah cookie jujubes powder macaroon. Fruitcake bear claw bonbon jelly beans oat cake pie muffin Fruitcake marzipan toffee.' + PHP_EOL +
      "\x1b[4A\x1b[0J" + ' 0/50 [>]   0% Fruitcake marzipan toffee. Cupcake gummi bears tart dessert ice cream chupa chups cupcake chocolate bar sesame snaps. Croissant halvah cookie jujubes powder macaroon. Fruitcake bear claw bonbon jelly beans oat cake pie muffin Fruitcake marzipan toffee.' + PHP_EOL +
      "\x1b[3A\x1b[0J" + '  1/50 [>---------------------------]   2%' + PHP_EOL +
      ' 0/50 [>]   0% Fruitcake marzipan toffee. Cupcake gummi bears tart dessert ice cream chupa chups cupcake chocolate bar sesame snaps. Croissant halvah cookie jujubes powder macaroon. Fruitcake bear claw bonbon jelly beans oat cake pie muffin Fruitcake marzipan toffee.' + PHP_EOL +
      "\x1b[3A\x1b[0J" + ' 1/50 [>]   2% Fruitcake marzipan toffee. Cupcake gummi bears tart dessert ice cream chupa chups cupcake chocolate bar sesame snaps. Croissant halvah cookie jujubes powder macaroon. Fruitcake bear claw bonbon jelly beans oat cake pie muffin Fruitcake marzipan toffee.' + PHP_EOL
    );
  });

  it('testStartWithMax', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.setFormat('%current%/%max% [%bar%]');
    bar.start(50);
    bar.advance();


    assert.deepEqual(
      output.getStream().rawInput,
      ' 0/50 [>---------------------------]' +
      generateOutput(' 1/50 [>---------------------------]')
    );
  });

  it('testSetCurrentProgress', () => {
    let bar = new ProgressBar(output = getOutputStream(), 50, 0);
    bar.start();
    bar.display();
    bar.advance();
    bar.setProgress(15);
    bar.setProgress(25);


    assert.deepEqual(
      output.getStream().rawInput,
      '  0/50 [>---------------------------]   0%' +
      generateOutput('  1/50 [>---------------------------]   2%') +
      generateOutput(' 15/50 [========>-------------------]  30%') +
      generateOutput(' 25/50 [==============>-------------]  50%'),
    );
  });

  it('testSetCurrentBeforeStarting', () => {
    let bar = new ProgressBar(getOutputStream(), 0, 0);
    bar.setProgress(15);
    assert.isNotNull(bar.getStartTime());
  });

  it('testRedrawFrequency', () => {
    let bar = new ProgressBar(output = getOutputStream(), 6, 0);
    bar.setRedrawFrequency(2);
    bar.start();
    bar.setProgress(1);
    bar.advance(2);
    bar.advance(2);
    bar.advance(1);


    assert.deepEqual(
      output.getStream().rawInput,
      ' 0/6 [>---------------------------]   0%' +
      generateOutput(' 3/6 [==============>-------------]  50%') +
      generateOutput(' 5/6 [=======================>----]  83%') +
      generateOutput(' 6/6 [============================] 100%')
    );
  });

  it('testRedrawFrequencyIsAtLeastOneIfZeroGiven', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.setRedrawFrequency(0);
    bar.start();
    bar.advance();


    assert.deepEqual(
      '    0 [>---------------------------]' +
      generateOutput('    1 [->--------------------------]'),
      output.getStream().rawInput
    );
  });

  it('testRedrawFrequencyIsAtLeastOneIfSmallerOneGiven', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.setRedrawFrequency(0.9);
    bar.start();
    bar.advance();


    assert.deepEqual(
      output.getStream().rawInput,
      '    0 [>---------------------------]' +
      generateOutput('    1 [->--------------------------]')
    );
  });

  it('testMultiByteSupport', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.start();
    bar.setBarCharacter('■');
    bar.advance(3);


    assert.deepEqual(
      '    0 [>---------------------------]' +
      generateOutput('    3 [■■■>------------------------]'),
      output.getStream().rawInput
    );
  });

  it('testClear', () => {
    let bar = new ProgressBar(output = getOutputStream(), 50, 0);
    bar.start();
    bar.setProgress(25);
    bar.clear();


    assert.deepEqual(
      '  0/50 [>---------------------------]   0%' +
      generateOutput(' 25/50 [==============>-------------]  50%') +
      generateOutput(''),
      output.getStream().rawInput
    );
  });

  it('testPercentNotHundredBeforeComplete', () => {
    let bar = new ProgressBar(output = getOutputStream(), 200, 0);
    bar.start();
    bar.display();
    bar.advance(199);
    bar.advance();


    assert.deepEqual(
      '   0/200 [>---------------------------]   0%' +
      generateOutput(' 199/200 [===========================>]  99%') +
      generateOutput(' 200/200 [============================] 100%'),
      output.getStream().rawInput
    );
  });

  it('testNonDecoratedOutput', () => {
    let bar = new ProgressBar(output = getOutputStream(false), 200, 0);
    bar.start();

    for (let i = 0; i < 200; ++i) {
      bar.advance();
    }

    bar.finish();


    assert.deepEqual(
      output.getStream().rawInput,
      '   0/200 [>---------------------------]   0%' + PHP_EOL +
      '  20/200 [==>-------------------------]  10%' + PHP_EOL +
      '  40/200 [=====>----------------------]  20%' + PHP_EOL +
      '  60/200 [========>-------------------]  30%' + PHP_EOL +
      '  80/200 [===========>----------------]  40%' + PHP_EOL +
      ' 100/200 [==============>-------------]  50%' + PHP_EOL +
      ' 120/200 [================>-----------]  60%' + PHP_EOL +
      ' 140/200 [===================>--------]  70%' + PHP_EOL +
      ' 160/200 [======================>-----]  80%' + PHP_EOL +
      ' 180/200 [=========================>--]  90%' + PHP_EOL +
      ' 200/200 [============================] 100%'
    );
  });

  it('testNonDecoratedOutputWithClear', () => {
    let bar = new ProgressBar(output = getOutputStream(false), 50, 0);
    bar.start();
    bar.setProgress(25);
    bar.clear();
    bar.setProgress(50);
    bar.finish();


    assert.deepEqual(
      '  0/50 [>---------------------------]   0%' + PHP_EOL +
      ' 25/50 [==============>-------------]  50%' + PHP_EOL +
      ' 50/50 [============================] 100%',
      output.getStream().rawInput
    );
  });

  it('testNonDecoratedOutputWithoutMax', () => {
    let bar = new ProgressBar(output = getOutputStream(false), 0, 0);
    bar.start();
    bar.advance();


    assert.deepEqual(
      '    0 [>---------------------------]' + PHP_EOL +
      '    1 [->--------------------------]',
      output.getStream().rawInput
    );
  });

  it('testParallelBars', () => {
    let output = getOutputStream();
    bar1 = new ProgressBar(output, 2, 0);
    let bar2 = new ProgressBar(output, 3, 0);
    bar2.setProgressCharacter('#');
    let bar3 = new ProgressBar(output, 0, 0);

    bar1.start();
    output.write("\n");
    bar2.start();
    output.write("\n");
    bar3.start();

    for (let i = 1; i <= 3; ++i) {
      // up two lines
      output.write("\x1B[2A");
      if (i <= 2) {
        bar1.advance();
      }
      output.write("\n");
      bar2.advance();
      output.write("\n");
      bar3.advance();
    }
    output.write("\x1B[2A");
    output.write("\n");
    output.write("\n");
    bar3.finish();


    assert.deepEqual(
      ' 0/2 [>---------------------------]   0%' + "\n" +
      ' 0/3 [#---------------------------]   0%' + "\n" +
      rtrim('    0 [>---------------------------]') +

      "\x1B[2A" +
      generateOutput(' 1/2 [==============>-------------]  50%') + "\n" +
      generateOutput(' 1/3 [=========#------------------]  33%') + "\n" +
      rtrim(generateOutput('    1 [->--------------------------]')) +

      "\x1B[2A" +
      generateOutput(' 2/2 [============================] 100%') + "\n" +
      generateOutput(' 2/3 [==================#---------]  66%') + "\n" +
      rtrim(generateOutput('    2 [-->-------------------------]')) +

      "\x1B[2A" +
      "\n" +
      generateOutput(' 3/3 [============================] 100%') + "\n" +
      rtrim(generateOutput('    3 [--->------------------------]')) +

      "\x1B[2A" +
      "\n" +
      "\n" +
      rtrim(generateOutput('    3 [============================]')),
      output.getStream().rawInput
    );
  });

  it('testWithoutMax', () => {
    let output = getOutputStream();

    let bar = new ProgressBar(output, 0, 0);
    bar.start();
    bar.advance();
    bar.advance();
    bar.advance();
    bar.finish();


    assert.deepEqual(
      rtrim('    0 [>---------------------------]') +
      rtrim(generateOutput('    1 [->--------------------------]')) +
      rtrim(generateOutput('    2 [-->-------------------------]')) +
      rtrim(generateOutput('    3 [--->------------------------]')) +
      rtrim(generateOutput('    3 [============================]')),
      output.getStream().rawInput
    );
  });

  it('testSettingMaxStepsDuringProgressing', () => {
    let output = getOutputStream();
    bar = new ProgressBar(output, 0, 0);
    bar.start();
    bar.setProgress(2);
    bar.setMaxSteps(10);
    bar.setProgress(5);
    bar.setMaxSteps(100);
    bar.setProgress(10);
    bar.finish();


    assert.deepEqual(
      rtrim('    0 [>---------------------------]') +
      rtrim(generateOutput('    2 [-->-------------------------]')) +
      rtrim(generateOutput('  5/10 [==============>-------------]  50%')) +
      rtrim(generateOutput('  10/100 [==>-------------------------]  10%')) +
      rtrim(generateOutput(' 100/100 [============================] 100%')),
      output.getStream().rawInput
    );
  });

  it('testWithSmallScreen', () => {
    let output = getOutputStream();

    let bar = new ProgressBar(output, 0, 0);
    putenv('COLUMNS=12');
    bar.start();
    bar.advance();
    putenv('COLUMNS=120');


    assert.deepEqual(
      '    0 [>---]' +
      generateOutput('    1 [->--]'),
      output.getStream().rawInput
    );
  });

  it('testAddingPlaceholderFormatter', () => {
    ProgressBar.setPlaceholderFormatterDefinition('remaining_steps', function (bar) {
      return bar.getMaxSteps() - bar.getProgress();
    });
    let bar = new ProgressBar(output = getOutputStream(), 3, 0);
    bar.setFormat(' %remaining_steps% [%bar%]');

    bar.start();
    bar.advance();
    bar.finish();


    assert.deepEqual(
      ' 3 [>---------------------------]' +
      generateOutput(' 2 [=========>------------------]') +
      generateOutput(' 0 [============================]'),
      output.getStream().rawInput
    );
  });

  it('testMultilineFormat', () => {
    let bar = new ProgressBar(output = getOutputStream(), 3, 0);
    bar.setFormat("%bar%\nfoobar");

    bar.start();
    bar.advance();
    bar.clear();
    bar.finish();


    assert.deepEqual(
      output.getStream().rawInput,
      ">---------------------------\nfoobar" +
      generateOutput("=========>------------------\nfoobar") +
      "\x0D\x1B[2K\x1B[1A\x1B[2K" +
      generateOutput("============================\nfoobar")
    );
  });

  it('testAnsiColorsAndEmojis', () => {
    putenv('COLUMNS=156');

    var i = 0;
    let bar = new ProgressBar(output = getOutputStream(), 15, 0);
    ProgressBar.setPlaceholderFormatterDefinition('memory', function (bar) {
      let mem = 100000 * i;
      let colors = i++ ? '41;37' : '44;37';

      return "\x1B[" + colors + 'm ' + Helper.formatMemory(mem) + " \x1B[0m";
    });
    const done = "\x1B[32m●\x1B[0m";
    const empty = "\x1B[31m●\x1B[0m";
    const progress = "\x1B[32m➤ \x1B[0m";

    bar.setFormat(" \x1B[44;37m %title:-37s% \x1B[0m\n %current%/%max% %bar% %percent:3s%%\n 🏁  %remaining:-10s% %memory:37s%");
    bar.setBarCharacter(done);
    bar.setEmptyBarCharacter(empty);
    bar.setProgressCharacter(progress);

    bar.setMessage('Starting the demo... fingers crossed', 'title');
    bar.start();


    assert.deepEqual(
      output.getStream().rawInput,
      " \x1B[44;37m Starting the demo... fingers crossed  \x1B[0m\n" +
      '  0/15 ' + progress + empty.repeat(26) + "   0%\n" +
      " 🏁  < 1 sec                        \x1B[44;37m 0 B \x1B[0m"
    );

    output.getStream().reset();

    bar.setMessage('Looks good to me...', 'title');
    bar.advance(4);


    assert.deepEqual(
      output.getStream().rawInput,
      generateOutput(
        " \x1B[44;37m Looks good to me...                   \x1B[0m\n" +
        '  4/15 ' + done.repeat(7) + progress + empty.repeat(19) + "  26%\n" +
        " 🏁  < 1 sec                     \x1B[41;37m 97 KiB \x1B[0m"
      )
    );

    output.getStream().reset();

    bar.setMessage('Thanks, bye', 'title');
    bar.finish();


    assert.deepEqual(
      generateOutput(
        " \x1B[44;37m Thanks, bye                           \x1B[0m\n" +
        ' 15/15 ' + done.repeat(28) + " 100%\n" +
        " 🏁  < 1 sec                    \x1B[41;37m 195 KiB \x1B[0m"
      ),
      output.getStream().rawInput
    );
    putenv('COLUMNS=120');
  });

  it('testSetFormat', () => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.setFormat('normal');
    bar.start();

    assert.deepEqual(
      '    0 [>---------------------------]',
      output.getStream().rawInput
    );

    bar = new ProgressBar(output = getOutputStream(), 10, 0);
    bar.setFormat('normal');
    bar.start();

    assert.deepEqual(
      '  0/10 [>---------------------------]   0%',
      output.getStream().rawInput
    );
  });


  forEach(provideFormat()).it('testFormatsWithoutMax %s', (format) => {
    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.setFormat(format);
    bar.start();


    assert.isNotEmpty(output.getStream().rawInput);
  });

  it('testBarWidthWithMultilineFormat', () => {
    putenv('COLUMNS=10');

    let bar = new ProgressBar(output = getOutputStream(), 0, 0);
    bar.setFormat("%bar%\n0123456789");

    // before starting
    bar.setBarWidth(5);
    assert.deepEqual(bar.getBarWidth(), 5);

    // after starting
    bar.start();

    assert.deepEqual(bar.getBarWidth(), 5, output.getStream().rawInput);
    putenv('COLUMNS=120');
  });

  it('testNoWriteWhenMessageIsSame', (done) => {
    let bar = new ProgressBar(output = getOutputStream(), 2);
    bar.start();
    bar.advance();
    bar.display();

    assert.deepEqual(
      ' 0/2 [>---------------------------]   0%' +
      generateOutput(' 1/2 [==============>-------------]  50%'),
      output.getStream().rawInput
    );
    done();
  });

  function getOutputStream(decorated = true, verbosity = StreamOutput.VERBOSITY_NORMAL) {
    return new StreamOutput(new stdOutMock({columns : 3000}), verbosity, decorated);
  }

  function generateOutput(expected) {
    const count = (expected.match(/\n/g) || []).length;
    return "\x0D\x1B[2K" + (count ? "\x1B[1A\x1B[2K".repeat(count) : '') + expected;
  }
  
  var colSize = getenv('COLUMNS');
  
  before(() => {
    putenv('COLUMNS=120');
  });

  after(() => {
    putenv(colSize ? 'COLUMNS=' + colSize : 'COLUMNS');
  });

  function provideFormat() {
    return [
      ['normal'],
      ['verbose'],
      ['very_verbose'],
      ['debug'],
    ];
  }
});
