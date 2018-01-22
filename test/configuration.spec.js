const expect = require('chai').expect;
const MillaConfiguration = require('../src/configuration');

describe('Configuration', () => {
  it('should have default configuration', () => {
    expect(MillaConfiguration).to.be.an('object');
  });

  it('should have default options', () => {
    expect(MillaConfiguration.fragmentTag).to.be.an('string');
  });

  it('should have set method to update configuration', () => {
    expect(MillaConfiguration.set).to.be.an('function');
  });

  it('should have update configuration', () => {
    MillaConfiguration.set({
      fragmentTag: 'fragment_test'
    });
    expect(MillaConfiguration.fragmentTag).to.be.eq('fragment_test');
  });
});
