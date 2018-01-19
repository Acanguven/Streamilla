const expect = require('chai').expect;
const Milla = require('../src');
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

  it('should create first flush string without fragment', () => {
    const page = new MillaPage({
      htmlFile: path.join(__dirname, './test2.html')
    });

    expect(page.pageContent.firstFlush).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title></head><body></body></html>');
  });

  it('should create first flush string with fragments', () => {
    Milla.config.set({
      fragmentTag: 'fragment'
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './test3.html')
    });

    expect(page.pageContent.firstFlush).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title></head><body><div>Some Content</div><fragment name="header"/></body></html>');
  });
});
