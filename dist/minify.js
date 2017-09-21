"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const Lexer_1 = require("./Lexer");
const Parser_1 = require("./Parser");
const varNameGenerator_1 = require("./varNameGenerator");
function minify(input, skipParsing) {
    const tokens = new Lexer_1.default(input).analyze();
    const aliasMap = {};
    const getNextVarName = varNameGenerator_1.default();
    // Check for errors by just going ahead and parsing it
    if (!skipParsing) {
        const parser = new Parser_1.default(tokens);
        parser.parse();
    }
    // Then write it back out from the tokens
    let output = '';
    let last = { type: null, value: null };
    for (const token of tokens) {
        switch (token.type) {
            case constants_1.TOKEN_TYPE.COMMENT:
                break;
            case constants_1.TOKEN_TYPE.ALIAS:
                aliasMap[token.value] = getNextVarName();
                output += '@' + aliasMap[token.value];
                break;
            case constants_1.TOKEN_TYPE.EXPORT:
                output += '$' + token.value;
                break;
            case constants_1.TOKEN_TYPE.STRING:
                output += "'" + token.value + "'";
                break;
            case constants_1.TOKEN_TYPE.IDENTIFIER:
                if (last.type === constants_1.TOKEN_TYPE.ALIAS ||
                    last.type === constants_1.TOKEN_TYPE.EXPORT ||
                    (last.type === constants_1.TOKEN_TYPE.NUMBER && last.value === '0')) {
                    output += ' ';
                }
                output += aliasMap.hasOwnProperty(token.value) ? aliasMap[token.value] : token.value;
                break;
            case constants_1.TOKEN_TYPE.NUMBER:
                if (last.type === constants_1.TOKEN_TYPE.NUMBER) {
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
exports.default = minify;
