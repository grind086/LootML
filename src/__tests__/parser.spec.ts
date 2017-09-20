/// <reference types="jest" />

import { TOKEN_TYPE } from '../constants';
import Lexer from '../Lexer';
import Parser from '../Parser';

const analyzeProgram = (input: string) => {
    const lexer = new Lexer(input);
    return lexer.analyze();
};

describe('Match', () => {
    const program = `
        oneOf {
            item['foo'],
            item['bar']
        }
    `;

    it('Matches tokens with a given type', () => {
        const parser = new Parser(analyzeProgram(program));

        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.LEFT_BRACE, true)).not.toBe(null);

        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.LEFT_BRACKET, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.STRING, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.RIGHT_BRACKET, true)).not.toBe(null);

        expect(parser.matchToken(TOKEN_TYPE.COMMA, true)).not.toBe(null);

        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.LEFT_BRACKET, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.STRING, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.RIGHT_BRACKET, true)).not.toBe(null);

        expect(parser.matchToken(TOKEN_TYPE.RIGHT_BRACE, true)).not.toBe(null);

        expect(parser.hasNext()).toEqual(false);
    });

    it('Does not match tokens with a different type', () => {
        const parser = new Parser(analyzeProgram(program));

        // expect(parser.matchToken(TOKEN_TYPE.ALIAS, false))
    });

    it('Matches tokens without advancing read index', () => {
        const parser = new Parser(analyzeProgram(program));

        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER, false)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER, false)).not.toBe(null);
    });

    it('Matches tokens while advancing read index', () => {
        const parser = new Parser(analyzeProgram(program));

        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER, true)).toBe(null);
    });

    it('Does not advance the read index when there is no match', () => {
        const parser = new Parser(analyzeProgram(program));

        expect(parser.matchToken(TOKEN_TYPE.COMMA, true)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER, true)).not.toBe(null);
    });

    it('Matches tokens with a specific value', () => {
        //
    });

    it('Does not match tokens with the wrong specific value', () => {
        //
    });
});
