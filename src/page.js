const config = require('./configuration');
const htmlparser2 = require('htmlparser2');
const ENUMS = require('./enums');
const fs = require('fs');

/**
 * Page Configuration
 * htmlFile {string} - path of html file (if exists htmlString won't be evaluated)
 * html {string} - html file as string
 */

const isEmpty = (s) => {
  return s.trim() === '';
};

const isSelfClosing = tag => {
  return config.selfClosingTags.indexOf(tag) > -1;
};

const createAttributes = attributesObject => {
  return Object.keys(attributesObject).reduce((attributeString, attributeProp) => {
    attributeString += ` ${attributeProp}="${attributesObject[attributeProp]}"`;
    return attributeString;
  }, '');
};

const createFragmentObject = fragmentNode => {
  return {
    ...fragmentNode.attribs
  }
};

const parseHtmlSiblings = siblings => {
  let htmlString = '';
  let fragments = [];

  for (let x = 0, len = siblings.length; x < len; x++) {
    const node = siblings[x];
    switch (node.type) {
      case ENUMS.HTML_ELEMENT_TYPES.TAG:
        if(node.name === config.fragmentTag){
          fragments.push(createFragmentObject(node));
          console.log(fragments);
        }else{
          const isSelfClosingTag = isSelfClosing(node.name);
          htmlString += `<${node.name}${createAttributes(node.attribs)}${isSelfClosingTag ? '/' : ''}>`;
          if (node.children) htmlString += parseHtmlSiblings(node.children);
          if (!isSelfClosingTag) htmlString += `</${node.name}>`;
        }
        break;
      case ENUMS.HTML_ELEMENT_TYPES.DIRECTIVE:
        if(node.data) htmlString += `<${node.data}>`;
        break;
      case ENUMS.HTML_ELEMENT_TYPES.TEXT:
        if (!isEmpty(node.data)) htmlString += node.data.trim();
        break;
    }
  }

  return htmlString;
};

class MillaPage {
  constructor(pageConfiguration) {
    this.html = '';
    this.pageContent = {
      firstFlush: ''
    };

    this.loadConfiguration(pageConfiguration);
    this.parseHtml();
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


  parseHtml() {
    const htmlDomTree = htmlparser2.parseDOM(this.html);
    const htmlData = parseHtmlSiblings(htmlDomTree);
    this.pageContent.firstFlush = htmlData;
  }
}

module.exports = MillaPage;
