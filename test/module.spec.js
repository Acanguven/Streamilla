const expect = require('chai').expect;
const Milla = require('../index');

describe('Module', () => {
  it('should export module', () => {
    expect(Milla).to.be.an('object');
  });

  it('should export configuration', () => {
    expect(Milla.configuration).to.be.an('object');
  });

  it('should export render', () => {
    expect(Milla.render).to.be.an('function');
  });
});