import { PARSER_OBJECT_TYPE } from '../constants';
import { Argument, ParserObject, Selector, WeightedIdentifier } from '../types';

class SelectorObject implements ParserObject {
    public type = PARSER_OBJECT_TYPE.SELECTOR;
    public compiled: string;

    constructor(
        public selector: Selector,
        public args: Argument[],
        public list: WeightedIdentifier[],
        public location: { line: number, column: number }
    ) {}
}

export default SelectorObject;
