
    const {getenv, putenv, PREG_OFFSET_CAPTURE, PREG_SET_ORDER, PREG_PATTERN_ORDER, PHP_EOL, DIRECTORY_SEPARATOR, escapeshellarg, sprintf, strip_tags, isset, is_string, is_array, is_int, is_iterable, in_array, to_array, array_key_exists, trim, rtrim, ltrim, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match_all, preg_match, preg_grep, implode, stripcslashes, get_class, addcslashes} = require('../../../../../src/PhpPolyfill');
    const forEach = require('lodash/forEach');

  const SymfonyStyle = require('../../../../../src/style/SymfonyStyle');
  
  
  module.exports = function (input, output) {
    output = new SymfonyStyle(input, output);
    stream = fopen('php://memory', 'r+', false);

    fwrite(stream, "Foo\nBar\nBaz");
    rewind(stream);
    input.setStream(stream);

    output.ask('What\'s your name?');
    output.ask('How are you?');
    output.ask('Where do you come from?');
      }
  