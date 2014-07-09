var convert = require('..'),
    stx = convert.stx,
    utils = convert.utils,
    pp = utils.pp,
    pb = utils.pb,
    contains = utils.contains,
    ometajs = require('ometajs'),
    compat = require('bemhtml-compat'),
    lo = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser,
    bemtoxjst = require('../lib/ometa/bemhtml').BEMHTMLToXJST,
    classifier = require('../lib/ometa/bemhtml-bh').Classifier
    ;

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
    return bemparser.matchAll(src, 'topLevel');
}


function classify(src) {
//    return classifier.match(parse(src), 'topLevel');
    return stx.classify2(src);
}


var newc = templates.
        mapValues(classify).
        mapValues(function (v) {
            v = lo(lo.first (v)).
                pick(['c1']).
                mapValues(function (c) {return lo.isEmpty(c) ? c : [lo.max(c)];}).
                value();
            return v;}).
        value();

var oldc = templates.
        mapValues(stx.classify).
        mapValues(function (v) {
            v = lo(lo.first (v)).
                pick(['c1']).
                mapValues(function (c) {return lo.isEmpty(c) ? c : [lo.max(c)];}).
                value();
            return v;}).
        value();

var temp = stx.get(function () {/*
    block button {
        tag: 'button'
        content: 'text'
        custommode: applyNext()
        this._bla && this._bla === 'bla' { tag: 'a'}
    }
*/});

// temp22_b and temp33_b classified into 1.1 intstead of 1.2
// nesting information gets lost during parsing, don't think it matters
var diff = lo(newc).
        mapValues(function(c, temp) {
            return {'new': c.c1,
                    'old': oldc[temp].c1};
        }).
        pick(function(c, temp) {return !lo.isEqual(c.new, c.old);}).
        value();

diff;
