import { TOKEN_TYPE } from './constants';
import Token from './Token';
import {
    Arguments,
    Identifier,
    IdentifierObject,
    Item,
    Selector,
    SelectorObject
} from './types';

import OneOfSelector from './selectors/oneOf';

/**
 * Converts a list of tokens to javascript
 */
class Parser {
    public tokens: Token[];
    public selectors: { [id: string]: Selector };

    private _index: number;
    private _aliases: { [name: string]: Identifier };

    constructor(tokens: Token[], selectors?: Selector[]) {
        this.tokens = tokens;
        this.selectors = {};

        if (selectors) {
            selectors.forEach(s => this.addSelector(s));
        }

        this.addSelector(OneOfSelector);

        this._index = 0;
        this._aliases = {};
    }

    /**
     * Parses all input tokens
     */
    public parse() {
        while (this.hasNext()) {
            this.parseTable();
        }
    }

    /**
     * Parses a top level identifier with an optional alias
     */
    public parseTable() {
        const alias = this.matchToken(TOKEN_TYPE.ALIAS, true);
        const identifier = this.parseIdentifier();

        if (alias) {
            if (this.hasSelector(alias.value)) {
                this.syntaxError(
                    `Alias "${alias.value}" has the same name as a selector`,
                    alias.location
                );
            }

            if (this.hasAlias(alias.value)) {
                this.syntaxError(
                    `Duplicate alias ${alias.value}`,
                    alias.location
                );
            }

            this.addAlias(alias.value, identifier);
        }

        console.log(
            JSON.stringify(
                { alias: (alias || {}).value, identifier },
                undefined,
                2
            )
        );
    }

    /**
     * Parses a list of arguments
     */
    public parseArgumentList(): Arguments[] {
        return this.parseList(
            TOKEN_TYPE.LEFT_BRACKET,
            TOKEN_TYPE.RIGHT_BRACKET,
            () => this.parseArgument()
        );
    }

    /**
     * Parses a list of weighted identifiers
     */
    public parseIdentifierList(): Identifier[] {
        return this.parseList(
            TOKEN_TYPE.LEFT_BRACE,
            TOKEN_TYPE.RIGHT_BRACE,
            () => this.parseWeightedIdentifier()
        );
    }

    /**
     * Parses a list of tokens delimited by `TOKEN_TYPE.COMMA`
     * @param open The list open token
     * @param close The list close token
     * @param get A function that will parse and return the next list item
     */
    public parseList(open: TOKEN_TYPE, close: TOKEN_TYPE, get: () => any) {
        const list: any[] = [];

        this.expectToken(open, true);

        if (!this.matchToken(close)) {
            list.push(get());

            while (this.hasNext() && !this.matchToken(close)) {
                this.expectToken(TOKEN_TYPE.COMMA, true);
                list.push(get());
            }
        }

        this.expectToken(close, true);

        return list;
    }

    /**
     * Parses a single argument. Can be number, amount, string, or identifier
     */
    public parseArgument() {
        const peek = this.peekToken();

        switch (peek.type) {
            case TOKEN_TYPE.NUMBER:
                return this.parseAmount();
            case TOKEN_TYPE.STRING:
                return this.parseString();
            case TOKEN_TYPE.IDENTIFIER:
                return this.parseIdentifier();
            default:
                this.syntaxError(
                    `Expected argument but got '${TOKEN_TYPE[
                        peek.type
                    ].toLowerCase()}'`,
                    peek.location
                );
        }

        // This is unreachable, so return `null` but keep it out of the inferred types
        return (null as any) as string;
    }

    /**
     * Parses an optional number, followed by an identifer
     */
    public parseWeightedIdentifier(): IdentifierObject {
        const weight = this.matchToken(TOKEN_TYPE.NUMBER)
            ? this.parseNumber()
            : 1;

        const identifier = this.parseIdentifier();

        return { weight, identifier };
    }

    /**
     * Parses an identifier
     */
    public parseIdentifier() {
        const token = this.expectToken(TOKEN_TYPE.IDENTIFIER, false);

        if (token.value === 'item') {
            return this.parseItem();
        } else if (this.hasSelector(token.value)) {
            return this.parseSelector();
        } else if (this.hasAlias(token.value)) {
            return this.parseAlias();
        } else {
            this.syntaxError(
                `Uknown identifier '${token.value}'`,
                token.location
            );
        }

        return (null as any) as Identifier;
    }

    /**
     * Parses an alias
     */
    public parseAlias(): Identifier {
        const token = this.expectToken(TOKEN_TYPE.IDENTIFIER, true);
        const alias = this.getAlias(token.value);

        if (alias === null) {
            this.syntaxError(`Unknown alias '${token.value}'`, token.location);
        }

        return alias!;
    }

