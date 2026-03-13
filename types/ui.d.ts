/**
 * Props required for rendering a segmented selector supporting disabled tabs.
 */

export interface SegmentedControlProps {
  /** An array of string labels displaying the segment options. */
  options: string[];
  /** Callback notifying parent of the newly selected index position. */
  onSelectionChange: (selectedIndex: number) => void;
  /** Numeric offset representing the active tab on load. */
  initialSelectedIndex?: number;
  /** Thematic highlight background for the active toggle. */
  activeColor?: string;
  /** Non-selected text font color. */
  textColor?: string;
  /** Font color inside an actively toggled component. */
  activeTextColor?: string;
  /** Text color representing the disabled segment. */
  disabledTextColor?: string;
  /** Explicit background color for a disabled button that is active. */
  activeDisabledColor?: string;
}
