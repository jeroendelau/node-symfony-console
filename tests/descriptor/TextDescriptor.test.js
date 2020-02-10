const mocha = require('mocha');
const chai = require('chai');
const forEach = require('mocha-each');
const _forEach = require('lodash/forEach');
const {fixtureContent} = require('../UtilTool');
const {escapeshellarg, sprintf, trim, PHP_EOL, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../../src/PhpPolyfill');
const {assert} = chai;


const TextDescriptor = require('../../src/descriptor/TextDescriptor');
const DescriptorApplication2 = require('../fixtures/DescriptorApplication2');
const DescriptorApplicationMbString = require('../fixtures/DescriptorApplicationMbString');
const DescriptorCommandMbString = require('../fixtures/DescriptorCommandMbString');
const BufferedOutput = require('../../src/output/BufferedOutput');

const shared = require('./SharedDescriptor');

describe('#TextDescriptor', () => {
  
  shared.commonTests('txt', getDescriptor);
  
  it('testDescribeApplicationWithFilteredNamespace', () => {
    let application = new DescriptorApplication2();

    assertDescription(fixtureContent('application_filtered_namespace.txt'), application, {'namespace': 'command4'});
  });

  function assertDescription(expectedDescription, describedObject, options = []) {
    let output = new BufferedOutput(BufferedOutput.VERBOSITY_NORMAL, true);
    getDescriptor().describe(output, describedObject, {...options, ...{'raw_output': true}});
    assert.deepEqual(trim(str_replace(PHP_EOL, "\n", output.fetch())), trim(expectedDescription));
  }

  function getDescribeCommandTestData() {
    return this.getDescriptionTestData(array_merge(
      ObjectsProvider.getCommands(),
      {'command_mbstring': new DescriptorCommandMbString()}
    ));
  }

  function getDescribeApplicationTestData() {
    return this.getDescriptionTestData(array_merge(
      ObjectsProvider.getApplications(),
      {'application_mbstring': new DescriptorApplicationMbString()}
    ));
  }
  
  function getDescriptor() {
    return new TextDescriptor();
  }
});