    /**
     * Parses a selector
     */
    public parseSelector(): SelectorObject {
        const token = this.expectToken(TOKEN_TYPE.IDENTIFIER, true);
        const selector = this.getSelector(token.value);

        if (selector === null) {
            this.syntaxError(
                `Unknown selector '${token.value}'`,
                token.location
            );
        }

        const args = this.matchToken(TOKEN_TYPE.LEFT_BRACKET)
            ? this.parseArgumentList()
            : [];

        const list = this.parseIdentifierList();

        return { selector: selector!, args, list };
    }

    /**
     * Parses an item
     */
    public parseItem(): Item {
        this.expectToken(TOKEN_TYPE.IDENTIFIER, true, 'item');
        this.expectToken(TOKEN_TYPE.LEFT_BRACKET, true);

        const type = this.expectToken(TOKEN_TYPE.STRING, true).value;
        const amount = this.matchToken(TOKEN_TYPE.COMMA, true)
            ? this.parseAmount()
            : 1;

        this.expectToken(TOKEN_TYPE.RIGHT_BRACKET, true);

        return { type, amount };
    }

    /**
     * Parses a string
     */
    public parseString() {
        return this.expectToken(TOKEN_TYPE.STRING, true).value;
    }

    /**
     * Parses an amount
     */
    public parseAmount() {
        const n = this.parseNumber();

        if (this.matchToken(TOKEN_TYPE.HYPHEN, true)) {
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
    public parseNumber() {
        const token = this.expectToken(TOKEN_TYPE.NUMBER, true);
        const format = token.value.slice(0, 2);

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
                    this.syntaxError(
                        `Invalid number "${token.value}"`,
                        token.location
                    );
            }
        }

        return parseInt(token.value, 10);
    }

    /**
     * Adds a new selector
     */
    public addSelector(selector: Selector) {
        if (!this.hasSelector(selector.identifier)) {
            this.selectors[selector.identifier] = selector;
        } else {
            throw new Error(`Duplicate selector '${name}'`);
        }
    }

    /**
     * Gets the selector with the given id, if it exists
     */
    public getSelector(id: string) {
        return this.hasSelector(id) ? this.selectors[id] : null;
    }

    /**
     * Checks whether the given selector exists
     */
    public hasSelector(id: string) {
        return this.selectors.hasOwnProperty(id);
    }

    /**
     * Adds an alias if an identifier with the same name doesn't already exist
     * @param name
     * @param identifier
     */
    public addAlias(name: string, identifier: Identifier) {
        if (!this.hasAlias(name)) {
            this._aliases[name] = identifier;
        } else {
            throw new Error(`Duplicate identifier '${name}'`);
        }
    }

    /**
     * Gets the given alias if it exists
     */
    public getAlias(name: string) {
        return this.hasAlias(name) ? this._aliases[name] : null;
    }

    /**
     * Checks whether the given alias name exists
     */
    public hasAlias(name: string) {
        return this._aliases.hasOwnProperty(name);
    }

    /**
     * Similar to `matchToken`, but throws if there isn't a match.
     * @param type Match token type
     * @param read Whether to read or peek
     * @param value Match token value
     */
    public expectToken(
        type: TOKEN_TYPE,
        read: boolean,
        value?: string | number
    ) {
        const token = this.matchToken(type, read, value);

        if (token === null) {
            const peek = this.peekToken();
            const peekType = TOKEN_TYPE[peek.type].toLowerCase();

            if (value !== undefined) {
                if (type === peek.type) {
                    this.syntaxError(
                        `Expected '${value}' but got '${peek.value}'`,
                        peek.location
                    );
                } else {
                    this.syntaxError(
                        `Expected '${value}' but got ${peekType}`,
                        peek.location
                    );
                }
            } else {
                this.syntaxError(
                    `Unexpected ${peekType} '${peek.value}'`,
                    peek.location
                );
            }
        }

        return token!;
    }

    /**
     * Returns the next token only if it matches the given paramaters. 
     * @param type Match token type
     * @param read Whether to read or peek
     * @param value Match token value
     */
    public matchToken(
        type: TOKEN_TYPE,
        read?: boolean,
        value?: string | number
    ) {
        const peek = this.peekToken();

        if (
            peek === undefined ||
            peek.type !== type ||
            (value !== undefined && peek.value !== value)
        ) {
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
    public syntaxError(
        message: string,
        { line, column }: { line: number; column: number }
    ) {
        throw new SyntaxError(`${message} (at ${line}:${column})`);
    }

    /**
     * Returns false if there are no more tokens to parse
     */
    public hasNext() {
        return this._index < this.tokens.length;
    }

    /**
     * Returns a token without changing the read index
     * @param offset Offset from the current read index
     */
    public peekToken(offset?: number) {
        return this.tokens[this._index + (offset || 0)];
    }

    /**
     * Reads a single token from the input list
     */
    public readToken() {
        return this.tokens[this._index++];
    }
}

export default Parser;
