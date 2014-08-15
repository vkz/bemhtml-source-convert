var convert = require('..'),
    Stx = convert.Stx,
    bp = require('../lib/bp'),
    pp = bp.pp,
    ometajs = require('ometajs'),
    lo = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    parser = require('../lib/ometa/bemhtml-bh').Parser,
    serializer = require('../lib/ometa/bemhtml-bh').XastToBh,
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser,
    compat = require('bemhtml-compat'),
    jstrans = ometajs.grammars.BSJSTranslator,
    uglify = require('uglify-js'),
    colors = require('colors'),
    esprima = require('esprima'),
    Bh = require('bh').BH,
    escodegen = require('escodegen'),
    projectRoot = path.resolve(path.join(__dirname, '..')),
    casesRoot = path.join(projectRoot, 'test', 'cases'),
    files = fs.readdirSync(casesRoot),
    templates = lo.map(files,
                       function(f) {
                           return path.basename(f, '.bemhtml');
                       });

// files = lo(files).
//     map(function (f) {return path.join(casesRoot, f);}).
//     map(function (f) {return fs.readFileSync(f, 'utf-8');}).
//     value();

// templates = lo.zipObject (templates,
//                           files);

// var temp1 = new Stx(function() {/*
//     block list {
//         elem item, tag: 'li'
//     }
// */});


// var temp2 = new Stx(function() {/*
// block input, mod theme black, elem hint, tag: 'a'
// */});

// var temp3 = new Stx(function() {/*
// block input, mod theme black, elem hint, elemMod visibility visible, tag: 'a'
// */});

// var temp4 = new Stx(function() {/*
// block button {
//     tag: 'button'
//     content: 'Yandex'
//     this.ctx.url { tag: this.ctx.url }
// }
// */});

// var temp5 = new Stx(function() {/*
// block button {
//     tag: 'button'
//     this.ctx.url {
//         tag: 'a'
//         attrs: {this._bla = '_bla_bla'; console.log(this); return {href: 'hi'};}
//         this._bla, attrs: ({href: this._bla})
//     }
// }
// */});


// //try convert temp*
// var temp = [temp1, temp2, temp3, temp4, temp5];
// temp.forEach(
//     function(t) {
//         //t.pp({prompt: 'bemhtml'});
//         t.bh.beautify().pp({prompt: 'bh'});
//     });

// // // why wouldn't it blow up on this input?
// // var e = new Stx('ohtu othu ethuo {nthoe }');
// // e.bh;

// // // random template from Granny
// // var t = new Stx("block serp-meta, elem text-wrap, tag: 'span'");
// // t.bemhtml.match({
// //     "block": "serp-meta",
// //     "elem": "text-wrap",
// //     "content": "Serp meta text-wrap content"
// // });

// // //try convert test/cases/*
// // lo(templates).forEach(function(src, name) {
// //     var t = new Stx(src);
// //     try {
// //         t.bh.beautify().pp({prompt: name});
// //     } catch(e) {
// //         console.log('!!!' + name.underline + '!!!');
// //     }
// // });

// // [
// //     templates.temp33_a,
// //     templates.temp33_b,
// //     templates.temp33_c
// // ]

// // lo(templates).forEach(function(src, name) {
// //     var t = new Stx(src);
// //     try {
// //         t.bh;
// //     } catch(e) {
// //         console.log(e.message ? e.message : e);
// //         console.log(name.underline);
// //     }
// // });

// // var t = new Stx(templates.temp33_c);


// temp5.bemhtml.pp();
// temp5.bemhtml.match({block: 'button', url: 'yandex.ru', _bla: 'yandex-team.ru'});


// pp(bemparser.matchAll ('this.mods.layout', 'stmt'));
// pp(bemparser.matchAll ('this.mods.layout = "val"', 'stmt'));
// jstrans.match(['call', ['getp', ['string', 'mod'], ['get', 'ctx']], ['string', 'p'], ['string', 'val']], 'trans');



var differ = require('html-differ'),
    difflogger = require('html-differ/lib/diff-logger'),
    options = {
        ignoreHtmlAttrs: [],
        compareHtmlAttrsAsJSON: [],
        ignoreWhitespaces: true,
        ignoreHtmlComments: true,
        bem: false
    };

var bemhtmlsrc = '/Users/kozin/Documents/bh-migration-test/blocks/serp-url/serp-url.bemhtml',
    stx = new Stx(fs.readFileSync(bemhtmlsrc, 'utf8')),
    dirname = path.dirname(bemhtmlsrc),
    pathtail = dirname.slice('/Users/kozin/Documents/bh-migration-test/'.length),
    name = path.basename(bemhtmlsrc, '.bemhtml'),
    bemjson = fs.readFileSync(dirname + '/' + name + '.json', 'utf8'),
    json1 = JSON.parse(bemjson),
    json2 = lo.cloneDeep(json1),
    json3 = lo.cloneDeep(json1),
    htmlexpected = stx.match(json1);


pp(bemjson, {prompt: 'json'});                             // show json
stx.pp(stx.src, {prompt: 'bemhtml'});                      // show bemhtml

var bhHandWritten = require('/Users/kozin/Documents/granny/' + pathtail + '/' + name + '.bh.js'),
    bh = new Bh();
bhHandWritten(bh);
pp(bhHandWritten.toString(), {prompt: 'bh hand-written'}); // show bh

stx.bh.beautify().pp({prompt: 'bh generated'});            // show bh-generated


var html = stx.bh.match(json2),
    diff = differ.diffHtml(html, htmlexpected);
if (!differ.isEqual(html, htmlexpected)) {
    pp('Html diff bemhtml VS bh generated\n'.red);
    difflogger.log(diff, { charsAroundDiff: 500 });                      // show html-diff
    console.log('Html from hand-written bh\n'.magenta, bh.apply(json3)); // show html from hand-written bh
    console.log('\n');
}
