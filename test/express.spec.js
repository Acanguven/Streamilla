const expect = require('chai').expect;
const Milla = require('../src');

describe('Render', ()=> {
  it('should return express middleware with', function () {
    expect(Milla.express()).to.be.an('function')
  });
});
