import { PARSER_OBJECT_TYPE } from '../constants';
import { ParserObject } from '../types';

class ItemObject implements ParserObject {
    public type = PARSER_OBJECT_TYPE.ITEM;
    public compiled: string;

    constructor(
        public name: string,
        public amount: number | number[],
        public location: { line: number, column: number }
    ) {}
}

export default ItemObject;
