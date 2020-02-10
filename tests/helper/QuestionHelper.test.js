const mocha = require('mocha');
const forEach = require('mocha-each');
const chai = require('chai');
const sinon = require('sinon');
const {assert} = chai;
const nassert = require('assert');
const mockStreams = require('stream-mock');
const stdoutMock = require('../stdOutMock');

const {DIRECTORY_SEPARATOR, strtr, PHP_EOL} = require('../../src/PhpPolyfill');

const OutputFormatter = require('../../src/formatter/OutputFormatter');
const FormatterHelper = require('../../src/helper/FormatterHelper');
const HelperSet = require('../../src/helper/HelperSet');
const QuestionHelper = require('../../src/helper/QuestionHelper');
const StreamOutput = require('../../src/output/StreamOutput');
const ChoiceQuestion = require('../../src/question/ChoiceQuestion');
const ConfirmationQuestion = require('../../src/question/ConfirmationQuestion');
const Question = require('../../src/question/Question');
const Terminal = require('../../src/Terminal');

const Input = require('../../src/input/Input');
const Output = require('../../src/output/Output');

const heroes = ['Superman', 'Batman', 'Spiderman'];

describe('#QuestionHelper', () => {
  it('testAskChoice', async () => {
    let questionHelper = new QuestionHelper();

    let helperSet = new HelperSet([new FormatterHelper()]);
    questionHelper.setHelperSet(helperSet);

    let heroes = ['Superman', 'Batman', 'Spiderman'];

    let inputStream = getInputStream("\n1\n  1  \nFabien\n1\nFabien\n1\n0,2\n 0 , 2  \n\n\n");

    let question = new ChoiceQuestion('What is your favorite superhero?', heroes, '2');
    question.setMaxAttempts(1);
    // first answer is an empty answer, we're supposed to receive the fallback value
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question), await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'Spiderman');

    question = new ChoiceQuestion('What is your favorite superhero?', heroes);
    question.setMaxAttempts(1);
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'Batman');
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'Batman');

    question = new ChoiceQuestion('What is your favorite superhero?', heroes);
    question.setErrorMessage('Input "%s" is not a superhero!');
    question.setMaxAttempts(2);
    let output = createOutput();
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), output, question), 'Batman');

    //rewind(output.getStream());
    //let stream = output.getStream().data.join("");
    assert.include(output.getStream().data.join(""), 'Input "Fabien" is not a superhero!');

    try {
      question = new ChoiceQuestion('What is your favorite superhero?', heroes, '1');
      question.setMaxAttempts(1);
      await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), output = createOutput(), question);
      this.fail();
    } catch (e) {
      assert.deepEqual(e.message, 'Value "Fabien" is invalid');
    }

    question = new ChoiceQuestion('What is your favorite superhero?', heroes, null);
    question.setMaxAttempts(1);
    question.setMultiselect(true);

    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['Batman']);
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['Superman', 'Spiderman']);
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['Superman', 'Spiderman']);

    question = new ChoiceQuestion('What is your favorite superhero?', heroes, '0,1');
    question.setMaxAttempts(1);
    question.setMultiselect(true);

    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['Superman', 'Batman']);

    question = new ChoiceQuestion('What is your favorite superhero?', heroes, ' 0 , 1 ');
    question.setMaxAttempts(1);
    question.setMultiselect(true);

    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['Superman', 'Batman']);

    question = new ChoiceQuestion('What is your favorite superhero?', heroes, 0);
    // We are supposed to get the fallback value since we are not in interactive mode
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question), 'Superman');
  });

  it('testAskChoiceNonInteractive', async () => {
    let questionHelper = new QuestionHelper();

    let helperSet = new HelperSet([new FormatterHelper()]);
    questionHelper.setHelperSet(helperSet);
    let inputStream = getInputStream("\n1\n  1  \nFabien\n1\nFabien\n1\n0,2\n 0 , 2  \n\n\n");

    let heroes = ['Superman', 'Batman', 'Spiderman'];

    let question = new ChoiceQuestion('What is your favorite superhero?', heroes, '0');

    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question), 'Superman');

    question = new ChoiceQuestion('What is your favorite superhero?', heroes, 'Batman');
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question), 'Batman');

    question = new ChoiceQuestion('What is your favorite superhero?', heroes, null);
    assert.isNull(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question));

    question = new ChoiceQuestion('What is your favorite superhero?', heroes, '0');
    question.setValidator(null);
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question), 'Superman');

    try {
      question = new ChoiceQuestion('What is your favorite superhero?', heroes, null);
      questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question);
    } catch (e) {
      assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question), 'Value "" is invalid', e.getMessage());
    }

    question = new ChoiceQuestion('Who are your favorite superheros?', heroes, '0, 1');
    question.setMultiselect(true);
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question), ['Superman', 'Batman']);

    question = new ChoiceQuestion('Who are your favorite superheros?', heroes, '0, 1');
    question.setMultiselect(true);
    question.setValidator(null);
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question), ['Superman', 'Batman']);

    question = new ChoiceQuestion('Who are your favorite superheros?', heroes, '0, Batman');
    question.setMultiselect(true);
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question), ['Superman', 'Batman']);

    question = new ChoiceQuestion('Who are your favorite superheros?', heroes, null);
    question.setMultiselect(true);
    assert.isNull(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question));

    question = new ChoiceQuestion('Who are your favorite superheros?', {'a': 'Batman', 'b': 'Superman'}, 'a');
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock('', false), createOutput(), question), 'a', 'ChoiceQuestion validator returns the key if it\'s a string');

    try {
      question = new ChoiceQuestion('Who are your favorite superheros?', heroes, '');
      question.setMultiselect(true);
      await questionHelper.ask(createStreamableInputInterfaceMock(inputStream, false), createOutput(), question);
    } catch (e) {
      assert.deepEqual(e.message, 'Value "" is invalid');
    }
  });

  it('testAsk', async () => {
    let dialog = new QuestionHelper();

    let inputStream = getInputStream("\n8AM\n");

    let question = new Question('What time is it?', '2PM');
    assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), '2PM');

    question = new Question('What time is it?', '2PM');
    let output = createOutput();
    assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), output, question), '8AM');

    assert.deepEqual(output.getStream().data.join(""), 'What time is it?');
  });

  it('testAskNonTrimmed', async () => {
    let dialog = new QuestionHelper();

    let inputStream = getInputStream(' 8AM \n');

    let question = new Question('What time is it?', '2PM');
    question.setTrimmable(false);

    let output = createOutput();
    assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), output, question), ' 8AM ');

    assert.deepEqual(output.getStream().data.join(""), 'What time is it?');
  });

  describe('#autoComplete', () => {
    var prev = process.stdout.isTTY;
    before(() => {
      if (!Terminal.hasSttyAvailable()) {
        process.stdout.isTTY = true;
      }
    });

    after(() => {
      process.stdout.isTTY = prev;
    });

    it('testAskWithAutocomplete', async () => {
      if (!Terminal.hasSttyAvailable()) {
        this.markTestSkipped('`stty` is required to test autocomplete functionality');
      }

      // Acm<NEWLINE>
      // Ac<BACKSPACE><BACKSPACE>s<TAB>Test<NEWLINE>
      // <NEWLINE>
      // <UP ARROW><UP ARROW><UP ARROW><NEWLINE>
      // <UP ARROW><UP ARROW><UP ARROW><UP ARROW><UP ARROW><UP ARROW><UP ARROW><TAB>Test<NEWLINE>
      // <DOWN ARROW><NEWLINE>
      // S<BACKSPACE><BACKSPACE><DOWN ARROW><DOWN ARROW><NEWLINE>
      // F00<BACKSPACE><BACKSPACE>oo<TAB><NEWLINE>
      // F⭐<TAB><BACKSPACE><BACKSPACE>⭐<TAB><NEWLINE>
      let inputStream = getInputStream("Acm\nAc\x7F\x7Fs\tTest\n\n\u001b[A\u001b[A\u001b[A\n\u001b[A\u001b[A\u001b[A\u001b[A\u001b[A\u001b[A\u001b[A\tTest\n\u001b[B\nS\x7F\x7F\u001b[B\u001b[B\nF00\x7F\x7Foo\t\nF⭐\t\x7F\x7F⭐\t\n");

      let dialog = new QuestionHelper();
      let helperSet = new HelperSet([new FormatterHelper()]);
      dialog.setHelperSet(helperSet);

      let question = new Question('Please select a bundle', 'FrameworkBundle');
      question.setAutocompleterValues(['AcmeDemoBundle', 'AsseticBundle', 'SecurityBundle', 'FooBundle', 'F⭐Y']);

      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AcmeDemoBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AsseticBundleTest');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'FrameworkBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'SecurityBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'FooBundleTest');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AcmeDemoBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AsseticBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'FooBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'F⭐Y');
    });

    it('testAskWithAutocompleteTrimmable', async () => {
      if (!Terminal.hasSttyAvailable()) {
        // this.markTestSkipped('`stty` is required to test autocomplete functionality');
        // process.stdout.isTTY = true;
      }

      // Acm<NEWLINE>
      // Ac<BACKSPACE><BACKSPACE>s<TAB>Test<NEWLINE>
      // <NEWLINE>
      // <UP ARROW><UP ARROW><NEWLINE>
      // <UP ARROW><UP ARROW><UP ARROW><UP ARROW><UP ARROW><TAB>Test<NEWLINE>
      // <DOWN ARROW><NEWLINE>
      // S<BACKSPACE><BACKSPACE><DOWN ARROW><DOWN ARROW><NEWLINE>
      // F00<BACKSPACE><BACKSPACE>oo<TAB><NEWLINE>
      let inputStream = getInputStream("Acm\nAc\x7F\x7Fs\tTest\n\n\u001b[A\u001b[A\n\u001b[A\u001b[A\u001b[A\u001b[A\u001b[A\tTest\n\u001b[B\nS\x7F\x7F\u001b[B\u001b[B\nF00\x7F\x7Foo\t\n");

      let dialog = new QuestionHelper();
      helperSet = new HelperSet([new FormatterHelper()]);
      dialog.setHelperSet(helperSet);

      let question = new Question('Please select a bundle', 'FrameworkBundle');
      question.setAutocompleterValues(['AcmeDemoBundle ', 'AsseticBundle', ' SecurityBundle ', 'FooBundle']);
      question.setTrimmable(false);

      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AcmeDemoBundle ');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AsseticBundleTest');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'FrameworkBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ' SecurityBundle ');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'FooBundleTest');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AcmeDemoBundle ');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AsseticBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'FooBundle');
    });

    it('testAskWithAutocompleteCallback', async () => {
      if (!Terminal.hasSttyAvailable()) {
        this.markTestSkipped('`stty` is required to test autocomplete functionality');
      }

      // Po<TAB>Cr<TAB>P<DOWN ARROW><DOWN ARROW><NEWLINE>
      let inputStream = getInputStream("Pa\x7F\x7Fo\tCr\tP\u001b[A\u001b[A\n");

      let dialog = new QuestionHelper();
      helperSet = new HelperSet([new FormatterHelper()]);
      dialog.setHelperSet(helperSet);

      let question = new Question('What\'s for dinner?');

      // A simple test callback - return an array containing the words the
      // user has already completed, suffixed with all known words +
      //
      // Eg: If the user inputs "Potato C", the return will be:
      //
      //     ["Potato Carrot ", "Potato Creme ", "Potato Curry ", ...]
      //
      // No effort is made to avoid irrelevant suggestions, as this is handled
      // by the autocomplete function +
      let callback = function (input) {
        let knownWords = ['Carrot', 'Creme', 'Curry', 'Parsnip', 'Pie', 'Potato', 'Tart'];
        let inputWords = input.split(' ');
        inputWords.pop();
        let suggestionBase = inputWords.length > 0 ? inputWords.join(' ') + ' ' : '';
        return knownWords.map(word => suggestionBase + word + ' ');
      };

      question.setAutocompleterCallback(callback);

      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'Potato Creme Pie');
    });

    /**
     * Quite a pointless test for Node, very PhP array specific
     */

    /**
     xit('testAskWithAutocompleteWithNonSequentialKeys', async () => {
      if (!Terminal.hasSttyAvailable()) {
        this.markTestSkipped('`stty` is required to test autocomplete functionality');
      }

      // <UP ARROW><UP ARROW><NEWLINE><DOWN ARROW><DOWN ARROW><NEWLINE>
      let inputStream = getInputStream("\u001b[A\u001b[A\n\u001b[B\u001b[B\n");

      let dialog = new QuestionHelper();
      dialog.setHelperSet(new HelperSet([new FormatterHelper()]));

      let vals = [];
      vals[1] = 'AcmeDemoBundle';
      vals[4] = 'AsseticBundle';
      let question = new ChoiceQuestion('Please select a bundle', vals);
      question.setMaxAttempts(1);

      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AcmeDemoBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AsseticBundle');
    });
     **/

    it('testAskWithAutocompleteWithExactMatch', async () => {
      if (!Terminal.hasSttyAvailable()) {
        this.markTestSkipped('`stty` is required to test autocomplete functionality');
      }

      let inputStream = getInputStream("b\n");

      let possibleChoices = {
        'a': 'berlin',
        'b': 'copenhagen',
        'c': 'amsterdam',
      };

      let dialog = new QuestionHelper();
      dialog.setHelperSet(new HelperSet([new FormatterHelper()]));

      let question = new ChoiceQuestion('Please select a city', possibleChoices);
      question.setMaxAttempts(1);

      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'b');
    });


    forEach(getInputs()).it('testAskWithAutocompleteWithMultiByteCharacter %s', async (character) => {
      if (!Terminal.hasSttyAvailable()) {
        this.markTestSkipped('`stty` is required to test autocomplete functionality');
      }

      let inputStream = getInputStream(`${character}\n`);

      let possibleChoices = {
        '$': '1 byte character',
        '¢': '2 bytes character',
        '€': '3 bytes character',
        '𐍈': '4 bytes character',
      };

      let dialog = new QuestionHelper();
      dialog.setHelperSet(new HelperSet([new FormatterHelper()]));

      let question = new ChoiceQuestion('Please select a character', possibleChoices);
      question.setMaxAttempts(1);

      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), character);
    });

    it('testAutocompleteWithTrailingBackslash', async () => {
      if (!Terminal.hasSttyAvailable()) {
        this.markTestSkipped('`stty` is required to test autocomplete functionality');
      }

      let inputStream = getInputStream('E\x04');

      let dialog = new QuestionHelper();
      let helperSet = new HelperSet([new FormatterHelper()]);
      dialog.setHelperSet(helperSet);

      let question = new Question('');
      let expectedCompletion = 'ExampleNamespace\\';
      question.setAutocompleterValues([expectedCompletion]);

      let output = createOutput();
      await dialog.ask(createStreamableInputInterfaceMock(inputStream), output, question);

      let outputStream = output.getStream();
      let actualOutput = outputStream.data.join("");

      // Shell control (esc) sequences are not so important: we only care that
      // <hl> tag is interpreted correctly and replaced
      let irrelevantEscSequences = {
        "\u001b7": '', // Save _cursor position
        "\u001b8": '', // Restore _cursor position
        "\u001b[K": '', // Clear line from _cursor till the end
      };

      let importantActualOutput = strtr(actualOutput, irrelevantEscSequences);

      // Remove colors (e + g +  "\u001b[30m", "\u001b[31;41m")
      importantActualOutput = importantActualOutput.replace(/\u001b\[\d+(;\d+)?m/g, '');

      assert.deepEqual(expectedCompletion, importantActualOutput);
    });


    it('testTraversableAutocomplete', async () => {
      if (!Terminal.hasSttyAvailable()) {
        this.markTestSkipped('`stty` is required to test autocomplete functionality');
      }

      // Acm<NEWLINE>
      // Ac<BACKSPACE><BACKSPACE>s<TAB>Test<NEWLINE>
      // <NEWLINE>
      // <UP ARROW><UP ARROW><NEWLINE>
      // <UP ARROW><UP ARROW><UP ARROW><UP ARROW><UP ARROW><TAB>Test<NEWLINE>
      // <DOWN ARROW><NEWLINE>
      // S<BACKSPACE><BACKSPACE><DOWN ARROW><DOWN ARROW><NEWLINE>
      // F00<BACKSPACE><BACKSPACE>oo<TAB><NEWLINE>
      let inputStream = getInputStream("Acm\nAc\x7F\x7Fs\tTest\n\n\u001b[A\u001b[A\n\u001b[A\u001b[A\u001b[A\u001b[A\u001b[A\tTest\n\u001b[B\nS\x7F\x7F\u001b[B\u001b[B\nF00\x7F\x7Foo\t\n");

      let dialog = new QuestionHelper();
      let helperSet = new HelperSet([new FormatterHelper()]);
      dialog.setHelperSet(helperSet);

      let question = new Question('Please select a bundle', 'FrameworkBundle');
      question.setAutocompleterValues(new AutocompleteValues({
        // 'irrelevant': 'AcmeDemoBundle', //this fails node doesn't work like this it will re-order
        '0': 'AcmeDemoBundle',
        '1': 'AsseticBundle',
        '2': 'SecurityBundle',
        '3': 'FooBundle'
      }));

      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AcmeDemoBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AsseticBundleTest');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'FrameworkBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'SecurityBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'FooBundleTest');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AcmeDemoBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'AsseticBundle');
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'FooBundle');
    });

    it('testTraversableMultiselectAutocomplete', async () => {
      // <NEWLINE>
      // F<TAB><NEWLINE>
      // A<3x UP ARROW><TAB>,F<TAB><NEWLINE>
      // F00<BACKSPACE><BACKSPACE>o<TAB>,A<DOWN ARROW>,<SPACE>SecurityBundle<NEWLINE>
      // Acme<TAB>,<SPACE>As<TAB><29x BACKSPACE>S<TAB><NEWLINE>
      // Ac<TAB>,As<TAB><3x BACKSPACE>d<TAB><NEWLINE>
      let inputStream = getInputStream("\nF\t\nA\u001b[A\u001b[A\u001b[A\t,F\t\nF00\x7F\x7Fo\t,A\u001b[B\t, SecurityBundle\nAcme\t, As\t\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7FS\t\nAc\t,As\t\x7F\x7F\x7Fd\t\n");

      let dialog = new QuestionHelper();
      let helperSet = new HelperSet([new FormatterHelper()]);
      dialog.setHelperSet(helperSet);

      let question = new ChoiceQuestion(
        'Please select a bundle (fallbacks to AcmeDemoBundle and AsseticBundle)',
        ['AcmeDemoBundle', 'AsseticBundle', 'SecurityBundle', 'FooBundle'],
        '0,1'
      );

      // This tests that autocomplete works for all multiselect choices entered by the user
      question.setMultiselect(true);

      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['AcmeDemoBundle', 'AsseticBundle']);
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['FooBundle']);
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['AsseticBundle', 'FooBundle']);
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['FooBundle', 'AsseticBundle', 'SecurityBundle']);
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['SecurityBundle']);
      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), ['AcmeDemoBundle', 'AsseticBundle']);

    });

  });

  forEach(getAskConfirmationData()).it('testAskConfirmation %s', async (question, expected, fallback) => {
    let dialog = new QuestionHelper();

    let inputStream = getInputStream(question + "\n");
    question = new ConfirmationQuestion('Do you like French fries?', fallback);
    assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), expected, 'confirmation question should ' + (expected ? 'pass' : 'cancel'));
  });

  it('testAskConfirmationWithCustomTrueAnswer', async () => {
    let dialog = new QuestionHelper();

    let inputStream = getInputStream("j\ny\n");
    let question = new ConfirmationQuestion('Do you like French fries?', false, '/^(j|y)/i');
    assert.isTrue(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question));
    question = new ConfirmationQuestion('Do you like French fries?', false, '/^(j|y)/i');
    assert.isTrue(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question));
  });

  it('testAskAndValidate', async () => {
    let dialog = new QuestionHelper();
    helperSet = new HelperSet([new FormatterHelper()]);
    dialog.setHelperSet(helperSet);

    let error = 'This is not a color!';
    validator = function (color) {
      if (['white', 'black'].indexOf(color) < 0) {
        throw new Error(error);
      }

      return color;
    };

    let question = new Question('What color was the white horse of Henry IV?', 'white');
    question.setValidator(validator);
    question.setMaxAttempts(2);

    let inputStream = getInputStream("\nblack\n");
    assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'white');
    assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'black');

    try {
      await dialog.ask(createStreamableInputInterfaceMock(getInputStream("green\nyellow\norange\n")), createOutput(), question);
      this.fail();
    } catch (e) {
      assert.deepEqual(e.message, error);
    }
  });

  forEach(simpleAnswerProvider()).it('testSelectChoiceFromSimpleChoices %s', async (providedAnswer, expectedValue) => {
    let possibleChoices = [
      'My environment 1',
      'My environment 2',
      'My environment 3',
    ];

    let dialog = new QuestionHelper();
    let helperSet = new HelperSet([new FormatterHelper()]);
    dialog.setHelperSet(helperSet);

    let question = new ChoiceQuestion('Please select the environment to load', possibleChoices);
    question.setMaxAttempts(1);
    let answer = await dialog.ask(createStreamableInputInterfaceMock(getInputStream(providedAnswer + "\n")), createOutput(), question);

    assert.deepEqual(expectedValue, answer);
  });

  forEach(specialCharacterInMultipleChoice()).it('testSpecialCharacterChoiceFromMultipleChoiceList %s', async (providedAnswer, expectedValue) => {
    let possibleChoices = ['.', 'src'];

    let dialog = new QuestionHelper();
    let inputStream = getInputStream(providedAnswer + "\n");
    let helperSet = new HelperSet([new FormatterHelper()]);
    dialog.setHelperSet(helperSet);

    let question = new ChoiceQuestion('Please select the directory', possibleChoices);
    question.setMaxAttempts(1);
    question.setMultiselect(true);
    let answer = await dialog.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question);

    assert.deepEqual(expectedValue, answer);
  });

  forEach(mixedKeysChoiceListAnswerProvider()).it('testChoiceFromChoicelistWithMixedKeys %s', async (providedAnswer, expectedValue) => {
    let possibleChoices = {
      '0': 'No environment',
      '1': 'My environment 1',
      'env_2': 'My environment 2',
      3: 'My environment 3',
    };

    let dialog = new QuestionHelper();
    let helperSet = new HelperSet([new FormatterHelper()]);
    dialog.setHelperSet(helperSet);

    let question = new ChoiceQuestion('Please select the environment to load', possibleChoices);
    question.setMaxAttempts(1);
    let answer = await dialog.ask(createStreamableInputInterfaceMock(getInputStream(providedAnswer + "\n")), createOutput(), question);

    assert.deepEqual(expectedValue, answer);
  });

  forEach(answerProvider()).it('testSelectChoiceFromChoiceList', async (providedAnswer, expectedValue) => {
    let possibleChoices = {
      'env_1': 'My environment 1',
      'env_2': 'My environment',
      'env_3': 'My environment',
    };

    let dialog = new QuestionHelper();
    let helperSet = new HelperSet([new FormatterHelper()]);
    dialog.setHelperSet(helperSet);

    let question = new ChoiceQuestion('Please select the environment to load', possibleChoices);
    question.setMaxAttempts(1);
    let answer = await dialog.ask(createStreamableInputInterfaceMock(getInputStream(providedAnswer + "\n")), createOutput(), question);

    assert.deepEqual(expectedValue, answer);
  });

  it('testAmbiguousChoiceFromChoicelist', async () => {

    await nassert.rejects(async () => {
        let possibleChoices = {
          'env_1': 'My first environment',
          'env_2': 'My environment',
          'env_3': 'My environment',
        };
        let dialog = new QuestionHelper();
        let helperSet = new HelperSet([new FormatterHelper()]);
        dialog.setHelperSet(helperSet);
        let question = new ChoiceQuestion('Please select the environment to load', possibleChoices);
        question.setMaxAttempts(1);
        await dialog.ask(createStreamableInputInterfaceMock(getInputStream("My environment\n")), createOutput(), question);
      },
      {message: 'The provided answer is ambiguous. Value should be one of env_2 or env_3.'},
      "questionHelper throws error upon ambiguous choice");
  });

  it('testNoInteraction', async () => {
    let dialog = new QuestionHelper();
    let question = new Question('Do you have a job?', 'not yet');
    assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(null, false), createOutput(), question), 'not yet');
  });

  it('testChoiceOutputFormattingQuestionForUtf8Keys', async () => {
    let question = 'Lorem ipsum?';
    let possibleChoices = {
      'foo': 'foo',
      'żółw': 'bar',
      'łabądź': 'baz',
    };
    let outputShown = [
      question,
      '  [foo   ] foo',
      '  [żółw  ] bar',
      '  [łabądź] baz',
      ' > '
    ];

    let output = createOutput();
    output.setDecorated(true);
    output.setFormatter(new OutputFormatter());

    let dialog = new QuestionHelper();
    let helperSet = new HelperSet([new FormatterHelper()]);
    dialog.setHelperSet(helperSet);

    question = new ChoiceQuestion(question, possibleChoices, 'foo');
    await dialog.ask(createStreamableInputInterfaceMock(getInputStream("\n")), output, question);

    assert.deepEqual(output.getStream().data[0].split("\n"), outputShown);

  });

  it('testEmptyChoices', () => {

    assert.throws(() => {
      new ChoiceQuestion('Question', [], 'irrelevant');
    }, 'Choice question must have at least 1 choice available.');

  });


  function getInputs() {
    return [
      ['$'], // 1 byte character
      ['¢'], // 2 bytes character
      ['€'], // 3 bytes character
      ['𐍈'], // 4 bytes character
    ];
  }

  function getAskConfirmationData() {
    return [
      ['', true],
      ['', false, false],
      ['y', true],
      ['yes', true],
      ['n', false],
      ['no', false],
    ];
  }

  function simpleAnswerProvider() {
    return [
      [0, 'My environment 1'],
      [1, 'My environment 2'],
      [2, 'My environment 3'],
      ['My environment 1', 'My environment 1'],
      ['My environment 2', 'My environment 2'],
      ['My environment 3', 'My environment 3'],
    ];
  }

  function specialCharacterInMultipleChoice() {
    return [
      ['.', ['.']],
      ['., src', ['.', 'src']],
    ];
  }

  function mixedKeysChoiceListAnswerProvider() {
    return [
      ['0', '0'],
      ['No environment', '0'],
      ['1', '1'],
      ['env_2', 'env_2'],
      [3, '3'],
      ['My environment 1', '1'],
    ];
  }

  function answerProvider() {
    return [
      ['env_1', 'env_1'],
      ['env_2', 'env_2'],
      ['env_3', 'env_3'],
      ['My environment 1', 'env_1'],
    ];
  }

  function getInputStream(input) {
    let stream = new mockStreams.DuplexMock(input);
    stream.setRawMode = () => {
    };
    // let stream = fopen('php://memory', 'r+', false);
    //stream.write, input);
    //rewind(stream);

    return stream;
  }

  function createOutput() {
    return new StreamOutput(new mockStreams.ObjectWritableMock());
    //return new StreamOutput(fopen('php://memory', 'r+', false));
  }

  function createInputInterfaceMock(interactive = true) {
    let mock = sinon.createStubInstance(Input);

    mock.isInteractive.returns(interactive);
    return mock;
  }

  function createStreamableInputInterfaceMock(stream = null, interactive = true) {
    let mock = sinon.createStubInstance(Input);

    mock.isInteractive.returns(interactive);
    if (stream) {
      mock.getStream.returns(stream);
    }

    return mock;
    /*
     $mock = $this->getMockBuilder(StreamableInputInterface::class)->getMock();
        $mock->expects($this->any())
            ->method('isInteractive')
            ->willReturn($interactive);

        if ($stream) {
            $mock->expects($this->any())
                ->method('getStream')
                ->willReturn($stream);
        }

     */
  }
});

class AutocompleteValues {
  [Symbol.iterator]() {
    return Object.values(this.values)[Symbol.iterator]();
  }

  constructor(values) {
    this.values = values;
  }
}
