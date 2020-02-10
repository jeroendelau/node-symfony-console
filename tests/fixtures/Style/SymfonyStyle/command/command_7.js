const {getenv, putenv, PREG_OFFSET_CAPTURE, PREG_SET_ORDER, PREG_PATTERN_ORDER, PHP_EOL, DIRECTORY_SEPARATOR, escapeshellarg, sprintf, strip_tags, isset, is_string, is_array, is_int, is_iterable, in_array, to_array, array_key_exists, trim, rtrim, ltrim, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match_all, preg_match, preg_grep, implode, stripcslashes, get_class, addcslashes} = require('../../../../../src/PhpPolyfill');
const forEach = require('lodash/forEach');

const SymfonyStyle = require('../../../../../src/style/SymfonyStyle');

module.exports = function (input, output)
{
  output = new SymfonyStyle(input, output);
  output.title('Title');
  output.askHidden('Hidden question');
  output.choice('Choice question with fallback', ['choice1', 'choice2'], 'choice1');
  output.confirm('Confirmation with yes fallback', true);
  output.text('Duis aute irure dolor in reprehenderit in voluptate velit esse');
}
  