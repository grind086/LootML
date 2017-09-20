import Compiler from './Compiler';
import { PARSER_OBJECT_TYPE, RETURN_ITEM_TYPE, TOKEN_TYPE } from './constants';

export type Argument = string | number | number[];

export interface CompileOptions {
    args: Argument[];

    list: WeightedIdentifier[];
    compiledList: string;

    isWeighted: boolean;
    totalWeights: number;
    weights: number[];
}

/**
 * An item resulting from a compiled LootML function
 */
export interface ItemResult {
    item: string;
    count: number;
}

export interface ParserObject {
    type: PARSER_OBJECT_TYPE;
    compiled: string;
}

/**
 * The javascript object representation of a weighted identifier (output by the parser)
 */
export interface WeightedIdentifier {
    identifier: ParserObject;
    weight: number;
}

/**
 * Interface that all selectors must implement (TODO: Turn this into an abstract class)
 */
export interface Selector {
    identifier: string;
    numArgs: number;
    returns: RETURN_ITEM_TYPE;

    compile(this: Compiler, options: CompileOptions, err: (message: string) => void): string;
}
