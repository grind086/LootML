import { Identifier, Item, Selector, SelectorObject } from './types';

/**
 * Recursively compiles a parsed object tree into javascript
 */
export default function compile(root: Identifier): string {
    if (!root.compiled) {
        if (root.hasOwnProperty('type')) {
            // Compile items
            const amount = (root as Item).amount;
            const type = (root as Item).type;
            let count: string;

            if ('number' === typeof amount) {
                count = amount.toString();
            } else {
                const min = amount[0];
                const max = amount[1];
                const range = max - min + 1;

                count = `Math.floor(Math.random()*${range})+${min}`;
            }

            root.compiled = `()=>({type:"${type}",count:${count}})`;
        } else {
            // Compile selectors
            const selector = (root as SelectorObject).selector;
            const args = (root as SelectorObject).args;
            const list = (root as SelectorObject).list;

            const weights: number[] = [];
            const firstWeight = (list[0] && list[0].weight) || 1;
            let isWeighted = false;
            let totalWeights = 0;

            for (const identObj of list) {
                if (identObj.weight !== firstWeight) {
                    isWeighted = true;
                }

                totalWeights += identObj.weight;
                weights.push(identObj.weight);
            }

            const compiledList =
                '[' +
                list.map(identObj => compile(identObj.identifier)).join(',') +
                ']';

            root.compiled = selector.compile(
                {
                    list,
                    args,
                    compiledList,
                    isWeighted,
                    totalWeights,
                    weights
                },
                err => {
                    throw new Error(err);
                }
            );
        }
    }

    return root.compiled!;
}
