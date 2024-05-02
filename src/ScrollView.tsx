// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { Component, forwardRef } from 'react';
import { PixelRatio, Platform, ScrollView as ScrollViewRN, ScrollViewProps, StyleSheet, View } from 'react-native';
import { BidirectionalFlatlist } from './BidirectionalFlatlist';
import type { ShiftFunction } from './types';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ScrollViewRNRaw: Component<ScrollViewProps> = ScrollViewRN.render().type; // hack to get inner type of ScrollView

export class ScrollViewComponent extends ScrollViewRNRaw {
  constructor(props: ScrollViewProps) {
    super(props);
  }

  shift: ShiftFunction = ({ offset, height }: { offset: number; height: number }) => {
    this.getNativeScrollRef().setNativeProps({
      shiftOffset: PixelRatio.getPixelSizeForLayoutSize(offset),
      shiftHeight: PixelRatio.getPixelSizeForLayoutSize(height),
    });
  }

  render() {
    const NativeDirectionalScrollView = BidirectionalFlatlist;
    const NativeDirectionalScrollContentView = View;

    const contentContainerStyle = [this.props.contentContainerStyle];
    // if (__DEV__ && this.props.style !== undefined) {
    // const style = StyleSheet.flatten(this.props.style);
    // const childLayoutProps = ['alignItems', 'justifyContent'].filter(
    //   (prop) => style && style[prop] !== undefined
    // );
    // invariant(
    //   childLayoutProps.length === 0,
    //   'ScrollView child layout (' +
    //     JSON.stringify(childLayoutProps) +
    //     ') must be applied through the contentContainerStyle prop.'
    // );
    // }

    const contentSizeChangeProps =
      this.props.onContentSizeChange == null
        ? null
        : {
          onLayout: this._handleContentOnLayout,
        };

    const { stickyHeaderIndices } = this.props;
    const children = this.props.children;

    const hasStickyHeaders =
      Array.isArray(stickyHeaderIndices) && stickyHeaderIndices.length > 0;

    const contentContainer = (
      <NativeDirectionalScrollContentView
        {...contentSizeChangeProps}
        ref={this._setInnerViewRef}
        style={contentContainerStyle}
        removeClippedSubviews={
          // Subview clipping causes issues with sticky headers on Android and
          // would be hard to fix properly in a performant way.
          Platform.OS === 'android' && hasStickyHeaders
            ? false
            : this.props.removeClippedSubviews
        }
        collapsable={false}
      >
        {children}
      </NativeDirectionalScrollContentView>
    );

    const alwaysBounceHorizontal =
      this.props.alwaysBounceHorizontal !== undefined
        ? this.props.alwaysBounceHorizontal
        : this.props.horizontal;

    const alwaysBounceVertical =
      this.props.alwaysBounceVertical !== undefined
        ? this.props.alwaysBounceVertical
        : !this.props.horizontal;

    const baseStyle = styles.baseVertical;
    const props = {
      ...this.props,
      alwaysBounceHorizontal,
      alwaysBounceVertical,
      style: StyleSheet.compose(baseStyle, this.props.style),
      // Override the onContentSizeChange from props, since this event can
      // bubble up from TextInputs
      onContentSizeChange: null,
      onLayout: this._handleLayout,
      onMomentumScrollBegin: this._handleMomentumScrollBegin,
      onMomentumScrollEnd: this._handleMomentumScrollEnd,
      onResponderGrant: this._handleResponderGrant,
      onResponderReject: this._handleResponderReject,
      onResponderRelease: this._handleResponderRelease,
      onResponderTerminationRequest: this._handleResponderTerminationRequest,
      onScrollBeginDrag: this._handleScrollBeginDrag,
      onScrollEndDrag: this._handleScrollEndDrag,
      onScrollShouldSetResponder: this._handleScrollShouldSetResponder,
      onStartShouldSetResponder: this._handleStartShouldSetResponder,
      onStartShouldSetResponderCapture:
      this._handleStartShouldSetResponderCapture,
      onTouchEnd: this._handleTouchEnd,
      onTouchMove: this._handleTouchMove,
      onTouchStart: this._handleTouchStart,
      onTouchCancel: this._handleTouchCancel,
      onScroll: this._handleScroll,
      scrollEventThrottle: hasStickyHeaders
        ? 1
        : this.props.scrollEventThrottle,
      sendMomentumEvents:
        this.props.onMomentumScrollBegin || this.props.onMomentumScrollEnd
          ? true
          : false,
      // default to true
      snapToStart: this.props.snapToStart !== false,
      // default to true
      snapToEnd: this.props.snapToEnd !== false,
      // pagingEnabled is overridden by snapToInterval / snapToOffsets
      pagingEnabled: Platform.select({
        // on iOS, pagingEnabled must be set to false to have snapToInterval / snapToOffsets work
        ios:
          this.props.pagingEnabled === true &&
          this.props.snapToInterval == null &&
          this.props.snapToOffsets == null,
        // on Android, pagingEnabled must be set to true to have snapToInterval / snapToOffsets work
        android:
          this.props.pagingEnabled === true ||
          this.props.snapToInterval != null ||
          this.props.snapToOffsets != null,
      }),
    };

    // const { decelerationRate } = this.props;
    // if (decelerationRate != null) {
    //   props.decelerationRate = processDecelerationRate(decelerationRate);
    // }

    const scrollViewRef = this._scrollView.getForwardingRef(
      this.props.scrollViewRef,
    );

    return (
      <NativeDirectionalScrollView {...props} maintainVisibleContentPosition={undefined} ref={scrollViewRef}>
        {contentContainer}
      </NativeDirectionalScrollView>
    );
  }
}

const styles = StyleSheet.create({
  baseVertical: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
    overflow: 'scroll',
  },
});

export type ScrollViewType = typeof ScrollViewRN & {shift: (options: {offset: number; height: number}) => void};

export const ScrollView: ScrollViewType = forwardRef<ScrollViewType, ScrollViewProps>((props, ref) => {
  return <ScrollViewComponent {...props} ref={ref} />
});
