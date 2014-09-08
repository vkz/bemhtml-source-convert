##BEMHTML conversion tool

Install
```bash
$ git clone https://github.com/vkz/bemhtml-source-convert.git
$ cd bemhtml-source-convert
$ npm install
$ bower install
```

Use
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
