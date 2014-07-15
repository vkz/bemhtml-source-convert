var convert = require('..'),
    stx = convert.stx,
    utils = convert.utils,
    util = require('util'),
    bh = convert.bh,
    diff = require('html-differ'),
    ibem = require('./i-bem');

// /** basic */
// var input = {block : 'button'},
//     templateSource = function(bh) {
//         bh.match('button', function(ctx, json) {
//             ctx.tag('button');
//         });
//         bh.match('input', function(ctx, json) {
//             ctx.tag('input');
//         });
//     },
//     template = bh.get(templateSource),
//     tapply = bh.tohtml(template);


// /** mods and mixing */
// var input = {block : 'button',
//              mods : {pseudo: 'yes'}},
//     templateSource = function(bh) {
//         bh.match('button_pseudo_yes', function(ctx, json) {
//             ctx.mix({ block: 'link', mods: { pseudo: 'yes' } });
//             ctx.mix([
//                 { elem: 'text' },
//                 { block: 'ajax' }
//             ]);
//         });
//     },
//     template = bh.get(templateSource),
//     tapply = bh.tohtml(template);


// /** getting element position */
// var input = {block : 'list',
//              elem : 'item'
//             },
//     templateSource = function(bh) {
//         bh.match('list__item', function(ctx) {
//             ctx.mod('pos', ctx.position());
//             if (ctx.isFirst()) {
//                 ctx.mod('first', 'yes');
//             }
//             if (ctx.isLast()) {
//                 ctx.mod('last', 'yes');
//             }
//         });
//     },
//     template = bh.get(templateSource),
//     tapply = bh.tohtml(template);


// /** applyBase() */
// var input = {block : 'header',
//              mods : {float: 'yes'}
//             },
//     templateSource = function(bh) {
//         bh.match('header', function(ctx) {
//             ctx.content([
//                 ctx.content(),
//                 { elem: 'under' }
//             ], true);
//         });
//         bh.match('header_float_yes', function(ctx) {
//             ctx.applyBase();
//             ctx.content([
//                 ctx.content(),
//                 { elem: 'clear' }
//             ], true);
//         });
//     },
//     template = bh.get(templateSource),
//     tapply = bh.tohtml(template);


// /** param */
// var input = {block : 'search',
//              action : 'sparta'
//             },
//     templateSource = function(bh) {
//         bh.match('search', function(ctx) {
//             ctx.attr('action', ctx.param('action') || '/');
//         });
//     },
//     template = bh.get(templateSource),
//     tapply = bh.tohtml(template);


/** tParam */
var input = {block : 'input',
             value : 'sparta'
            },
    templateSource = function(bh) {
        bh.match('input', function(ctx, json) {
            ctx.content({
                elem: 'control'
            }, true);
            ctx.tParam('value', ctx.param('value'));
        });

        bh.match('input__control', function(ctx, json) {
            utils.pp(json);
            ctx.attr('value', ctx.tParam('value'));
        });
    },
    template = bh.get(templateSource),
    tapply = bh.tohtml(template);

tapply(input);
