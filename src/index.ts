import Lexer from './Lexer';
import minify from './minify';
import Parser from './Parser';
import { ItemResult } from './types';

export function compileJS(input: string) {
    const raw = compileRaw(input);
    const props = Object.keys(raw).map(key => `${key}:${raw[key]}`);
    return `module.exports={${props.join(',')}};`;
}

export function compileFunctions(input: string) {
    const raw = compileRaw(input);
    const fns: { [key: string]: () => ItemResult[] } = {};

    Object.keys(raw).forEach(key => {
        // tslint:disable-next-line no-eval
        fns[key] = eval(raw[key]);
    });

    return fns;
}

export function compileRaw(input: string) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer.analyze());
    return parser.parse();
}

export { Lexer, minify, Parser };
