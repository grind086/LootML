import Lexer from '../Lexer';
import Parser from '../Parser';

const inputFile = `
@MyItem
item['MINE']

@MyTable
oneOf {
    oneOf {
        MyItem,
        item['item2', 5-7]
    },
    MyItem
}
`;

const lex = new Lexer(inputFile);
const parse = new Parser(lex.analyze());

parse.parse();

// console.log(lex.output);
