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

    for (const token of lex.output) {
        switch (token.type) {
            case TOKEN_TYPE.COMMENT:
                continue;
            case TOKEN_TYPE.ALIAS:
                aliasMap[token.value] = getNextVarName();
                output += '@' + aliasMap[token.value] + ' ';
                continue;
            case TOKEN_TYPE.STRING:
                output += "'" + token.value + "'";
                continue;
            case TOKEN_TYPE.IDENTIFIER:
                if (aliasMap.hasOwnProperty(token.value)) {
                    output += aliasMap[token.value];
                    continue;
                }
            default:
                output += token.value;
        }
    }

    return output;
}
