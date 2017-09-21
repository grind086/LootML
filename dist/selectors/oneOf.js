"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
/**
 * Returns a single member from the input list. Supports weighted indexing.
 */
const OneOfSelector = {
    identifier: 'oneOf',
    numArgs: 0,
    returns: constants_1.RETURN_ITEM_TYPE.SINGLE,
    compile({ list, compiledList, isWeighted, totalWeights, weights }, err) {
        const length = list.length;
        const index = isWeighted ? this.buildWeightedIndex(weights, totalWeights) : `$frand(${length})`;
        return `()=>${compiledList}[${index}]()`;
    }
};
exports.default = OneOfSelector;
