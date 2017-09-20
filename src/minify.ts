import { TOKEN_TYPE } from './constants';
import Lexer from './Lexer';
import Parser from './Parser';

export default function minify(input: string) {
    const lex = new Lexer(input);

    // Check for errors by just going ahead and parsing it
    const parser = new Parser(lex.analyze());
    parser.parse();

    // Map aliases to short names
    const aliasMap: { [name: string]: string } = {};
    let varCount = 0;

    const getNextVarName = () => {
        let str = '';
        let d = ++varCount;
        let m;

        while (d > 0) {
            m = (d - 1) % 26;
            str = String.fromCharCode(97 + m) + str;
            d = Math.floor((d - m) / 26);
        }

        return str;
    };

    // Then write it back out from the tokens
    let output = '';
    let lastConflictsWithIdentifier = false;

    for (const token of lex.output) {
        switch (token.type) {
            case TOKEN_TYPE.COMMENT:
                break;
            case TOKEN_TYPE.ALIAS:
                aliasMap[token.value] = getNextVarName();
                output += '@' + aliasMap[token.value];
                lastConflictsWithIdentifier = true;
                break;
            case TOKEN_TYPE.EXPORT:
                output += '$' + token.value;
                lastConflictsWithIdentifier = true;
                break;
            case TOKEN_TYPE.STRING:
                output += "'" + token.value + "'";
                lastConflictsWithIdentifier = false;
                break;
            case TOKEN_TYPE.IDENTIFIER:
                if (lastConflictsWithIdentifier) {
                    output += ' ';
                }

                output += aliasMap.hasOwnProperty(token.value) ? aliasMap[token.value] : token.value;
                lastConflictsWithIdentifier = true;
                break;
            case TOKEN_TYPE.NUMBER:
                output += token.value;
                lastConflictsWithIdentifier = token.value === '0';
                break;
            default:
                output += token.value;
                lastConflictsWithIdentifier = false;
        }
    }

    return output;
}
