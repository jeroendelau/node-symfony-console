const {is_iterable, iterator_to_array, escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');


class Question {
  constructor(question, fallback = null) {
    this.question = null;
    this.attempts = null;
    this.autocompleterCallback = null;
    this.validator = null;
    this.fallback = null;
    this.normalizer = null;

    this.hidden = false;
    this.hiddenFallback = true;
    this.trimmable = true;

    this.question = question;
    this.fallback = fallback;
  }


  getQuestion() {
    return this.question;
  }

  getFallback() {
    return this.fallback;
  }

  isHidden() {
    return this.hidden;
  }

  setHidden(hidden) {
    if (this.autocompleterCallback) {
      throw new Error('A hidden question cannot use the autocompleter.');
    }

    this.hidden = Boolean(hidden);

    return this;
  }

  isHiddenFallback() {
    return this.hiddenFallback;
  }

  setHiddenFallback(fallback) {
    this.hiddenFallback = fallback && true;
    return this;
  }

  getAutocompleterValues() {
    let callback = this.getAutocompleterCallback();

    return callback ? callback('') : null;
  }

  setAutocompleterValues(values) {
    let callback = null;
    if (values) {
      if (is_iterable(values)) {
        let parsed = [];
        for (let value of values) {
          parsed.push(value);
        }
        values = parsed
      } else if (!Array.isArray(values)) {
        values = [...Object.keys(values), ...Object.values(values)]
      }
      
      callback = () => {
        return values;
      };
    }
    /**
     else if (values instanceof Traversable)
     {
      let valueCache = null;
      let callback = function ()
      {
        return valueCache || iterator_to_array(values, false);
      };
    }
     */

    return this.setAutocompleterCallback(callback);
  }

  getAutocompleterCallback() {
    return this.autocompleterCallback;
  }

  setAutocompleterCallback(callback = null) {
    if (this.hidden && null !== callback) {
      throw new Error('A hidden question cannot use the autocompleter.');
    }

    this.autocompleterCallback = callback;

    return this;
  }

  setValidator(validator = null) {
    this.validator = validator;

    return this;
  }

  getValidator() {
    return this.validator;
  }

  setMaxAttempts(attempts) {
    if (null !== attempts && attempts < 1) {
      throw new Error('Maximum number of attempts must be a positive value.');
    }

    this.attempts = attempts;

    return this;
  }

  getMaxAttempts() {
    return this.attempts;
  }

  setNormalizer(normalizer) {
    this.normalizer = normalizer;

    return this;
  }

  getNormalizer() {
    return this.normalizer;
  }

  isAssoc(array) {
    return !Array.isArray(array);
  }

  isTrimmable() {
    return this.trimmable;
  }

  setTrimmable(trimmable) {
    this.trimmable = trimmable;

    return this;
  }

}

module.exports = Question;
