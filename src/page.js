const config = require('./configuration');
const htmlparser2 = require('htmlparser2');
const ENUMS = require('./enums');
const fs = require('fs');
const path = require('path');

/**
 * Page Configuration
 * htmlFile {string} - path of html file (if exists htmlString won't be evaluated)
 * html {string} - html file as string
 * data {object} - component resolvers: {} | () => {} | () => new Promise()
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
  const fragmentObject = {};
  for (let prop in fragmentNode.attribs) {
    fragmentObject[prop] = fragmentNode.attribs[prop];
  }
  return fragmentObject;
};

const parseHtmlSiblings = (siblings, fragmentLength = 0) => {
  let htmlString = '';
  let fragments = [];

  for (let x = 0, len = siblings.length; x < len; x++) {
    const node = siblings[x];
    switch (node.type) {
      case ENUMS.HTML_ELEMENT_TYPES.TAG:
        switch (node.name) {
          case config.fragmentTag:
            const fragmentExpression = `{__fp|${fragmentLength++}}`;
            fragments.push(createFragmentObject(node, fragmentExpression));
            htmlString += fragmentExpression;
            break;
          case config.headTag:
            htmlString += `{__milla-head}`;
            break;
          case config.bodyTag:
            htmlString += `{__milla-body}`;
            break;
          default:
            const isSelfClosingTag = isSelfClosing(node.name);
            htmlString += `<${node.name}${createAttributes(node.attribs)}${isSelfClosingTag ? '/' : ''}>`;
            if (node.children){
              const childrenData = parseHtmlSiblings(node.children, fragmentLength);
              htmlString += childrenData[0];
              fragments = fragments.concat(childrenData[1]);
            }
            if (!isSelfClosingTag) htmlString += `</${node.name}>`;
            break;
        }
        break;
      case ENUMS.HTML_ELEMENT_TYPES.DIRECTIVE:
        if (node.data) htmlString += `<${node.data}>`;
        break;
      case ENUMS.HTML_ELEMENT_TYPES.TEXT:
        if (!isEmpty(node.data)) htmlString += node.data.trim();
        break;
    }
  }

  return [htmlString, fragments];
};

class MillaPage {
  constructor(pageConfiguration) {
    this.html = '';
    this.pageContent = {
      fragmentedHtml: '',
      firstFlush: '',
      fragments: [],
      data: {},
    };
    this.dependencies = {};

    this.loadConfiguration(pageConfiguration);

    this.parseHtml();
    this.loadDependencies();
    this.buildFirstFlush();
  }

  loadConfiguration(pageConfiguration) {
    if (typeof pageConfiguration !== 'object') throw ENUMS.ERRORS.MISSING_PAGE_CONFIGURATION;

    /**
     * Check page file
     */
    if (typeof pageConfiguration.htmlFile !== 'string') {
      if (typeof pageConfiguration.html !== 'string') {
        throw ENUMS.ERRORS.MISSING_RENDER_FILE;
      } else {
        this.html = pageConfiguration.html;
      }
    } else {
      this.loadFromFile(pageConfiguration.htmlFile);
    }


    /**
     * Set page data
     */
    if(pageConfiguration.data){
      this.pageContent.data = pageConfiguration.data;
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
    this.pageContent.fragmentedHtml = htmlData[0];
    this.pageContent.fragments = htmlData[1];
  }

  buildFirstFlush() {

  }

  loadDependencies() {
    this.pageContent.fragments.forEach(fragment => {
      Object.values(ENUMS.KNOWN_DEPENDENCY_EXTENSIONS).forEach(fileType => {
        if(!fragment[fileType]) return;
        const filePath = path.join(__dirname, fragment[fileType]);
        const dependencySource = MillaPage.cachedDependencies[filePath] || fs.readFileSync(filePath, 'utf8').trim();
        this.dependencies[filePath] =  {
          code: dependencySource,
          type: fileType
        };
      })
    });
  }
}

MillaPage.cachedDependencies = {};

module.exports = MillaPage;
