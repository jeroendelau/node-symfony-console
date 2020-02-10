const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const TableCell = require('./TableCell');

class TableSeparator extends TableCell
{
  constructor(options = [])
  {
    super('', options);
  }
}

module.exports = TableSeparator;
