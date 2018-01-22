const expect = require('chai').expect;
const Milla = require('../src');
const MillaPage = require('../src/page');
const path = require('path');
const ENUMS = require('../src/enums');

describe('Page', () => {
  it('should export module', () => {
    expect(MillaPage).to.be.an('function');
  });

  it('should throw error calling without configuration', (done) => {
    try {
      new MillaPage();
      done(new Error('It is not throwing error'));
    } catch (e) {
      expect(e).to.equal(ENUMS.ERRORS.MISSING_PAGE_CONFIGURATION);
      done();
    }
  });

  it('should throw error calling without render file or string', (done) => {
    try {
      new MillaPage({});
      done(new Error('It is not throwing error'));
    } catch (e) {
      expect(e).to.equal(ENUMS.ERRORS.MISSING_RENDER_FILE);
      done();
    }
  });

  it('should read from html string', () => {
    const page = new MillaPage({
      html: '<html></html>'
    });

    expect(page.html).to.equal('<html></html>');
  });

  it('should throw for wrong file path', (done) => {
    const missingFilePath = path.join(__dirname, './html/test_missing.html');
    try {
      new MillaPage({
        htmlFile: missingFilePath
      });
      done(new Error('It is not throwing error'));
    } catch (e) {
      expect(e.message).to.equal(ENUMS.ERRORS.FILE_READ_ERROR(missingFilePath).message);
      done();
    }
  });

  it('should read from html file', () => {
    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test.html')
    });

    expect(page.html).to.equal('<html></html>');
  });

  it('should create first flush string without fragment', () => {
    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test2.html')
    });

    expect(page.pageContent.fragmentedHtml).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title></head><body></body></html>');
  });

  it('should create first flush string with fragments', () => {
    Milla.config.set({
      fragmentTag: 'fragment'
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test3.html'),
      fragments: {
        header: {
          placeholder: () => {
          },
          content: () => {
          }
        }
      }
    });

    expect(page.pageContent.fragmentedHtml).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title>{__milla-head}</head><body><div>Some Content</div>{__fp|0}{__milla-body}</body></html>');
  });

  it('should create first flush string with multiple fragments', () => {
    Milla.config.set({
      fragmentTag: 'fragment',
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test4.html'),
      fragments: {
        header: {
          placeholder: () => {
          },
          content: () => {
          }
        },
        menu: {
          placeholder: () => {
          },
          content: () => {
          }
        }
      }
    });

    expect(page.pageContent.fragmentedHtml).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title>{__milla-head}</head><body><div>Some Content</div>{__fp|0}<div>Middle Content</div>{__fp|1}{__milla-body}</body></html>');
  });

  it('should create first flush string with multiple fragments with different level', () => {
    Milla.config.set({
      fragmentTag: 'fragment'
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test5.html'),
      fragments: {
        header: {
          placeholder: () => {
          },
          content: () => {
          }
        },
        menu: {
          placeholder: () => {
          },
          content: () => {
          }
        }
      }
    });

    expect(page.pageContent.fragmentedHtml).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title>{__milla-head}</head><body><div>Some Content</div>{__fp|0}<div>Middle Content</div><div><span>{__fp|1}</span></div>{__milla-body}</body></html>');
  });

  it('should capture fragments and attributes', () => {
    Milla.config.set({
      fragmentTag: 'fragment'
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test5.html'),
      fragments: {
        header: {
          placeholder: () => {
          },
          content: () => {
          }
        },
        menu: {
          placeholder: () => {
          },
          content: () => {
          }
        }
      }
    });

    expect(page.pageContent.fragments).to.deep.equal([{name: 'header', expression: '{__fp|0}', index: 0}, {
      name: 'menu',
      expression: '{__fp|1}',
      index: 1
    }]);
  });

  it('should store data items', () => {
    Milla.config.set({
      fragmentTag: 'fragment',
    });

    const productResolver = req => new Promise((resolve, reject) => {
    });

    const staticResolver = req => {
    };

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test5.html'),
      data: {
        header: {test: 5},
        menu: staticResolver,
        product: productResolver
      },
      fragments: {
        header: {
          content: (data) => '',
          placeholder: (data) => ''
        },
        menu: {
          placeholder: () => {
          },
          content: () => {
          }
        }
      }
    });

    expect(page.pageContent.data).to.deep.equal({
      header: {test: 5},
      menu: staticResolver,
      product: productResolver
    });
  });

  it('should throw error for fragments dependencies that does\'nt exists', (done) => {
    Milla.config.set({
      fragmentTag: 'fragment',
    });

    try {
      new MillaPage({
        htmlFile: path.join(__dirname, './html/test6.html'),
      });
      done(new Error('Not throwing error'));
    } catch (e) {
      done();
    }
  });

  it('should throw error when placeholder provided without data', function (done) {
    Milla.config.set({
      fragmentTag: 'fragment',
    });

    try {
      const page = new MillaPage({
        htmlFile: path.join(__dirname, './html/test7.html'),
      });
      done(new Error('should throw error'));
    } catch (e) {
      done();
    }


    expect(page.stream(writeHandler, () => {
    }));
  });

  it('should cache dependencies', () => {
    Milla.config.set({
      fragmentTag: 'fragment',
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test8.html'),
      data: {
        header: {test: 4},
        product: {test: 6}
      },
      fragments: {
        header: {
          placeholder: () => '',
          content: () => ''
        },
        product: {
          placeholder: () => '',
          content: () => ''
        }
      }
    });

    expect(page.dependencies).to.deep.equal({
      [path.join(__dirname, '../test/dependencies/8.css')]: {
        code: '.test{color:red}',
        type: 'css',
      },
      [path.join(__dirname, '../test/dependencies/8.js')]: {
        code: 'console.log("I am alive");',
        type: 'js'
      },
      [path.join(__dirname, '../test/dependencies/8.html')]: {
        code: '<div>Example of placeholder content</div>',
        type: 'placeholder'
      },
    });
  });

  it('should have stream method', function () {
    Milla.config.set({
      fragmentTag: 'fragment',
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test8.html'),
      data: {
        header: {test: 4},
        product: {test: 6}
      },
      fragments: {
        header: {
          placeholder: () => '',
          content: () => ''
        },
        product: {
          placeholder: () => '',
          content: () => ''
        }
      }
    });

    expect(page.stream).to.be.a('function');
  });

  it('should flush first content with static content', function (done) {
    Milla.config.set({
      fragmentTag: 'fragment',
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test8.html'),
      data: {
        header: {test: 4},
        product: () => {}
      },
      fragments: {
        header: {
          placeholder: () => '',
          content: (input) => `test:${input.test}`
        },
        product: {
          placeholder: () => '',
          content: () => ''
        }
      }
    });

    const writeHandler = (data) => {
      expect(data).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title><script>function $p(p,c){var c = document.getElementById(c),r = c.innerHTML;c.remove();document.getElementById(p).innerHTML=r}</script><style>.test{color:red}[p]{display:none;}</style></head><body>test:4<div>Middle Content</div><div id="c_1"><div>Example of placeholder content</div></div><script>function __f__header(){console.log("I am alive");};</script></body></html>');
      done();
    };

    expect(page.stream({},writeHandler, () => {}));
  });


  it('should create placeholders for async data', function (done) {
    Milla.config.set({
      fragmentTag: 'fragment',
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test8.html'),
      data: {
        header: () => {},
        product: () => {}
      },
      fragments: {
        header: {
          placeholder: () => '',
          content: (input) => `test:${input.test}`
        },
        product: {
          placeholder: () => '',
          content: () => ''
        }
      }
    });

    const writeHandler = (data) => {
      expect(data).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title><script>function $p(p,c){var c = document.getElementById(c),r = c.innerHTML;c.remove();document.getElementById(p).innerHTML=r}</script><style>.test{color:red}[p]{display:none;}</style></head><body><div id="c_0"><div>Example of placeholder content</div></div><div>Middle Content</div><div id="c_1"><div>Example of placeholder content</div></div><script>function __f__header(){console.log("I am alive");};</script></body></html>');
      done();
    };

    expect(page.stream({},writeHandler, () => {}));
  });
});
