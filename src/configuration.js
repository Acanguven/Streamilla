const DEFAULT_CONFIGURATION = {
  fragmentTag: 'fragment',
  selfClosingTags: ['meta'],
  placeholderIdPrefix: 'c_',
  contentIdPrefix: 'p_',
  hideAttribute: 'p',
  headTag: 'milla-head',
  minifyJs: true,
  minifyCss: true,
  minifyHtml: true
};

class Configuration {
  constructor() {
    for (let prop in DEFAULT_CONFIGURATION) {
      this[prop] = DEFAULT_CONFIGURATION[prop];
    }
  }

  set(userConfigurations) {
    for (let prop in userConfigurations) {
      if (this.hasOwnProperty(prop)) {
        this[prop] = userConfigurations[prop];
      }
    }
  }
}

module.exports = new Configuration();
