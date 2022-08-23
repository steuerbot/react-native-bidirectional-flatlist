import React, { forwardRef, MutableRefObject, useCallback, useState } from 'react';
import {
  FlatList as FlatListRN,
  FlatListProps,
  LayoutChangeEvent,
  Platform,
  ScrollViewProps,
  StyleSheet,
  View,
} from 'react-native';
import { ScrollView } from './ScrollView';
import { usePrerenderedData } from './hooks/usePrerenderedData';
import type { FlatListType, OnUpdateData, RenderItem } from './types';

const maintainVisibleContentPosition = { minIndexForVisible: 1 };

const capture = (r: any, ref: MutableRefObject<FlatListType>) => {
  if(!ref) {
    return;
  }
  ref.current = r ? Object.assign(r, {
    shift: (options: {height: number; offset: number}) => {
      r.getNativeScrollRef().shift(options);
    },
  }) : r;
}


const FlatListImpl = forwardRef<FlatListType, FlatListProps<any> & {renderItem: RenderItem, onUpdateData?: OnUpdateData}>((props, ref) => {
  const renderScrollComponent = useCallback((props: ScrollViewProps) => {
    return <ScrollView {...props} />;
  }, []);

  const captureRef = useCallback((r) => capture(r, ref as MutableRefObject<FlatListType>), []);

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
    scrollRef: ref as MutableRefObject<FlatListType>,
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
