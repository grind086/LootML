"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
/**
 * Returns items from a list by selecting from it a given number of times. Supports weighted indexing.
 */
const SomeOfSelector = {
    identifier: 'someOf',
    numArgs: 0,
    returns: constants_1.RETURN_ITEM_TYPE.MULTIPLE,
    compile({ list, args, compiledList, isWeighted, totalWeights, weights }, err) {
        if (args.length < 1) {
            err(`Expected 1 argument but got ${args.length}`);
        }
        if ('string' === typeof args[0]) {
            err(`First argument must be number or range`);
        }
        const amount = args[0];
        const length = list.length;
        const count = this.buildCount(amount);
        const index = isWeighted ? this.buildWeightedIndex(weights, totalWeights) : `$frand(${length})`;
        return this.buildRepeater(`${compiledList}[${index}]`, count);
    }
};
exports.default = SomeOfSelector;
