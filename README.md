#BEMHTML to BH conversion tool
##### Disclaimer ###### _Given the impedence mismatch between *Bemhtml* and *Bh* it does not seem possible to convert every template or guarantee that the applicative semantics of the source will be preserved in the result. Bemhtml is much too expressive and lenient to deliver on such promise. The ability to apply templates in modified context powered by XJST methods `apply`, `applyNext`, `applyCtx` employing the result is one feature prominantly missing in Bh. It's `applyBase` method carries a very particular meaning that doesn't map clearly on Bemhtml machinery and as of this writing appears to be broken anyway._

----------------------------------------------------------------------------------

This is a tool to help you port existing Bemhtml templates into Bh. Given the above disclaimer it is best viewed as an aid that guides your conversion effort. Until there's a more direct mapping between Bemhtml and Bh we hope that in the best case this tool will produce a drop in replacement for your Bemhtml template, on average give you enough meat to avoid writing Bh from scratch, offering meaningful feedback when unable to convert. Always be sure to eyeball and test the result.

###Install
```bash
$ git clone https://github.com/vkz/bemhtml-source-convert.git
$ cd bemhtml-source-convert
$ npm install
$ bower install
```

###Use
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

###Example
With *-j* option a json passed to the command will be matched against both original bemhtml and generated bh templates. Expect a colored diff if the two produce different html.
```bash
~/Documents/bemhtml-source-convert [master] $ cat test/scratch.bemhtml
block node {
mod 'size' 'big', tag: 'big'
js: {param: 'p2'}
attrs:  {node: 'yes'}
}

~/Documents/bemhtml-source-convert [master] $ cat test/scratch.json
{
"block" : "node",
"attrs": {"a": "set"}
}

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
