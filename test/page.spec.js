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

    expect(page.pageContent.fragmentedHtml).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title>{__milla-head}</head><body><div>Some Content</div>{__fp|0}</body></html>');
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

    expect(page.pageContent.fragmentedHtml).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title>{__milla-head}</head><body><div>Some Content</div>{__fp|0}<div>Middle Content</div>{__fp|1}</body></html>');
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

    expect(page.pageContent.fragmentedHtml).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title>{__milla-head}</head><body><div>Some Content</div>{__fp|0}<div>Middle Content</div><div><span>{__fp|1}</span></div></body></html>');
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

    expect(page.pageContent.fragments).to.deep.equal([
      {
        name: 'header',
        expression: '{__fp|0}',
        index: 0,
        placeholderGenerator: true
      }, {
        name: 'menu',
        expression: '{__fp|1}',
        index: 1, placeholderGenerator: true
      }
    ]);
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
        code: 'console.log("Header is alive and working");',
        type: 'js'
      },
      [path.join(__dirname, '../test/dependencies/8_1.js')]: {
        code: 'console.log("Product is alive too!");',
        type: 'js'
      }
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

  it('should end with single flush because of static contents', function (done) {
    Milla.config.set({
      fragmentTag: 'fragment',
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test8.html'),
      data: {
        header: {test: 4},
        product: () => {
        }
      },
      fragments: {
        header: {
          placeholder: () => '<div>Header placeholder</div>',
          content: (input) => `test:${input.test}`
        },
        product: {
          placeholder: () => '<div>Product placeholder</div>',
          content: () => ''
        }
      }
    });

    const endHandler = (data) => {
      expect(data).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title><script>function $p(p,c){var c = document.getElementById(c),r = c.innerHTML;c.remove();document.getElementById(p).innerHTML=r}</script><style>.test{color:red}[p]{display:none;}</style></head><body>test:4<script>console.log("Header is alive and working");</script><div>Middle Content</div>{__fp|1}</body></html>');
      done();
    };

    expect(page.stream({}, () => {
    }, endHandler));
  });


  it('should end stream in 2 flushes', function (done) {
    this.timeout(5000);

    Milla.config.set({
      fragmentTag: 'fragment',
    });

    const page = new MillaPage({
      htmlFile: path.join(__dirname, './html/test8.html'),
      data: {
        header: () => {
        },
        product: () => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({product: {name: 'Test'}});
            }, 4000 * Math.random())
          });
        }
      },
      fragments: {
        header: {
          content: (input) => `test:${input.test}`
        },
        product: {
          placeholder: () => '<div>Product placeholder</div>',
          content: (input) => {
            return JSON.stringify(input);
          }
        }
      }
    });

    const writeHandler = (data) => {
      expect(data).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title><script>function $p(p,c){var c = document.getElementById(c),r = c.innerHTML;c.remove();document.getElementById(p).innerHTML=r}</script><style>.test{color:red}[p]{display:none;}</style></head><body>{__fp|0}<div>Middle Content</div><div id="c_1"><div>Product placeholder</div></div>');
    };

    const endHandler = (data) => {
      expect(data).to.equal('<div id="p_1" p>{"product":{"name":"Test"}}</div><script>$p(\'c_1\',\'p_1\');console.log("Product is alive too!");</script></body></html>');
      done();
    };

    page.stream({}, writeHandler, endHandler);
  });
});
