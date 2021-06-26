require('dotenv').config();

const mock = require('./mock');

require('./interceptors')();

require('./error-handling')(mock);
require('./content/repository')(mock);
require('./content')(mock);
require('./content/status')(mock);
require('./content/query')(mock);
require('./content/delete')(mock);
require('./transformer')(mock);
