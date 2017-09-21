"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const AliasObject_1 = require("./parserObjects/AliasObject");
const ItemObject_1 = require("./parserObjects/ItemObject");
const SelectorObject_1 = require("./parserObjects/SelectorObject");
const allOf_1 = require("./selectors/allOf");
const oneOf_1 = require("./selectors/oneOf");
const repeat_1 = require("./selectors/repeat");
const someOf_1 = require("./selectors/someOf");
/**
 * Converts a list of tokens to parser objects
 */
class Parser {
    constructor(tokens, selectors) {
        this._index = 0;
        this._aliases = {};
        this._aliasObjects = {};
        this._exports = {};
        this.tokens = tokens;
        this.selectors = {};
        this.output = {};
        this.addSelector(allOf_1.default);
        this.addSelector(oneOf_1.default);
        this.addSelector(repeat_1.default);
        this.addSelector(someOf_1.default);
        if (selectors) {
            selectors.forEach(s => this.addSelector(s));
        }
    }
    /**
     * Parses all input tokens
     */
    parse() {
        while (this.hasNext()) {
            this.parseTable();
        }
        if (Object.keys(this._exports).length === 0) {
            this.syntaxError(`A LootML file must have at least one export`, null);
        }
        this.output = this._exports;
        return this.output;
    }
    /**
     * Parses a top level identifier with an optional alias
     */
    parseTable() {
        // Parse modifiers
        let alias = null;
        let exp = null;
        alias = this.matchToken(constants_1.TOKEN_TYPE.ALIAS, true);
        exp = this.matchToken(constants_1.TOKEN_TYPE.EXPORT, true);
        if (alias === null) {
            alias = this.matchToken(constants_1.TOKEN_TYPE.ALIAS, true);
        }
        // Parse the table identifier
        const identifier = this.parseIdentifier();
        // Add an alias if one is defined
        if (alias) {
            if (this.hasSelector(alias.value)) {
                this.syntaxError(`Alias '${alias.value}' has the same name as a selector`, alias.location);
            }
            if (this.hasExport(alias.value)) {
                this.syntaxError(`Alias '${alias.value}' has the same name as an export`, alias.location);
            }
            if (this.hasAlias(alias.value)) {
                this.syntaxError(`Duplicate alias ${alias.value}`, alias.location);
            }
            this.addAlias(alias.value, identifier);
        }
        // Add an export if one is defined
        if (exp) {
            if (this.hasSelector(exp.value)) {
                this.syntaxError(`Export '${exp.value}' has the same name as a selector`, exp.location);
            }
            if (this.hasAlias(exp.value)) {
                this.syntaxError(`Export '${exp.value}' has the same name as an alias`, exp.location);
            }
            if (this.hasExport(exp.value)) {
                this.syntaxError(`Duplicate export ${exp.value}`, exp.location);
            }
            this.addExport(exp.value, identifier);
        }
    }
    /**
     * Parses a list of arguments
     */
    parseArgumentList() {
        return this.parseList(constants_1.TOKEN_TYPE.LEFT_BRACKET, constants_1.TOKEN_TYPE.RIGHT_BRACKET, () => this.parseArgument());
    }
    /**
     * Parses a list of weighted identifiers
     */
    parseIdentifierList() {
        return this.parseList(constants_1.TOKEN_TYPE.LEFT_BRACE, constants_1.TOKEN_TYPE.RIGHT_BRACE, () => this.parseWeightedIdentifier());
    }
    /**
     * Parses a list of tokens delimited by `TOKEN_TYPE.COMMA`
     * @param open The list open token
     * @param close The list close token
     * @param get A function that will parse and return the next list item
     */
    parseList(open, close, get) {
        const list = [];
        this.expectToken(open, true);
        if (!this.matchToken(close)) {
            list.push(get());
            while (this.hasNext() && !this.matchToken(close)) {
                this.expectToken(constants_1.TOKEN_TYPE.COMMA, true);
                list.push(get());
            }
        }
        this.expectToken(close, true);
        return list;
    }
    /**
     * Parses a single argument. Can be number, amount, or string.
     */
    parseArgument() {
        const peek = this.peekToken();
        switch (peek.type) {
            case constants_1.TOKEN_TYPE.NUMBER:
                return this.parseAmount();
            case constants_1.TOKEN_TYPE.STRING:
                return this.parseString();
            default:
                this.syntaxError(`Expected argument but got '${constants_1.TOKEN_TYPE[peek.type].toLowerCase()}'`, peek.location);
        }
        // This is unreachable, so return `null` but keep it out of the inferred types
        return null;
    }
    /**
     * Parses an optional number, followed by an identifer
     */
    parseWeightedIdentifier() {
        const weight = this.matchToken(constants_1.TOKEN_TYPE.NUMBER) ? this.parseNumber() : 1;
        const identifier = this.parseIdentifier();
        return { weight, identifier };
    }
    /**
     * Parses an identifier
     */
    parseIdentifier() {
        const token = this.expectToken(constants_1.TOKEN_TYPE.IDENTIFIER, false);
        if (token.value === 'item') {
            return this.parseItem();
        }
        else if (this.hasSelector(token.value)) {
            return this.parseSelector();
        }
        else if (this.hasAlias(token.value)) {
            return this.parseAlias();
        }
        else {
            this.syntaxError(`Uknown identifier '${token.value}'`, token.location);
        }
        // This is unreachable, so return `null` but keep it out of the inferred types
        return null;
    }
    /**
     * Parses an alias
     */
    parseAlias() {
        const token = this.expectToken(constants_1.TOKEN_TYPE.IDENTIFIER, true);
        const alias = this.getAlias(token.value);
        if (alias === null) {
            this.syntaxError(`Unknown alias '${token.value}'`, token.location);
        }
        if (!this._aliasObjects.hasOwnProperty(token.value)) {
            this._aliasObjects[token.value] = new AliasObject_1.default(token.value, alias, token.location);
        }
        return this._aliasObjects[token.value];
    }
    /**
     * Parses a selector
     */
    parseSelector() {
        const token = this.expectToken(constants_1.TOKEN_TYPE.IDENTIFIER, true);
        const selector = this.getSelector(token.value);
        if (selector === null) {
            this.syntaxError(`Unknown selector '${token.value}'`, token.location);
        }
        const args = this.matchToken(constants_1.TOKEN_TYPE.LEFT_BRACKET) ? this.parseArgumentList() : [];
        const list = this.parseIdentifierList();
        return new SelectorObject_1.default(selector, args, list, token.location);
    }
    /**
     * Parses an item
     */
    parseItem() {
        const token = this.expectToken(constants_1.TOKEN_TYPE.IDENTIFIER, true, 'item');
        this.expectToken(constants_1.TOKEN_TYPE.LEFT_BRACKET, true);
        const type = this.parseString();
        const amount = this.matchToken(constants_1.TOKEN_TYPE.COMMA, true) ? this.parseAmount() : 1;
        this.expectToken(constants_1.TOKEN_TYPE.RIGHT_BRACKET, true);
        return new ItemObject_1.default(type, amount, token.location);
    }
    /**
     * Parses a string
     */
    parseString() {
        return this.expectToken(constants_1.TOKEN_TYPE.STRING, true).value;
    }
    /**
     * Parses an amount
     */
    parseAmount() {
        const n = this.parseNumber();
        if (this.matchToken(constants_1.TOKEN_TYPE.HYPHEN, true)) {
            const m = this.parseNumber();
            if (n !== m) {
                return [Math.min(n, m), Math.max(n, m)];
            }
        }
        return n;
    }
    /**
     * Parses the next token as a number
     */
    parseNumber() {
        const token = this.expectToken(constants_1.TOKEN_TYPE.NUMBER, true);
        const format = token.value.slice(0, 2);
        // Sure, we can support 4 different integer formats
        if (/0[a-z]/.test(format)) {
            const value = token.value.slice(2);
            switch (format) {
                case '0x':
                    return parseInt(value, 16);
                case '0d':
                    return parseInt(value, 10);
                case '0o':
                    return parseInt(value, 8);
                case '0b':
                    return parseInt(value, 2);
                default:
                    this.syntaxError(`Invalid number '${token.value}'`, token.location);
            }
        }
        return parseInt(token.value, 10);
    }
    /**
     * Adds a new selector
     */
    addSelector(selector) {
        const name = selector.identifier;
        if (name === 'item') {
            throw new Error(`'item' is not an allowed selector name`);
        }
        if (!this.hasExport(name) && !this.hasAlias(name) && !this.hasSelector(name)) {
            this.selectors[name] = selector;
        }
        else {
            throw new Error(`Duplicate selector '${name}'`);
        }
    }
    /**
     * Gets the selector with the given id, if it exists
     */
    getSelector(id) {
        return this.hasSelector(id) ? this.selectors[id] : null;
    }
    /**
     * Checks whether the given selector exists
     */
    hasSelector(id) {
        return this.selectors.hasOwnProperty(id);
    }
    /**
     * Adds an alias if an identifier with the same name doesn't already exist
     * @param name
     * @param identifier
     */
    addAlias(name, identifier) {
        if (name === 'item') {
            throw new Error(`'item' is not an allowed alias name`);
        }
        if (!this.hasExport(name) && !this.hasAlias(name) && !this.hasSelector(name)) {
            this._aliases[name] = identifier;
        }
        else {
            throw new Error(`Duplicate identifier '${name}'`);
        }
    }
    /**
     * Gets the given alias if it exists
     */
    getAlias(name) {
        return this.hasAlias(name) ? this._aliases[name] : null;
    }
    /**
     * Checks whether the given alias name exists
     */
    hasAlias(name) {
        return this._aliases.hasOwnProperty(name);
    }
    /**
     * Adds an export if an identifier with the same name doesn't already exist
     * @param name
     * @param identifier
     */
    addExport(name, identifier) {
        if (name === 'item') {
            throw new Error(`'item' is not an allowed alias name`);
        }
        if (!this.hasExport(name) && !this.hasAlias(name) && !this.hasSelector(name)) {
            this._exports[name] = identifier;
        }
        else {
            throw new Error(`Duplicate identifier '${name}'`);
        }
    }
    /**
     * Gets the given export if it exists
     */
    getExport(name) {
        return this.hasExport(name) ? this._exports[name] : null;
    }
    /**
     * Checks whether the given alias name exists
     */
    hasExport(name) {
        return this._exports.hasOwnProperty(name);
    }
    /**
     * Similar to `matchToken`, but throws if there isn't a match.
     * @param type Match token type
     * @param read Whether to read or peek
     * @param value Match token value
     */
    expectToken(type, read, value) {
        const token = this.matchToken(type, read, value);
        if (token === null) {
            const peek = this.peekToken();
            const peekType = constants_1.TOKEN_TYPE[peek.type].toLowerCase();
            if (value !== undefined) {
                if (type === peek.type) {
                    this.syntaxError(`Expected '${value}' but got '${peek.value}'`, peek.location);
                }
                else {
                    this.syntaxError(`Expected '${value}' but got ${peekType}`, peek.location);
                }
            }
            else {
                this.syntaxError(`Unexpected ${peekType} '${peek.value}'`, peek.location);
            }
        }
        return token;
    }
    /**
     * Returns the next token only if it matches the given paramaters.
     * @param type Match token type
     * @param read Whether to read or peek
     * @param value Match token value
     */
    matchToken(type, read, value) {
        const peek = this.peekToken();
        if (peek === undefined || peek.type !== type || (value !== undefined && peek.value !== value)) {
            return null;
        }
        if (read) {
            return this.readToken();
        }
        return peek;
    }
    /**
     * Throws a syntax error
     * @param message Error message
     * @param location Error location
     */
    syntaxError(message, location) {
        if (location) {
            const { line, column } = location;
            throw new SyntaxError(`${message} (at ${line}:${column})`);
        }
        else {
            throw new SyntaxError(message);
        }
    }
    /**
     * Returns false if there are no more tokens to parse
     */
    hasNext() {
        return this._index < this.tokens.length;
    }
    /**
     * Returns a token without changing the read index
     * @param offset Offset from the current read index
     */
    peekToken(offset) {
        return this.tokens[this._index + (offset || 0)];
    }
    /**
     * Reads a single token from the input list
     */
    readToken() {
        return this.tokens[this._index++];
    }
}
exports.default = Parser;
