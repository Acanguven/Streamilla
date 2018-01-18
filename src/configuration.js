const DEFAULT_CONFIGURATION = {
  fragment_tag: 'fragment'
};

class Configuration {
  constructor(){
    for(let prop in DEFAULT_CONFIGURATION){
      this[prop] = DEFAULT_CONFIGURATION[prop];
    }
  }

  set(userConfigurations){
    for(let prop in userConfigurations){
      if(this.hasOwnProperty(prop)){
        this[prop] = userConfigurations[prop];
      }
    }
  }
}

module.exports = new Configuration();