var convert = require('..'),
    stx = convert.stx,
    stxjs = convert.stxjs,
    bh = convert.bh,
    pp = convert.prettyPrint;
var assert = require('assert');
var diff = require('html-differ');
var ibem = require('./i-bem');

/**********
 playground
 **********/

var temp = stx.get(function () {/*

    block logo {
        tag: 'img'
    }

*/});

var tempbh = bh.get(function(bh) {

    bh.match('logo', function(ctx, json) {
        ctx.tag(json.tag || 'img');
    });

});


diff.isEqual(bh.tohtml(tempbh)({block: 'button'}),
             stx.tohtml (temp) ({block: 'button'}));


console.log(bh.tohtml(tempbh)({block: 'logo'}));
console.log(stx.tohtml (temp)({block: 'logo'}));
