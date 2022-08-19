package com.reactnativebidirectionalflatlist;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.views.scroll.ReactScrollViewManager;
import com.reactnativebidirectionalflatlist.scroll.ScrollView;

public class BidirectionalFlatlistManager extends ReactScrollViewManager {
    public static final String REACT_CLASS = "BidirectionalFlatlist";

    @Override
    @NonNull
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    @NonNull
    public ScrollView createViewInstance(ThemedReactContext reactContext) {
        return new ScrollView(reactContext);
    }

    @ReactProp(name = "shiftHeight")
    public void setShiftHeight(ScrollView view, double shiftHeight) {
       view.setShiftHeight(shiftHeight);
    }

    @ReactProp(name = "shiftOffset")
    public void setShiftOffset(ScrollView view, double shiftOffset) {
      view.setShiftOffset(shiftOffset);
    }
}
