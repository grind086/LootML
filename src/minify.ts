import { TOKEN_TYPE } from './constants';
import Lexer from './Lexer';
import Parser from './Parser';
import Token from './Token';
import varNameGenerator from './varNameGenerator';

export default function minify(input: string, skipParsing?: boolean) {
    const tokens = new Lexer(input).analyze();
    const aliasMap: { [name: string]: string } = {};
    const getNextVarName = varNameGenerator();

    // Check for errors by just going ahead and parsing it
    if (!skipParsing) {
        const parser = new Parser(tokens);
        parser.parse();
    }

    // Then write it back out from the tokens
    let output = '';
    let last: Token = { type: null, value: null } as any;

    for (const token of tokens) {
        switch (token.type) {
            case TOKEN_TYPE.COMMENT:
                break;
            case TOKEN_TYPE.ALIAS:
                aliasMap[token.value] = getNextVarName();
                output += '@' + aliasMap[token.value];
                break;
            case TOKEN_TYPE.EXPORT:
                output += '$' + token.value;
                break;
            case TOKEN_TYPE.STRING:
                output += "'" + token.value + "'";
                break;
            case TOKEN_TYPE.IDENTIFIER:
                if (
                    last.type === TOKEN_TYPE.ALIAS ||
                    last.type === TOKEN_TYPE.EXPORT ||
                    (last.type === TOKEN_TYPE.NUMBER && last.value === '0')
                ) {
                    output += ' ';
                }

                output += aliasMap.hasOwnProperty(token.value) ? aliasMap[token.value] : token.value;
                break;
            case TOKEN_TYPE.NUMBER:
                if (last.type === TOKEN_TYPE.NUMBER) {
                    output += ' ';
                }

                output += token.value;
                break;
            default:
                output += token.value;
        }

        last = token;
    }

    return output;
}
