"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Token {
    constructor(type, value, location) {
        this.type = type;
        this.value = value;
        this.location = location;
    }
}
exports.default = Token;
