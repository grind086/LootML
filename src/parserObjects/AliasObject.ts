import { PARSER_OBJECT_TYPE } from '../constants';
import { ParserObject } from '../types';

class AliasObject implements ParserObject {
    public type = PARSER_OBJECT_TYPE.ALIAS;
    public compiled: string;

    constructor(
        public name: string,
        public identifier: ParserObject
    ) {}
}

export default AliasObject;
