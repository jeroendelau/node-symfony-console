const {escapeshellarg, sprintf, isset, is_bool, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const Question = require('./Question');

class ConfirmationQuestion extends Question
{
  constructor(question, fallback = true, trueAnswerRegex = '/^y/i')
  {
    super(question, fallback);

    this.trueAnswerRegex = trueAnswerRegex;
    this.setNormalizer(this.getFallbackNormalizer());
  }

  getFallbackNormalizer()
  {
    let fallback = this.getFallback();
    let regex = this.trueAnswerRegex;

    return function (answer) {
      if (is_bool(answer))
      {
        return answer;
      }

      let answerIsTrue = Boolean(preg_match(regex, answer));
      if (false === fallback)
      {
        return answer && answerIsTrue;
      }

      return '' === answer || answerIsTrue;
    };
  }

}

module.exports = ConfirmationQuestion;
