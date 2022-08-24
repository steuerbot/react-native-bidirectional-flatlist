import React, { MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { FlatListProps, LayoutChangeEvent, View } from 'react-native';
import type { FlatListType, OnUpdateData, RenderItem } from '../types';
import { MIN_INDEX } from '../config';

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

export const usePrerenderedData = ({data, keyExtractor, renderItem, scrollRef, onUpdateData, getItemLayout}: {
  data: readonly any[];
  keyExtractor: Required<FlatListProps<any>>['keyExtractor'];
  renderItem: RenderItem
  scrollRef: MutableRefObject<FlatListType>;
  onUpdateData?: OnUpdateData;
  getItemLayout?: FlatListProps<any>['getItemLayout'];
}) => {
  const [finalData, setFinalData] = useState<readonly any[]>([]);
  const [newData, setNewData] = useState<any[]>([]);

  const heightsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if(data === finalData) {
      return;
    }
    if(getItemLayout) {
      const newD = data.filter((d, i) => !heightsRef.current[keyExtractor(d, i)]);
      heightsRef.current = data.reduce((p,c,i) => {
        p[keyExtractor(c, i)] = getItemLayout(data as any[], i).length;
        return p;
      }, {});
      const index = data.findIndex((d) => d === newD[0]);
      if(index >= 0 && index <= MIN_INDEX) {
        const shift = {
          height: newD.reduce((p, c, i) => p + heightsRef.current[keyExtractor(c, i)], 0),
          offset: data.slice(0, index).reduce((p, c, i) => p + heightsRef.current[keyExtractor(c, i)], 0),
        };
        scrollRef.current?.shift(shift);
        onUpdateData?.({heights: heightsRef.current, ...shift});
      }
      setFinalData(data);
      return;
    }
    setNewData(data.filter((d, i) => !heightsRef.current[keyExtractor(d, i)]));
  }, [data, finalData, getItemLayout, keyExtractor, onUpdateData, scrollRef]);

  useEffect(() => {
    if(getItemLayout || !newData.length) {
      return;
    }
  }, [newData, getItemLayout]);

  const onLayout = useCallback<OnLayout>(({id, height}) => {
    heightsRef.current[id] = height;
    // check if there are missing elements
    const missing = data.some((d, i) => heightsRef.current[keyExtractor(d, i)] === undefined);
    if(missing) {
      return;
    }
    const index = data.findIndex((d) => d === newData[0]);
    if(index >= 0 && index <= MIN_INDEX) {
      const shift = {
        height: newData.reduce((p, c, i) => p + heightsRef.current[keyExtractor(c, i)], 0),
        offset: data.slice(0, index).reduce((p, c, i) => p + heightsRef.current[keyExtractor(c, i)], 0),
      };
      scrollRef.current?.shift(shift);
      onUpdateData?.({heights: heightsRef.current, ...shift});
    }
    setNewData([]);
    setFinalData(data);
  }, [data, keyExtractor, newData, onUpdateData, scrollRef]);

  return {
    finalData,
    prerender: newData.length ? <View>
      {newData.map((d, i) => <Prerender key={keyExtractor(d, i)} id={keyExtractor(d, i)} onLayout={onLayout}>{renderItem({item: d, prerendering: true})}</Prerender>)}
    </View> : undefined,
    getItemLayoutCustom: useCallback((data, index) => {
      const d = data[index];
      const id = keyExtractor(d, index);
      return {
        index,
        length: heightsRef.current[id],
        offset: data.slice(0, index).reduce((p: number, c: any, i: number) => {
          return p + heightsRef.current[keyExtractor(c, i)];
        }, 0),
      }
    }, [keyExtractor]),
  };
};
