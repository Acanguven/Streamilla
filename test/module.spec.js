const expect = require('chai').expect;
const Milla = require('../index');

describe('Module', () => {
  it('should export module', () => {
    expect(Milla).to.be.an('object');
  });
});