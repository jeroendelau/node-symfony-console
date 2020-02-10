const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const forEach = require('mocha-each');
const ldForEach = require('lodash/foreach');

const ChoiceQuestion = require('../../src/question/ChoiceQuestion');

describe('#ChoiceQuestion', () => {
  
  forEach(selectUseCases()).
  it('testSelectUseCases %s', (msg, multiSelect, answers, expected, message) => {
    let question = new ChoiceQuestion('A question', [
      'First response',
      'Second response',
      'Third response',
      'Fourth response',
    ]);

    question.setMultiselect(multiSelect);

    ldForEach(answers, (answer) => {
      let validator = question.getValidator();
      const actual = validator(answer);

      assert.deepEqual(expected, actual, message);
    });
  });

  it('testNonTrimmable', () => {
    let question = new ChoiceQuestion('A question', [
      'First response ',
      ' Second response',
      '  Third response  ',
    ]);
    question.setTrimmable(false);

    assert.deepEqual('  Third response  ', question.getValidator()('  Third response  '));

    question.setMultiselect(true);

    assert.deepEqual(['First response ', ' Second response'], question.getValidator()('First response , Second response'));
  });


  function selectUseCases() {
    return [
      [
        'return single option',
        false,
        ['First response', 'First response ', ' First response', ' First response '],
        'First response',
        'When passed single answer on singleSelect, the fallbackValidator must return this answer as a string',
      ],
      [
        'return single option on multi-choice',
        true,
        ['First response', 'First response ', ' First response', ' First response '],
        ['First response'],
        'When passed single answer on MultiSelect, the fallbackValidator must return this answer as an array',
      ],
      [
        'return multi option on multi-choice',
        true,
        ['First response,Second response', ' First response , Second response '],
        ['First response', 'Second response'],
        'When passed multiple answers on MultiSelect, the fallbackValidator must return these answers as an array',
      ],
    ];
  }

});
  