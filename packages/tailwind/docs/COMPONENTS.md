# Component Variables Documentation

本文档列出了所有需要实现的组件及其变量定义。这些变量将用于生成 Tailwind CSS 配置，供组件开发时直接使用。

## 组件列表

### 1. Common (通用变量)

- `themeColor`, `themeColor1`
- `borderRedius`
- `successColor`, `warnColor`
- `primaryTextColor`, `secondaryTextColor`, `thirdlyTextColor`
- `divideColor`
- `disabledBgColor`, `activeDisabledBgColor`
- `borderColor`, `hoverBorderColor`
- `animationDisplay`
- `disabledTextColor`, `hintTextColor`, `placeholderColor`
- `boxShadowColor`, `trackColor`, `activeBoxShadow`

### 2. Icon (图标)

- `color`, `hoverColor`

### 3. DangerColor (危险色)

- `color`, `hoverColor`, `activeColor`

### 4. FontSize (字体大小)

- `small`, `medium`, `large`

### 5. Height (高度)

- `small`, `medium`, `large`

### 6. LinkColor (链接颜色)

- `color`, `hoverColor`, `activeColor`, `disabledColor`

### 7. Input (输入框)

- `inputColors`: `color`, `disabledColor`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `errorBorderColor`, `warningBorderColor`, `successBorderColor`, `validatingBorderColor`, `disabledBorderColor`, `bgColor`, `hoverBgColor`, `activeBgColor`, `disabledBgColor`
- `suffixInfoColor`
- `padding`: `small`, `medium`, `large`
- `fontSize`: `small`, `medium`, `large`
- `height`: `small`, `medium`, `large`
- `addonColors`: `color`, `bgColor`, `borderColor`
- `IconClearColors`: `color`, `hoverColor`
- `placeholderColor`
- `suffixOrPrefixColor`

### 8. Button (按钮)

- `primary`: `disabledBgColor`, `disabledBorderColor`, `disabledColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`, `activeDisabledColor`, `color`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `bgColor`, `hoverBgColor`, `activeBgColor`, `fontWeight`
- `secondary`: `disabledBgColor`, `disabledBorderColor`, `disabledColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`, `activeDisabledColor`, `color`, `hoverColor`, `activeColor`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `bgColor`, `fontWeight`
- `gray`: `disabledBgColor`, `disabledBorderColor`, `disabledColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`, `activeDisabledColor`, `color`, `hoverColor`, `activeColor`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `bgColor`
- `danger`: `disabledBgColor`, `disabledBorderColor`, `disabledColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`, `activeDisabledColor`, `color`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `bgColor`, `hoverBgColor`, `activeBgColor`, `fontWeight`
- `secondaryDanger`: `disabledBgColor`, `disabledBorderColor`, `disabledColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`, `activeDisabledColor`, `color`, `hoverColor`, `activeColor`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `bgColor`
- `grayDanger`: `disabledBgColor`, `disabledBorderColor`, `disabledColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`, `activeDisabledColor`, `color`, `hoverColor`, `activeColor`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `bgColor`
- `textPrimary`: `disabledColor`, `color`, `hoverColor`, `activeColor`
- `text`: `color`, `hoverColor`, `activeColor`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `borderStyle`, `disabledColor`, `disabledBorderColor`
- `textTip`: `color`, `hoverColor`, `activeColor`, `disabledColor`, `disabledBorderColor`
- `fontSize`: `small`, `medium`, `large`
- `paddingBtn`: `small`, `medium`, `large`
- `height`: `small`, `medium`, `large`
- `buttonGap`

### 9. Badge (徽章)

- `count`: `color`, `bgColor`

### 10. Breathe (呼吸效果)

- `bgColor`
- `wave`: `width`

### 11. Card (卡片)

- `card`: `border`, `hoverBorder`, `borderRadius`
- `divideLineColor`
- `header`: `height`, `lineHeight`, `fontSize`, `fontWeight`, `padding`
- `disabled`: `background`
- `checked`: `border`, `disabledBgColor`

