import Parser from './Parser';
import { RETURN_ITEM_TYPE, TOKEN_TYPE } from './constants';

export type Identifier = SelectorObject | Item;
export type Arguments = string | number | number[];

export interface CompileOptions {
    args: Arguments[];

    list: IdentifierObject[];
    compiledList: string;

    isWeighted: boolean;
    totalWeights: number;
    weights: number[];
}

export interface Item {
    type: string;
    amount: number | number[];
    compiled?: string;
}

export interface ItemResult {
    item: string;
    count: number;
}

export interface Selector {
    identifier: string;
    numArgs: number;
    returns: RETURN_ITEM_TYPE

    compile(options: CompileOptions, err: (message: string) => void): string;
}

export interface SelectorObject {
    selector: Selector;
    args: Arguments[];
    list: IdentifierObject[];
    compiled?: string;
}

export interface IdentifierObject {
    identifier: Identifier;
    weight: number;
}
