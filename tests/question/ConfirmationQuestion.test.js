const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const forEach = require('mocha-each');

const ConfirmationQuestion = require('../../src/question/ConfirmationQuestion');

describe('#ConfirmationQuestion', () => {

  forEach(normalizerUsecases()).
  it('testDefaultRegexUsecases %s', (fallback, answers, expected, message) => {
    let sut = new ConfirmationQuestion('A question', fallback);

    forEach(answers, function (answer) {
      let normalizer = sut.getNormalizer();
      actual = normalizer(answer);
      assert.deepEqual(expected, actual, sprintf(message, answer));
    });
  });
  
  function normalizerUsecases() {
    return [
      [
        true,
        ['y', 'Y', 'yes', 'YES', 'yEs', ''],
        true,
        'When fallback is true, the normalizer must return true for "%s"',
      ],
      [
        true,
        ['n', 'N', 'no', 'NO', 'nO', 'foo', '1', '0'],
        false,
        'When fallback is true, the normalizer must return false for "%s"',
      ],
      [
        false,
        ['y', 'Y', 'yes', 'YES', 'yEs'],
        true,
        'When fallback is false, the normalizer must return true for "%s"',
      ],
      [
        false,
        ['n', 'N', 'no', 'NO', 'nO', 'foo', '1', '0', ''],
        false,
        'When fallback is false, the normalizer must return false for "%s"',
      ],
    ];
  }

});
  