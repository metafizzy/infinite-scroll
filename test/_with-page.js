// https://github.com/avajs/ava/blob/v3.13.0/docs/recipes/puppeteer.md

const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');
const getPort = require('get-port');

module.exports = async( t, run ) => {
  const port = await getPort({ port: getPort.makeRange( 9100, 9200 ) });
  let server = getServer();
  server.listen( port );

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await run( t, page );
  } finally {
    await page.close();
    await browser.close();
    server.close();
  }
};
