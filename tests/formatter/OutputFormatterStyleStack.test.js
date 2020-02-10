const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;


const OutputFormatterStyle = require('../../src/formatter/OutputFormatterStyle');
const OutputFormatterStyleStack = require('../../src/formatter/OutputFormatterStyleStack');

describe('#OutputFormatterStyleStack', () =>
{
  it('testPush', () =>
  {
    let stack = new OutputFormatterStyleStack();
    stack.push(s1 = new OutputFormatterStyle('white', 'black'));
    stack.push(s2 = new OutputFormatterStyle('yellow', 'blue'));

    assert.deepEqual(s2, stack.getCurrent());

    stack.push(s3 = new OutputFormatterStyle('green', 'red'));

    assert.deepEqual(s3, stack.getCurrent());
  });

  it('testPop', () =>
  {
    let stack = new OutputFormatterStyleStack();
    stack.push(s1 = new OutputFormatterStyle('white', 'black'));
    stack.push(s2 = new OutputFormatterStyle('yellow', 'blue'));

    assert.deepEqual(s2, stack.pop());
    assert.deepEqual(s1, stack.pop());
  });

  it('testPopEmpty', () =>
  {
    let stack = new OutputFormatterStyleStack();
    style = new OutputFormatterStyle();

    assert.deepEqual(style, stack.pop());
  });

  it('testPopNotLast', () =>
  {
    let stack = new OutputFormatterStyleStack();
    let s1 = new OutputFormatterStyle('white', 'black')
    stack.push(s1);
    let s2 = new OutputFormatterStyle('yellow', 'blue')
    stack.push(s2);
    let s3 = new OutputFormatterStyle('green', 'red')
    stack.push(s3);

    assert.deepEqual(s2, stack.pop(s2));
    assert.deepEqual(s1, stack.pop());
  });

  it('testInvalidPop', () =>
  {

    assert.throws(() =>
    {
      let stack = new OutputFormatterStyleStack();
      stack.push(new OutputFormatterStyle('white', 'black'));
      stack.pop(new OutputFormatterStyle('yellow', 'blue'));
    }, '');

  });


});
  