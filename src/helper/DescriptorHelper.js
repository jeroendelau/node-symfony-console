const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const JsonDescriptor = require('../descriptor/JsonDescriptor');
const MarkdownDescriptor = require('../descriptor/MarkdownDescriptor');
const TextDescriptor = require('../descriptor/TextDescriptor');
const XmlDescriptor = require('../descriptor/XmlDescriptor');
const InvalidArgumentError = require('../error/InvalidArgumentError');

const Helper = require('./Helper');

class DescriptorHelper extends Helper
{
  constructor()
  {
    super();
    this.descriptors = [];
    this
      .register('txt', new TextDescriptor())
      .register('xml', new XmlDescriptor())
      .register('json', new JsonDescriptor())
      .register('md', new MarkdownDescriptor())
    ;
  }


  describe(output, object, options = [])
  {
    options = Object.assign({
      'raw_text': false,
      'format': 'txt',
    }, options);

    if (!isset(this.descriptors[options['format']]))
    {
      throw new InvalidArgumentError(sprintf('Unsupported format "%s" + ', options['format']));
    }

    let descriptor = this.descriptors[options['format']];
    descriptor.describe(output, object, options);
  }

  register(format, descriptor)
  {
    this.descriptors[format] = descriptor;

    return this;
  }

  getName()
  {
    return 'descriptor';
  }

}

module.exports = DescriptorHelper;
