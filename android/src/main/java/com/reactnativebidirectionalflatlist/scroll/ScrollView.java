package com.reactnativebidirectionalflatlist.scroll;

import android.content.Context;
import android.util.Log;
import android.view.ContentInfo;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.views.scroll.ReactScrollView;

public class ScrollView extends ReactScrollView {

  protected double mShiftHeight = 0;
  protected double mShiftOffset = 0;

  public ScrollView(Context context) {
    super(context, null);
  }

  public void setShiftHeight(double shiftHeight) {
    mShiftHeight = shiftHeight;
    Log.d("ScrollView", "set shiftHeight " + shiftHeight);
  }

  public void setShiftOffset(double shiftOffset) {
    mShiftOffset = shiftOffset;
    Log.d("ScrollView", "set shiftOffset " + shiftOffset);
  }

  @Override
  public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight, int oldBottom) {
    super.onLayoutChange(v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom);
    Log.d("ScrollView", "on layout change");
    if(mShiftHeight != 0) {
      Log.d("ScrollView", "shift by " + mShiftHeight);
      Log.d("ScrollView", "y: " + getScrollY());
      scrollTo(0, getScrollY() + (int)mShiftHeight);
      Log.d("ScrollView", "y: " + getScrollY());
      mShiftHeight = 0;
      mShiftOffset = 0;
    }
  }
}
