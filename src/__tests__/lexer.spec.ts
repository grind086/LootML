import Compiler from '../Compiler';
import Lexer from '../Lexer';
import Parser from '../Parser';

import { compileJS, minify } from '../';

import * as fs from 'fs';

const inputFile = fs.readFileSync(__dirname + '/../../examples/rare_world_drops.loot', 'utf8');

// fs.writeFileSync(__dirname + '/compiled.js', compileJS(inputFile));
// console.log(minify(inputFile).length);
// console.log(compileJS(inputFile).length);
// console.log(compileJS(minify(inputFile)).length);

// console.log(minify(inputFile));

const lexer = new Lexer(inputFile);
const parser = new Parser(lexer.analyze());
const compiler = new Compiler(parser.parse());

const compiled = compiler.compile();
fs.writeFileSync(__dirname + '/compiled.js', compiled);

const result = require(__dirname + '/compiled.js');

console.log(result.test());

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
