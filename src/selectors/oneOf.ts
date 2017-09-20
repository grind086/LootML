import { RETURN_ITEM_TYPE } from '../constants';
import { Selector } from '../types';

const OneOfSelector: Selector = {
    identifier: 'oneOf',
    numArgs: 0,
    returns: RETURN_ITEM_TYPE.SINGLE,

    compile(
        { list, compiledList, isWeighted, totalWeights, weights },
        err
    ) {
        const length = list.length;
        const index = isWeighted
            ? this.buildWeightedIndex(weights, totalWeights)
            : `$frand(${length})`;

        return `()=>${compiledList}[${index}]()`;
    }
};

export default OneOfSelector;
