export enum TOKEN_TYPE {
    ERROR,

    // Syntax elements
    COMMA,
    LEFT_BRACKET,
    RIGHT_BRACKET,
    LEFT_BRACE,
    RIGHT_BRACE,
    HYPHEN,
    IDENTIFIER,
    ALIAS,
    EXPORT,
    COMMENT,

    // Basic types
    NUMBER,
    STRING
}

export enum RETURN_ITEM_TYPE {
    SINGLE,
    MULTIPLE
}
