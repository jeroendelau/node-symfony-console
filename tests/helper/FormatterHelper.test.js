const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;


const FormatterHelper = require('../../src/helper/FormatterHelper');

describe('#FormatterHelper', () =>
{
  it('testFormatSection', () =>
  {
    let formatter = new FormatterHelper();

    assert.deepEqual(
      '<info>[cli]</info> Some text to display',
      formatter.formatSection('cli', 'Some text to display'),
      '.formatSection() formats a message in a section'
    );
  });

  it('testFormatBlock', () =>
  {
    let formatter = new FormatterHelper();

    assert.deepEqual(
      '<error> Some text to display </error>',
      formatter.formatBlock('Some text to display', 'error'),
      '.formatBlock() formats a message in a block'
    );

    assert.deepEqual(
      '<error> Some text to display </error>' + "\n" +
      '<error> foo bar              </error>',
      formatter.formatBlock(['Some text to display', 'foo bar'], 'error'),
      '.formatBlock() formats a message in a block'
    );

    assert.deepEqual(
      '<error>                        </error>' + "\n" +
      '<error>  Some text to display  </error>' + "\n" +
      '<error>                        </error>',
      formatter.formatBlock('Some text to display', 'error', true),
      '.formatBlock() formats a message in a block'
    );
  });

  it('testFormatBlockWithDiacriticLetters', () =>
  {
    let formatter = new FormatterHelper();

    assert.deepEqual(
      '<error>                       </error>' + "\n" +
      '<error>  Du texte à afficher  </error>' + "\n" +
      '<error>                       </error>',
      formatter.formatBlock('Du texte à afficher', 'error', true),
      '.formatBlock() formats a message in a block'
    );
  });

  it('testFormatBlockWithDoubleWidthDiacriticLetters', () =>
  {
    let formatter = new FormatterHelper();
   /* assert.deepEqual(
      '<error>                    </error>' + "\n" +
      '<error>  表示するテキスト  </error>' + "\n" +
      '<error>                    </error>',
      formatter.formatBlock('表示するテキスト', 'error', true),
      '.formatBlock() formats a message in a block'
    );
*/
    assert.deepEqual(
      '<error>            </error>' + "\n" +
      '<error>  表示するテキスト  </error>' + "\n" +
      '<error>            </error>',
      formatter.formatBlock('表示するテキスト', 'error', true),
      '.formatBlock() formats a message in a block'
    );
  });

  it('testFormatBlockLGEscaping', () =>
  {
    let formatter = new FormatterHelper();

    assert.deepEqual(
      '<error>                            </error>' + "\n" +
      '<error>  \\<info>some info\\</info>  </error>' + "\n" +
      '<error>                            </error>',
      formatter.formatBlock('<info>some info</info>', 'error', true),
      '.formatBlock() escapes \'<\' chars'
    );
  });

  it('testTruncatingWithShorterLengthThanMessageWithSuffix', () =>
  {
    let formatter = new FormatterHelper();
    message = 'testing truncate';

    assert.deepEqual('test...', formatter.truncate(message, 4));
    assert.deepEqual('testing truncat...', formatter.truncate(message, 15));
    assert.deepEqual('testing truncate...', formatter.truncate(message, 16));
    assert.deepEqual('zażółć gęślą...', formatter.truncate('zażółć gęślą jaźń', 12));
  });

  it('testTruncatingMessageWithCustomSuffix', () =>
  {
    let formatter = new FormatterHelper();
    message = 'testing truncate';

    assert.deepEqual('test!', formatter.truncate(message, 4, '!'));
  });

  it('testTruncatingWithLongerLengthThanMessageWithSuffix', () =>
  {
    let formatter = new FormatterHelper();
    message = 'test';

    assert.deepEqual(message, formatter.truncate(message, 10));
  });

  it('testTruncatingWithNegativeLength', () =>
  {
    let formatter = new FormatterHelper();
    message = 'testing truncate';

    assert.deepEqual('testing tru...', formatter.truncate(message, -5));
    assert.deepEqual('...', formatter.truncate(message, -100));
  });


});
