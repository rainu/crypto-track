const depcheck = require('depcheck');
const path = require('path');
const fs = require('fs');
const pjson = require('./package.json');

const target = path.join(__dirname, process.argv[2]);

const options = {
  ignoreBinPackage: false, // ignore the packages with bin entry
  parsers: { // the target parsers
    '*.js': depcheck.parser.es6,
  },
  detectors: [ // the target detectors
    depcheck.detector.requireCallExpression,
    depcheck.detector.importDeclaration
  ],
  specials: [ // the target special parsers
    depcheck.special.webpack
  ],
};

fs.writeFile(path.join(target, 'package.json'), JSON.stringify(pjson), err => {
  if(err) {
    return console.log(err);
  }

  depcheck(target, options, (unused) => {
    pjson.scripts = {};

    for(let dep of unused.dependencies){
      delete pjson.dependencies[dep];
    }

    for(let dep of unused.devDependencies){
      delete pjson.devDependencies[dep];
    }

    fs.writeFile(path.join(target, 'package.json'), JSON.stringify(pjson, null, 4), err => {
      if (err) {
        return console.log(err);
      }
    });
  });
});