### 12. Breadcrumb (面包屑)

- `fontSize`
- `normalColor`, `hoverColor`, `clickColor`, `activeColor`
- `separatorColor`
- `activeWeight`
- `separatorMargin`

### 13. Checkbox (复选框)

- `checkboxButtonMode`: `borderColor`, `hoverBorderColor`, `activeBorderColor`, `bgColor`, `activeDisabledColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`
- `buttonGhostTagMode`: `activeColor`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `bgColor`, `activeDisabledColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`
- `buttonTagMode`: `color`, `hoverColor`, `borderColor`, `hoverBorderColor`, `activeColor`, `activeBorderColor`, `bgColor`, `activeBgColor`, `activeDisabledColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`
- `groupDisabled`: `disabledBgColor`, `disabledBorderColor`, `disabledColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`, `activeDisabledColor`
- `textColors`: `color`, `disabledColor`
- `squareTextGap`: `small`, `medium`, `large`
- `squareFontSize`: `small`, `medium`, `large`
- `checkboxGap`: `small`, `medium`, `large`
- `buttonCheckboxGap`: `small`, `medium`, `large`
- `indeterminateSize`: `small`, `medium`, `large`
- `columnButtonPadding`: `small`, `medium`, `large`
- `columnSquareTextGap`: `small`, `medium`, `large`
- `columnCheckboxGap`: `small`, `medium`, `large`
- `columnButtonCheckboxGap`: `small`, `medium`, `large`
- `buttonCheckboxPadding`: `small`, `medium`, `large`
- `buttonPadding`: `small`, `medium`, `large`

### 14. Radio (单选框)

- `radioButtonMode`: `hoverBorderColor`, `activeBorderColor`, `bgColor`, `activeDisabledColor`, `activeDisabledBgColor`, `activeDisabledBorderColor`
- `tabGhostMode`: `hoverColor`, `activeColor`, `activeBorderColor`, `bgColor`, `activeDisabledColor`, `activeDisabledBgColor`, `activeDisabledBorderColor`
- `tabMode`: `hoverColor`, `activeColor`, `activeBorderColor`, `bgColor`, `activeBgColor`, `activeDisabledColor`, `activeDisabledBgColor`, `activeDisabledBorderColor`
- `buttonGhostTagMode`: `activeColor`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `bgColor`, `activeDisabledColor`, `activeDisabledBgColor`, `activeDisabledBorderColor`
- `buttonTagMode`: `color`, `hoverColor`, `activeColor`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `bgColor`, `activeBgColor`, `activeDisabledColor`, `activeDisabledBgColor`, `activeDisabledBorderColor`
- `groupDisabled`: `disabledBgColor`, `activeDisabledBorderColor`, `activeDisabledBgColor`
- `circleColors`: `color`, `hoverColor`, `activeColor`, `disabledColor`, `activeDisabledColor`, `bgColor`, `disabledBgColor`, `activeDisabledBgColor`
- `circleTextGap`: `small`, `medium`, `large`
- `columnButtonRadioGap`: `small`, `medium`, `large`

### 15. Tab (标签页)

- `capsuleType`: `borderRadius`, `bgColor`, `activeBorderColor`, `border`, `activeDisabledBorderColor`, `activeDisabledBgColor`, `activeDisabledColor`, `padding`, `fontSize`
- `reunitType`: `border`, `hoverBgColor`, `activeBorderTopColor`, `padding`, `fontSize`, `activeBorderColor`
- `cardType`: `disabledColor`, `disabledBgColor`, `padding`, `fontSize`
- `lineType`: `padding`, `fontSize`, `labelPadding`, `activeBelowLabelLineHeight`
- `textColors`: `hoverColor`, `activeColor`, `disabledColor`
- `turnerColor`: `color`, `hoverColor`, `disabledColor`, `fontSize`, `paddingLeft`
- `addIconVariables`: `color`, `border`, `hoverColor`, `hoverBorderColor`, `borderRadius`, `padding`, `fontSize`
- `topLineBelow`: `height`, `color`
- `activeFontWeight`
- `rightNodeMarginLeft`
- `borderWidth`

