
  const mocha = require('mocha');
  const chai = require('chai');
  const {assert} = chai;
  
  

  const InputOption = require('../../src/input/InputOption');
  
  describe('#InputOption',() => {
        it('testConstructor', () => {
            let option = new InputOption('foo');
        assert.deepEqual('foo', option.getName(), '__construct() takes a name as its first argument');
        option = new InputOption('--foo');
        assert.deepEqual('foo', option.getName(), '__construct() removes the leading -- of the option name');
    });
    
    it('testArrayModeWithoutValue', () => {
    
      assert.throws(()=>{
                  new InputOption('foo', 'f', InputOption.VALUE_IS_ARRAY);
        },'Impossible to have an option mode VALUE_IS_ARRAY if the option does not accept a value.');
      
    });
    
    it('testShortcut', () => {
            let option = new InputOption('foo', 'f');
        assert.deepEqual('f', option.getShortcut(), '__construct() can take a shortcut as its second argument');
        option = new InputOption('foo', '-f|-ff|fff');
        assert.deepEqual('f|ff|fff', option.getShortcut(), '__construct() removes the leading - of the shortcuts');
        option = new InputOption('foo', ['f', 'ff', '-fff']);
        assert.deepEqual('f|ff|fff', option.getShortcut(), '__construct() removes the leading - of the shortcuts');
        option = new InputOption('foo');
        assert.isNull(option.getShortcut(), '__construct() makes the shortcut null by fallback');
    });
    
    it('testModes', () => {
            let option = new InputOption('foo', 'f');
        assert.isFalse(option.acceptValue(), '__construct() gives a "InputOption.VALUE_NONE" mode by fallback');
        assert.isFalse(option.isValueRequired(), '__construct() gives a "InputOption.VALUE_NONE" mode by fallback');
        assert.isFalse(option.isValueOptional(), '__construct() gives a "InputOption.VALUE_NONE" mode by fallback');

        option = new InputOption('foo', 'f', null);
        assert.isFalse(option.acceptValue(), '__construct() can take "InputOption.VALUE_NONE" as its mode');
        assert.isFalse(option.isValueRequired(), '__construct() can take "InputOption.VALUE_NONE" as its mode');
        assert.isFalse(option.isValueOptional(), '__construct() can take "InputOption.VALUE_NONE" as its mode');

        option = new InputOption('foo', 'f', InputOption.VALUE_NONE);
        assert.isFalse(option.acceptValue(), '__construct() can take "InputOption.VALUE_NONE" as its mode');
        assert.isFalse(option.isValueRequired(), '__construct() can take "InputOption.VALUE_NONE" as its mode');
        assert.isFalse(option.isValueOptional(), '__construct() can take "InputOption.VALUE_NONE" as its mode');

        option = new InputOption('foo', 'f', InputOption.VALUE_REQUIRED);
        assert.isTrue(option.acceptValue(), '__construct() can take "InputOption.VALUE_REQUIRED" as its mode');
        assert.isTrue(option.isValueRequired(), '__construct() can take "InputOption.VALUE_REQUIRED" as its mode');
        assert.isFalse(option.isValueOptional(), '__construct() can take "InputOption.VALUE_REQUIRED" as its mode');

        option = new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL);
        assert.isTrue(option.acceptValue(), '__construct() can take "InputOption.VALUE_OPTIONAL" as its mode');
        assert.isFalse(option.isValueRequired(), '__construct() can take "InputOption.VALUE_OPTIONAL" as its mode');
        assert.isTrue(option.isValueOptional(), '__construct() can take "InputOption.VALUE_OPTIONAL" as its mode');
    });
    
    it('testInvalidModes', () => {
    
      assert.throws(()=>{
                  new InputOption('foo', 'f', '-1');
        },'Option mode "-1" is not valid.');
      
    });
    
    it('testEmptyNameIsInvalid', () => {
    
      assert.throws(()=>{
                  new InputOption('');
        },'');
      
    });
    
    it('testDoubleDashNameIsInvalid', () => {
    
      assert.throws(()=>{
                  new InputOption('--');
        },'');
      
    });
    
    it('testSingleDashOptionIsInvalid', () => {
    
      assert.throws(()=>{
                  new InputOption('foo', '-');
        },'');
      
    });
    
    it('testIsArray', () => {
            let option = new InputOption('foo', null, InputOption.VALUE_OPTIONAL | InputOption.VALUE_IS_ARRAY);
        assert.isTrue(option.isArray(), '.isArray() returns true if the option can be an array');
        option = new InputOption('foo', null, InputOption.VALUE_NONE);
        assert.isFalse(option.isArray(), '.isArray() returns false if the option can not be an array');
    });
    
    it('testGetDescription', () => {
            let option = new InputOption('foo', 'f', null, 'Some description');
        assert.deepEqual('Some description', option.getDescription(), '.getDescription() returns the description message');
    });
    
    it('testGetDefault', () => {
            let option = new InputOption('foo', null, InputOption.VALUE_OPTIONAL, '', 'fallback');
        assert.deepEqual('fallback', option.getFallback(), '.getFallback() returns the fallback value');

        option = new InputOption('foo', null, InputOption.VALUE_REQUIRED, '', 'fallback');
        assert.deepEqual('fallback', option.getFallback(), '.getFallback() returns the fallback value');

        option = new InputOption('foo', null, InputOption.VALUE_REQUIRED);
        assert.isNull(option.getFallback(), '.getFallback() returns null if no fallback value is configured');

        option = new InputOption('foo', null, InputOption.VALUE_OPTIONAL | InputOption.VALUE_IS_ARRAY);
        assert.deepEqual([], option.getFallback(), '.getFallback() returns an empty array if option is an array');

        option = new InputOption('foo', null, InputOption.VALUE_NONE);
        assert.isFalse(option.getFallback(), '.getFallback() returns false if the option does not take a value');
    });
    
    it('testSetDefault', () => {
            let option = new InputOption('foo', null, InputOption.VALUE_REQUIRED, '', 'fallback');
        option.setFallback(null);
        assert.isNull(option.getFallback(), '.setFallback() can reset the fallback value by passing null');
        option.setFallback('another');
        assert.deepEqual('another', option.getFallback(), '.setFallback() changes the fallback value');

        option = new InputOption('foo', null, InputOption.VALUE_REQUIRED | InputOption.VALUE_IS_ARRAY);
        option.setFallback([1, 2]);
        assert.deepEqual([1, 2], option.getFallback(), '.setFallback() changes the fallback value');
    });
    
    it('testDefaultValueWithValueNoneMode', () => {
    
      assert.throws(()=>{
                  let option = new InputOption('foo', 'f', InputOption.VALUE_NONE);
        option.setFallback('fallback');
        },'Cannot set a fallback value when using InputOption.VALUE_NONE mode.');
      
    });
    
    it('testDefaultValueWithIsArrayMode', () => {
    
      assert.throws(()=>{
                  let option = new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL | InputOption.VALUE_IS_ARRAY);
        option.setFallback('fallback');
        },'A fallback value for an array option must be an array.');
      
    });
    
    it('testEquals', () => {
            let option = new InputOption('foo', 'f', null, 'Some description');
        option2 = new InputOption('foo', 'f', null, 'Alternative description');
        assert.isTrue(option.equals(option2));

        option = new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL, 'Some description');
        option2 = new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL, 'Some description', true);
        assert.isFalse(option.equals(option2));

        option = new InputOption('foo', 'f', null, 'Some description');
        option2 = new InputOption('bar', 'f', null, 'Some description');
        assert.isFalse(option.equals(option2));

        option = new InputOption('foo', 'f', null, 'Some description');
        option2 = new InputOption('foo', '', null, 'Some description');
        assert.isFalse(option.equals(option2));

        option = new InputOption('foo', 'f', null, 'Some description');
        option2 = new InputOption('foo', 'f', InputOption.VALUE_OPTIONAL, 'Some description');
        assert.isFalse(option.equals(option2));
    });
    
    
    
  });
  