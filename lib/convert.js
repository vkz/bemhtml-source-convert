var convert = exports,
    bp = require('./bp'),
    compat  = require('bemhtml-compat'),
    ometajs = require('ometajs'),
    ast2astxjst = require('./ometa/bemhtml').BEMHTMLToXJST,
    stx2astWithClass = require('../lib/ometa/bemhtml-classify').BEMHTMLParser,
    bemhtml2bh = require('../lib/ometa/bemhtml-bh'),
    classifier =  bemhtml2bh.Classifier,
    serializer =  bemhtml2bh.XastToBh,
    serializer2 = bemhtml2bh.XastToBh2,
    bemxjst = require('bem-xjst'),
    BH = require('bh').BH,
    fs = require('fs'),
    lo = require('lodash'),
    colors = require('colors'),
    uglify = require('uglify-js'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    util = require('util');

function Stx (src) {
    var _class,
        _ast,
        _bh;

    // add pp() method to every instance
    bp.addPrettyPrinter(this);

    this.bemhtml = new bp.Bemhtml(src);

    // duplicate some of bemhtml api for quicker access
    this.src = this.bemhtml.src;
    this.match = function (json) { return this.bemhtml.match(json);};

    Object.defineProperties (this, {
        'class': {
            'get': function() { return _class || this.classify().class; },
            'set': function(v) { _class = v; return this; },
            enumerable: true
        },
        'ast': {
            'get': function() { return _ast || this.parse().ast; },
            'set': function(v) { _ast = v; return this; },
            enumerable: true
        },

        'bh': {
            'get': function() { return _bh || this.toBh().bh; },
            'set': function(v) { _bh = v; return this; },
            enumerable: true
        }
    });
}

Stx.prototype = {

    classify: function classify() {
        this.class = classifier.match(this.ast, 'topLevel');
        return this;
    },

    parse: function parse() {
        this.ast = compat.parse(this.src);
        return this;
        //return xjst ? ast2astxjst.match(this._ast, 'topLevel') : this._ast;
    },

    toBh: function toBh() {
        this.bh = serializer.match(this.ast, 'topLevel');
        return this;
    }

};

convert.Stx = Stx;



// convert.stxjs = {
//     /**
//      * Not implemented. Should parse js-syntax templates into a tree
//      * similar to one produced by BEMHTMLParser from bemtml-compat.
//      * @param {stxjs} src
//      * @throws {}
//      */
//     parse: function(src) {
//         throw("STUB: not implemented");
//     },

//     /**
//      * Turns an old syntax template into a function that given a bemjson
//      * generates html.
//      * @param {stx} src
//      * @returns {function}
//      */
//     tohtml: stx2html            //see comment to stx2html why it works for stxjs
// };

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
    var text = bp.pp.toString() +  '\n\n' +
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


/**
 * Turns bh template into a function that given a bemjson generates
 * html.
 * @param {bh} bh
 * @returns {function}
 */
function bh2html (bh) {
    return function (json) {return bh.apply(json);};
}

convert.utils = {
    contains: contains,
    pp: bp.pp,
    pb: dataToBrowserConsole,
    getBody: getBody

};

/**
 * Check if a tree contains a given subtree (any JS value including
 * array). Handy to perform checks like this:
 *
 * var sub = bemparser.matchAll('this.ctx.url', 'asgnExpr'),
 *     tree = getBody(some_template);
 * contains(tree, sub);
 *
 * @param {Array} tree
 * @param {any} sub
 * @returns {boolean}
 */
function contains(tree, sub) {
    return lo.some(tree,
                   function(t) {
                       return lo.isEqual(t, sub) ||
                           lo.isArray(t) &&
                           contains(t, sub);
                   });
}




/**
 * Extract template bod(y|ies) from its ast. If given a template in
 * old stx parse it first.
 * @param {stx, ast} maybeAst
 * @returns {ast}
 */
function getBody(maybeAst) {
    function dropLevel (ast) {
        return lo.flatten(lo.map (ast, lo.rest), true);
    }
    if (typeof maybeAst == 'string') {
        maybeAst =  lo.rest(convert.stx.classify(maybeAst));
    }
    var ast = lo.flatten(maybeAst, true).
            filter(function (e) { return lo.first(e) === 'body';});
    return dropLevel(dropLevel (ast));
}

convert.run = function run(options) {
    var input = [];

    options.input.on('data', function (chunk) {
        input.push(chunk);
    });

    options.input.on('end', function () {
        finish(input.join(''));
    });

    // put input stream in a flow mode
    options.input.resume();

    function finish(source) {

        var out = [],
            err = [],
            stderr = process.stderr,
            t = new Stx(source);


        // -p parse
        if (options.parse) {
            out.push(t.ast);
        }

        // -c classify or -c2 classify2
        if (options.classify) {
            out.push('Template has'.underline.blue,
                    t.class.describe());
        }

        // default
        if(!(options.parse || options.classify)) {
            try {
                out.push(t.bh.beautify().src, '\n');
            } catch (e) {
                err.push('Error '.bold.red + 'detected while converting template'.blue,
                         t.src,
                         'that has:'.blue,
                        t.class.describe());
                err.push(e.toString());
                stderr.write(err.join('\n'));
                stderr.end('\n');
                throw e;
                return null;
            }

        }

        options.output.write(out.join('\n'));
        options.output.end();
    }
};
