import { PARSER_OBJECT_TYPE } from '../constants';
import { ParserObject } from '../types';

/**
 * Object representation of an alias identifier
 */
class AliasObject implements ParserObject {
    public type = PARSER_OBJECT_TYPE.ALIAS;
    public compiled: string;

    constructor(
        public name: string,
        public identifier: ParserObject,
        public location: { line: number; column: number }
    ) {}
}

export default AliasObject;
