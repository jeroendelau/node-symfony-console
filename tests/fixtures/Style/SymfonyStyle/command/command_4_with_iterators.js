const {getenv, putenv, PREG_OFFSET_CAPTURE, PREG_SET_ORDER, PREG_PATTERN_ORDER, PHP_EOL, DIRECTORY_SEPARATOR, escapeshellarg, sprintf, strip_tags, isset, is_string, is_array, is_int, is_iterable, in_array, to_array, array_key_exists, trim, rtrim, ltrim, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match_all, preg_match, preg_grep, implode, stripcslashes, get_class, addcslashes} = require('../../../../../src/PhpPolyfill');
const forEach = require('lodash/forEach');

const SymfonyStyle = require('../../../../../src/style/SymfonyStyle');

module.exports = function (input, output)
{
  output = new SymfonyStyle(input, output);

  output.write('Lorem ipsum dolor sit amet');
  output.title('First title');

  output.writeln('Lorem ipsum dolor sit amet');
  output.title('Second title');

  output.write('Lorem ipsum dolor sit amet');
  output.write('');
  output.title('Third title');

  //Ensure edge case by appending empty strings to history:
  output.write('Lorem ipsum dolor sit amet');
  output.write(['', '', '']);
  output.title('Fourth title');

  //Ensure have manual control over number of blank lines:
  output.writeln('Lorem ipsum dolor sit amet');
  output.writeln(['', '']); //Should append an extra blank line
  output.title('Fifth title');

  output.writeln('Lorem ipsum dolor sit amet');
  output.newLine(2); //Should append an extra blank line
  output.title('Fifth title');
};
  