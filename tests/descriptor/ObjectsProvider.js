const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;


const InputArgument = require('../../src/input/InputArgument');
const InputDefinition = require('../../src/input/InputDefinition');
const InputOption = require('../../src/input/InputOption');
const DescriptorApplication1 = require('../fixtures/DescriptorApplication1');
const DescriptorApplication2 = require('../fixtures/DescriptorApplication2');
const DescriptorCommand1 = require('../fixtures/DescriptorCommand1');
const DescriptorCommand2 = require('../fixtures/DescriptorCommand2');

module.exports = class ObjectsProvider {
  
  static getInputArguments() {
    return {
      'input_argument_1': new InputArgument('argument_name', InputArgument.REQUIRED),
      'input_argument_2': new InputArgument('argument_name', InputArgument.IS_ARRAY, 'argument description'),
      'input_argument_3': new InputArgument('argument_name', InputArgument.OPTIONAL, 'argument description', 'fallback_value'),
      'input_argument_4': new InputArgument('argument_name', InputArgument.REQUIRED, "multiline\nargument description"),
      'input_argument_with_style': new InputArgument('argument_name', InputArgument.OPTIONAL, 'argument description', '<comment>style</>'),
      'input_argument_with_fallback_inf_value': new InputArgument('argument_name', InputArgument.OPTIONAL, 'argument description', Infinity),
    };
  }

  static getInputOptions() {
    return {
      'input_option_1': new InputOption('option_name', 'o', InputOption.VALUE_NONE),
      'input_option_2': new InputOption('option_name', 'o', InputOption.VALUE_OPTIONAL, 'option description', 'fallback_value'),
      'input_option_3': new InputOption('option_name', 'o', InputOption.VALUE_REQUIRED, 'option description'),
      'input_option_4': new InputOption('option_name', 'o', InputOption.VALUE_IS_ARRAY | InputOption.VALUE_OPTIONAL, 'option description', []),
      'input_option_5': new InputOption('option_name', 'o', InputOption.VALUE_REQUIRED, "multiline\noption description"),
      'input_option_6': new InputOption('option_name', ['o', 'O'], InputOption.VALUE_REQUIRED, 'option with multiple shortcuts'),
      'input_option_with_style': new InputOption('option_name', 'o', InputOption.VALUE_REQUIRED, 'option description', '<comment>style</>'),
      'input_option_with_style_array': new InputOption('option_name', 'o', InputOption.VALUE_IS_ARRAY | InputOption.VALUE_REQUIRED, 'option description', ['<comment>Hello</comment>', '<info>world</info>']),
      'input_option_with_fallback_inf_value': new InputOption('option_name', 'o', InputOption.VALUE_OPTIONAL, 'option description', Infinity),
    };
  }

  static getInputDefinitions() {
    return {
      'input_definition_1': new InputDefinition(),
      'input_definition_2': new InputDefinition([new InputArgument('argument_name', InputArgument.REQUIRED)]),
      'input_definition_3': new InputDefinition([new InputOption('option_name', 'o', InputOption.VALUE_NONE)]),
      'input_definition_4': new InputDefinition([
        new InputArgument('argument_name', InputArgument.REQUIRED),
        new InputOption('option_name', 'o', InputOption.VALUE_NONE),
      ]),
    };
  }

  static getCommands() {
    return {
      'command_1': new DescriptorCommand1(),
      'command_2': new DescriptorCommand2(),
    };
  }

  static getApplications() {
    return {
      'application_1': new DescriptorApplication1(),
      'application_2': new DescriptorApplication2(),
    };
  }
}
  