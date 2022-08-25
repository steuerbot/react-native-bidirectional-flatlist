# react-native-bidirectional-flatlist
FlatList supports bidirectional additions
## Installation

```sh
npm install react-native-bidirectional-flatlist
```

or

```sh
yarn add react-native-bidirectional-flatlist
```

## Usage

```js
import BidirectionalFlatlist from "react-native-bidirectional-flatlist";

// ...

<BidirectionalFlatlist data={data} renderItem={renderItem} keyExtractor={keyExtractor} />
```

### Properties
| Name          | description                                                                                                                                                                | required | default |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|---------|
| data          | The data array, see [RN doc](https://reactnative.dev/docs/flatlist#required-data)                                                                                          | ☑️     |         |
| renderItem    | Render function, see [RN doc](https://reactnative.dev/docs/flatlist#required-renderitem). Difference to FlatList: Argument is {item: T; prerendering: boolean}             | ☑️     |         |
| keyExtractor  | Function, which returns the key / id of the item, see [RN doc](https://reactnative.dev/docs/flatlist#keyextractor). Difference to FlatList: The index-Parameter is missing |        | (item) => item.id ?? item.key        |
| getItemLayout | If you know the dimensions of the items you can provide it, otherwise prerendering would be used to determine the height. See [RN doc](https://reactnative.dev/docs/flatlist#getitemlayout)                                             |        |         |

Separators are not allowed. For other properties see [RN doc](https://reactnative.dev/docs/flatlist).

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
