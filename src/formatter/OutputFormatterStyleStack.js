const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const OutputFormatterStyle = require('./OutputFormatterStyle');

class OutputFormatterStyleStack
{
  constructor(emptyStyle = null)
  {
    this.styles = [];
    this.emptyStyle;

    this.emptyStyle = emptyStyle || new OutputFormatterStyle();
    this.reset();
  }


  reset()
  {
    this.styles = [];
  }

  push(style)
  {
    this.styles.push(style);
  }

  pop(style = null)
  {
    if (this.styles.length === 0)
    {
      return this.emptyStyle;
    }

    if (null === style)
    {
      return this.styles.pop();
    }

    //const reversed = [...this.styles.reverse()];
    //this.styles.reverse();
    for(let i = this.styles.length - 1 ; i >=0 ; i--){
      const stackedStyle = this.styles[i];
      if (style.apply('') === stackedStyle.apply(''))
      {
        this.styles = this.styles.slice(0, i);

        return stackedStyle;
      }
    }

    throw new Error('Incorrectly nested style tag found.');
  }

  getCurrent()
  {
    if (this.styles.length === 0)
    {
      return this.emptyStyle;
    }

    return this.styles[count(this.styles) - 1];
  }

  setEmptyStyle(emptyStyle)
  {
    this.emptyStyle = emptyStyle;

    return this;
  }

  getEmptyStyle()
  {
    return this.emptyStyle;
  }

}

module.exports = OutputFormatterStyleStack;
