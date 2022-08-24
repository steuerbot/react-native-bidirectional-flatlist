import type { ReactNode } from 'react';
import type { FlatList as FlatListRN, FlatListProps } from 'react-native';

export type RenderItem = <T>(options: {item: T; prerendering?: boolean}) => ReactNode;
export type OnUpdateData = (options: {heights: Record<string, number>; offset: number; height: number}) => void;

export type ShiftFunction = ({ offset, height }: { offset: number; height: number }) => void;

export type FlatListType = typeof FlatListRN & {shift: ShiftFunction};

export type BidirectionalFlatListProps = FlatListProps<any> & {renderItem: RenderItem, onUpdateData?: OnUpdateData};

