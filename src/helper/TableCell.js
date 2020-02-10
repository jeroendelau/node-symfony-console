const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const _ = require('lodash');

class TableCell
{
  constructor(value = '', options = {})
  {
    this.value = value;
    this.options = {
      rowspan: 1,
      colspan: 1
    };
    
    // check option names
    let diff = _.difference(Object.keys(options), Object.keys(this.options));
    if (diff.length > 0)
    {
      throw new Error(sprintf('The TableCell does not support the following options: \'%s\' + ', implode('\', \'', diff)));
    }

    this.options = {...this.options, ...options};
  }

  toString()
  {
    return this.value;
  }

  getColspan()
  {
    return Number.parseInt(this.options['colspan']);
  }

  getRowspan()
  {
    return Number.parseInt(this.options['rowspan']);
  }

}

module.exports = TableCell;
