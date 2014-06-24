var convert = exports,
    compat  = require('bemhtml-compat'),
    ometajs = require('ometajs'),
    ast2astxjst = require('./ometa/bemhtml').BEMHTMLToXJST,
    ibem = require('../test/i-bem'),
    bemxjst = require('bem-xjst'),
    BH = require('bh').BH,
    fs = require('fs');

/*****
 api
 *****/

/**
 *  stx.tohtml: template -> (function: json -> html)
 *   bh.tohtml: template -> (function: json -> html)
*/

convert.stx = {
    // (-> stx astxjst)
    parse: function (src) {
        return ast2astxjst.match(compat.parse (src), 'topLevel');
    },
    // (-> stx stxjs)
    tojs: function (src) { return compat.transpile(src); },
    tohtml: stx2html,
    get: getSource
};

convert.stxjs = {
    // (-> stxjs astxjst)
    parse: function(src) {throw("not implemented");},
    tohtml: stx2html            //see comment to stx2html why it works for stxjs
};

convert.bh = {
    create: function() { return new BH(); },
    get: function (f) {var bh = this.create(); f(bh); return bh;},
    tohtml: bh2html
};

convert.prettyPrint = prettyPrint;
function prettyPrint(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function getSource(fn) {
    return fn.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '');
}

// generates data.js sourced by scratch.html so I can traverse the ast
// in the browser just by clicking and expanding the nodes
convert.toBrowser = dataToBrowserConsole;
function dataToBrowserConsole(obj, file) {
    var text = prettyPrint.toString() +  '\n\n' +
            'var ast = '                        +
            JSON.stringify(obj)       + ';\n\n' +
            'console.dirxml(ast);\n';

    file = file ? file : '/Users/kozin/Documents/bemhtml-source-convert/data.js';
    fs.writeFileSync(file, text);
}

// (-> stx json html)
// (-> bh json html)
// (-> stxjs json html)
function stx2html (src) {
    // NB: ibem is in js-syntax and compat.transpile leaves js intact
    // only transpiling the old syntax, which means it doesn't matter
    // wheather you stick ibem to old or js-syntax - compat.transpile
    // will do the right thing
    var srcjs = compat.transpile(ibem + src);
    var compiled = bemxjst.compile(srcjs, {});
    return function(json) { return compiled.apply.call(json);};
}

function bh2html (bh) {
    return function (json) {return bh.apply(json);};
}

function stxjs2html(srcjs) {
    return function(json ) {throw("not implemented");};
}
