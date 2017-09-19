import { PARSER_OBJECT_TYPE, RETURN_ITEM_TYPE } from './constants';
import {
    Argument,
    ParserObject,
    Selector,
    WeightedIdentifier
} from './types';

import AliasObject from './parserObjects/AliasObject';
import ItemObject from './parserObjects/ItemObject';
import SelectorObject from './parserObjects/SelectorObject';

class Compiler {
    public parsed: { [key: string]: ParserObject };

    /**
     * A library of functions that will be passed as arguments to the IIFE closure
     */
    public lib: { [fnName: string]: string };

    private _aliases: { [name: string]: string } = {};

    constructor(parsed: { [key: string]: ParserObject }, lib?: { [fnName: string]: string }) {
        this.parsed = parsed;
        this.lib = Object.assign({
            rand: `n=>Math.random()*n`,
            frand: `n=>Math.floor(Math.random()*n)`,
            crand: `n=>Math.ceil(Math.random()*n)`,
            cat: `a=>Array.prototype.concat.apply([],a)`
        }, lib);
    }

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
            aliasConstants.push(`${name}=${this._aliases[name]}`);
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

    public buildExports() {
        const parsed = this.parsed;
    }

    public buildLib() {
        const lib = this.lib;
        const libFns = Object.keys(lib)
            .map(name => `$${name}=${lib[name]}`)
            .join(',');

        return `const ${libFns};`;
    }

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
                    throw new Error(`Invalid parser object type ${obj.type}`);
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

    public compileAlias(alias: AliasObject) {
        if (alias.compiled) {
            return;
        }

        this._aliases[alias.name] = this.compileBranch(alias.identifier);
        alias.compiled = alias.name;
    }

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

        const compiledListElements = list.map(
            obj => this.compileBranch(obj.identifier)
        );

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
                throw new Error(err);
            }
        );

        if (sel.returns === RETURN_ITEM_TYPE.MULTIPLE) {
            selector.compiled = `()=>$cat((${compiled})())`;
        } else {
            selector.compiled = compiled;
        }
    }

    /**
     * 
     */
    public buildCount(amount: number | number[]): string {
        let count: string;
        
        if ('number' === typeof amount) {
            count = amount.toString();
        } else {
            const min = amount[0];
            const max = amount[1];
            const range = max - min + 1;

            count = `Math.floor(Math.random()*${range})+${min}`;
        }

        return count;
    }
}

export default Compiler;
