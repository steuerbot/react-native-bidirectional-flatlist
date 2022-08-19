import type { ReactNode } from 'react';
import {
  Platform,
  requireNativeComponent,
  UIManager,
  ViewStyle,
} from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-bidirectional-flatlist' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

type BidirectionalFlatlistProps = {
  style: ViewStyle;
  children: ReactNode;
};

const ComponentName = 'BidirectionalFlatlist';

export const BidirectionalFlatlist =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<BidirectionalFlatlistProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };
