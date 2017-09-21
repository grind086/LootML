"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
/**
 * Evaluates its single list member a given number of times. Must have exactly one
 * list item.
 */
const RepeatSelector = {
    identifier: 'repeat',
    numArgs: 0,
    returns: constants_1.RETURN_ITEM_TYPE.MULTIPLE,
    compile({ list, args, compiledList }, err) {
        if (args.length < 1) {
            err(`Expected 1 argument but got ${args.length}`);
        }
        if ('string' === typeof args[0]) {
            err(`First argument must be number or range`);
        }
        if (list.length !== 1) {
            err('Must have exactly one element in the list');
        }
        const amount = args[0];
        const compiledSingle = compiledList.slice(1).slice(0, -1);
        const count = this.buildCount(amount);
        return this.buildRepeater(compiledSingle, count);
    }
};
exports.default = RepeatSelector;
