module.exports.ERRORS = {
  MISSING_PAGE_CONFIGURATION: new TypeError('You should provide page configuration to Milla'),
  MISSING_RENDER_FILE: new TypeError('You should provide a file to render (htmlFile: path {string}) or string (htmlString: content {string}) in page configuration'),
  FILE_READ_ERROR: (filePath) => new Error(`Failed to read provided file: ${filePath}`),
  NO_DATA_FOR_PLACEHOLDER: new Error('Provided placeholder without data'),
  NO_FRAGMENT_NAME: new Error('No name provided for the fragment'),
  NO_FRAGMENT_RENDER_METHOD_PROVIDED: (fragment) => new Error('No render method provided for fragment:' + fragment),
  EXPECTED_SYNC_RENDER_FOR_STATIC_DATA: (fragment) => new Error('Expected sync render method for static data, fragment:'+ fragment)
};

module.exports.HTML_ELEMENT_TYPES = {
  TEXT: 'text',
  TAG: 'tag',
  DIRECTIVE: 'directive'
};

module.exports.KNOWN_DEPENDENCY_EXTENSIONS = {
  CSS: 'css',
  JS: 'js',
};
