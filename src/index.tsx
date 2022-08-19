import {
  requireNativeComponent,
  UIManager,
  Platform,
  ViewStyle,
} from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-bidirectional-flatlist' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

type BidirectionalFlatlistProps = {
  color: string;
  style: ViewStyle;
};

const ComponentName = 'BidirectionalFlatlistView';

export const BidirectionalFlatlistView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<BidirectionalFlatlistProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };
