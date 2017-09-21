/// <reference types="jest" />

import { TOKEN_TYPE } from '../constants';
import Lexer from '../Lexer';
import Parser from '../Parser';

const analyzeProgram = (input: string) => {
    const lexer = new Lexer(input);
    return lexer.analyze();
};

const simpleProgram = `
$export
@alias
oneOf {
    item['foo', 4-5],
    item['bar']
}
`;

describe('Match', () => {
    it('Matches tokens with a given type', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        expect(parser.matchToken(TOKEN_TYPE.EXPORT, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.ALIAS, true)).not.toBe(null);

        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.LEFT_BRACE, true)).not.toBe(null);

        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.LEFT_BRACKET, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.STRING, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.COMMA, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.NUMBER, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.HYPHEN, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.NUMBER, true)).not.toBe(null);
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
        const parser = new Parser(analyzeProgram(simpleProgram));

        expect(parser.matchToken(TOKEN_TYPE.ALIAS)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.COMMA)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.COMMENT)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.ERROR)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.HYPHEN)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.IDENTIFIER)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.LEFT_BRACE)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.LEFT_BRACKET)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.NUMBER)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.RIGHT_BRACE)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.RIGHT_BRACKET)).toBe(null);

        expect(parser.matchToken(TOKEN_TYPE.EXPORT, true)).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.EXPORT)).toBe(null);
    });

    it('Matches tokens without advancing read index', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));
        const token = parser.matchToken(TOKEN_TYPE.EXPORT, false);

        expect(token).not.toBe(null);
        expect(token).toBe(parser.matchToken(TOKEN_TYPE.EXPORT, false));
    });

    it('Matches tokens while advancing read index', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));
        const token = parser.matchToken(TOKEN_TYPE.EXPORT, true);

        expect(token).not.toBe(null);
        expect(token).not.toBe(parser.matchToken(TOKEN_TYPE.EXPORT, true));
    });

    it('Does not advance the read index when there is no match', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        expect(parser.matchToken(TOKEN_TYPE.COMMA, true)).toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.EXPORT, true)).not.toBe(null);
    });

    it('Matches tokens with a specific value', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        expect(parser.matchToken(TOKEN_TYPE.EXPORT, true, 'export')).not.toBe(null);
        expect(parser.matchToken(TOKEN_TYPE.ALIAS, true, 'alias')).not.toBe(null);
    });

    it('Does not match tokens with the wrong specific value', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        expect(parser.matchToken(TOKEN_TYPE.EXPORT, true, 'other')).toBe(null);
    });
});

describe('Expect', () => {
    it('Expects tokens with a given type', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        expect(() => parser.expectToken(TOKEN_TYPE.EXPORT, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.ALIAS, true)).not.toThrow();

        expect(() => parser.expectToken(TOKEN_TYPE.IDENTIFIER, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.LEFT_BRACE, true)).not.toThrow();

        expect(() => parser.expectToken(TOKEN_TYPE.IDENTIFIER, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.LEFT_BRACKET, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.STRING, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.COMMA, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.NUMBER, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.HYPHEN, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.NUMBER, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.RIGHT_BRACKET, true)).not.toThrow();

        expect(() => parser.expectToken(TOKEN_TYPE.COMMA, true)).not.toThrow();

        expect(() => parser.expectToken(TOKEN_TYPE.IDENTIFIER, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.LEFT_BRACKET, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.STRING, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.RIGHT_BRACKET, true)).not.toThrow();

        expect(() => parser.expectToken(TOKEN_TYPE.RIGHT_BRACE, true)).not.toThrow();

        expect(parser.hasNext()).toEqual(false);
    });

    it('Throws when the token is the wrong type', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        expect(() => parser.expectToken(TOKEN_TYPE.ALIAS)).toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.COMMA)).toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.COMMENT)).toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.ERROR)).toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.HYPHEN)).toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.IDENTIFIER)).toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.LEFT_BRACE)).toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.LEFT_BRACKET)).toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.NUMBER)).toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.RIGHT_BRACE)).toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.RIGHT_BRACKET)).toThrow();

        expect(() => parser.expectToken(TOKEN_TYPE.EXPORT, true)).not.toThrow();
        expect(() => parser.expectToken(TOKEN_TYPE.EXPORT)).toThrow();
    });

    it('Throws when the token has the wrong specific value', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        expect(() => parser.expectToken(TOKEN_TYPE.EXPORT, true, 'other')).toThrow();
    });
});

