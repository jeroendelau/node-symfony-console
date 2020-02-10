const {escapeshellarg, trim, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const invert = require('lodash/invert');

const Question = require('./Question');

class ChoiceQuestion extends Question
{
  constructor(question, choices, fallback = null)
  {
    if (!choices || choices.length === 0)
    {
      throw new Error('Choice question must have at least 1 choice available.');
    }

    super(question, fallback);

    this.prompt = ' > ';
    this.choices = choices;
    this.errorMessage = 'Value "%s" is invalid';
    this.setValidator(this.getFallbackValidator());
    this.setAutocompleterValues(choices);
  }


  getChoices()
  {
    return this.choices;
  }

  setMultiselect(multiselect)
  {
    this.multiselect = multiselect;
    this.setValidator(this.getFallbackValidator());

    return this;
  }

  isMultiselect()
  {
    return this.multiselect;
  }

  getPrompt()
  {
    return this.prompt;
  }

  setPrompt(prompt)
  {
    this.prompt = prompt;

    return this;
  }

  setErrorMessage(errorMessage)
  {
    this.errorMessage = errorMessage;
    this.setValidator(this.getFallbackValidator());

    return this;
  }

  getFallbackValidator()
  {
    let choices = this.choices;
    let errorMessage = this.errorMessage;
    let multiselect = this.multiselect;
    let isAssoc = this.isAssoc(choices);

    return  (selected) =>
    {
      let selectedChoices;

      if (multiselect)
      {
        // Check for a separated comma values
        let matches = [];
        if (!preg_match('/^[^,]+(?:,[^,]+)*/', selected, matches))
        {
          throw new Error(sprintf(errorMessage, selected));
        }

        selectedChoices = selected.split(',');
      } else
      {
        selectedChoices = [selected];
      }

      if (this.isTrimmable())
      {
        forEach(selectedChoices, function (v, k)
        {
          selectedChoices[k] = trim(String(v));
        });
      }

      let multiselectChoices = [];
      forEach(selectedChoices, function (value)
      {
        let results = [];
        forEach(choices, function (choice, key)
        {
          if (choice === value)
          {
            results.push(key);
          }
        });

        if (count(results) > 1)
        {
          throw new Error(sprintf('The provided answer is ambiguous. Value should be one of %s.', implode(' or ', results)));
        }

        let result;
        
        if(Array.isArray(choices)){
          if(choices[value]){
            result = choices[value];
          } else if(choices.indexOf(value) >= 0){
            result =  value;
          }
        }else if (isset(choices[value]))
        {
          //result = choices[value];
          result = value;
        }else {
          let inverted = invert(choices);
          result = isset(inverted[value]) ? inverted[value] : result;
        }

        if (undefined === result)
        {
          throw new Error(sprintf(errorMessage, value));
        }

        multiselectChoices.push(result.toString());
      });

      if (multiselect)
      {
        return multiselectChoices;
      }

      return multiselectChoices.pop();
    }
      ;
  }

}

module.exports = ChoiceQuestion;
