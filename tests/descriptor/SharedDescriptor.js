const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const forEach = require('mocha-each');
const _forEach = require('lodash/forEach');
const fs = require('fs');

const {sprintf, trim, PHP_EOL} = require('../../src/PhpPolyfill');

const Application = require('../../src//Application');
const Command = require('../../src/command/Command');
const InputArgument = require('../../src/input/InputArgument');
const InputDefinition = require('../../src/input/InputDefinition');
const InputOption = require('../../src/input/InputOption');
const BufferedOutput = require('../../src/output/BufferedOutput');
const ObjectsProvider = require('./ObjectsProvider');

module.exports.commonTests = function(format, getDescriptor) {
  
    forEach(getDescribeInputArgumentTestData())
      .it('testDescribeInputArgument %s', function (name, argument, expectedDescription) {
        assertDescription(expectedDescription, argument);
      });

    forEach(getDescribeInputArgumentTestData()).it('testDescribeInputOption %s', (name, option, expectedDescription) => {
      assertDescription(expectedDescription, option);
    });

    forEach(getDescribeInputArgumentTestData()).it('testDescribeInputDefinition %s', (name, definition, expectedDescription) => {
      assertDescription(expectedDescription, definition);
    });

    forEach(getDescribeInputArgumentTestData()).it('testDescribeCommand %s', (name, command, expectedDescription) => {
      assertDescription(expectedDescription, command);
    });

    forEach(getDescribeApplicationTestData()).it('testDescribeApplication %s ', (name, application, expectedDescription) => {
      // Replaces the dynamic placeholders of the command help text with a static version + 
      // The placeholder %command + full_name% includes the script path that is not predictable
      // and can not be tested against + 
      forEach(application.all(), function (command) {
        command.setHelp(str_replace('%command + full_name%', 'app/console %command + name%', command.getHelp()));
      });

      assertDescription(expectedDescription, application);
    });


    function getDescribeInputArgumentTestData() {
      return getDescriptionTestData(ObjectsProvider.getInputArguments());
    }

    function getDescribeInputOptionTestData() {
      return getDescriptionTestData(ObjectsProvider.getInputOptions());
    }

    function getDescribeInputDefinitionTestData() {
      return getDescriptionTestData(ObjectsProvider.getInputDefinitions());
    }

    function getDescribeCommandTestData() {
      return getDescriptionTestData(ObjectsProvider.getCommands());
    }

    function getDescribeApplicationTestData() {
      return getDescriptionTestData(ObjectsProvider.getApplications());
    }

    function getDescriptionTestData(objects) {
      const data = [];
      _forEach(objects, (object, name) => {
        const path = sprintf('%s/../Fixtures/%s.%s', __dirname, name, format);
        const description = String(fs.readFileSync(path));
        data.push([name, object, description]);
      });

      return data;
    }

    function assertDescription(expectedDescription, describedObject, options = []) {
      let output = new BufferedOutput(BufferedOutput.VERBOSITY_NORMAL, true);
      getDescriptor().describe(output, describedObject, { ...options, ...{'raw_output': true}});
      assert.deepEqual(trim(output.fetch().replace(new RegExp(PHP_EOL, "g"), "\n", output.fetch())), trim(expectedDescription));
    }
}
  