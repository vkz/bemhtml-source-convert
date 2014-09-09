#[BEMHTML] to [BH] conversion tool
###### Disclaimer ######
_Given the impedence mismatch between *Bemhtml* and *Bh* it does not seem possible to convert every template or guarantee that the applicative semantics of the source will be preserved in the result. Bemhtml is much too expressive and lenient to deliver on such promise. The ability to apply templates in modified context powered by XJST methods `apply`, `applyNext`, `applyCtx` employing the result is one feature prominantly missing in Bh, whose `applyBase` method carries a very particular meaning that doesn't map clearly on Bemhtml machinery and as of this writing appears to be broken anyway._

----------------------------------------------------------------------------------

[bemhtml-source-convert](https://github.com/vkz/bemhtml-source-convert) helps you port existing [Bemhtml] templates to [Bh]. Given the above disclaimer it is best viewed as an aid that guides your conversion effort. Until there's a more direct mapping between *Bemhtml* and *Bh* we hope that in the best case it will produce a drop in replacement for your *Bemhtml* template, give you enough meat to avoid writing *Bh* from scratch on your average template, and offer meaningful feedback when unable to convert. Be sure to eyeball and test even the happy case when conversion succeeds. 

###Install
```bash
$ git clone https://github.com/vkz/bemhtml-source-convert.git
$ cd bemhtml-source-convert
$ npm install
$ bower install
```

###Use

####cli
```bash
$ bemhtml2bh -h
Usage:
  bemhtml2bh [OPTIONS] [ARGS]


Options:
  -h, --help : Help
  -v, --verbose : Verbose mode
  -i INPUT, --input=INPUT : File to convert (default: stdin)
  -j BEMJSON, --json=BEMJSON : Apply templates to this bemjson file
  -s SETOPTIONS, --setOptions=SETOPTIONS : Set bh-template options (default: { "jsAttrName": "onclick" , "jsAttrScheme": "js" })
  -o OUTPUT, --output=OUTPUT : Output to file (default: stdout)
```

#####Example
Convert this meaningless template _**-i**_ *test/scratch.bemhtml* into Bh
```
block node {
    mod 'size' 'big', tag: 'big'
    js: {param: 'p2'}
    attrs:  {node: 'yes'}
}
```

feeding it a *bemjson* _**-j**_ *test/scratch.json*
```
{
    "block" : "node",
    "attrs": {"a": "set"}
}
```

Hopefully this should produce a Bh template and HTML. You'll get a color-coded diff if generated Bh and original Bemhtml produce different HTML when applied to the same *bemjson*.
```bash
~/Documents/bemhtml-source-convert [master] $ bemhtml2bh -i test/scratch.bemhtml -j test/scratch.json
module.exports = function (bh) {
    bh.match('node_size_big', function (ctx, json) {
        ctx.tag('big', true);
    });
    bh.match('node', function (ctx, json) {
        ctx.js(json.js !== false ? ctx.extend(json.js, { 'param': 'p2' }) : false);
        ctx.attrs(ctx.extend({ 'node': 'yes' }, ctx.attrs()));
    });
};
Html produced
expected actual
<div a="set" class="i-bem node" data-bem="{&node="yes" onclick="return {&quot;node&quot;:{&quot;param&quot;:&quot;p2&quot;}}" node="yes"></;}}"></div>
```

####api
#####Stx object
var stx = new Stx(stringOfBemhtml)

stx.bemhtml {object} with fields/methods:
* src duplicated in stx.src
* match(json) duplicated in stx.match(json)
* pp()

stx.bh {object} with fields/methods:
* match(json, options)
* pp()

stx.htmlDiff(json, options)
stx.pp(anyJavaScriptObject, {prompt: "", stringify: false)

#####Example
```javascript
var repoDir = '/Users/kozin/Documents/bemhtml-source-convert/',
    Stx = require(repoDir + 'lib/convert').Stx,
    fs = require('fs'),
    stx = new Stx(fs.readFileSync('scratch.bemhtml', 'utf8')),
    bemjson = JSON.parse(fs.readFileSync('scratch.json', 'utf8'));

// pretty-print bemjson
stx.pp(bemjson, {prompt: 'bemjson'});

// pretty-print bemhtml
stx.bemhtml.pp({prompt: 'bemhtml'});

// convert bemhtml into bh and pretty-print the result
try {
    stx.bh.pp({prompt: 'bh generated'});
} catch(e) {
    console.log(e.message);
}

// try applying both templates to bemjson showing colored diff if they
// produce different HTML or HTML otherwise
var diff = stx.htmlDiff(bemjson);
diff.isEqual ?
    console.log('Html diff\n', diff.html) :
    console.log('Html\n', diff.html);
```

[Bemhtml]:    http://bem.info/tags/bem-core-v2.3.0/#
[Bemhtml/Ru]: http://ru.bem.info/technology/bemhtml/2.3.0/rationale/
[Bh]:         https://github.com/bem/bh
