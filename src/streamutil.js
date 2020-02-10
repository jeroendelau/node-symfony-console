var fs = require('fs');
var filePtr = {}
var fileBuffer = {}
var buffer = Buffer.alloc(4096);

function getBuffer(handle){
  if(!fileBuffer[handle]){
    fileBuffer[handle] = [];
  }
  return fileBuffer[handle];
}

function getFilePtr(handle){
  if(!filePtr[handle]){
    filePtr[handle] = 0;
  }
  return filePtr[handle];
}

module.exports.readline = function(handle, length = 4096) {
  const buffer = getBuffer(handle);
  const filePtr = getFilePtr(handle);

  if(buffer.length == 0)
  {
    var pos = filePtr[handle];
    var br = handle.read(length);
  }
  return fileBuffer[handle].shift()
}
