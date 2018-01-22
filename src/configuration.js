const DEFAULT_CONFIGURATION = {
  fragmentTag: 'fragment',
  selfClosingTags: ['meta'],
  placeholderIdPrefix: 'c_',
  contentIdPrefix: 'p_',
  hideAttribute: 'p',
  headTag: 'milla-head',
  bodyTag: 'milla-body',
  minifyJs: true, //not supported, yet.
  minifyCss: true //not supported, yet.
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
