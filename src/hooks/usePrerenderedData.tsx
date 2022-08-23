import React, { MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { FlatListProps, LayoutChangeEvent, View } from 'react-native';
import type { FlatListType, OnUpdateData, RenderItem } from '../types';

type OnLayout = (options: {id: string; height: number}) => void;

const Prerender = ({id, onLayout, children}: {id: string; onLayout: OnLayout; children: ReactNode}) => {
  const onLayoutView = useCallback((e: LayoutChangeEvent) => {
    onLayout({
      id,
      height: e.nativeEvent.layout.height,
    });
  }, []);

  return <View onLayout={onLayoutView}>
    {children}
  </View>
}

export const usePrerenderedData = ({data, keyExtractor, renderItem, scrollRef, onUpdateData}: {
  data: readonly any[];
  keyExtractor: Required<FlatListProps<any>>['keyExtractor'];
  renderItem: RenderItem
  scrollRef: MutableRefObject<FlatListType>;
  onUpdateData?: OnUpdateData
}) => {
  const [finalData, setFinalData] = useState<readonly any[]>([]);
  const [newData, setNewData] = useState<any[]>([]);

  const heightsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if(data === finalData) {
      return;
    }
    setNewData(data.filter((d, i) => !heightsRef.current[keyExtractor(d, i)]));
  }, [data, finalData]);

  useEffect(() => {
    if(!newData.length) {
      return;
    }
  }, [newData]);

  const onLayout = useCallback<OnLayout>(({id, height}) => {
    heightsRef.current[id] = height;
    // check if there are missing elements
    const missing = data.some((d, i) => heightsRef.current[keyExtractor(d, i)] === undefined);
    if(missing) {
      return;
    }
    const index = data.findIndex((d) => d === newData[0]);
    const shift = {
      height: newData.reduce((p, c, i) => p + heightsRef.current[keyExtractor(c, i)], 0),
      offset: data.slice(0, index).reduce((p, c, i) => p + heightsRef.current[keyExtractor(c, i)], 0),
    };
    scrollRef.current?.shift(shift);
    setNewData([]);
    setFinalData(data);
    onUpdateData?.({heights: heightsRef.current, ...shift});
  }, [data, keyExtractor, newData, onUpdateData]);

  return {
    finalData,
    prerender: newData.length ? <View>
      {newData.map((d, i) => <Prerender key={keyExtractor(d, i)} id={keyExtractor(d, i)} onLayout={onLayout}>{renderItem({item: d, prerendering: true})}</Prerender>)}
    </View> : undefined,
    getItemLayout: useCallback((data, index) => {
      const d = data[index];
      const id = keyExtractor(d, index);
      return {
        index,
        length: heightsRef.current[id],
        offset: data.slice(0, index).reduce((p: number, c: any, i: number) => {
          return p + heightsRef.current[keyExtractor(c, i)];
        }, 0),
      }
    }, []),
  };
};
