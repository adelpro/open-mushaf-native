'use no memo';
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
        backgroundColor: '#112344',
        borderRadius: 16,
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget
        style={{
          height: 'wrap_content',
          width: 'match_parent',
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'flex_start',
          paddingHorizontal: 8,
          borderRadius: 16,
        }}
      >
        <ImageWidget
          image={require('../assets/widgets/widget-preview.png')}
          imageWidth={88}
          imageHeight={88}
        />
        <TextWidget
          text="Open Mushaf - Open App"
          style={{
            fontSize: 32,
            fontFamily: 'Tajawal_400Regular',
            color: '#ffffff',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
