var convert = require('..'),
    Stx = convert.Stx,
    bp = require('../lib/bp'),
    pp = convert.utils.pp,
    ometajs = require('ometajs'),
    lo = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    parser = require('../lib/ometa/bemhtml-bh').Parser,
    serializer = require('../lib/ometa/bemhtml-bh').XastToBh,
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser,
    jstrans = ometajs.grammars.BSJSTranslator,
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

var temp1 = new Stx(function() {/*
    block list {
        elem item, tag: 'li'
    }
*/});


var temp2 = new Stx(function() {/*
block input, mod theme black, elem hint, tag: 'a'
*/});

var temp3 = new Stx(function() {/*
block input, mod theme black, elem hint, elemMod visibility visible, tag: 'a'
*/});

var temp4 = new Stx(function() {/*
block button {
    tag: 'button'
    content: {block: 'link'}
    this.ctx.url { tag: this.ctx.url }
}
*/});

var temp5 = new Stx(function() {/*
block button {
    tag: 'button'
    this.ctx.url {
        tag: 'a'
        attrs: ({href: this.ctx.url})
        this._bla, attrs: ({href: this._bla})
    }
}
*/});

// //try convert temp*
// var temp = [temp1, temp2, temp3, temp4, temp5];
// temp.forEach(
//     function(t) {
//         t.pp({prompt: 'bemhtml'});
//         t.bh.beautify().pp({prompt: 'bh'});
//     });

// // why wouldn't it blow up on this input?
// var e = new Stx('ohtu othu ethuo {nthoe }');
// e.bh;

// // random template from Granny
// var t = new Stx("block serp-meta, elem text-wrap, tag: 'span'");
// t.bemhtml.match({
//     "block": "serp-meta",
//     "elem": "text-wrap",
//     "content": "Serp meta text-wrap content"
// });

// //try convert test/cases/*
// lo(templates).forEach(function(src, name) {
//     var t = new Stx(src);
//     try {
//         t.bh.beautify().pp({prompt: name});
//     } catch(e) {
//         console.log('!!!' + name.underline + '!!!');
//     }
// });

// [
//     templates.temp33_a,
//     templates.temp33_b,
//     templates.temp33_c
// ]

// lo(templates).forEach(function(src, name) {
//     var t = new Stx(src);
//     try {
//         t.bh;
//     } catch(e) {
//         console.log(e.message ? e.message : e);
//         console.log(name.underline);
//     }
// });

var t = new Stx(templates.temp33_c);
t.bh;
