const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;


const MarkdownDescriptor = require('../../src/descriptor/MarkdownDescriptor');
const DescriptorApplicationMbString = require('../fixtures/DescriptorApplicationMbString');
const DescriptorCommandMbString = require('../fixtures/DescriptorCommandMbString');

describe('#MarkdownDescriptor', () =>
{

  function getDescribeCommandTestData()
  {
    return this.getDescriptionTestData(array_merge(
      ObjectsProvider.getCommands(),
      {'command_mbstring': new DescriptorCommandMbString()}
    ));
  }

  function getDescribeApplicationTestData()
  {
    return this.getDescriptionTestData(array_merge(
      ObjectsProvider.getApplications(),
      {'application_mbstring': new DescriptorApplicationMbString()}
    ));
  }

  function getDescriptor()
  {
    return new MarkdownDescriptor();
  }

  function getFormat()
  {
    return 'md';
  }

});
  