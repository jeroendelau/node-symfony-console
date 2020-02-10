const mocha = require('mocha');
const chai = require('chai');
const sinon = require('sinon');
const {assert} = chai;
assert.rejects = assert.rejects || require('assert').rejects;
const mockStreams = require('stream-mock');

const {PHP_EOL} = require('../../src/PhpPolyfill');

const FormatterHelper = require('../../src/helper/FormatterHelper');
const HelperSet = require('../../src/helper/HelperSet');
const SymfonyQuestionHelper = require('../../src/helper/SymfonyQuestionHelper');
const StreamOutput = require('../../src/output/StreamOutput');
const ChoiceQuestion = require('../../src/question/ChoiceQuestion');
const Question = require('../../src/question/Question');

const Input = require('../../src/input/Input');
const Output = require('../../src/output/Output');

describe('#SymfonyQuestionHelper', () => {
  it('testAskChoice', async () => {
    let questionHelper = new SymfonyQuestionHelper();

    let helperSet = new HelperSet([new FormatterHelper()]);
    questionHelper.setHelperSet(helperSet);

    let heroes = ['Superman', 'Batman', 'Spiderman'];

    let inputStream = getInputStream("\n1\n  1  \nFabien\n1\nFabien\n1\n0,2\n 0 , 2  \n\n\n");

    let question = new ChoiceQuestion('What is your favorite superhero?', heroes, '2');
    question.setMaxAttempts(1);
    // first answer is an empty answer, we're supposed to receive the fallback value
    let output = createOutput();
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), output, question), 'Spiderman');
    console.log(output.getStream().data.join(""));
    assertOutputContains(output, 'What is your favorite superhero? [Spiderman]');

    question = new ChoiceQuestion('What is your favorite superhero?', heroes);
    question.setMaxAttempts(1);
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'Batman');
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), createOutput(), question), 'Batman');

    question = new ChoiceQuestion('What is your favorite superhero?', heroes);
    question.setErrorMessage('Input "%s" is not a superhero!');
    question.setMaxAttempts(2);
    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), output = createOutput(), question), 'Batman');
    assertOutputContains(output, 'Input "Fabien" is not a superhero!');

    try {
      question = new ChoiceQuestion('What is your favorite superhero?', heroes, '1');
      question.setMaxAttempts(1);
      await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), output = createOutput(), question);
      this.fail();
    } catch (e) {
      assert.deepEqual('Value "Fabien" is invalid', e.message);
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

    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), output = createOutput(), question), ['Superman', 'Batman']);
    assertOutputContains(output, 'What is your favorite superhero? [Superman, Batman]');

    question = new ChoiceQuestion('What is your favorite superhero?', heroes, ' 0 , 1 ');
    question.setMaxAttempts(1);
    question.setMultiselect(true);

    assert.deepEqual(await questionHelper.ask(createStreamableInputInterfaceMock(inputStream), output = createOutput(), question), ['Superman', 'Batman']);
    assertOutputContains(output, 'What is your favorite superhero? [Superman, Batman]');
  });

  it('testAskChoiceWithChoiceValueAsDefault', async () => {
    let questionHelper = new SymfonyQuestionHelper();
    let helperSet = new HelperSet([new FormatterHelper()]);
    questionHelper.setHelperSet(helperSet);
    let question = new ChoiceQuestion('What is your favorite superhero?', ['Superman', 'Batman', 'Spiderman'], 'Batman');
    question.setMaxAttempts(1);

    let output = createOutput();
    assert.deepEqual( await questionHelper.ask(createStreamableInputInterfaceMock(getInputStream("Batman\n")), output, question), 'Batman');
    assertOutputContains(output, 'What is your favorite superhero? [Batman]');
  });

  it('testAskReturnsNullIfValidatorAllowsIt', async () => {
    let questionHelper = new SymfonyQuestionHelper();
    let question = new Question('What is your favorite superhero?');
    question.setValidator(function (value) {
      return value;
    });
    let input = createStreamableInputInterfaceMock(getInputStream("\n"));
    assert.isNull(await questionHelper.ask(input, createOutput(), question));
  });

  it('testAskEscapeDefaultValue', async () => {
    let helper = new SymfonyQuestionHelper();
    let input = createStreamableInputInterfaceMock(getInputStream('\\\n'));
    let output = createOutput();
    var q = new Question('Can I have a backslash?', '\\');
    await helper.ask(input, output, q);

    assertOutputContains(output, 'Can I have a backslash? [\\]');
  });

  it('testAskEscapeAndFormatLabel', () => {
    let helper = new SymfonyQuestionHelper();
    let input = createStreamableInputInterfaceMock(getInputStream('Foo\\Bar'));
    let output = createOutput();
    helper.ask(input, output, new Question('Do you want to use Foo\\Bar <comment>or</comment> Foo\\Baz\\?', 'Foo\\Baz'));

    assertOutputContains(output, 'Do you want to use Foo\\Bar or Foo\\Baz\\? [Foo\\Baz]:');
  });

  it('testLabelTrailingBackslash', () => {
    let helper = new SymfonyQuestionHelper();
    let input = createStreamableInputInterfaceMock(getInputStream('sure'));
    let output = createOutput();
    helper.ask(input, output, new Question('Question with a trailing \\'));

    assertOutputContains(output, 'Question with a trailing \\');
  });

  it('testChoiceQuestionPadding', async () => {
    let choiceQuestion = new ChoiceQuestion('qqq', {
      'foo': 'foo',
      'żółw': 'bar',
      'łabądź': 'baz',
    });

    let output = createOutput();
    await (new SymfonyQuestionHelper()).ask(
      createStreamableInputInterfaceMock(getInputStream("foo\n")),
      output,
      choiceQuestion
    );

    assertOutputContains(output, ` qqq:
  [foo   ] foo
  [żółw  ] bar
  [łabądź] baz
 >`, output, true);
  });

  it('testChoiceQuestionCustomPrompt', () => {
    let choiceQuestion = new ChoiceQuestion('qqq', ['foo']);
    choiceQuestion.setPrompt(' >ccc> ');

    let output = createOutput();
    (new SymfonyQuestionHelper()).ask(
      createStreamableInputInterfaceMock(getInputStream("foo\n")),
      output,
      choiceQuestion
    );

    assertOutputContains(output, `qqq:
  [0] foo
 >ccc>`, output, true);
  });


  function getInputStream(input, keyed = false) {
    let stream = new mockStreams.DuplexMock(input);
    stream.setRawMode = () => {
    }
    if (keyed) {


    }
    // let stream = fopen('php://memory', 'r+', false);
    //stream.write, input);
    //rewind(stream);

    return stream;
  }

  function createOutput() {
    const output = new StreamOutput(new mockStreams.ObjectWritableMock());
    output.setDecorated(false);

    return output;
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
  }

  function assertOutputContains(output, expected, normalize = false) {
    let stream = output.getStream().data.join("");

    if (normalize) {
      stream = stream.replace(new RegExp(PHP_EOL, "g"), "\n");
    }

    assert.include(stream, expected);
  }

});
  