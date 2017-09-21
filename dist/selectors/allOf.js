"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
/**
 * Returns every member of the input list
 */
const AllOfSelector = {
    identifier: 'allOf',
    numArgs: 0,
    returns: constants_1.RETURN_ITEM_TYPE.MULTIPLE,
    compile({ compiledList }, err) {
        return `()=>${compiledList}.map(f=>f())`;
    }
};
exports.default = AllOfSelector;
