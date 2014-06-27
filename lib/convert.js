var convert = exports,
    compat  = require('bemhtml-compat'),
    ometajs = require('ometajs'),
    ast2astxjst = require('./ometa/bemhtml').BEMHTMLToXJST,
    stx2astWithClass = require('../lib/ometa/bemhtml-classify').BEMHTMLParser,
    ibem = require('../test/i-bem'),
    bemxjst = require('bem-xjst'),
    BH = require('bh').BH,
    fs = require('fs');

/**
 * @typedef {string} stx   - Template in old bemhtml syntax
 * @typedef {string} stxjs - Template in js bemhtml syntax
 * @typedef {Object} bh    - BH object instanciated with a bh-template
*/


convert.stx = {

    /**
     * Parse old-syntax template into an ast. Same as BEMHTMLParser
     * from compat-bemhtml would produce but the first element in the
     * returned array hold classification information.
     * @param {} src
     * @returns {Array}
     */
    classify: function (src) {
        return stx2astWithClass.matchAll(src, 'topLevel');
    },

    /**
     * Parse old template into an xjst-compatible ast.
     * @param {stx} src
     * @returns {xast}
     */
    parse: function parse(src) {
        return ast2astxjst.match(compat.parse (src), 'topLevel');
    },

    /**
     * Compile old template into a new js-template.
     * @param {stx} src
     * @returns {stxjs}
     */
    tojs: function tojs(src) {
        return compat.transpile(src);
    },

    tohtml: stx2html,

    get: getSource
};

convert.stxjs = {
    /**
     * Not implemented. Should parse js-syntax templates into a tree
     * similar to one produced by BEMHTMLParser from bemtml-compat.
     * @param {stxjs} src
     * @throws {}
     */
    parse: function(src) {
        throw("STUB: not implemented");
    },

    /**
     * Turns an old syntax template into a function that given a bemjson
     * generates html.
     * @param {stx} src
     * @returns {function}
     */
    tohtml: stx2html            //see comment to stx2html why it works for stxjs
};

convert.bh = {
    /**
     * Instanciate a fresh BH object.
     * @returns {BH}
     */
    create: function() {
        return new BH();
    },

    /**
     * Populate a BH object with information specified in a
     * bh-template and return that object.
     * @param {function} f - bh-template
     * @returns {bh}
     */
    get: function (f) {
        var bh = this.create();
        f(bh);
        return bh;
    },

    /**
     * Turns bh template into a function that given a bemjson generates
     * html.
     * @param {bh} bh
     * @returns {function}
     */
    tohtml: bh2html
};

convert.prettyPrint = prettyPrint;

/**
 * Print any js object properly indented. Makes it easy to jump
 * between matching parens and see subtrees at the same nesting level.
 * @param {obj} obj
 */
function prettyPrint(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

/**
 * A hack to read old-syntax templates defined in the same file as
 * functions that operate on them. See files in test/ for examples.
 * @param {function} fn - Function with block-commented body
 * @returns {stx}
 */
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

/**
 * Turns an old syntax template into a function that given a bemjson
 * generates html.
 * @param {stx} src
 * @returns {function}
 */
function stx2html (src) {
    // NB: ibem is in js-syntax and compat.transpile leaves js intact
    // only transpiling the old syntax, which means it doesn't matter
    // wheather you stick ibem to old or js-syntax - compat.transpile
    // will do the right thing
    var srcjs = compat.transpile(ibem + src);
    var compiled = bemxjst.compile(srcjs, {});
    return function(json) { return compiled.apply.call(json);};
}

/**
 * Turns bh template into a function that given a bemjson generates
 * html.
 * @param {bh} bh
 * @returns {function}
 */
function bh2html (bh) {
    return function (json) {return bh.apply(json);};
}
