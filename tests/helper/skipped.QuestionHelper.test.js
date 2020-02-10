const mocha = require('mocha');
const forEach = require('mocha-each');
const chai = require('chai');
const sinon = require('sinon');
const {assert} = chai;
assert.rejects = assert.rejects || require('assert').rejects;
const mockStreams = require('stream-mock');

const {DIRECTORY_SEPARATOR, strtr} = require('../../src/PhpPolyfill');

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

describe('#QuestionHelper - skipped', () => {
  xdescribe('#QuestionHelper - HIDDEN', () => {

    it('testAskHiddenResponse', async () => {
      if ('\\' === DIRECTORY_SEPARATOR) {
        this.markTestSkipped('This test is not supported on Windows');
      }

      let dialog = new QuestionHelper();

      let question = new Question('What time is it?');
      question.setHidden(true);

      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(getInputStream("8AM\n")), createOutput(), question), '8AM');
    });

    it('testAskHiddenResponseTrimmed', async () => {
      if ('\\' === DIRECTORY_SEPARATOR) {
        this.markTestSkipped('This test is not supported on Windows');
      }

      let dialog = new QuestionHelper();

      let question = new Question('What time is it?');
      question.setHidden(true);
      question.setTrimmable(false);

      assert.deepEqual(await dialog.ask(createStreamableInputInterfaceMock(getInputStream(' 8AM')), createOutput(), question), ' 8AM');
    });

  });

//readline question doesn't work on empty input
  xdescribe('#QuestionHelper - Empty input', () => {
    it('testAskThrowsExceptionOnMissingInput', async () => {

      assert.rejects(async () => {
        let dialog = new SymfonyQuestionHelper();
        await dialog.ask(createStreamableInputInterfaceMock(getInputStream('')), createOutput(), new Question('What\'s your name?'));
      }, 'Aborted.');

    });
    
    it('testAskThrowsExceptionOnMissingInput', async () => {

      await assert.rejects(async () => {
        let dialog = new QuestionHelper();
        await dialog.ask(createStreamableInputInterfaceMock(getInputStream('')), createOutput(), new Question('What\'s your name?'));
      }, {message: 'Aborted.'}, '');

    });

    it('testAskThrowsExceptionOnMissingInputForChoiceQuestion', async () => {

      await assert.rejects(async () => {
        let dialog = new QuestionHelper();
        await dialog.ask(createStreamableInputInterfaceMock(getInputStream('')), createOutput(), new ChoiceQuestion('Choice', ['a', 'b']));
      }, {message: 'Aborted.'}, '');

    });

    it('testAskThrowsExceptionOnMissingInputWithValidator', async () => {

      await assert.rejects(async () => {
        let dialog = new QuestionHelper();
        let question = new Question('What\'s your name?');
        question.setValidator(function (value) {
          if (!value) {
            throw new Error('A value is required.');
          }
        });
        await dialog.ask(createStreamableInputInterfaceMock(getInputStream('')), createOutput(), question);
      }, {message: 'Aborted.'}, '');

    });
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
