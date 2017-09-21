/// <reference types="node" />
/// <reference types="jest" />

import * as fs from 'fs';
import { TOKEN_TYPE } from '../constants';
import Lexer from '../Lexer';
import minify from '../minify';
import Parser from '../Parser';
import Token from '../Token';

/** Filters out token properties that can change during minification */
const filterLocationsAndIdentifiers = (tokens: Token[]) => {
    const aliases: string[] = [];

    for (const t of tokens) {
        delete t.location;

        if (t.type === TOKEN_TYPE.ALIAS) {
            aliases.push(t.value);
            delete t.value;
        } else if (t.type === TOKEN_TYPE.IDENTIFIER && aliases.indexOf(t.value) !== -1) {
            delete t.value;
        }
    }
};

/** Run non-parsing tests on a program */
const testProgram = (name: string, program: string) => {
    it(name + ' should tokenize the same as its minified counterpart (except locations and alias names)', () => {
        const rawTokens = new Lexer(program).analyze();
        const minTokens = new Lexer(minify(program, true)).analyze();

        filterLocationsAndIdentifiers(rawTokens);
        filterLocationsAndIdentifiers(minTokens);

        expect(rawTokens).toEqual(minTokens);
    });

    it(name + ' should not change with additional minification', () => {
        const mini = minify(program, true);

        expect(mini).toBe(minify(mini, true));
    });
};

describe('Toy programs', () => {
    const toyPrograms = [
        `
            $exportA ident
            @aliasA ident
            0 0 asdf 'string' 0x123
        `
    ];

    for (let i = 0; i < toyPrograms.length; i++) {
        testProgram('Toy #' + i, toyPrograms[i]);
    }
});

describe('Examples', () => {
    const exampleDir = __dirname + '/../../examples';
    const exampleNames = fs.readdirSync(exampleDir).filter(file => /\.loot$/.test(file));
    const exampleData: string[] = [];

    for (const name of exampleNames) {
        const program = fs.readFileSync(exampleDir + '/' + name, 'utf8');
        testProgram(name, program);
    }
});
