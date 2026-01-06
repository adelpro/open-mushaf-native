import React from 'react';

import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import AndroidWidget from './android';

const nameToWidget = {
  // OpenMushaf will be the **name** with which we will reference our widget.
  OpenMushaf: AndroidWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
      props.renderWidget(<Widget />);
      break;

    case 'WIDGET_UPDATE':
      props.renderWidget(<Widget />);
      break;

    case 'WIDGET_RESIZED':
      props.renderWidget(<Widget />);
      break;

    case 'WIDGET_DELETED':
      // Handle widget deleted (remove widget data if you stored it somewhere)
      break;

    case 'WIDGET_CLICK':
      if (props.clickAction === 'play') {
        props.renderWidget(<Widget status="playing" />);
      } else {
        props.renderWidget(<Widget status="stopped" />);
      }
      break;

    default:
      break;
  }
}
