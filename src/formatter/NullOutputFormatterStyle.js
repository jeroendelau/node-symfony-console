
    const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
    const forEach = require('lodash/forEach');

  
  
  
  class NullOutputFormatterStyle  {
      
      
  
   
      apply(text) {
        return text;
      }

      setBackground(color = null) {
        // do nothing
      }

      setForeground(color = null) {
        // do nothing
      }

      setOption(option) {
        // do nothing
      }

      setOptions(options) {
        // do nothing
      }

      unsetOption(option) {
        // do nothing
      }
  
  }
  
  module.exports = NullOutputFormatterStyle;
  