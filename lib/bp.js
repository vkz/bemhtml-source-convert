var Blueprint = exports,
    lo = require('lodash'),
    colors = require('colors'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    compat  = require('bemhtml-compat'),
    // ibem = require('../test/i-bem'),
    ibem = require('./i-bem.bemhtml'),
    bemxjst = require('bem-xjst'),
    BH = require('bh').BH;

function prettyPrint(obj, opts) {
    opts || (opts = {});
    var prompt = String(opts.prompt || ''),
        wrappedObj = lo.isString(obj) && obj || util.inspect(obj, {depth: 300, colors: false}),
        lenmax = lo(wrappedObj.split('\n'))
            .map(function(s) { return s.length })
            .max()
            .value(),
        len = Math.min(lenmax, 75),
        prefix =  repeatStr(len, '<').magenta.bold + '\n',
        postfix = repeatStr(len, '>').cyan.bold + '\n',
        padding = Math.max(len - prompt.length - 1, 0),
        msg = '\n' + wrappedObj + '\n';
    prompt = prompt ? repeatStr(padding, ' ') + prompt.magenta : '';

    if(opts.stringify) return msg;
    console.log(prefix, prompt, msg, postfix, '\n');
}

function repeatStr(len, str) {
    return (new Array(len)).join(str);
}

Blueprint.addPrettyPrinter = function addPrettyPrinter(obj) {
    obj.pp = function(what, options) {
        return prettyPrint(what || this.ast, options);
    };
};

Blueprint.pp = prettyPrint;

function Classes() {
    this._classes = {};
}

Classes.prototype = {
    _bemFields: ['block', 'elem', 'mods', 'elemMods', '_mode', '_buf'],

    addClass: function addClass(fullClass) {
        // subClass is "1.2" ==> "1" ==> "c1"
        fullClass = fullClass.split('.');
        var classes = this._classes,
            baseClass = fullClass[0],
            subClass = fullClass[1];
        (classes[baseClass] || (classes[baseClass] = {}))[subClass] = true;
    },

    classifyPredic: function classifyPredic(predic) {
        predic.ctx && this.addClass('2.1');
        predic.bem && this.addClass('2.2');
        predic.custom && this.addClass('2.3');
    },

    classifyBody: function classifyPredic(body) {
        body.ctx && this.addClass('3.2');
        (body.apply || body.js) && this.addClass('3.3');
        // if none of ctx, apply, js fields set to true, classify into 3.1
        body.ctx || body.apply || body.js || this.addClass('3.1');
    },

    _classesDescs: {
        '1.1': 'flat predicates',
        '1.2': 'nested predicates',
        '2.1': 'predicates with references to this.ctx',
        '2.2': 'predicates with references to BEM context fields', // be good to show which ones
        '2.3': 'predicates with references to custom context fields', // again, which ones
        '3.1': 'body that returns static JSON',
        '3.2': 'body that returns JSON with references to this.ctx',
        '3.3': 'body that invokes arbitrary JavaScript' // again, give details to the user
    },

    describe: function describe(fullClass) {
        if (lo.isNumber(fullClass) || lo.isString(fullClass)) return this._classesDescs[fullClass];

        return lo(this._classes).reduce(
            function (ac, subClasses, baseClass) {
                return ac + lo(subClasses).reduce(
                    function (ac, _, subClass) {
                        fullClass = baseClass + '.' + subClass;
                        return ac + ' (' + fullClass + ') ' + classesDescs[fullClass] + '\n';
                    },
                    '');
            },
            '\n');
    }
};

Blueprint.Classes = Classes;

function Bh(src) {
    this.src = src;
};

Bh.prototype = {
    beautify: function beautify() {
        var tree = esprima.parse(this.src, { range: true, tokens: true, comment: true });
        tree = escodegen.attachComments(tree, tree.comments, tree.tokens);
        this.src = escodegen.generate(tree, { comment: true });
        return this;
    },

    match: function(json) {
        var bh = new BH(),
            lambdaOnly = this.src.replace(/^module\.exports = |;$/g, ''),
            fbh = eval('(function(f) { return f })(' + lambdaOnly + ')'); // function (bh) { ... }

        //this.prettyPrint(lambdaOnly, {prompt: 'lambda'});
        //this.prettyPrint(fbh.toString(), {prompt: 'fbh'});
        fbh(bh); //populate bh with stuff from fbh-template
        return bh.apply(json);
    },

    pp: function(options) {
        return prettyPrint(this.src, options);
    }
};

Blueprint.Bh = Bh;

function Bemhtml(src) {
    this.src = lo.isFunction(src) ? src.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '') : src;
    this.match = function (json) {
        // NB: ibem is in js-syntax and compat.transpile leaves js intact
        // only transpiling the old syntax, which means it doesn't matter
        // wheather you stick ibem to old or js-syntax - compat.transpile
        // will do the right thing
        var srcjs = compat.transpile(ibem + this.src);
        var compiled = bemxjst.compile(srcjs, {});
        return compiled.apply.call(json);
    },

    this.pp = function(options) {return prettyPrint(this.src, options);};
};

Blueprint.Bemhtml = Bemhtml;