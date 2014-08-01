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
    opts = opts ?  opts : {};
    var prompt = opts.prompt ? opts.prompt : '',
        asString = opts.stringify ? !!opts.stringify : false,
        wrappedObj = lo.isString(obj) && obj || util.inspect(obj, {depth: 300, colors: false}),
        len = lo(wrappedObj.split('\n')).
            map(function(s) {return s.length;}).
            max().
            value(),
        prefix = (new Array(len)).join('<').magenta.bold + '\n',
        postfix = (new Array(len)).join('>').cyan.bold + '\n',
        padding = lo.isString(prompt) && len - prompt.length - 1 || 0,
        msg;
    padding = (padding < 0) ? 0 : padding;
    prompt = prompt ? (new Array(padding)).join(' ') + prompt.magenta : '';
    msg = '\n' + wrappedObj + '\n';
    return asString ? msg : console.log(prefix, prompt, msg, postfix, '\n') && null;
}

Blueprint.pp = prettyPrint;

var PrettyPrinter = {
    prettyPrint: function (what, options) { return prettyPrint(what || this, options);},
    pp: function (what, options) { return prettyPrint(what || this, options);}
};

function Classes() {
    this.c1 = [];
    this.c2 = [];
    this.c3 = [];
}

var bpClasses = {
    _bemFields: ['block', 'elem', 'mods', 'elemMods', '_mode', '_buf'],

    uniq: function uniq() {
        this.c1 = lo.uniq(this.c1);
        this.c2 = lo.uniq(this.c2);
        this.c3 = lo.uniq(this.c3);
        return this;
    },

    addClass: function addClass(subClass) {
        // subClass is "1.2" ==> "1" ==> "c1"
        this['c' + subClass.split('.').shift()].push(subClass);
    },

    classifyPredic: function classifyPredic(predicObj) {
        predicObj.ctx && this.addClass('2.1');
        predicObj.bem && this.addClass('2.2');
        predicObj.custom && this.addClass('2.3');
    },

    classifyBody: function classifyPredic(bodyObj) {
        bodyObj.ctx && this.addClass('3.2');
        (bodyObj.apply || bodyObj.js) && this.addClass('3.3');
        // if none of ctx, apply, js fields set to true, classify into 3.1
        bodyObj.ctx || bodyObj.apply || bodyObj.js || this.addClass('3.1');
    },

    describe: function describe(c) {
        var classMap = {
            '1.1':'flat predicates',
            '1.2':'nested predicates',
            '2.1':'predicates with references to ' + 'this.ctx',
            '2.2':'predicates with references to BEM context fields', //be good to show which ones
            '2.3':'predicates with references to custom context fields',//again, which ones
            '3.1':'body that returns static JSON',
            '3.2':'body that returns JSON with references to ' + 'this.ctx',
            '3.3':'body that invokes arbitrary JavaScript'}, //again, give details to the user
            ans = '';

        if (lo.isNumber(c) || lo.isString(c)) {
            c = c.toString();
            return classMap[c];
        } else {
            ans += lo(this).
                reduce(function (ac, ar) {
                    return ac + lo(ar).
                        reduce(function (ac, str) {return ac + ' (' + str + ') ' + classMap[str] + '\n';},
                               '');
                },
                       '\n');
            return ans;}
    }
};
Classes.prototype = Object.create(lo.merge(PrettyPrinter, bpClasses));
Blueprint.Classes = Classes;

function Bh(src) {
    this.src = src;

    this.beautify = function beautify() {
        var tree = esprima.parse(this.src, {range: true, tokens: true, comment: true});
        tree = escodegen.attachComments(tree, tree.comments, tree.tokens);
        this.src = escodegen.generate(tree, {comment: true});
        return this;
    };

    this.match = function(json) {
        var bh = new BH(),
            lambdaOnly = this.src.replace(/^module\.exports = |;$/g, ''),
            fbh = eval('(function(f) {return f;})(' + lambdaOnly + ')'); // function (bh) { ... }
        //this.prettyPrint(lambdaOnly, {prompt: 'lambda'});
        //this.prettyPrint(fbh.toString(), {prompt: 'fbh'});
        fbh(bh); //populate bh with stuff from fbh-template
        return bh.apply(json);
    },

    this.pp = function(options) {return prettyPrint(this.src, options);};
};
Bh.prototype = Object.create(PrettyPrinter);
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
