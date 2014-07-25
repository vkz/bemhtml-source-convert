var convert = exports,
    compat  = require('bemhtml-compat'),
    ometajs = require('ometajs'),
    ast2astxjst = require('./ometa/bemhtml').BEMHTMLToXJST,
    stx2astWithClass = require('../lib/ometa/bemhtml-classify').BEMHTMLParser,
    classifier = require('../lib/ometa/bemhtml-bh').Classifier,
    serializer = require('../lib/ometa/bemhtml-bh').XastToBh,
    serializer2 = require('../lib/ometa/bemhtml-bh').XastToBh2,
    ibem = require('../test/i-bem'),
    bemxjst = require('bem-xjst'),
    BH = require('bh').BH,
    fs = require('fs'),
    lo = require('lodash'),
    colors = require('colors'),
    uglify = require('uglify-js'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    util = require('util');

/**
 * @typedef {string} stx   - Template in old bemhtml syntax
 * @typedef {string} stxjs - Template in js bemhtml syntax
 * @typedef {Object} bh    - BH object instanciated with a bh-template
*/


convert.stx = {

    /**
     * Parse old-syntax template into an ast. Same as BEMHTMLParser
     * from compat-bemhtml would produce but the first element in the
     * returned array holds classification information. To turn this
     * into bemhtml ast remove the first element:
     *
     * result.shift();
     *      or
     * result = lodash.rest(result);
     *
     * @param {stx} src
     * @returns {Array}
     */
    classify: function (src) {
        return stx2astWithClass.matchAll(src, 'topLevel');
    },

    /**
     * Same as stx.classify above but but doesn't modify existing
     * grammars. Instead it inherits from BEMHTMLtoXJST traversal
     * grammar and shadows several base rules. See grammar definitions
     * in bemhtml-bh.ometajs
     * @param {stx} src
     * @returns {}
     */
    classify2: function(src) {
        return classifier.match(compat.parse (src), 'topLevel');
    },

    /**
     * Parse old template into an bemhtml or xjst-compatible ast.
     * @param {stx} src
     * @returns {xast}
     */
    parse: function parse(src, bemhtmlAst) {
        var ast = compat.parse (src);
        return bemhtmlAst ? ast : ast2astxjst.match(ast, 'topLevel');
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

    get: getSource,

    toBh: function toBh(src, shouldBeautify) {
        var ast = lo.isArray(src) ? src : convert.stx.parse(src, 'bem'),
            result = serializer.match (ast, 'topLevel');
        shouldBeautify = ( typeof shouldBeautify === 'undefined') || !!shouldBeautify; //beautify by default
        shouldBeautify && (result = beautify(result));
        prettyPrint(result);
        return result;
    },

    bhWithClass: function bhWithClass(src, shouldBeautify) {
        var stx = convert.stx,
            ast = stx.classify2(src),
            classification = ast.shift(),
            bh = stx.toBh(ast, shouldBeautify),
            pp = convert.utils.pp;
        pp(classification, 'Classification');
        pp(bh, 'Bh');
        return {classification: classification, bh: bh};
    },

    describeClass: function describeClass (c) {
        var classMap = {
            '1.1':'flat predicates',
            '1.2':'nested predicates',
            '2.1':'predicates with references to ' + 'this.ctx'.blue,
            '2.2':'predicates with references to BEM context fields', //be good to show which ones
            '2.3':'predicates with references to custom context fields',//again, which ones
            '3.1':'body that returns static JSON',
            '3.2':'body that returns JSON with references to ' + 'this.ctx'.blue,
            '3.3':'body that invokes arbitrary JavaScript'}, //again, give details to the user
            ans = '';

        if (lo.isNumber(c) || lo.isString(c)) {
            c = c.toString();
            return classMap[c];
        } else {
            ans += lo(c).
                reduce(function (ac, ar) {
                    return ac + lo(ar).
                        reduce(function (ac, str) {return ac + ' * ' + classMap[str] + '\n';},
                               '');
                },
                       '\n');
            return ans;}
    }
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
function prettyPrint(obj, opts) {
    opts = opts ?  opts : {};
    var prompt = opts.prompt ? opts.prompt : '',
        asString = opts.stringify ? !!opts.stringify : false,
        wrappedObj = lo.isString(obj) && obj || util.inspect(obj, {depth: 300, colors: false}),
        len = lo(wrappedObj.split('\n')).
            map(function(s) {return s.length;}).
            max().
            value(),
        prefix = (new Array(len)).join('<').magenta.bold,
        postfix = (new Array(len)).join('>').cyan.bold,
        padding = lo.isString(prompt) && len - prompt.length || 0,
        msg;
    padding = (padding < 0) ? 0 : padding;
    prompt = prompt ? (new Array(padding)).join(' ') + prompt.magenta : '';
    msg = prompt + '\n' + wrappedObj;
    !asString && console.log(prefix, msg, postfix);
    return msg;
}


// // beautify and print using my prettyPrinter
// function beautify(code) {
//     var stream = uglify.OutputStream({beautify: true });
//     var uast = uglify.parse (code);
//     code = uast.print(stream);
//     return stream.toString();
// }


// beautify and print using my prettyPrinter
function beautify(code) {
    var tree = esprima.parse(code, {range: true, tokens: true, comment: true});
    tree = escodegen.attachComments(tree, tree.comments, tree.tokens);
    return escodegen.generate(tree, {comment: true});
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

convert.utils = {
    contains: contains,
    pp: prettyPrint,
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
            stx = convert.stx;

        out.push("Source template:".underline.blue,
                 prettyPrint(source, {stringify: true}));

        function pushResult(res) {
            out.push(JSON.stringify(res, null, 2));
        }

        // -p parse
        if (options.parse) {
            out.push("XJST parse tree:".underline.blue,
                     JSON.stringify(convert.stx.parse (source),
                                    null, "  "));
        }

        // -c classify or -c2 classify2
        if (options.classify || options.classify2) {
            var classify = options.classify ?
                    convert.stx.classify :
                    convert.stx.classify2,
                classObj = classify(source).shift();

            out.push('Template has'.underline.blue,
                     prettyPrint(convert.stx.describeClass(classObj), {stringify: true}));
        }

        // default
        if(!(options.parse || options.classify || options.classify2)) {
            try {
                var res = stx.toBh(source);
                out.push(prettyPrint(stx.toBh(source), {stringify: true}));
            } catch (e) {
                err.push('Error '.bold.red + 'detected while converting template'.blue,
                         prettyPrint(source, {stringify: true}),
                         'that has:'.blue,
                         stx.describeClass(stx.classify2(source).shift()));
                stderr.write(err.join('\n'));
                stderr.end('\n');
                throw e;
            }

        }

        options.output.write(out.join('\n'));

        if (options.output === process.stdout) {
            options.output.write('\n');
        }

        options.output.end();
    }
};
