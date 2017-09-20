import { PARSER_OBJECT_TYPE, RETURN_ITEM_TYPE } from './constants';
import { Argument, ParserObject, Selector, WeightedIdentifier } from './types';
import varNameGenerator from './varNameGenerator';

import AliasObject from './parserObjects/AliasObject';
import ItemObject from './parserObjects/ItemObject';
import SelectorObject from './parserObjects/SelectorObject';

/**
 * Converts parser objects to javascript
 */
class Compiler {
    public parsed: { [key: string]: ParserObject };

    /**
     * A library of functions that will be passed as arguments to the IIFE closure
     */
    public lib: { [fnName: string]: string };

    private _nextVarname = varNameGenerator();
    private _aliases: { [name: string]: string } = {};
    private _aliasMap: { [fullName: string]: string } = {};

    constructor(parsed: { [key: string]: ParserObject }, lib?: { [fnName: string]: string }) {
        this.parsed = parsed;
        this.lib = {
            ...({
                rand: `n=>Math.random()*n`,
                frand: `n=>Math.floor(Math.random()*n)`,
                crand: `n=>Math.ceil(Math.random()*n)`,
                cat: `a=>Array.prototype.concat.apply([],a)`
            } as any),
            ...lib
        };
    }

    /**
     * Parse input and produce a javascript string
     */
    public compile() {
        // Build the exports
        const exportObjects: string[] = [];

        Object.keys(this.parsed).forEach(name => {
            const compiled = this.compileBranch(this.parsed[name]);

            exportObjects.push(`${name}:${compiled}`);
        });

        // Build aliases
        const aliasConstants: string[] = [];

        Object.keys(this._aliases).forEach(name => {
            aliasConstants.push(`${this._aliasMap[name]}=${this._aliases[name]}`);
        });

        // Build the library
        const libNames: string[] = [];
        const libFunctions: string[] = [];

        Object.keys(this.lib).forEach(name => {
            libNames.push('$' + name);
            libFunctions.push(this.lib[name]);
        });

        // Put it all together
        return [
            `module.exports=((${libNames.join(',')})=>{`,
            `const ${aliasConstants.join(',')};`,
            `return {${exportObjects.join(',')}}`,
            `})(${libFunctions.join(',')})`
        ].join('');
    }

    /**
     * Compiles the given parser object and returns a string of javascript
     */
    public compileBranch(obj: ParserObject) {
        if (!obj.compiled) {
            switch (obj.type) {
                case PARSER_OBJECT_TYPE.ITEM:
                    this.compileItem(obj as ItemObject);
                    break;
                case PARSER_OBJECT_TYPE.ALIAS:
                    this.compileAlias(obj as AliasObject);
                    break;
                case PARSER_OBJECT_TYPE.SELECTOR:
                    this.compileSelector(obj as SelectorObject);
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
    public compileItem(item: ItemObject) {
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
    public compileAlias(alias: AliasObject) {
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
    public compileSelector(selector: SelectorObject) {
        if (selector.compiled) {
            return;
        }

        const sel = selector.selector;
        const args = selector.args;
        const list = selector.list;

        const weights: number[] = [];
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
        const compiled = sel.compile.call(
            this,
            {
                list,
                args,
                compiledList,
                isWeighted,
                totalWeights,
                weights
            },
            (err: string) => {
                throw this.compileError(`${sel.identifier}: ${err}`, selector.location);
            }
        );

        selector.compiled = sel.returns === RETURN_ITEM_TYPE.MULTIPLE ? `()=>$cat((${compiled})())` : compiled;
    }

    /**
     * Turns an amount into a javascript string that evaluates to a number in its range.
     */
    public buildCount(amount: number | number[]): string {
        let count: string;

        if ('number' === typeof amount) {
            count = amount.toString();
        } else {
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
    public buildWeightedIndex(weights: number[], total: number): string {
        const length = weights.length;
        const weightArr = `[${weights.join(',')}]`;

        return `((r,w,i,l)=>{for(;i<l;i++)if((r-=w[i])<=0)return i;})($crand(${total}),${weightArr},0,${length})`;
    }

    /**
     * Returns a function that evaluates to an array of elements resulting from running `fn` `count` times.
     */
    public buildRepeater(fn: string, count: string): string {
        return `()=>((i,n,o)=>{for(;i<n;i++)o.push((${fn})());return o})(0,${count},[])`;
    }

    /**
     * Throws a compile error
     * @param message Error message
     * @param location Error location
     */
    public compileError(message: string, location: { line: number; column: number } | null) {
        if (location) {
            const { line, column } = location;
            throw new Error(`${message} (at ${line}:${column})`);
        } else {
            throw new Error(message);
        }
    }
}

export default Compiler;
