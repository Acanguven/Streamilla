const MillaPage = require('./page');

const expressMiddleware = (pageConfiguration) => {
  const millaPage = new MillaPage(pageConfiguration);

  return (req, res) => {
    millaPage.stream(req, res.write.bind(res), res.end.bind(res));
  }
};

module.exports = expressMiddleware;
