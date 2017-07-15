/**
 * Created by SOFTMAN on 27-06-2017.
 */

'use strict';
var fs = require('fs');
fs.createReadStream('.env')
    .pipe(fs.createWriteStream('.env'));