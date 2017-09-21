"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
/**
 * Object representation of an item identifier
 */
class ItemObject {
    constructor(name, amount, location) {
        this.name = name;
        this.amount = amount;
        this.location = location;
        this.type = constants_1.PARSER_OBJECT_TYPE.ITEM;
    }
}
exports.default = ItemObject;