### 16. Portal (传送门/弹出层)

- `lineHeight`
- `boxShadow`
- `borderredius`
- `border`
- `arrow`: `topBoxShadow`, `leftBoxShadow`, `rightBoxShadow`, `bottomBoxShadow`

### 17. Popover (气泡卡片)

- `padding`
- `title`: `fontSize`, `fontWeight`, `lineHeight`, `marginBottom`, `color`
- `icon`: `padding`, `fontSize`
- `withConfirm`: `noTitleColor`, `noTitleFontSize`, `noTitleMarginTop`, `padding`, `minWidth`
- `withTitleContentFontSize`
- `withTitleContentColor`
- `withTitleIconPadding`
- `footerMarginTop`
- `operationButtonFontSize`
- `operationButtonHeight`
- `contentFontSize`
- `contentColor`

### 18. Switch (开关)

- `small`: `width`, `height`, `circlePadding`, `circleWidth`, `loadingIconHeight`
- `medium`: `width`, `height`, `circleWidth`, `loadingIconHeight`, `circlePadding`
- `switch`: `bgColor`, `disabledBgColor`, `activeBgColor`, `activeHoverBgColor`, `activeDisabledBgColor`
- `circle`: `bgColor`, `disabledBgColor`, `activeDisabledBgColor`
- `loading`: `color`, `activeColor`

### 19. RangePicker (日期范围选择器)

- `iconClear`: `color`, `hoverColor`
- `iconCalendarColor`
- `tableCell`: `color`, `borderColor`, `todayColor`, `todayBorderColor`, `activeColor`, `activeBgColor`, `activeBorderColor`, `disabledTodayBorderColor`, `disabledColor`, `outOfMonthColor`
- `tableCellInRange`: `disabledBgColor`, `bgColor`
- `divideLineColor`

### 20. NoticeBar (通知栏)

- `color`
- `outerWrapperPadding`
- `outerWrapperBorderRadius`
- `warnWrapperBorder`, `warnWrapperBgColor`, `warnIconColor`
- `infoWrapperBorder`, `infoWrapperBgColor`, `infoIconColor`
- `successWrapperBorder`, `successWrapperBgColor`, `successIconColor`
- `errorWrapperBorder`, `errorWrapperBgColor`, `errorIconColor`
- `doingWrapperBorder`, `doingWrapperBgColor`, `doingIconColor`
- `iconCloseMarginLeft`
- `iconCloseColor`, `iconCloseHoverColor`
- `iconTypeMarginRight`
- `iconFontSize`
- `contentSize`
- `iconCloseFontSize`

### 21. Modal (对话框)

- `borderRadius`
- `bgColor`
- `minWidth`
- `innerOverflowY`
- `headerPadding`
- `headerBg`
- `headerColor`
- `showCloseIconHeaderPaddingRight`
- `headerSeparatorColor`
- `headerFontSize`
- `headerFontWeight`
- `closeIconRight`
- `closeIconTop`
- `closeIconColor`
- `closeIconFontSize`
- `closeIconHoverColor`
- `bodyPadding`
- `bodyLineHeight`
- `bodyFontSize`
- `maskBgColor`
- `operationGutter`
- `operationLeft`
- `operationRight`
- `footerBottom`
- `footerTextAlign`
- `alertFooterTextAlign`
- `boxShadow`

### 22. Table (表格)

- `borderRadius`
- `fontSize`: `small`, `medium`, `large`
- `borderColor`
- `lineHeight`
- `theadBgColor`
- `theadColor`
- `theadLineHeight`
- `thFontWeight`
- `tdFontWeight`
- `thBorderRight`
- `thBorderBottom`
- `thPadding`
- `tbodyFontSize`
- `tdPadding`
- `tdBorderRight`
- `tdBorderBottom`
- `trDisabledOpacity`
- `innerLeftBorderWidth`
- `innerMiddleBorder`
- `innerMiddleBorderBottom`
- `innerRightBorderWidth`
- `trHoverBgColor`
- `greyRowBgColor`
- `whiteRowBgColor`

