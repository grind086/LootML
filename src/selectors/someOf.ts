import { RETURN_ITEM_TYPE } from '../constants';
import { Selector } from '../types';

/**
 * Returns items from a list by selecting from it a given number of times. Supports weighted indexing.
 */
const SomeOfSelector: Selector = {
    identifier: 'someOf',
    numArgs: 0,
    returns: RETURN_ITEM_TYPE.MULTIPLE,

    compile({ list, args, compiledList, isWeighted, totalWeights, weights }, err) {
        if (args.length < 1) {
            err(`Expected 1 argument but got ${args.length}`);
        }

        if ('string' === typeof args[0]) {
            err(`First argument must be number or range`);
        }

        const amount: number | number[] = args[0] as any;
        const length = list.length;

        const count = this.buildCount(amount);
        const index = isWeighted ? this.buildWeightedIndex(weights, totalWeights) : `$frand(${length})`;

        return this.buildRepeater(`${compiledList}[${index}]`, count);
    }
};

export default SomeOfSelector;
