import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import {
  Button,
  ScrollView as ScrollViewRN,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScrollView as ScrollViewChanged } from 'react-native-bidirectional-flatlist';

const USE_NEW = true;

const ScrollView = USE_NEW ? ScrollViewChanged : ScrollViewRN;

interface MessageType {
  id: string;
  color: string;
  height: number;
}

let counter = 1;
const getIdNumber = () => counter++;

const HEIGHT = 150;

const generateData = (howMany: number = 20): MessageType[] => {
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
  return Array.from(new Array(howMany)).map(() => {
    const count = getIdNumber();
    return {
      id: count.toString(),
      color: colors[count % colors.length] as string,
      height: HEIGHT,
    };
  });
};

const Message: FC<MessageType> = ({ id, color, height }) => (
  <View
    style={{
      height,
      width: '100%',
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: color,
    }}
  >
    <Text>{id}</Text>
  </View>
);

export default function App() {
  const [data, setData] = useState(() => generateData());

  const ref = useRef<ScrollViewRN>();
  const ran = useRef<boolean>();

  const prepend = useCallback(() => {
    const howMany = 1;
    ref.current?.shift({
      offset: 0,
      height: 150,
    });
    setData((x) => [...generateData(howMany), ...x]);
  }, []);

  useEffect(() => {
    if (ran.current) {
      return;
    }
    ran.current = true;
    console.log(ref.current);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.list} ref={ref}>
        {data.map((d) => (
          <Message key={d.id} {...d} />
        ))}
      </ScrollView>
      <View style={{ position: 'absolute', bottom: 100 }}>
        <Button title="Prepend" onPress={prepend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
