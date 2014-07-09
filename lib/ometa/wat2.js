var ometajs = require('ometajs'),
    parser = require('./wat2.ometajs').Parser;

parser.matchAll("this.ctx", 'asgnExpr');
parser.matchAll("this.ctx.url", 'asgnExpr');
