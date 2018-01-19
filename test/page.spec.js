const expect = require('chai').expect;
const MillaPage = require('../src/page');
const path = require('path');
const ENUMS = require('../src/enums');

describe('Page', () => {
  it('should export module', () => {
    expect(MillaPage).to.be.an('function');
  });

  it('should throw error calling without configuration', (done) => {
    try{
      new MillaPage();
      done(new Error('It is not throwing error'));
    }catch (e){
      expect(e).to.equal(ENUMS.ERRORS.MISSING_PAGE_CONFIGURATION);
      done();
    }
  });

  it('should throw error calling without render file or string', (done) => {
    try{
      new MillaPage({});
      done(new Error('It is not throwing error'));
    }catch (e){
      expect(e).to.equal(ENUMS.ERRORS.MISSING_RENDER_FILE);
      done();
    }
  });

  it('should read from html string', () => {
    const page = new MillaPage({
      html: '<html></html>'
    });

    expect(page.html).to.equal('<html></html>');
  });

  it('should throw for wrong file path', (done) => {
    const missingFilePath = path.join(__dirname, './test_missing.html');
    try{
      new MillaPage({
        htmlFile: missingFilePath
      });
      done(new Error('It is not throwing error'));
    }catch (e){
      expect(e.message).to.equal(ENUMS.ERRORS.FILE_READ_ERROR(missingFilePath).message);
      done();
    }
  });

  it('should read from html file', () => {
    const page = new MillaPage({
      htmlFile: path.join(__dirname, './test.html')
    });

    expect(page.html).to.equal('<html></html>');
  });
});
