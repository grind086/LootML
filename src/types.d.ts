import Parser from './Parser';
import { TOKEN_TYPE } from './constants';

export type Identifier = SelectorObject | Item;
export type Arguments = string | number | number[] | Identifier;

export interface Item {
    type: string;
    amount: number | number[];
}

export interface Selector {
    identifier: string;

    parseArgs?(p: Parser): void;
}

export interface SelectorObject {
    selector: Selector;
    args: Arguments[];
    list: Identifier[];
}

export interface IdentifierObject {
    identifier: Identifier;
    weight: number;
}
