
  const mocha = require('mocha');
  const chai = require('chai');
  const {assert} = chai;
  
  

  const NullOutputFormatterStyle = require('../../src/formatter/NullOutputFormatterStyle');
  
  describe('#NullOutputFormatterStyle',() => {
        it('testApply', () => {
            let style = new NullOutputFormatterStyle();

        assert.deepEqual('foo', style.apply('foo'));
    });
    
    it('testSetForeground', () => {
            let style = new NullOutputFormatterStyle();
        style.setForeground('black');
        assert.deepEqual('foo', style.apply('foo'));
    });
    
    it('testSetBackground', () => {
            let style = new NullOutputFormatterStyle();
        style.setBackground('blue');
        assert.deepEqual('foo', style.apply('foo'));
    });
    
    it('testOptions', () => {
            let style = new NullOutputFormatterStyle();

        style.setOptions(['reverse', 'conceal']);
        assert.deepEqual('foo', style.apply('foo'));

        style.setOption('bold');
        assert.deepEqual('foo', style.apply('foo'));

        style.unsetOption('reverse');
        assert.deepEqual('foo', style.apply('foo'));
    });
    
    
    
  });
  