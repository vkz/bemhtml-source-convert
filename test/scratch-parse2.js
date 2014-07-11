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
    classifier = require('../lib/ometa/bemhtml-bh').Classifier ;

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
//     block button {
//         tag: 'button'
//         content: 'text'
//         custommode: applyNext()
//         this._bla && this._bla === 'bla' { tag: 'a'}
//     }
// */});

var temp = stx.get(function () {/*
 block button {
    this.block === 'button': {'tag' : 'button'}
}*/});

//parser.matchAll("this.ctx", 'asgnExpr');
//parse(temp);
classify(temp);
//parse(temp);

//utils.pp(bemparser.matchAll(temp, 'topLevel'));
//bemparser.matchAll("this._bla && this._bla === 'bla'", 'topLevel');
