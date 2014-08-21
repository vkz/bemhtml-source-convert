var convert = exports,
    bp = require('./bp'),
    compat  = require('bemhtml-compat'),
    ometajs = require('ometajs'),
    lo = require('lodash'),
    bemhtml2bh = require('../lib/ometa/bemhtml-bh'),
    parser = bemhtml2bh.Parser,
    classifier = bemhtml2bh.Classifier,
    serializer = bemhtml2bh.XastToBh,
    colors = require('colors');

function Stx (src) {
    var _class,
        _ast,
        _bh;

    this.bemhtml = new bp.Bemhtml(src);
    this.src = this.bemhtml.src;
    this.match = function (json) { return this.bemhtml.match(json);};

    Object.defineProperties (this, {
        'class': {
            'get': function() { return _class || this.classify().class; },
            'set': function(v) { _class = v; return this; },
            enumerable: true
        },
        'ast': {
            'get': function() { return _ast|| this.parse().ast; },
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
        this.class = classifier.match(compat.parse(this.src), 'topLevel');
        return this;
    },

    parse: function parse() {
        this.ast = new bp.Ast(parser.matchAll(this.src, 'topLevel'));
        return this;
    },

    toBh: function toBh() {
        this.bh = serializer.match(this.ast.get(), 'topLevel', undefined, this.reportError);
        return this;
    },

    reportError: function reportError(err) {
        // additional info can be passed via this._errorStack.report
        // in XastToBh grammar
        if (!err.report) throw(err);
        var message = ['Can\'t auto-convert this bemhtml because:']
                .concat(err
                        .report
                        .map(function (problem) { return ' * ' + problem; }));
        err.message = message.join('\n') + '\n\n';
        throw err;
    }

};
bp.addPrettyPrinter(Stx.prototype);
convert.Stx = Stx;

convert.run = function run(options) {
    var input = [],
        out = [],
        err = [],
        stderr = process.stderr;

    options.input
        .on('data', function(chunk) { input.push(chunk); })
        .on('end', function() { finish(input.join('')); })
        .resume();

    function htmlDiff(stx, json) {
        var differ = require('html-differ'),
            difflogger = require('html-differ/lib/diff-logger'),
            jsonCopy = lo.cloneDeep(json),
            htmlExpected = stx.match(json),
            htmlBh = stx.bh.match(jsonCopy),
            htmldiff = differ.diffHtml(htmlBh, htmlExpected);

        return (differ.isEqual(htmlBh, htmlExpected) && htmlBh) ||
            difflogger.getDiffText(htmldiff, { charsAroundDiff: 500 });
    }

    function addMetaInfo(out, stx) {
        out.push(
            stx.class.describe(),
            stx.ast.pp({stringify: true}));
    }

    function finish(source) {
        var stx = new convert.Stx(source);

        try {
            stx.bh.beautify();
        } catch (e) {
            err.push(
                'Error'.bold.red + ' detected while converting template'.blue,
                stx.src,
                e.message);
            addMetaInfo(err, stx);
            stderr.write(err.join('\n'));
            stderr.end('\n');
            throw e;
        }

        out.push(stx.bh.src);

        if (options.bemjson) out.push(
            'expected'.green + ' actual'.red,
            htmlDiff(stx, options.bemjson));

        if (options.verbose) addMetaInfo(out, stx);

        options.output.write(out.join('\n'));
        options.output.end('\n');
    }
};
