import type { FC } from 'react';
import React, { useCallback, useRef, useState } from 'react';

import { Button, StyleSheet, Text, View } from 'react-native';
import { FlatList, ScrollView } from 'react-native-bidirectional-flatlist';

interface MessageType {
  id: string;
  color: string;
  height: number;
}

let counter = 1;
const getIdNumber = () => counter++;
let block = 1;
const getBlockNumber = () => block++;

const generateData = (howMany = 20): MessageType[] => {
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
      height: Math.floor(50 + Math.random() * 100),
    };
  });
};

const Message: FC<MessageType> = ({ id, color, height }) => (
  <View
    style={{
      height,
      width: '100%',
      padding: 8,
      paddingHorizontal: 16,
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

export default function App() {
  const [data, setData] = useState<MessageType[]>([]);
  const [type] = useState<'flatlist' | 'scrollview'>('flatlist');

  const ref = useRef<typeof FlatList>(null);

  const renderItem = useCallback(({item}) => {
    return <Message key={item.id} {...item} />
  }, [])

  const keyExtractor = useCallback((item) => item.id, []);

  const prepend = useCallback(() => {
    const newData = generateData();
    ref.current?.shift({
      offset: 0,
      height: newData.reduce((p, c) => p + c.height, 0),
    });
    setData((x) => [...newData, ...x]);
  }, []);

  const append = useCallback(() => {
    const newData = generateData();
    ref.current?.shift({
      offset: data.reduce((p, c) => p + c.height, 0),
      height: newData.reduce((p, c) => p + c.height, 0),
    });
    setData((x) => [...x, ...newData]);
  }, [data]);

  const reset = useCallback(() => {
    setData([]);
  }, []);

  const getItemLayout = useCallback((data, index) => {
    return {
      index,
      length: data[index].height,
      offset: data.slice(0, index).reduce((p: number,c: MessageType) => p+c.height, 0),
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {type === 'scrollview' && <ScrollView style={styles.list} ref={ref as any}>
        {data.map((d) => renderItem({item: d}))}
      </ScrollView>}
      {type === 'flatlist' && <FlatList data={data} renderItem={renderItem} keyExtractor={keyExtractor} getItemLayout={getItemLayout} ref={ref as any} />}
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Button title="Prepend" onPress={prepend} />
        <Button title="Append" onPress={append} />
        <Button title="Reset" onPress={reset} />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor: 'red',
          padding: 8,
        }}
      >
        <Text style={{ fontWeight: '900', color: 'white', fontSize: 16 }}>
          {data.length} / {type}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});
