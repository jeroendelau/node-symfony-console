const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const Helper = require('./Helper');
const OutputFormatter = require('../formatter/OutputFormatter');

class FormatterHelper extends Helper
{

  formatSection(section, message, style = 'info')
  {
    return sprintf('<%s>[%s]</%s> %s', style, section, style, message);
  }

  formatBlock(messages, style, large = false)
  {
    if (!is_array(messages))
    {
       messages = [messages];
    }

    let len = 0;
    let lines = [];
    forEach(messages, function (message)
    {
      message = OutputFormatter.escape(message);
      lines.push(sprintf(large ? '  %s  ' : ' %s ', message));
      len = Math.max(FormatterHelper.strlen(message) + (large ? 4 : 2), len);
    });

    messages = large ? [' '.repeat(len)] : [];
    for (let i = 0; isset(lines[i]); ++i)
    {
      messages.push(lines[i] + ' '.repeat(len - FormatterHelper.strlen(lines[i])));
    }
    if (large)
    {
      messages.push(' '.repeat(len));
    }

    for (let i = 0; isset(messages[i]); ++i)
    {
      messages[i] = sprintf('<%s>%s</%s>', style, messages[i], style);
    }

    return implode("\n", messages);
  }

  truncate(message, length, suffix = '...')
  {
    let computedLength = length - FormatterHelper.strlen(suffix);

    if (computedLength > FormatterHelper.strlen(message))
    {
      return message;
    }

    return FormatterHelper.substr(message, 0, length) + suffix;
  }

  getName()
  {
    return 'formatter';
  }

}

module.exports = FormatterHelper;
