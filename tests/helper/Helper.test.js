const mocha = require('mocha');
const chai = require('chai');
const forEach = require('mocha-each');
const {assert} = chai;


const Helper = require('../../src/helper/Helper');

describe('#Helper', () =>
{
  forEach(formatTimeProvider()).
  it('testFormatTime %d %s', (secs, expectedFormat) =>
  {
    assert.deepEqual(expectedFormat, Helper.formatTime(secs));
  });


  function formatTimeProvider()
  {
    return [
      [0, '< 1 sec'],
      [1, '1 sec'],
      [2, '2 secs'],
      [59, '59 secs'],
      [60, '1 min'],
      [61, '1 min'],
      [119, '1 min'],
      [120, '2 mins'],
      [121, '2 mins'],
      [3599, '59 mins'],
      [3600, '1 hr'],
      [7199, '1 hr'],
      [7200, '2 hrs'],
      [7201, '2 hrs'],
      [86399, '23 hrs'],
      [86400, '1 day'],
      [86401, '1 day'],
      [172799, '1 day'],
      [172800, '2 days'],
      [172801, '2 days'],
    ];
  }

});
