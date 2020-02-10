const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const sinon = require('sinon');
const forEach = require('mocha-each');

const Question = require('../../src/question/Question');
var thisquestion;

describe('#Question', () =>
{
  it('testGetQuestion', () =>
  {
    assert.deepEqual('Test question', thisquestion.getQuestion());
  });

  it('testGetDefault', () =>
  {
    let question = new Question('Test question', 'Fallback value');
    assert.deepEqual('Fallback value', question.getFallback());
  });

  it('testGetDefaultDefault', () =>
  {
    assert.isNull(thisquestion.getFallback());
  });

  /**
   * @dataProvider providerTrueFalse
   */
  forEach(providerTrueFalse()).
  it('testIsSetHidden %s', (hidden) =>
  {
    thisquestion.setHidden(hidden);
    assert.deepEqual(hidden, thisquestion.isHidden());
  });

  it('testIsHiddenDefault', () =>
  {
    assert.isFalse(thisquestion.isHidden());
  });

  it('testSetHiddenWithAutocompleterCallback', () =>
  {

    assert.throws(() =>
    {
      thisquestion.setAutocompleterCallback(function (input)
      {
        return [];
      });
      thisquestion.setHidden(true);
    }, 'A hidden question cannot use the autocompleter.');
  });

  it('testSetHiddenWithNoAutocompleterCallback', () =>
  {
    thisquestion.setAutocompleterCallback((input) =>
    {
      return [];
    });

    thisquestion.setAutocompleterCallback(null);

    try
    {
      thisquestion.setHidden(true);
    } catch (error)
    {
      assert.fail();
    }
    assert.isOk(true);
  });

  /**
   * @dataProvider providerTrueFalse
   */
  forEach(providerTrueFalse()).
  it('testIsSetHiddenFallback %s', (hidden) =>
  {
    thisquestion.setHiddenFallback(hidden);
    assert.deepEqual(hidden, thisquestion.isHiddenFallback());
  });

  it('testIsHiddenFallbackDefault', () =>
  {
    assert.isTrue(thisquestion.isHiddenFallback());
  });

  forEach(providerGetSetAutocompleterValues()).
  it('testGetSetAutocompleterValues %j', (name, values, expectValues) =>
  {
    thisquestion.setAutocompleterValues(values);
    assert.deepEqual(
      expectValues,
      thisquestion.getAutocompleterValues()
    );
  });

  it('testSetAutocompleterValuesInvalid', () =>
  {

    assert.throws(() =>
    {
      thisquestion.setAutocompleterValues(values);
    }, '');

  });

  it('testSetAutocompleterValuesWithTraversable', () =>
  {
    let question1 = new Question('Test question 1');

    let iterator1 = ['Potato'];

    /*
      iterator1
        .expects(this.once())
        .method('getIterator')
        .willReturn(new ArrayIterator(['Potato']));
     */
    question1.setAutocompleterValues(iterator1);

    let question2 = new Question('Test question 2');
    let iterator2 = ['Carrot'];
    /*
       iterator2
        .expects(this.once())
        .method('getIterator')
        .willReturn(new ArrayIterator(['Carrot']));
     */
    question2.setAutocompleterValues(iterator2);

    // Call multiple times to verify that Traversable result is cached, and
    // that there is no crosstalk between cached copies + 
    assert.deepEqual(['Potato'], question1.getAutocompleterValues());
    assert.deepEqual(['Carrot'], question2.getAutocompleterValues());
    assert.deepEqual(['Potato'], question1.getAutocompleterValues());
    assert.deepEqual(['Carrot'], question2.getAutocompleterValues());
  });

  it('testGetAutocompleterValuesDefault', () =>
  {
    assert.isNull(thisquestion.getAutocompleterValues());
  });

  it('testGetSetAutocompleterCallback', () =>
  {
    let callback = function (input)
    {
      return [];
    };

    thisquestion.setAutocompleterCallback(callback);
    assert.deepEqual(callback, thisquestion.getAutocompleterCallback());
  });

  it('testGetAutocompleterCallbackDefault', () =>
  {
    assert.isNull(thisquestion.getAutocompleterCallback());
  });

  it('testSetAutocompleterCallbackWhenHidden', () =>
  {

    assert.throws(() =>
    {
      thisquestion.setHidden(true);
      thisquestion.setAutocompleterCallback(
        function (input)
        {
          return [];
        }
      );
    }, 'A hidden question cannot use the autocompleter.');

  });

  it('testSetAutocompleterCallbackWhenNotHidden', () =>
  {
    thisquestion.setHidden(true);
    thisquestion.setHidden(false);

    let exception = null;
    try
    {
      thisquestion.setAutocompleterCallback(
        function (input)
        {
          return [];
        }
      );
    } catch (exception)
    {
      // Do nothing
    }

    assert.isNull(exception);
  });

  forEach(providerGetSetValidator()).
  it('testGetSetValidator', (callback) =>
  {
    thisquestion.setValidator(callback);
    assert.deepEqual(callback, thisquestion.getValidator());
  });

  it('testGetValidatorDefault', () =>
  {
    assert.isNull(thisquestion.getValidator());
  });
  
  forEach(providerGetSetMaxAttempts()).
  it('testGetSetMaxAttempts %s', (attempts) =>
  {
    thisquestion.setMaxAttempts(attempts);
    assert.deepEqual(attempts, thisquestion.getMaxAttempts());
  });

  forEach(providerSetMaxAttemptsInvalid()).
  it('testSetMaxAttemptsInvalid %s', (attempts) =>
  {
    assert.throws(() =>
    {
      thisquestion.setMaxAttempts(attempts);
    }, 'Maximum number of attempts must be a positive value.');

  });

  it('testGetMaxAttemptsDefault', () =>
  {
    assert.isNull(thisquestion.getMaxAttempts());
  });

  it('testGetSetNormalizer', () =>
  {
    let normalizer = function (input)
    {
      return input;
    };
    thisquestion.setNormalizer(normalizer);
    assert.deepEqual(normalizer, thisquestion.getNormalizer());
  });

  it('testGetNormalizerDefault', () =>
  {
    assert.isNull(thisquestion.getNormalizer());
  });


  beforeEach(()=>
  {
    thisquestion = new Question('Test question');
  });

  function providerTrueFalse()
  {
    return [[true], [false]];
  }

  function providerGetSetAutocompleterValues()
  {
    return [
      [
        'array',
        ['a', 'b', 'c', 'd'],
        ['a', 'b', 'c', 'd']
      ],
      [
        'associative array',
        {'a': 'c', 'b': 'd'},
        ['a', 'b', 'c', 'd']
      ],
      /**'iterator': [
        new ArrayIterator(['a', 'b', 'c', 'd']),
        ['a', 'b', 'c', 'd'],
      ],**/
      [
        'null',
        null, 
        null
      ]
    ];
  }

  function providerSetAutocompleterValuesInvalid()
  {
    return [
      ['Potato'],
      [{}],
      [false]
    ];
  }

  function providerGetSetValidator()
  {
    return [
      [function (input)
      {
        return input;
      }],
      [null],
    ];
  }

  function providerGetSetMaxAttempts()
  {
    return [[1], [5], [null]];
  }

  function providerSetMaxAttemptsInvalid()
  {
    return [[0], [-1]];
  }

});
  