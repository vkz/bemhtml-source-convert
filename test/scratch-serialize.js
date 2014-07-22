var convert = require('..'),
    stx = convert.stx,
    pp = convert.utils.pp,
    ometajs = require('ometajs'),
    lo = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    parser = require('../lib/ometa/bemhtml-bh').Parser,
    serializer = require('../lib/ometa/bemhtml-bh').XastToBh,
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser,
    uglify = require('uglify-js'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    projectRoot = path.resolve(path.join(__dirname, '..')),
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

templates = lo.zipObject (templates,
                          files);

var temp1 = stx.get(function() {/*
    block list {
        elem item, tag: 'li'
    }
*/});


var temp2 = stx.get(function() {/*
block input, mod theme black, elem hint, tag: 'a'
*/});

var temp3 = stx.get(function() {/*
block input, mod theme black, elem hint, elemMod visibility visible, tag: 'a'
*/});

var temp4 = stx.get(function() {/*
block button {
    tag: 'button'
    content: this.ctx
    this._bla && this.ctx.url { tag: 'a' }
}
*/});

var temp5 = stx.get(function() {/*
block button {
    tag: 'button'
    this.ctx.url {
        tag: {applyNext()}
        attrs: ({href: this.ctx.url})
        this._bla, attrs: ({href: this._bla})
    }
}
*/});

// var tt = stx.parse('ctx.tag(a, b)') ;
//var tt = stx.parse('function(){b}()');
// serializer.matchAll(tt, 'trans');

var temp = [temp1, temp2, temp3, temp4, temp5];

//stx.toBh(temp1);

//stx.tohtml(temp)({block: 'button', url: 'href'});

//lo.isEqual(lo.rest(stx.classify2(temp5)), stx.parse(temp5, 'bem'));

var res = stx.classify2(temp5);


// ediff of parse.tree vs classify.tree should be the same up to
// dynamically generated flags to avoid infinite recursion of template
// re-application. This is because I parse two trees separately. Idea
// here is that classification shouldn't alter bemhtml tree
if (false) {
    fs.writeFileSync(path.join(__dirname, 'parse.tree'),
                     JSON.stringify(stx.parse(temp5, 'bem'), true, 2));
    fs.writeFileSync(path.join(__dirname, 'classify.tree'),
                     JSON.stringify(lo.rest(res), true, 2));
}
