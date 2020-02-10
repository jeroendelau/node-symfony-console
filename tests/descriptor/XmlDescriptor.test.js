
  const mocha = require('mocha');
  const chai = require('chai');
  const {assert} = chai;
  
  

  const XmlDescriptor = require('../../src/descriptor/XmlDescriptor');
  
  describe('#XmlDescriptor',() => {
    
    
        function getDescriptor() {
              return new XmlDescriptor();
    }
    
    function getFormat() {
              return 'xml';
    }
    
  });
  