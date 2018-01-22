const config = require('./configuration');
const htmlparser2 = require('htmlparser2');
const ENUMS = require('./enums');
const fs = require('fs');
const path = require('path');
const htmlminify = require('html-minifier').minify;
const crass = require('crass');
const UglifyJS = require("uglify-js");

/**
 * Page Configuration
 * htmlFile {string} - path of html file (if exists htmlString won't be evaluated)
 * html {string} - html file as string
 * data {object} - component resolvers: {} | () => {} | () => new Promise()
 */

const contentReplaceScript = 'function $p(p,c){var c = document.getElementById(c),r = c.innerHTML;c.remove();document.getElementById(p).innerHTML=r}';

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

const createFragmentObject = (fragmentNode, expression, index) => {
  const fragmentObject = {};
  for (let prop in fragmentNode.attribs) {
    fragmentObject[prop] = fragmentNode.attribs[prop];
  }
  fragmentObject.expression = expression;
  fragmentObject.index = index;
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
            const fragmentExpression = `{__fp|${fragmentLength}}`;
            fragments.push(createFragmentObject(node, fragmentExpression, fragmentLength++));
            htmlString += fragmentExpression;
            break;
          case config.headTag:
            htmlString += `{__milla-head}`;
            break;
          default:
            const isSelfClosingTag = isSelfClosing(node.name);
            htmlString += `<${node.name}${createAttributes(node.attribs)}${isSelfClosingTag ? '/' : ''}>`;
            if (node.children) {
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

const generateMillaHead = (fragments, dependencies) => {
  const fragmentStyles = Object.values(dependencies).filter(dep => dep.type === ENUMS.KNOWN_DEPENDENCY_EXTENSIONS.CSS).map(dep => dep.code).join('');

  return `<script>${contentReplaceScript}</script><style>${fragmentStyles}[${config.hideAttribute}]{display:none;}</style>`;
};

const generateFragmentsFirstContent = (firstFlush, pageContents, dependencies) => {
  let fragmentsReplacedFirstFlush = firstFlush;

  pageContents.fragments.forEach(fragment => {
    if (typeof pageContents.data[fragment.name] === 'object') {
      const contentRender = pageContents.fragmentMethods[fragment.name].content(pageContents.data[fragment.name]);
      if (typeof contentRender !== 'string') {
        throw ENUMS.ERRORS.EXPECTED_SYNC_RENDER_FOR_STATIC_DATA(fragment.name);
      }
      fragment.static = true;
      fragmentsReplacedFirstFlush = fragmentsReplacedFirstFlush.replace(fragment.expression, `${contentRender}${fragment.js ? '<script>' + dependencies[path.join(__dirname, fragment.js)].code + '</script>' : ''}`);

    } else {
      const placeholderMethod = pageContents.fragmentMethods[fragment.name].placeholder;
      if (placeholderMethod) {
        if (typeof placeholderMethod === 'string') {
          const placeholderContainer = `<div id="${config.placeholderIdPrefix + fragment.index}">${placeholderMethod}</div>`;
          fragmentsReplacedFirstFlush = fragmentsReplacedFirstFlush.replace(fragment.expression, placeholderContainer);
        } else if (typeof placeholderMethod === 'function') {
          fragment.placeholderGenerator = true;
        }
      }
    }
  });

  return fragmentsReplacedFirstFlush;
};

const contentReplacerGenerator = (i, content, fragment, dependencies) => {
  return `<div id="${config.contentIdPrefix + i}" ${config.hideAttribute}>${content}</div><script>$p('${config.placeholderIdPrefix + i}','${config.contentIdPrefix + i}');${fragment.js ? `${dependencies[path.join(__dirname, fragment.js)].code}` : ''}</script>`
};

class MillaPage {
  constructor(pageConfiguration) {
    this.html = '';
    this.pageContent = {
      fragmentedHtml: '',
      firstFlush: '',
      fragments: [],
      fragmentMethods: {},
      data: {},
      lastFlush: ''
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
    if (pageConfiguration.data) {
      this.pageContent.data = pageConfiguration.data;
    }

    if (pageConfiguration.fragments) {
      this.pageContent.fragmentMethods = pageConfiguration.fragments;
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
    let firstFlushContent = this.pageContent.fragmentedHtml;
    firstFlushContent = firstFlushContent.replace('{__milla-head}', generateMillaHead(this.pageContent, this.dependencies));
    firstFlushContent = generateFragmentsFirstContent(firstFlushContent, this.pageContent, this.dependencies);
    this.pageContent.lastFlush = '</body></html>';
    this.pageContent.firstFlush = firstFlushContent.replace(this.pageContent.lastFlush, '');
  }

  loadDependencies() {
    this.pageContent.fragments.forEach(fragment => {
      if (!fragment.name) throw ENUMS.ERRORS.NO_FRAGMENT_NAME;
      if (!this.pageContent.fragmentMethods[fragment.name]) throw ENUMS.ERRORS.NO_FRAGMENT_RENDER_METHOD_PROVIDED(fragment.name);
      if (fragment[ENUMS.KNOWN_DEPENDENCY_EXTENSIONS.PLACEHOLDER] && !this.pageContent.data[fragment.name]) throw ENUMS.ERRORS.NO_DATA_FOR_PLACEHOLDER;

      Object.values(ENUMS.KNOWN_DEPENDENCY_EXTENSIONS).forEach(fileType => {
        if (!fragment[fileType]) return;
        const filePath = path.join(__dirname, fragment[fileType]);
        let dependencySource = MillaPage.cachedDependencies[filePath] || fs.readFileSync(filePath, 'utf8').trim();
        switch (fileType) {
          case ENUMS.KNOWN_DEPENDENCY_EXTENSIONS.PLACEHOLDER:
            if (config.minifyHtml) {
              dependencySource = htmlminify(dependencySource, {
                collapseWhitespace: true
              });
            }
            break;
          case ENUMS.KNOWN_DEPENDENCY_EXTENSIONS.CSS:
            if (config.minifyCss) {
              dependencySource = crass.parse(dependencySource).optimize().toString();
            }
            break;
          case ENUMS.KNOWN_DEPENDENCY_EXTENSIONS.JS:
            if (config.minifyJs) {
              dependencySource = UglifyJS.minify(dependencySource).code;
            }
            break;
        }
        this.dependencies[filePath] = {
          code: dependencySource,
          type: fileType
        };
      })
    });
  }

  stream(req, writeCallback, endCallback) {
    let firstFlush = this.pageContent.firstFlush;
    let promiseCount = 0;
    this.pageContent.fragments.forEach(fragment => {
      if (!fragment.static) {
        const fragmentDataResolver = this.pageContent.data[fragment.name](req);

        if (fragmentDataResolver instanceof Promise) {
          promiseCount++;
          if (fragment.placeholderGenerator) {
            firstFlush = firstFlush.replace(fragment.expression, `<div id="${config.placeholderIdPrefix + fragment.index}">${this.pageContent.fragmentMethods[fragment.name].placeholder(req)}</div>`)
          }
          fragmentDataResolver.then((data) => {
            promiseCount--;
            if (promiseCount === 0) {
              endCallback(contentReplacerGenerator(fragment.index, this.pageContent.fragmentMethods[fragment.name].content(data), fragment, this.dependencies) + this.pageContent.lastFlush);
            } else {
              writeCallback(contentReplacerGenerator(fragment.index, this.pageContent.fragmentMethods[fragment.name].content(data), fragment, this.dependencies));
            }
          });
        } else if (typeof fragmentDataResolver === 'object' || typeof fragmentDataResolver === 'string') {
          const replaceContent = this.pageContent.fragmentMethods[fragment.name].content(fragmentDataResolver);
          firstFlush = firstFlush.replace(fragment.expression, replaceContent + (fragment.js ? `<script>${this.dependencies[path.join(__dirname, fragment.js)].code}</script>` : ''));
        }
      }
    });

    if (promiseCount === 0) {
      endCallback(firstFlush + this.pageContent.lastFlush);
    } else {
      writeCallback(firstFlush);
    }
  }
}

MillaPage.cachedDependencies = {};

module.exports = MillaPage;
