"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
/**
 * Object representation of a selector identifier
 */
class SelectorObject {
    constructor(selector, args, list, location) {
        this.selector = selector;
        this.args = args;
        this.list = list;
        this.location = location;
        this.type = constants_1.PARSER_OBJECT_TYPE.SELECTOR;
    }
}
exports.default = SelectorObject;
