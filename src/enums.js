module.exports.ERRORS = {
  MISSING_PAGE_CONFIGURATION: new TypeError('You should provide page configuration to Milla'),
  MISSING_RENDER_FILE: new TypeError('You should provide a file to render (htmlFile: path {string}) or string (htmlString: content {string}) in page configuration'),
  FILE_READ_ERROR: (filePath) => new Error(`Failed to read provided file: ${filePath}`)
};
