var ometajs = require('ometajs'),
    parser = require('./wat1.ometajs').Parser;

parser.matchAll("this.ctx.url", 'asgnExpr');
