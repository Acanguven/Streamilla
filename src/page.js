const config = require('./configuration');
const htmlparser2 = require('htmlparser2');
const assert = require('assert');
const ENUMS = require('./enums');
const fs = require('fs');

/**
 * Page Configuration
 * htmlFile {string} - path of html file (if exists htmlString won't be evaluated)
 * html {string} - html file as string
 */

class MillaPage {
  constructor(pageConfiguration) {
    this.html = '';

    this.loadConfiguration(pageConfiguration);
  }

  loadConfiguration(pageConfiguration) {
    if (typeof pageConfiguration !== 'object') throw ENUMS.ERRORS.MISSING_PAGE_CONFIGURATION;
    if (typeof pageConfiguration.htmlFile !== 'string') {
      if (typeof pageConfiguration.html !== 'string') {
        throw ENUMS.ERRORS.MISSING_RENDER_FILE;
      } else {
        this.html = pageConfiguration.html;
      }
    } else {
      this.loadFromFile(pageConfiguration.htmlFile);
    }
  }

  loadFromFile(filePath) {
    try {
      this.html = fs.readFileSync(filePath, 'utf8').trim();
    } catch (e) {
      throw ENUMS.ERRORS.FILE_READ_ERROR(filePath);
    }
  }
}

module.exports = MillaPage;
