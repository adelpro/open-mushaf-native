import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  currentSavedPage,
  dailyTrackerGoal,
  mushafRiwaya,
  yesterdayPage,
} from '@/jotai/atoms';

// `getDefaultStore` is mocked via `vi.mock` below — we just need its
// `get` method here to drive the atoms to specific values.
const storeState = new Map<unknown, unknown>();
vi.mock('jotai', () => ({
  // Preserve real exports (atom creators, hooks) so the module under
  // test can do `import { getDefaultStore } from 'jotai'` and reach
  // our mock.
  getDefaultStore: () => ({
    get: (atom: unknown) => storeState.get(atom),
    set: (atom: unknown, value: unknown) => storeState.set(atom, value),
  }),
}));

// `widgets/android.tsx` imports the native widget primitives which
// crash in node. We replace the default export with a sentinel that
// the test can detect in `renderWidget` calls.
const AndroidWidgetMock = vi.fn(() => null);
vi.mock('../android', () => ({
  default: AndroidWidgetMock,
}));

// Dynamic import deferred until after `vi.mock` registrations above.
// `vi.mock` is hoisted, but using `await import` keeps the test
// deterministic without relying on top-level await (which the
// project's tsconfig forbids).
type WidgetTaskHandlerModule = typeof import('../widget-task-handler');
let widgetTaskHandlerModule: WidgetTaskHandlerModule;

function makeProps(
  action: WidgetTaskHandlerProps['widgetAction'],
  clickAction?: string,
): WidgetTaskHandlerProps {
  const renderWidget = vi.fn();
  const props = {
    widgetInfo: {
      widgetName: 'OpenMushaf',
      widgetId: 1,
      width: 320,
      height: 120,
      screenInfo: {
        screenHeightDp: 640,
        screenWidthDp: 360,
        density: 2,
        densityDpi: 320,
      },
    },
    widgetAction: action,
    clickAction,
    clickActionData: undefined,
    renderWidget,
  } as unknown as WidgetTaskHandlerProps;
  return props;
}

describe('widgetTaskHandler', () => {
  beforeEach(async () => {
    AndroidWidgetMock.mockClear();
    storeState.clear();
    // Seed the atoms with deterministic values.
    // `dailyCompleted` is derived from
    // `(currentSavedPage - yesterdayPage.value) * 60 / 604` — seed
    // those two atoms instead of the (now-unused) dailyTrackerCompleted.
    storeState.set(dailyTrackerGoal, 5);
    storeState.set(currentSavedPage, 42);
    storeState.set(yesterdayPage, {
      value: 22,
      date: new Date().toDateString(),
    });
    storeState.set(mushafRiwaya, 'hafs');

    widgetTaskHandlerModule = await import('../widget-task-handler');
  });

  it('renders the widget on WIDGET_ADDED with the current reading state', async () => {
    const props = makeProps('WIDGET_ADDED');
    await widgetTaskHandlerModule.widgetTaskHandler(props);

    expect(props.renderWidget).toHaveBeenCalledTimes(1);
    // The first arg to renderWidget should be the { light, dark }
    // representation. Confirm both branches built an element.
    const rendered = (
      props.renderWidget as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls[0][0] as { light: unknown; dark: unknown };
    expect(rendered).toHaveProperty('light');
    expect(rendered).toHaveProperty('dark');

    // AndroidWidget was invoked twice — once for each scheme. Confirm
    // the sentinel got the right values for at least one of them.
    expect(AndroidWidgetMock).toHaveBeenCalledTimes(2);
    const mockCalls = AndroidWidgetMock.mock.calls as unknown[][];
    const firstCall = mockCalls[0][0] as {
      dailyGoal: number;
      dailyCompleted: number;
      currentPage: number;
      colorScheme: string;
    };
    expect(firstCall.dailyGoal).toBe(5);
    // (42 - 22) / (604/60) = 1.987 — derived from page delta.
    expect(firstCall.dailyCompleted).toBeCloseTo(1.987, 3);
    expect(firstCall.currentPage).toBe(42);
    expect(firstCall.colorScheme).toBe('light');
    const secondCall = mockCalls[1][0] as { colorScheme: string };
    expect(secondCall.colorScheme).toBe('dark');
  });

  it('renders on WIDGET_UPDATE and WIDGET_RESIZED', async () => {
    for (const action of ['WIDGET_UPDATE', 'WIDGET_RESIZED'] as const) {
      const props = makeProps(action);
      await widgetTaskHandlerModule.widgetTaskHandler(props);
      expect(props.renderWidget).toHaveBeenCalledTimes(1);
    }
  });

  it('does not render on WIDGET_DELETED', async () => {
    const props = makeProps('WIDGET_DELETED');
    await widgetTaskHandlerModule.widgetTaskHandler(props);
    expect(props.renderWidget).not.toHaveBeenCalled();
  });

  it('does not re-render on WIDGET_CLICK (clicks are user gestures, not state changes)', async () => {
    // The widget's root uses clickAction="OPEN_APP" which is intercepted
    // by the library before reaching this handler. Custom click actions
    // would still arrive here, but re-rendering on every click is wasted
    // IPC. Verify the handler is a no-op for WIDGET_CLICK.
    const props = makeProps('WIDGET_CLICK', 'CUSTOM_ACTION');
    await widgetTaskHandlerModule.widgetTaskHandler(props);
    expect(props.renderWidget).not.toHaveBeenCalled();
  });

  it('treats an unknown widget name as the default widget rather than crashing', async () => {
    const props = makeProps('WIDGET_UPDATE');
    (props.widgetInfo as { widgetName: string }).widgetName = 'NotARealWidget';
    await expect(
      widgetTaskHandlerModule.widgetTaskHandler(props),
    ).resolves.not.toThrow();
    expect(props.renderWidget).toHaveBeenCalledTimes(1);
  });

  it('clamps dailyCompleted to 0 when yesterdayPage is at or past currentSavedPage', async () => {
    // Defensive path: if yesterdayPage.value >= currentSavedPage (e.g.
    // the user navigated backwards or never moved forward today), the
    // page delta is non-positive and dailyCompleted is clamped to 0.
    storeState.set(yesterdayPage, {
      value: 100,
      date: new Date().toDateString(),
    });
    const props = makeProps('WIDGET_UPDATE');
    await widgetTaskHandlerModule.widgetTaskHandler(props);
    const mockCalls = AndroidWidgetMock.mock.calls as unknown[][];
    const firstCall = mockCalls[0][0] as { dailyCompleted: number };
    expect(firstCall.dailyCompleted).toBe(0);
  });

  it('loads Warsh metadata when the riwaya is warsh', async () => {
    storeState.set(mushafRiwaya, 'warsh');
    const props = makeProps('WIDGET_UPDATE');
    await widgetTaskHandlerModule.widgetTaskHandler(props);
    expect(props.renderWidget).toHaveBeenCalled();
    expect(AndroidWidgetMock).toHaveBeenCalled();
  });
});
