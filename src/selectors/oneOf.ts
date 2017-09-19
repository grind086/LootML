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
        let index = '0';

        if (!isWeighted) {
            index = `Math.floor(Math.random()*${length})`;
        } else {
            const weightArr = `[${weights.join(',')}]`;
            const rand = `Math.ceil(Math.random()*${totalWeights})`;

            index = `((r,w,i,l)=>{for(;i<l;i++)if((r-=w[i])<=0)return i;})(${rand},${weightArr},0,${length})`;
        }

        return `()=>${compiledList}[${index}]()`;
    }
};

export default OneOfSelector;
