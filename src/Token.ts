import { TOKEN_TYPE } from './constants';

class Token {
    constructor(
        public type: TOKEN_TYPE,
        public value: string,
        public location: {
            line: number;
            column: number;
        }
    ) {}
}

export default Token;
