var convert = require('..'),
    stx = convert.stx,
    utils = convert.utils,
    ometajs = require('ometajs'),
    compat = require('bemhtml-compat'),
    lo = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser,
    bemtoxjst = require('../lib/ometa/bemhtml').BEMHTMLToXJST,
    parser = require('../lib/ometa/bemhtml-bh').Parser,
    classifier = require('../lib/ometa/bemhtml-bh').Classifier,
    util = require('util');

var projectRoot = path.resolve(path.join(__dirname, '..')),
    casesRoot = path.join(projectRoot, 'test', 'cases'),
    files = fs.readdirSync(casesRoot),
    templates = lo.map(files,
                       function(f) {
                           return path.basename(f, '.bemhtml');
                       });

files = lo(files).
    map(function (f) {return path.join(casesRoot, f);}).
    map(function (f) {return fs.readFileSync(f, 'utf-8');}).
    value();

templates = lo(lo.zipObject (templates,
                             files));

function parse(src) {
//    return bemparser.matchAll(src, 'topLevel');
    return parser.matchAll(src, 'topLevel');
}


function classify(src) {
   return classifier.match(parse(src), 'topLevel');
//    return stx.classify2(src);
}


// var temp = stx.get(function () {/*
// block b1 {
//     content: [applyNext(), 'text2']
// }
// */});


var temp = stx.get(function () {/*
block button, tag: 'button'
*/});

// var temp = stx.get(function () {/*
// block button {
//     tag: 'button'
//     this.ctx.url {
//         tag: 'a'
//         attrs: {href: this.ctx.url}
//     }
// }
// */});


// var temp = stx.get(function () {/*
// block button {
//     tag, ~['mark', 'item', 'text'].indexOf(this.elem): 'span'
// }
// */});


// var temp = stx.get(function () {/*
// block logo {
//     this.ctx.url, tag: 'a'
//     attrs {
//         lo.isEmpty(this) || true: {role: 'logo'}
//         this.ctx.url: {
//             var ctx = this.ctx,
//             p = applyNext(),
//             a = { href: ctx.url };
//             return this._.extend(p, a);}
//     }
// }
// */});

// var temp = stx.get(function () {/*
// block b1: {
//     return {a: 1, b: 2}
// }
// */});

//parser.matchAll("this.ctx", 'asgnExpr');
//parse(temp);
var ast = classify(temp);
//console.log(util.inspect (ast, {depth : 300}));
utils.pp(ast);

//ast.forEach(function(t){ utils.pp (t[2]);});
//parse(temp);

//utils.pp(bemparser.matchAll(temp, 'topLevel'));
//bemparser.matchAll("this._bla && this._bla === 'bla'", 'topLevel');