### 23. Pagination (分页)

- `borderColor`
- `activeHoverColor`
- `activeHoverBorderColor`
- `prevNextBorderColor`
- `pagerItemColor`
- `pagerItemActiveBorderColor`
- `pagerItemActiveBgColor`
- `pagerItemActiveColor`
- `hoverColor`
- `hoverBorderColor`
- `slashMargin`
- `simplePagerMarginRight`
- `arrowColor`
- `jumpRightMarginRight`
- `disabledBorderColor`
- `disabledArrowColor`
- `height`: `small`, `medium`, `large`
- `inputPaddingRight`

### 24. Select (选择器)

- `fontSize`: `small`, `medium`, `large`
- `minHeight`: `small`, `medium`, `large`
- `iconFontSize`: `small`, `medium`, `large`
- `inputPadding`: `small`, `medium`, `large`
- `inputHeight`: `small`, `medium`, `large`
- `itemHeight`: `small`, `medium`, `large`
- `dropdown`: `fontSize`, `borderColor`, `boxShadow`, `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`
- `dropdownItem`: `color`, `activeColor`, `activeFontWeight`, `activeBgColor`, `hoverBgColor`, `disabledBgColor`, `disabledColor`, `padding`
- `head`: `focusBoxShadowColor`
- `status`: `notFoundBgColor`, `refreshColor`, `color`

### 25. Cropper (裁剪器)

- `cropSize`: `width`, `padding`, `height`, `lineHeight`

### 26. Rate (评分)

- `iconEmptyColor`

### 27. Slider (滑块)

- `rail`: `height`, `bgColor`, `hoverBgColor`, `disabledBgColor`, `borderRadius`
- `track`: `bgColor`, `hoverBgColor`, `disabledBgColor`
- `handle`: `width`, `borderColor`, `hoverBorderColor`, `clickBorderColor`, `disabledBorderColor`
- `dot`: `borderColor`, `activeBorderColor`

### 28. Transfer (穿梭框)

- `color`
- `fontSize`
- `lineHeight`
- `itemBorderRadius`
- `itemWidth`
- `itemHeight`
- `itemBorder`
- `itemPaddingTop`
- `itemDisabledBgColor`
- `itemHeaderPadding`
- `itemHeaderColor`
- `itemHeaderBgColor`
- `itemHeaderBorderBottom`
- `itemFooterBorderTop`
- `listItemPadding`
- `listItemHoverBgColor`
- `listItemActiveBgColor`
- `listItemDisabledColor`

### 29. Upload (上传)

- `text`: `padding`, `margin`, `fontSize`, `hoverBgColor`
- `textName`: `padding`, `color`, `lineHeight`
- `textDeleteIcon`: `color`, `hoverColor`
- `pictureList`: `marginRight`

### 30. groupListItem (分组列表项)

- `hoverBgColor`
- `activeBgColor`
- `disabledBgColor`
- `color`
- `disabledColor`
- `activeFontWeight`
- `padding`: `small`, `medium`, `large`
- `fontSize`
- `lineHeight`
- `activeDisabled`: `fontWeight`, `color`, `background`

### 31. groupDisabled (分组禁用)

- `disabledBorderColor`
- `disabledBgColor`
- `disabledColor`
- `activeDisabledBorderColor`
- `activeDisabledBgColor`
- `activeDisabledColor`

## 使用说明

这些变量将在生成 Tailwind 配置时被处理，组件开发时可以直接使用对应的 className，例如：

- `Button.primary.bgColor` → `bg-button-primary-bgColor`
- `Input.height.small` → `h-input-height-small`
- `Card.header.padding` → `p-card-header-padding`

变量名会转换为 kebab-case 格式，并添加组件前缀以便区分。
