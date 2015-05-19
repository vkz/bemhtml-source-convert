exports.COA = function () {
  this
    .opt()
        .name('verbose')
        .title('Verbose mode')
        .short('v').long('verbose')
        .flag()
        .end()
    .opt()
        .name('input').title('File to convert (default: stdin)')
        .short('i').long('input')
        .input()
        .end()
    .opt()
        .name('bemjson').title('Apply templates to this bemjson file')
        .short('j').long('json')
        .val(function(v) {return JSON.parse(require('fs').readFileSync(v, 'utf8'));})
        .end()
    .opt()
        .name('setOptions').title('Set bh-template options (default: { \"jsAttrName\": \"onclick\" , \"jsAttrScheme\": \"js\" })')
        .short('s').long('setOptions')
        .val(function(v) {return JSON.parse(v);})
        .end()
    .opt()
        .name('output').title('Output to file (default: stdout)')
        .short('o').long('output')
        .output()
        .end()
    .opt()
        .name('strictOff')
        .title('Ignore bh-incompatibility warnings, perform best-effort conversion')
        .short('S').long('strictOff')
        .flag()
        .end()
    .opt()
        .name('jsstx')
        .title('Convert old BEMHTML syntax into Js-campatible syntax using bemhtml-compat')
        .short('x').long('jsstx')
        .flag()
        .end()
    .act(function(options) {
        // PIPE when reading from stdin, TTY when reading from file
        // console.log(process.binding ('tty_wrap').guessHandleType (0));
        return require('../lib/convert')
            .run(options);
    })
}
