const fetch = require('cross-fetch');

if (!global.fetch) {
  global.fetch = fetch;
}
