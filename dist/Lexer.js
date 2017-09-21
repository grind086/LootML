"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const Token_1 = require("./Token");
/**
 * Converts some given input to tokens
 */
class Lexer {
    constructor(input) {
        this._index = 0;
        this._line = 1;
        this._column = 1;
        this.input = input;
        this.output = [];
    }
    /**
     * Analyzes the input and produces an array of tokens
     */
    analyze() {
        this.skipWhitespace();
        while (!this.isEOF()) {
            const token = this.nextToken();
            if (token !== null && token.type !== constants_1.TOKEN_TYPE.COMMENT) {
                this.addToken(token);
            }
            this.skipWhitespace();
        }
        return this.output;
    }
    /**
     * Reads the next token
     */
    nextToken() {
        const ch = this.peekChar();
        if ('/' === ch) {
            const ch2 = this.peekChar(1);
            if ('/' === ch2) {
                return this.readCommentLine();
            }
            else if ('*' === ch2) {
                return this.readCommentBlock();
            }
        }
        if (/[0-9]/.test(ch)) {
            return this.readNumberLiteral();
        }
        if (/['"]/.test(ch)) {
            return this.readStringLiteral();
        }
        if (/[$@a-zA-Z_]/.test(ch)) {
            return this.readIdentifier();
        }
        switch (ch) {
            case ',':
                return this.readCharacter(constants_1.TOKEN_TYPE.COMMA);
            case '[':
                return this.readCharacter(constants_1.TOKEN_TYPE.LEFT_BRACKET);
            case ']':
                return this.readCharacter(constants_1.TOKEN_TYPE.RIGHT_BRACKET);
            case '{':
                return this.readCharacter(constants_1.TOKEN_TYPE.LEFT_BRACE);
            case '}':
                return this.readCharacter(constants_1.TOKEN_TYPE.RIGHT_BRACE);
            case '-':
                return this.readCharacter(constants_1.TOKEN_TYPE.HYPHEN);
        }
        const location = this.getLocation();
        return new Token_1.default(constants_1.TOKEN_TYPE.ERROR, `Unexpected character ${this.readChar()}`, location);
    }
    /**
     * Tokenizes a single-line comment
     */
    readCommentLine() {
        const location = this.getLocation();
        this.readChar(); // => '/'
        this.readChar(); // => '/'
        let value = '';
        while (!this.isEOF() && !this.isNewline(this.peekChar())) {
            value += this.readChar();
        }
        return new Token_1.default(constants_1.TOKEN_TYPE.COMMENT, value, location);
    }
    /**
     * Tokenizes a comment block
     */
    readCommentBlock() {
        const location = this.getLocation();
        this.readChar(); // => '/'
        this.readChar(); // => '*'
        let value = '';
        while (true) {
            if (this.isEOF()) {
                return new Token_1.default(constants_1.TOKEN_TYPE.ERROR, 'Unterminated comment block', location);
            }
            if (this.peekChar() === '*' && this.peekChar(1) === '/') {
                this.readChar(); // => '*'
                this.readChar(); // => '/'
                break;
            }
            value += this.readChar();
        }
        return new Token_1.default(constants_1.TOKEN_TYPE.COMMENT, value, location);
    }
    /**
     * Tokenizes a number literal
     */
    readNumberLiteral() {
        const location = this.getLocation();
        let value = '';
        // Check for an integer format
        if (this.peekChar() === '0' && /[a-z]/.test(this.peekChar(1))) {
            value += this.readChar();
            value += this.readChar();
        }
        while (/[0-9]/.test(this.peekChar())) {
            value += this.readChar();
        }
        return new Token_1.default(constants_1.TOKEN_TYPE.NUMBER, value, location);
    }
    /**
     * Tokenizes a string literal
     */
    readStringLiteral() {
        const location = this.getLocation();
        const delimiter = this.readChar();
        let value = '';
        while (true) {
            const ch = this.peekChar();
            if (this.isEOF() || this.isNewline(ch)) {
                return new Token_1.default(constants_1.TOKEN_TYPE.ERROR, 'Unterminated string literal', location);
            }
            if (ch === delimiter) {
                this.readChar();
                break;
            }
            value += this.readChar();
        }
        return new Token_1.default(constants_1.TOKEN_TYPE.STRING, value, location);
    }
    /**
     * Tokenizes an identifier or alias
     */
    readIdentifier() {
        const location = this.getLocation();
        let value = '';
        let type = constants_1.TOKEN_TYPE.IDENTIFIER;
        if (this.peekChar() === '@') {
            type = constants_1.TOKEN_TYPE.ALIAS;
            this.readChar(); // => '@'
        }
        if (this.peekChar() === '$') {
            type = constants_1.TOKEN_TYPE.EXPORT;
            this.readChar(); // => '$'
        }
        while (!this.isEOF() && /[a-zA-Z_]/.test(this.peekChar())) {
            value += this.readChar();
        }
        return new Token_1.default(type, value, location);
    }
    /**
     * Tokenizes a single character
     * @param type The token type
     */
    readCharacter(type) {
        const location = this.getLocation();
        const ch = this.readChar();
        return new Token_1.default(type, ch, location);
    }
    /**
     * Returns an object with the current file location
     */
    getLocation() {
        return { line: this._line, column: this._column };
    }
    /**
     * Reads through continuous whitespace
     */
    skipWhitespace() {
        while (!this.isEOF() && this.isWhitespace(this.peekChar())) {
            this.readChar();
        }
    }
    /**
     * Checks if the given character is whitespace
     */
    isWhitespace(ch) {
        return ch === ' ' || ch === '\n' || ch === '\t';
    }
    /**
     * Checks if the given characters is a newline
     */
    isNewline(ch) {
        return ch === '\n';
    }
    /**
     * Checks if we are at the end of the input
     */
    isEOF() {
        return this._index >= this.input.length;
    }
    /**
     * Adds a token to the output
     */
    addToken(token) {
        this.output.push(token);
    }
    /**
     * Returns an input character without changing the read index
     * @param offset Offset from the current read index
     */
    peekChar(offset) {
        return this.input[this._index + (offset || 0)];
    }
    /**
     * Reads a single character from the input
     */
    readChar() {
        const ch = this.input[this._index++];
        if (this.isNewline(ch)) {
            this._line++;
            this._column = 1;
        }
        else {
            this._column++;
        }
        return ch;
    }
}
exports.default = Lexer;
