import React, { MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { FlatListProps, LayoutChangeEvent, View } from 'react-native';
import type { FlatListType, KeyExtractor, OnUpdateData, RenderItem } from '../types';
import { MIN_INDEX } from '../config';

type OnLayout = (options: {id: string; height: number}) => void;

const Prerender = ({id, onLayout, children}: {id: string; onLayout: OnLayout; children: ReactNode}) => {
  const onLayoutView = useCallback((e: LayoutChangeEvent) => {
    onLayout({
      id,
      height: e.nativeEvent.layout.height,
    });
  }, [id, onLayout]);

  return <View onLayout={onLayoutView}>
    {children}
  </View>
}

export const usePrerenderedData = ({data, keyExtractor, renderItem, scrollRef, onUpdateData, getItemLayout}: {
  data: readonly any[];
  keyExtractor: KeyExtractor;
  renderItem: RenderItem
  scrollRef: MutableRefObject<FlatListType>;
  onUpdateData?: OnUpdateData;
  getItemLayout?: FlatListProps<any>['getItemLayout'];
}) => {
  const [finalData, setFinalData] = useState<readonly any[]>([]);
  const [newData, setNewData] = useState<any[]>([]);

  const heightsRef = useRef<Record<string, any>>({});
  const getHeight = useCallback((list: any[], heights= heightsRef.current) => {
    return list.reduce((p, c) => p + heights[keyExtractor(c)], 0)
  }, [keyExtractor]);

  const shift = useCallback((newData: any[], oldHeights: Record<string, number>) => {
    const removedData = [];
    for (const d of finalData) {
      if(!heightsRef.current[keyExtractor(d)]) {
        removedData.push(d);
      } else {
        break;
      }
    }

    const shiftValue = {
      height: -getHeight(removedData, oldHeights),
      offset: 0,
    };
    const index = data.findIndex((d) => d === newData[0]);
    if(index >= 0 && index <= MIN_INDEX) {
      shiftValue.height += getHeight(newData);
      shiftValue.offset = getHeight(data.slice(0, index))
    }
    if(shiftValue.height !== 0) {
      scrollRef.current?.shift(shiftValue);
      onUpdateData?.({heights: heightsRef.current, ...shiftValue});
    }
    setFinalData(data);
  }, [data, finalData, getHeight, keyExtractor, onUpdateData, scrollRef]);

  useEffect(() => {
    if(data === finalData) {
      return;
    }
    if(getItemLayout) {
      const newD = data.filter((d) => !heightsRef.current[keyExtractor(d)]);
      const oldHeights = heightsRef.current;
      heightsRef.current = data.reduce((p,c,i) => {
        p[keyExtractor(c)] = getItemLayout(data as any[], i).length;
        return p;
      }, {});
      shift(newD, oldHeights);
      return;
    }
    setNewData(data.filter((d) => !heightsRef.current[keyExtractor(d)]));
  }, [data, finalData, getHeight, getItemLayout, keyExtractor, onUpdateData, scrollRef, shift]);

  useEffect(() => {
    if(getItemLayout || !newData.length) {
      return;
    }
  }, [newData, getItemLayout]);

  const onLayout = useCallback<OnLayout>(({id, height}) => {
    heightsRef.current[id] = height;
    // check if there are missing elements
    const missing = data.some((d) => heightsRef.current[keyExtractor(d)] === undefined);
    if(missing) {
      return;
    }
    const oldHeights = heightsRef.current;
    // clean current heights (=> remove old heights)
    heightsRef.current = data.reduce((p,c) => {
      const id = keyExtractor(c);
      p[id] = oldHeights[id];
      return p;
    }, {});
    shift(newData, oldHeights);
    setNewData([]);
  }, [data, keyExtractor, newData, shift]);

  return {
    finalData,
    prerender: newData.length ? <View>
      {newData.map((d) => <Prerender key={keyExtractor(d)} id={keyExtractor(d)} onLayout={onLayout}>{renderItem({item: d, prerendering: true})}</Prerender>)}
    </View> : undefined,
    getItemLayoutCustom: useCallback((data, index) => {
      const d = data[index];
      const id = keyExtractor(d);
      return {
        index,
        length: heightsRef.current[id],
        offset: getHeight(data.slice(0, index)),
      }
    }, [getHeight, keyExtractor]),
  };
};
