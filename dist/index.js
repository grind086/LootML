"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Compiler_1 = require("./Compiler");
exports.Compiler = Compiler_1.default;
const Lexer_1 = require("./Lexer");
exports.Lexer = Lexer_1.default;
const minify_1 = require("./minify");
exports.minify = minify_1.default;
const Parser_1 = require("./Parser");
exports.Parser = Parser_1.default;
/**
 * Compiles the given program to a commonJS module
 * @param input A LootML program in string form
 */
function compileCommonJS(input) {
    return `module.exports=${compileRaw(input)}`;
}
exports.compileCommonJS = compileCommonJS;
/**
 * Compiles the given program to an object of executable functions (USES EVAL)
 * @param input A LootML program in string form
 */
function compileFunctions(input) {
    // tslint:disable-next-line no-eval
    return eval(compileRaw(input));
}
exports.compileFunctions = compileFunctions;
/**
 * Compiles the given program to an IIFE that will return the exports object
 * @param input A LootML program in string form
 */
function compileRaw(input) {
    const lexer = new Lexer_1.default(input);
    const parser = new Parser_1.default(lexer.analyze());
    const compiler = new Compiler_1.default(parser.parse());
    return compiler.compile();
}
exports.compileRaw = compileRaw;
