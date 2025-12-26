import React from 'react';

import {
  FlexWidget,
  ImageWidget,
  TextWidget,
} from 'react-native-android-widget';

export default function AndroidWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        borderRadius: 16,
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="Open App"
        style={{
          fontSize: 32,
          fontFamily: 'Inter',
          color: '#ffffff',
        }}
      />
    </FlexWidget>
  );
}
