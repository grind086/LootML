import Lexer from '../Lexer';
import Parser from '../Parser';

import { compileJS, minify } from '../';

import * as fs from 'fs';

const inputFile = `
@Nothing
item['NONE']

@WorldBlues
oneOf {
    item['RareSword'],
    item['RareSpear']
}

@WorldPurples
oneOf {
    item['EpicSword'],
    item['EpicSpear']
}

@WorldJackpot
item['Gold', 100000-1000000]

@WorldDrops
oneOf {
    1000 Nothing,
      10 WorldBlues,
       1 WorldPurples,
       1 WorldJackpot
}

$test
allOf {
    WorldDrops,
    item['Gold', 100-1000],
    oneOf {
        2 Nothing,
        item['Apple'],
        item['Cloth scraps']
    }
}
`;

fs.writeFileSync(__dirname + '/compiled.js', compileJS(inputFile));
console.log(minify(inputFile).length);
console.log(compileJS(inputFile).length);
console.log(compileJS(minify(inputFile)).length);

console.log(minify(inputFile));

// const lexer = new Lexer(inputFile);
// const parser = new Parser(lexer.analyze());
// const compiled = parser.parse();

// const fn = eval(compiled.test);
// const res = {
//     MINE: 0,
//     YOURS: 0,
//     item2: 0
// };

// for (let i = 0; i < 1e6; i++) {
//     const type = fn().type;
//     res[type]++;
//     // console.log(type);
// }

// console.log(res);

// console.log(minify(inputFile));
