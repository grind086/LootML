# LootML

[LootML](https://github.com/grind086/LootML) is a simple markup language for building loot tables.

## Installation

```
yarn add loot-ml
```

Other useful scripts

```
npm run test
npm run build
npm run build-examples
```

## API

> **compileCommonJS(input: string)**  
> Compiles the given program to a commonJS module.

> **compileFunctions(input: string)**  
> Compiles the given program to an object of executable functions (USES EVAL).

> **compileIIFE(input: string)**  
> Compiles the given program to an IIFE that will return the exports object.

### Example
```js
import { compileFunctions } from 'loot-ml';

// or
// const compileFunctions = require('loot-ml');

const fns = compileFunctions(`
    @Fruits
    oneOf {
        item['Apple'],
        item['Pear'],
        item['Banana']
    }

    $FruitSalad
    repeat[4] {
        Fruits
    }

    $DeliciousSnack
    oneOf {
        Fruits,
        item['Mango']
    }
`);

fns.FruitSalad();
fns.DeliciousSnack();
```

## Syntax

The following is the [EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) description of LootML

```
(* Simple characters *)
letter = "A" | "B" | "C" | "D" | "E" | "F" | "G"
       | "H" | "I" | "J" | "K" | "L" | "M" | "N"
       | "O" | "P" | "Q" | "R" | "S" | "T" | "U"
       | "V" | "W" | "X" | "Y" | "Z" | "a" | "b"
       | "c" | "d" | "e" | "f" | "g" | "h" | "i"
       | "j" | "k" | "l" | "m" | "n" | "o" | "p"
       | "q" | "r" | "s" | "t" | "u" | "v" | "w"
       | "x" | "y" | "z" ;
symbol = "[" | "]" | "{" | "}" | "," | "-" | "_" 
       | "@" | "$" ;
digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" 
      | "7" | "8" | "9" ;

(* Primitive types *)
string = ( "'", { letter | digit | symbol | " " }, "'" ) 
       | ( '"', { letter | digit | symbol | " " }, '"' ) ;
number = digit, { digit } ;
identifier = letter | "_", { letter | "_" } ;

(* Extended types *)
amount = number, "-", number ;
argument = number | amount | identifier ;
alias = "@", identifier ;
export = "$", identifier ;

(* List elements *)
argument_list = "[", [ argument, { ",", argument } ], "]" ;
selection_list = "{", item | identifier | selector, { ",", item | selector | identifier }, "}" ;

(* Functional elements *)
item = "item", "[", string, [ number | amount ], "]" ;
selector = identifier, [ argument_list ], selection_list ;

```

### Structure

> **item[type, amount?]**  
> An item entry for item `type` (string or number). Optionally specify an amount (default `1`) either as a single number, or a range separated by `-`.  
>  
> Examples:  
> `item['item1']`  
> `item['item2', 10]`  
> `item['item3', 4-7]`

> **selector[params] { weight? identifier, ... }**  
> Makes a selection from the given list. `selector` is one of the selector types listed below. Some selectors allow weighting of different options using the number `weight` (default `1`). `identifier` can be another selector, or an item.  
>  
> Examples:
> ```
> oneOf {
>     item['item1'],
>     item['item2']
> }
> ```
>
> ```
> allOf {
>     someOf[2] {
>         9 item['gold', 5],
>         1 item['gold', 50]
>     },
>     oneOf {
>         item['cloth scrap'],
>         item['apple']
>     }
> }
> ```

> **@alias identifier**  
> Creates an alias for `identifier` (either an item, a selector, or another alias) that can be used in its place.  
>  
> Examples:
> ```
> @MyItem item['myItemId', 1-2]
>
> oneOf {
>     MyItem,
>     item['anotherItem']
> }
> ```
>
> ```
> @MySubTable
> oneOf {
>     item['someItem'],
>     item['anotherItem']
> }
>
> oneOf {
>     item['commonItem'],
>     MySubTable
> }
> ```

> **$export identifier**  
> Exports the given identifier  
>  
> Examples:
> ```
> $MyExport
> oneOf {
>     item['someItem'],
>     item['anotherItem']
> }
> ```
>
> ```
> $MyExport
> @MyTable
> oneOf {
>     item['someItem'],
>     item['anotherItem']
> }
>
> // or
>
> @MyTable
> $MyExport
> oneOf {
>     item['someItem'],
>     item['anotherItem']
> }
>
> // or
>
> @MyTable
> oneOf {
>     item['someItem'],
>     item['anotherItem']
> }
>
> $MyExport MyTable
> ```

### Selectors

> **oneOf**  
> Chooses once from the given list

> **allOf**  
> Chooses every entry in the given list (ignores weights)

> **someOf[n]**  
> Chooses `n` times from the given list

## Language extensions

It is possible to extend the language with additional selectors. To do so, either pass an array of selector objects as the second argument for `new Parser()`, or call `addSelector()` on the parser
instance. Note that this should be done *before* calling `parse()`. See [src/selectors](https://github.com/grind086/LootML/tree/master/src/selectors) for examples.

More documentation to come.

### Built-in functions

> **$rand(n: number)**  
> Returns `Math.random() * n`

> **$crand(n: number)**  
> Returns `Math.ceil(Math.random() * n)`

> **$frand(n: number)**  
> Returns `Math.floor(Math.random() * n)`

> **$cat(arr: Array<Array<any> | any>)**  
> Flattens the given array (NOT recursive)