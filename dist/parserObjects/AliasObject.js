"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
/**
 * Object representation of an alias identifier
 */
class AliasObject {
    constructor(name, identifier, location) {
        this.name = name;
        this.identifier = identifier;
        this.location = location;
        this.type = constants_1.PARSER_OBJECT_TYPE.ALIAS;
    }
}
exports.default = AliasObject;
