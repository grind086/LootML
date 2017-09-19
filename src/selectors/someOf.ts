import { RETURN_ITEM_TYPE } from '../constants';
import { Selector } from '../types';

const SomeOfSelector: Selector = {
    identifier: 'someOf',
    numArgs: 0,
    returns: RETURN_ITEM_TYPE.MULTIPLE,

    compile(
        { list, args, compiledList, isWeighted, totalWeights, weights },
        err
    ) {
        if (args.length < 1) {
            err(`oneOf: Expected 1 argument but got ${args.length}`);
        }

        if ('string' === typeof args[0]) {
            err(`oneOf: First argument must be number or range`);
        }

        const amount: number | number[] = args[0] as any;
        const length = list.length;

        const count = this.buildCount(amount);
        let index = '0';

        if (!isWeighted) {
            index = `Math.floor(Math.random()*${length})`;
        } else {
            const weightArr = `[${weights.join(',')}]`;
            const rand = `Math.ceil(Math.random()*${totalWeights})`;

            index = `((r,w,i,l)=>{for(;i<l;i++)if((r-=w[i])<=0)return i;})(${rand},${weightArr},0,${length})`;
        }

        return `()=>((i,n,o)=>{for(;i<n;i++)o.push(${compiledList}[${index}]());return o})(0,${count},[])`;
    }
};

export default SomeOfSelector;
