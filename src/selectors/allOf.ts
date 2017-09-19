import { RETURN_ITEM_TYPE } from '../constants';
import { Selector } from '../types';

const AllOfSelector: Selector = {
    identifier: 'allOf',
    numArgs: 0,
    returns: RETURN_ITEM_TYPE.MULTIPLE,

    compile({ compiledList }, err) {
        return `()=>${compiledList}.map(f=>f())`;
    }
};

export default AllOfSelector;
