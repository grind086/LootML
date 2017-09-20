/// <reference types="jest" />

import { TOKEN_TYPE } from '../constants';
import Lexer from '../Lexer';

it('Ignores whitespace characters', () => {
    const tab = String.fromCharCode(9);
    const space = ' ';
    const newline = '\n';

    const lexer = new Lexer(tab + space + newline);
    const result = lexer.analyze();

    expect(result.length).toEqual(0);
});

describe('Comments', () => {
    it('Ignores single-line comments', () => {
        const lexer = new Lexer(`123 // This is a comment 456\n789`);
        const result = lexer.analyze();

        expect(result.length).toEqual(2);

        expect(result[0].type).toEqual(TOKEN_TYPE.NUMBER);
        expect(result[0].value).toEqual('123');

        expect(result[1].type).toEqual(TOKEN_TYPE.NUMBER);
        expect(result[1].value).toEqual('789');
    });

    it('Ignores block comments', () => {
        const lexer = new Lexer(`1 /* 'foo' */ 2`);
        const result = lexer.analyze();

        expect(result.length).toEqual(2);

        expect(result[0].type).toEqual(TOKEN_TYPE.NUMBER);
        expect(result[0].value).toEqual('1');

        expect(result[1].type).toEqual(TOKEN_TYPE.NUMBER);
        expect(result[1].value).toEqual('2');
    });
});

describe('Literals', () => {
    it('Reads string literals using either single (\') or double (") quotes', () => {
        const lexer = new Lexer(`"this is a double-quoted string - '" 'this is a single-quoted string - "'`);
        const result = lexer.analyze();

        expect(result.length).toEqual(2);

        expect(result[0].type).toEqual(TOKEN_TYPE.STRING);
        expect(result[0].value).toEqual("this is a double-quoted string - '");

        expect(result[1].type).toEqual(TOKEN_TYPE.STRING);
        expect(result[1].value).toEqual('this is a single-quoted string - "');
    });

    it('Reads number literals', () => {
        const lexer = new Lexer('1234 5678');
        const result = lexer.analyze();

        expect(result.length).toEqual(2);

        expect(result[0].type).toEqual(TOKEN_TYPE.NUMBER);
        expect(result[0].value).toEqual('1234');

        expect(result[1].type).toEqual(TOKEN_TYPE.NUMBER);
        expect(result[1].value).toEqual('5678');
    });

    it("Produces an error on unterminated string literal (')", () => {
        const lexer = new Lexer("'");
        const result = lexer.analyze();

        expect(result.length).toEqual(1);
        expect(result[0].type).toEqual(TOKEN_TYPE.ERROR);
    });

    it('Produces an error on unterminated string literal (")', () => {
        const lexer = new Lexer('"');
        const result = lexer.analyze();

        expect(result.length).toEqual(1);
        expect(result[0].type).toEqual(TOKEN_TYPE.ERROR);
    });
});

it('Reads each single-character token', () => {
    const lexer = new Lexer(',[]{}-');
    const result = lexer.analyze();

    expect(result.length).toEqual(6);

    expect(result[0].type).toEqual(TOKEN_TYPE.COMMA);
    expect(result[1].type).toEqual(TOKEN_TYPE.LEFT_BRACKET);
    expect(result[2].type).toEqual(TOKEN_TYPE.RIGHT_BRACKET);
    expect(result[3].type).toEqual(TOKEN_TYPE.LEFT_BRACE);
    expect(result[4].type).toEqual(TOKEN_TYPE.RIGHT_BRACE);
    expect(result[5].type).toEqual(TOKEN_TYPE.HYPHEN);
});

it('Reports the location of tokens', () => {
    const lines: string[] = [];
    lines.push(',');
    lines.push('   ,');
    lines.push(' ,');

    const lexer = new Lexer(lines.join('\n'));
    const result = lexer.analyze();

    expect(result.length).toEqual(3);

    for (let i = 0; i < lines.length; i++) {
        expect(result[i].location.line).toEqual(i + 1);
        expect(result[i].location.column).toEqual(lines[i].indexOf(',') + 1);
    }
});
