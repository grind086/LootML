import Lexer from '../Lexer';
import minify from '../minify';
import Parser from '../Parser';

const inputFile = `
@MyItem
item['MINE', 1-6]

@YourItem
item['YOURS']

@OurItems
oneOf {
    MyItem,
    YourItem
}

$test
@MyTable
oneOf {
    oneOf {
        OurItems,
        item['item2', 5-7]
    },
    YourItem
}

oneOf {
    2 MyItem,
    YourItem
}
`;

const lexer = new Lexer(inputFile);
const parser = new Parser(lexer.analyze());
const compiled = parser.parse();

const fn = eval(compiled.test);
const res = {
    MINE: 0,
    YOURS: 0,
    item2: 0
};

for (let i = 0; i < 1e6; i++) {
    const type = fn().type;
    res[type]++;
    // console.log(type);
}

console.log(res);

// console.log(minify(inputFile));
