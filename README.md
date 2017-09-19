# LootML

LootML is a simple markup language for building loot tables.

### Syntax

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
> // Chooses a single options
> oneOf {
>     item['item1'],
>     item['item2']
> }
> ```
>
> ```
> // Chooses twice from the given options
> someOf[2] {
>     9 item['gold', 5],
>     1 item['gold', 50]
> }
> ```

### Selectors

> **oneOf**  
> Chooses once from the given list

> **allOf**  
> Chooses every entry in the given list (ignores weights)

> **someOf[n]**  
> Chooses `n` times from the given list

```
selector {
    weight? identifier,
    weight? identifier,
    ...
}
```

```
selector {
    weight item[type, amount],
    item[type, amount],
    item[type],

    weight selector {
        weight item[type, amount],
        item[type, amount],
        item[type]
    },

    selector {
        weight item[type, amount],
        item[type, amount],
        item[type]
    }
}
```

### Selectors

