import React, { forwardRef, MutableRefObject, useCallback, useRef, useState } from 'react';
import { FlatList as FlatListRN, LayoutChangeEvent, Platform, ScrollViewProps, StyleSheet, View } from 'react-native';
import { ScrollView } from './ScrollView';
import { usePrerenderedData } from './hooks/usePrerenderedData';
import type { BidirectionalFlatListProps, FlatListType } from './types';

const maintainVisibleContentPosition = { minIndexForVisible: 1 };

const FlatListImpl = forwardRef<FlatListType, BidirectionalFlatListProps>((props, ref) => {
  const renderScrollComponent = useCallback((props: ScrollViewProps) => {
    return <ScrollView {...props} />;
  }, []);

  const capturedRef = useRef<FlatListType>();
  const captureRef = useCallback((r: any) => {
    const obj = r ? Object.assign(r, {
      shift: (options: {height: number; offset: number}) => {
        if(Platform.OS !== 'android') {
          return;
        }
        r.getNativeScrollRef().shift(options);
      },
    }) : r;
    capturedRef.current = obj;
    if(!ref) {
      return;
    }
    if(typeof ref === 'function') {
      ref(obj);
    } else {
      (ref as MutableRefObject<FlatListType>).current = obj;
    }
  }, []);

  // todo add hack to prevent flickering
  const {
    data = [],
    keyExtractor = (item) => item.id,
    renderItem,
    onUpdateData,
  } = props;
  const {finalData, prerender, getItemLayout} = usePrerenderedData({
    data: data ?? [],
    keyExtractor,
    renderItem,
    scrollRef: capturedRef as MutableRefObject<FlatListType>,
    onUpdateData
  });

  const [width, setWidth] = useState<number>();
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    props.onLayout?.(e);
    setWidth(e.nativeEvent.layout.width);
  }, []);

  return <>
    <FlatListRN
      maintainVisibleContentPosition={props.maintainVisibleContentPosition ?? maintainVisibleContentPosition}
      renderScrollComponent={Platform.OS === 'android' ? renderScrollComponent : undefined}
      getItemLayout={getItemLayout}
      {...props}
      onLayout={onLayout}
      data={finalData}
      ref={captureRef} />
    {prerender && !!width && <View style={[styles.prerender, {width}]}>
      {prerender}
    </View>}
  </>
})

const styles = StyleSheet.create({
  prerender: {
    position: 'absolute',
    top: 0,
    left: -10000,
  }
});

export const FlatList = FlatListImpl as unknown as FlatListType
