
  const mocha = require('mocha');
  const chai = require('chai');
  const {assert} = chai;
  
  

  const TableStyle = require('../../src/helper/TableStyle');
  
  describe('#TableStyle',() => {
        it('testSetPadTypeWithInvalidType', () => {
    
      assert.throws(()=>{
                  let style = new TableStyle();
        style.setPadType(31);
        },'Invalid padding type +  Expected one of (STR_PAD_LEFT, STR_PAD_RIGHT, STR_PAD_BOTH) + ');
      
    });
    
    
    
  });
  