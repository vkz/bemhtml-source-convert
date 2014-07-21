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

// var temp = stx.get(function() {/*
//     block list {
//         elem item, tag: 'li'
//     }
// */});


// var temp = stx.get(function() {/*
// block input, mod theme black, elem hint, tag: 'a'
// */});

// var temp = stx.get(function() {/*
// block input, mod theme black, elem hint, elemMod visibility visible, tag: 'a'
// */});


// var temp = stx.get(function() {/*
// block button {
//     tag: 'button'
//     content: 'text'
//     this._bla === 'bla' { tag: 'a' }
// }
// */});

// module.exports = function(bh) {
//     bh.match("button", function(ctx, json) {
//         ctx.tag(function() {
//             return "button";
//         }());
//         if ([ "pred", "this.ctx.url" ]) {
//             ctx.tag(function() {
//                 return "a";
//             }());
//             ctx.attrs(function() {
//                 return {
//                     href: this.ctx.url
//                 };
//             }());
//             if ([ "pred", "this._bla" ]) {
//                 ctx.attrs(function() {
//                     return {
//                         href: this._bla
//                     };
//                 }());
//             }
//         }
//     });
// };

var temp = stx.get(function() {/*
block button {
    tag: 'button'
    this.ctx.url {
        tag: 'a'
        attrs: {href: this.ctx.url}
        this._bla, attrs: {href: this._bla}
    }
}
*/});

// var tt = stx.parse('ctx.tag(a, b)');
//var tt = stx.parse('function(){b}()');
// serializer.matchAll(tt, 'trans');

//pp(stx.parse(temp));
stx.toBh (temp);
