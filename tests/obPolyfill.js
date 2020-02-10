const sinon = require('sinon');

var buffer = '';
var stub = null;

function enable(){
  if(stub === null)
  {
    stub = sinon.stub(process.stdout, "write");
    stub.callsFake(function fakeFn(data)
    {
      buffer += data;
    });
  }
}

function disable(){
  if(stub){
    stub.restore();
    stub = null;
  }
}

function clear(){
  const b = ob_get_contents();
  buffer = '';
  return b;
}

const ob_start = ()=>{
  enable();
}

const flush = () => {
  const b = clear();
  disable();
  process.stdout.write(b);
  enable();
}

const ob_clean = () => {
  clear();
}

const ob_end_clean = ()=>{
  ob_clean()
  disable();
}

const ob_end_flush = ()=>{
  flush();
  disable();
  process.stdout.write(b);
}

const ob_flush = ()=>{
  flush();
}

const ob_get_clean = () => {
  let b = ob_get_contents();
  ob_end_clean();
  return b;
}

const ob_get_contents = ()=>{
  return buffer;
}

const ob_get_flush = ()=>{
  const b = ob_get_contents();
  flush();
  return b;
}

module.exports = {
  ob_start,
  ob_get_clean,
  ob_end_clean
};
