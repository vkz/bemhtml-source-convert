var convert = require('..'),
    Stx = convert.Stx,
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

// // var tt = stx.parse('ctx.tag(a, b)') ;
// //var tt = stx.parse('function(){b}()');
// // serializer.matchAll(tt, 'trans');

var temp = [temp1, temp2, temp3, temp4, temp5];
temp.forEach(
    function(t) {
        t.pp({prompt: 'bemhtml'});
        t.bh.beautify().pp({prompt: 'bh'});
    });


var t = temp[0];
t.match({block: 'list', elem: 'item'});
t.bh.match({block: 'list', elem: 'item'});

// //stx.toBh(temp1);

// //stx.tohtml(temp)({block: 'button', url: 'href'});

// //lo.isEqual(lo.rest(stx.classify2(temp5)), stx.parse(temp5, 'bem'));

// var t = temp5 ;

// //var bh = stx.classify2(t);


// // ediff of parse.tree vs classify.tree should be the same up to
// // dynamically generated flags to avoid infinite recursion of template
// // re-application. This is because I parse two trees separately. Idea
// // here is that classification shouldn't alter bemhtml tree
// if (false) {
//     fs.writeFileSync(path.join(__dirname, 'parse.tree'),
//                      JSON.stringify(stx.parse(t, 'bem'), true, 2));
//     fs.writeFileSync(path.join(__dirname, 'classify.tree'),
//                      JSON.stringify(lo.rest(bh), true, 2));
// }

// // var ast = stx.parse(t, 'bem');
// // pp(ast);


// temp.forEach(stx.toBh);
// //temp.forEach(stx.classify2);

// //stx.classify2(t);

// // var button = {block: 'button', url: 'link'},
// //     bh = convert.bh.tohtml(convert.bh.get(eval(stx.toBh (temp4))));

// // bh(button);

// //jstrans.match('ctx.tag("a", true)', 'stmt');

// var c = stx.bhWithClass(t, 'false').classification;

// pp(stx.describeClass(c), {prompt: 'Classification', stringify: true});

// // var res = stx.classify2(t);

// // var ast = res.shift() && res;



// var temp = new Stx(function() {/*
//     block list {
//         elem item, tag: 'li'
//     }
// */});
// temp.bh;

// temp.class;

// function Temp() {
//     var _h;

//     // this.h = _h ? _h : (_h = 42, _h);

//     Object.defineProperties(this, {
//         'test': { 'get': function() { !_h && (_h = '42'); return _h;}}
//     });

// }

// Temp.prototype.seth = function () { _h = 42;};

// // var e = new Stx('block button, content: [applyNext()]');
// var e = new Stx('ohtu othu ethuo {nthoe }');
// e.bh;



var t = new Stx("block serp-meta, elem text-wrap, tag: 'span'");
t.bemhtml.match({
    "block": "serp-meta",
    "elem": "text-wrap",
    "content": "Serp meta text-wrap content"
});

// lo(templates).forEach(function(src, name) {
//     var t = new Stx(src);
//     t.bh.pp({prompt: name});
// });



// var temp = new Stx(function() {/*
//     block list {
//         elem item, tag: 'li'
//     }
// */});
// temp.bh;
