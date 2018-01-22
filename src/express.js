const MillaPage = require('./page');

const expressMiddleware = (pageConfiguration) => {
  const millaPage = new MillaPage(pageConfiguration);

  return (req, res, next) => {
    millaPage.stream(req, res.write, res.end);
  }
};

module.exports = expressMiddleware;
