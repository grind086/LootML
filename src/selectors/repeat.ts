import { RETURN_ITEM_TYPE } from '../constants';
import { Selector } from '../types';

const RepeatSelector: Selector = {
    identifier: 'repeat',
    numArgs: 0,
    returns: RETURN_ITEM_TYPE.MULTIPLE,

    compile: ({ list, args, compiledList }, err) => {
        if (args.length < 1) {
            err(`repeat: Expected 1 argument but got ${args.length}`);
        }

        if ('string' === typeof args[0]) {
            err(`repeat: First argument must be number or range`);
        }

        if (list.length !== 1) {
            err('repeat: Must have exactly one element in the list');
        }

        const compiledSingle = compiledList.slice(1).slice(0, -1);
        let count;

        if ('number' === typeof args[0]) {
            count = args[0].toString();
        } else {
            const min = (args[0] as number[])[0];
            const max = (args[0] as number[])[1];
            const range = max - min + 1;

            count = `Math.floor(Math.random()*${range})+${min}`;
        }

        return `()=>((i,n,o)=>{for(;i<n;i++)o.push((${compiledSingle})());return o})(0,${count},[])`;
    }
};

export default RepeatSelector;
