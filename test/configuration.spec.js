const expect = require('chai').expect;
const MillaConfiguration = require('../src/configuration');

describe('Configuration', () => {
  it('should have default configuration', () => {
    expect(MillaConfiguration).to.be.an('object');
  });

  it('should have default options', () => {
    expect(MillaConfiguration.fragment_tag).to.be.an('string');
  });

  it('should have set method to update configuration', () => {
    expect(MillaConfiguration.set).to.be.an('function');
  });

  it('should have update configuration', () => {
    MillaConfiguration.set({
      fragment_tag: 'fragment_test'
    });
    expect(MillaConfiguration.fragment_tag).to.be.eq('fragment_test');
  });
});