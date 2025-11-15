export { default as Icon } from './Icon';
export type { IconBaseProps, IconComponentProps } from './Icon';
export { default as createFromIconfontCN } from './createFromIconfontCN';
export type { CustomIconOptions, IconFontProps } from './createFromIconfontCN';
export {
  parseIconsFromScript,
  fetchIconfontScript,
  extractSvgString,
  getSvgStringFromWindow,
  waitForIconfontScript,
} from './utils/parseIcons';
export type { ParsedIcon } from './utils/parseIcons';
