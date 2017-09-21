import Compiler from './Compiler';
import Lexer from './Lexer';
import minify from './minify';
import Parser from './Parser';
import { ItemResult } from './types';

/**
 * Compiles the given program to a commonJS module
 * @param input A LootML program in string form
 */
export function compileCommonJS(input: string): string {
    return `module.exports=${compileIIFE(input)}`;
}

/**
 * Compiles the given program to an object of executable functions (USES EVAL)
 * @param input A LootML program in string form
 */
export function compileFunctions(input: string): { [names: string]: () => ItemResult | ItemResult[] } {
    // tslint:disable-next-line no-eval
    return eval(compileIIFE(input));
}

/**
 * Compiles the given program to an IIFE that will return the exports object
 * @param input A LootML program in string form
 */
export function compileIIFE(input: string): string {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer.analyze());
    const compiler = new Compiler(parser.parse());

    return compiler.compile();
}

export { Compiler, Lexer, minify, Parser };
