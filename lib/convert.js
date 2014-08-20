var convert = exports,
    bp = require('./bp'),
    compat  = require('bemhtml-compat'),
    ometajs = require('ometajs'),
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
        this.class = classifier.match(compat.parse(this.src), 'topLevel');
        return this;
    },

    parse: function parse() {
        this.ast = parser.matchAll(this.src, 'topLevel');
        return this;
    },

    toBh: function toBh() {
        this.bh = serializer.match(this.ast, 'topLevel', undefined, this.reportError);
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
bp.addPrettyPrinter(Stx.prototype, 'ast');
convert.Stx = Stx;

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
