require('dotenv').config();

const mock = require('./mock');

require('./interceptors')();

require('./error-handling')(mock);
require('./content/repository')(mock);
require('./content/content')(mock);
require('./content/content-status')(mock);
require('./content/content-query')(mock);
require('./content/content-delete')(mock);
require('./transformer')(mock);
