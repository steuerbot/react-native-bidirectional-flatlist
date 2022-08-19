import React, { forwardRef, MutableRefObject, useCallback } from 'react';
import { FlatList as FlatListRN, FlatListProps, ScrollViewProps } from 'react-native';
import { ScrollView, ShiftFunction } from './ScrollView';

export type FlatListType = typeof FlatListRN & {shift: ShiftFunction};

export const FlatListComponent = forwardRef<FlatListType, FlatListProps<any>>((props, ref) => {
  const renderScrollComponent = useCallback((props: ScrollViewProps) => {
    return <ScrollView {...props} />;
  }, []);

  const captureRef = useCallback((r) => {
    if(!ref) {
      return;
    }
    (ref as MutableRefObject<FlatListType>).current = Object.assign(r, {
      shift: (options: {height: number; offset: number}) => {
        r.getNativeScrollRef().shift(options);
      },
    });
  }, []);

  return <FlatListRN renderScrollComponent={renderScrollComponent} {...props} ref={captureRef} />
})

export const FlatList = FlatListComponent as unknown as FlatListType
