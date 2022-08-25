import React, { FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { Button, FlatList, Text, TouchableOpacity, View } from 'react-native';
import BidirectionalFlatList from 'react-native-bidirectional-flatlist';
import Reanimated, { useAnimatedRef } from 'react-native-reanimated';

const FlatListReanimated = Reanimated.createAnimatedComponent(BidirectionalFlatList);

interface MessageType {
  id: string;
  color: string;
  height: number;
}

let counter = 1;
const getIdNumber = () => counter++;
let block = 1;
const getBlockNumber = () => block++;

const generateData = (howMany = 20, height: number | undefined = undefined): MessageType[] => {
  const colors = [
    'red',
    'green',
    'blue',
    'yellow',
    'purple',
    'brown',
    'magenta',
    'cyan',
  ];
  const color = colors[getBlockNumber() % colors.length] as string;
  return Array.from(new Array(howMany)).map(() => {
    const id = getIdNumber();
    return {
      id: id.toString(),
      color,
      height: height ?? Math.floor(50 + Math.random() * 100),
    };
  });
};

const Message: FC<MessageType> = ({ id, color, height }) => {
  if(!height) {
    return null;
  }
  return (
    <View
      style={{
        height,
        width: '100%',
        padding: 8,
        paddingHorizontal: 16,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          backgroundColor: color,
          paddingHorizontal: 8,
          height: height - 8,
        }}
      >
        <Text style={{ fontSize: 32, color: 'white' }}>{id}</Text>
      </View>
    </View>
  );
};


const types = ['FlatList', 'AnimatedFlatList'] as const;
type Type = typeof types[number];

const ExampleLink = ({type}: {type: Type}) => {
  const {setType} = useContext(ExampleContext);
  const onPress = useCallback(() => {
    setType(type);
  }, [setType, type]);
  return <TouchableOpacity onPress={onPress}><View style={{height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16}}><Text>{type}</Text></View></TouchableOpacity>;
}

const ExampleContext = React.createContext<{type: string | undefined; back: () => unknown; setType: (type: Type) => unknown}>({type: undefined, back: () => {/* placeholder */}, setType: (_type) => {/* placeholder */}});

const Example = ({children}: {children: (props: any) => ReactNode}) => {
  const [puffer] = useState(() => generateData(20, 0));
  const [data, setData] = useState<MessageType[]>([]);

  const ref = useAnimatedRef<FlatList>();

  const renderItem = useCallback(({item}) => {
    return <Message key={item.id} {...item} />
  }, [])

  const keyExtractor = useCallback((item) => item.id, []);

  const prependAndRemoveFirst = useCallback(async () => {
    const newData = generateData(20);
    setData((x) => [...newData, ...x.slice(1)]);
  }, []);

  const prepend = useCallback(async () => {
    const newData = generateData(20);
    setData((x) => [...newData, ...x]);
  }, []);

  const append = useCallback(async () => {
    const newData = generateData();
    setData((x) => [...x, ...newData]);
  }, []);

  const reset = useCallback(() => {
    setData([]);
  }, []);

  const finalData = useMemo(() => [...data, ...puffer], [data, puffer]);

  const props = {
    windowSize: 21,
    maxToRenderPerBatch: 20,
    initialNumToRender: 20,
    data: finalData,
    renderItem,
    keyExtractor,
    ref,
  }

  return <ExampleContext.Consumer>
    {({type, back}) => <>
      {children(props)}
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Button title="Prepend And Remove First" onPress={prependAndRemoveFirst} />
        <Button title="Prepend" onPress={prepend} />
        <Button title="Append" onPress={append} />
        <Button title="Reset" onPress={reset} />
      </View>
      <TouchableOpacity onPress={back} style={{
        position: 'absolute',
        top: 100,
        left: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: 'black',
        padding: 8,
      }}>
        <View>
          <Text style={{ color: 'white', fontSize: 16 }}>
            🔙 {type}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={{
          position: 'absolute',
          bottom: 100,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor: 'red',
          padding: 8,
        }}>
        <Text style={{ fontWeight: '900', color: 'white', fontSize: 16 }}>
         {data.length}
        </Text>
      </View>
    </>}
  </ExampleContext.Consumer>
}

export default function App() {
  const [type, setType] = useState<Type>();

  const back = useCallback(() => setType(undefined), [])

  return (
    <ExampleContext.Provider value={{type, setType, back}}>
      <View style={{ flex: 1 }}>
        {!type && <View>
          {types.map(t => <ExampleLink key={t} type={t} />)}
        </View>}
        {type === 'FlatList' && <Example>{props => <BidirectionalFlatList {...props} />}</Example>}
        {type === 'AnimatedFlatList' && <Example>{props => <FlatListReanimated {...props} />}</Example>}
      </View>
    </ExampleContext.Provider>
  );
}