describe('Set, test, and retrieve objects', () => {
    const fakeObject = { type: 0, compiled: '', location: { line: 0, column: 0 } };
    const fakeSelector = {
        identifier: 'foo',
        numArgs: 0,
        returns: 0,

        compile() {
            return '';
        }
    };

    it('Should be able to set and retrieve aliases', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        parser.addAlias('foo', fakeObject);

        expect(parser.hasAlias('foo')).toBe(true);
        expect(parser.getAlias('foo')).toBe(fakeObject);
    });

    it('Should be able to set and retrieve exports', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        parser.addExport('foo', fakeObject);

        expect(parser.hasExport('foo')).toBe(true);
        expect(parser.getExport('foo')).toBe(fakeObject);
    });

    it('Should be able to set and retrieve selectors', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        parser.addSelector(fakeSelector);

        expect(parser.hasSelector('foo')).toBe(true);
        expect(parser.getSelector('foo')).toBe(fakeSelector);
    });

    it('Should not allow aliases, exports, or selectors named "item"', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));
        const fakeIllegalSelector = {
            ...fakeSelector,
            identifier: 'item'
        };

        expect(() => parser.addAlias('item', fakeObject)).toThrow(/not an allowed/i);
        expect(() => parser.addExport('item', fakeObject)).toThrow(/not an allowed/i);
        expect(() => parser.addSelector(fakeIllegalSelector)).toThrow(/not an allowed/i);
    });

    it('Should not allow aliases, exports, or selectors with duplicate names', () => {
        const parser = new Parser(analyzeProgram(simpleProgram));

        parser.addAlias('foo', fakeObject);

        expect(() => parser.addAlias('foo', fakeObject)).toThrow(/duplicate/i);
        expect(() => parser.addExport('foo', fakeObject)).toThrow(/duplicate/i);

        expect(fakeSelector.identifier).toBe('foo'); // Make sure we're actually testing it
        expect(() => parser.addSelector(fakeSelector)).toThrow(/duplicate/i);
    });
});

describe('Parse basic types', () => {
    it('Should parse all number formats', () => {
        const numberProgram = ['1234', '0x1234', '0d1234', '0o1234', '0b10101', '0l1234'].join('\n');
        const parser = new Parser(analyzeProgram(numberProgram));

        expect(parser.parseNumber()).toBe(parseInt('1234', 10));
        expect(parser.parseNumber()).toBe(parseInt('1234', 16));
        expect(parser.parseNumber()).toBe(parseInt('1234', 10));
        expect(parser.parseNumber()).toBe(parseInt('1234', 8));
        expect(parser.parseNumber()).toBe(parseInt('10101', 2));
        expect(() => parser.parseNumber()).toThrow(/invalid number/i);
    });

    it('Should parse amounts with the lowest value first', () => {
        const numberProgram = ['1-3', '3-1'].join('\n');
        const parser = new Parser(analyzeProgram(numberProgram));

        expect(parser.parseAmount()).toEqual([1, 3]);
        expect(parser.parseAmount()).toEqual([1, 3]);
    });

    it('Should parse strings', () => {
        const stringProgram = ['"abc"', "'123'"].join('\n');
        const parser = new Parser(analyzeProgram(stringProgram));

        expect(parser.parseString()).toBe('abc');
        expect(parser.parseString()).toBe('123');
    });
});
