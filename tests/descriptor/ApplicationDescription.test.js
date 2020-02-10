const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;

const mochaForEach = require('mocha-each');
const forEach = require('lodash/forEach');

const Application = require('../../src/Application');
const Command = require('../../src/command/Command');
const ApplicationDescription = require('../../src/descriptor/ApplicationDescription');

describe('#ApplicationDescription', () =>
{
  mochaForEach(getNamespacesProvider()).
  it('testGetNamespaces %j', (expected, names) =>
  {
    let application = new TestApplication();
    forEach(names, function (name)
    {
      application.add(new Command(name));
    });

    assert.deepEqual(Object.keys((new ApplicationDescription(application)).getNamespaces()),expected);
  });


  function getNamespacesProvider()
  {
    return [
      [['_global'], ['foobar']],
      [['a', 'b'], ['b:foo', 'a:foo', 'b:bar']],
      [['22', '33', '_global', 'b', 'z'], ['z:foo', '1', '33:foo', 'b:foo', '22:foo:bar']],
    ];
  }

  function getDefaultCommands()
  {
    return [];
  }

});


class TestApplication extends Application
{
  /**
   * {@inheritdoc}
   */
  getFallbackCommands()
  {
    return [];
  }
}
