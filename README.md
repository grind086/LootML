# LootML

LootML is a simple markup language for building loot tables.

## Syntax

### Structure

> **item[type, amount?]**  
> An item entry for item `type` (string or number). Optionally specify an amount (default `1`) either as a single number, or a range separated by `-`.  
>  
> Examples:  
> `item['item1']`  
> `item['item2', 10]`  
> `item['item3', 4-7]`

> **selector[params] { weight? identifier, ... }**  
> Makes a selection from the given list. `selector` is one of the selector types listed below. Some selectors allow weighting of different options using the number `weight`, will be `1` if omitted. `identifier` can be another selector, or an item.  
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