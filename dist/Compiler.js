"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const varNameGenerator_1 = require("./varNameGenerator");
/**
 * Converts parser objects to javascript
 */
class Compiler {
    constructor(parsed, lib) {
        this._nextVarname = varNameGenerator_1.default();
        this._aliases = {};
        this._aliasMap = {};
        this.parsed = parsed;
        this.lib = Object.assign({}, {
            rand: `n=>Math.random()*n`,
            frand: `n=>Math.floor(Math.random()*n)`,
            crand: `n=>Math.ceil(Math.random()*n)`,
            cat: `a=>Array.prototype.concat.apply([],a)`
        }, lib);
    }
    /**
     * Parse input and produce a javascript string that will return an exports object
     */
    compile() {
        // Build the exports
        const exportObjects = [];
        Object.keys(this.parsed).forEach(name => {
            const compiled = this.compileBranch(this.parsed[name]);
            exportObjects.push(`${name}:${compiled}`);
        });
        // Build aliases
        const aliasConstants = [];
        Object.keys(this._aliases).forEach(name => {
            aliasConstants.push(`${this._aliasMap[name]}=${this._aliases[name]}`);
        });
        // Build the library
        const libNames = [];
        const libFunctions = [];
        Object.keys(this.lib).forEach(name => {
            libNames.push('$' + name);
            libFunctions.push(this.lib[name]);
        });
        // Put it all together
        return [
            `((${libNames.join(',')})=>{`,
            aliasConstants.length ? `const ${aliasConstants.join(',')};` : '',
            `return {${exportObjects.join(',')}}`,
            `})(${libFunctions.join(',')})`
        ].join('');
    }
    /**
     * Compiles the given parser object and returns a string of javascript
     */
    compileBranch(obj) {
        if (!obj.compiled) {
            switch (obj.type) {
                case constants_1.PARSER_OBJECT_TYPE.ITEM:
                    this.compileItem(obj);
                    break;
                case constants_1.PARSER_OBJECT_TYPE.ALIAS:
                    this.compileAlias(obj);
                    break;
                case constants_1.PARSER_OBJECT_TYPE.SELECTOR:
                    this.compileSelector(obj);
                    break;
                default:
                    this.compileError(`Invalid parser object type ${obj.type}`, obj.location);
            }
        }
        return obj.compiled;
    }
    /**
     * Compiles an `ItemObject` to a javascript function and sets its `compiled` property
     */
    compileItem(item) {
        if (item.compiled) {
            return;
        }
        const count = this.buildCount(item.amount);
        const compiled = `()=>({type:"${item.name}",count:${count}})`;
        item.compiled = compiled;
    }
    /**
     * Compiles an `AliasObject` to a javascript function and sets its `compiled` property
     */
    compileAlias(alias) {
        if (alias.compiled !== void 0) {
            return;
        }
        const shortName = this._nextVarname();
        this._aliases[alias.name] = this.compileBranch(alias.identifier);
        this._aliasMap[alias.name] = shortName;
        alias.compiled = shortName;
    }
    /**
     * Compiles an `SelectorObject` to a javascript function and sets its `compiled` property
     */
    compileSelector(selector) {
        if (selector.compiled) {
            return;
        }
        const sel = selector.selector;
        const args = selector.args;
        const list = selector.list;
        const weights = [];
        const firstWeight = (list[0] && list[0].weight) || 1;
        let isWeighted = false;
        let totalWeights = 0;
        for (const weighted of list) {
            if (weighted.weight !== firstWeight) {
                isWeighted = true;
            }
            totalWeights += weighted.weight;
            weights.push(weighted.weight);
        }
        const compiledListElements = list.map(obj => this.compileBranch(obj.identifier));
        const compiledList = '[' + compiledListElements.join(',') + ']';
        const compiled = sel.compile.call(this, {
            list,
            args,
            compiledList,
            isWeighted,
            totalWeights,
            weights
        }, (err) => {
            throw this.compileError(`${sel.identifier}: ${err}`, selector.location);
        });
        selector.compiled = sel.returns === constants_1.RETURN_ITEM_TYPE.MULTIPLE ? `()=>$cat((${compiled})())` : compiled;
    }
    /**
     * Turns an amount into a javascript string that evaluates to a number in its range.
     */
    buildCount(amount) {
        let count;
        if ('number' === typeof amount) {
            count = amount.toString();
        }
        else {
            const min = amount[0];
            const max = amount[1];
            const range = max - min + 1;
            count = `$frand(${range})+${min}`;
        }
        return count;
    }
    /**
     * Returns a string that evaluates to a weighted index
     */
    buildWeightedIndex(weights, total) {
        const length = weights.length;
        const weightArr = `[${weights.join(',')}]`;
        return `((r,w,i,l)=>{for(;i<l;i++)if((r-=w[i])<=0)return i;})($crand(${total}),${weightArr},0,${length})`;
    }
    /**
     * Returns a function that evaluates to an array of elements resulting from running `fn` `count` times.
     */
    buildRepeater(fn, count) {
        return `()=>((i,n,o)=>{for(;i<n;i++)o.push((${fn})());return o})(0,${count},[])`;
    }
    /**
     * Throws a compile error
     * @param message Error message
     * @param location Error location
     */
    compileError(message, location) {
        if (location) {
            const { line, column } = location;
            throw new Error(`${message} (at ${line}:${column})`);
        }
        else {
            throw new Error(message);
        }
    }
}
exports.default = Compiler;
