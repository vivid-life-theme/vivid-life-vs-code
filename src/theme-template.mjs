// Maps Vivid Life foundation tokens to a VS Code color theme.
// One pure function: (flavor, variant, tokens) -> theme JSON object.

const ALPHA = {
  a10: "1a",
  a15: "26",
  a20: "33",
  a25: "40",
  a30: "4d",
  a40: "66",
  a50: "80",
  a60: "99",
  a70: "b3",
  a90: "e6",
};

function withAlpha(hex, alpha) {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  if (clean.length !== 6) {
    throw new Error(`withAlpha expects 6-digit hex, got "${hex}"`);
  }
  return `#${clean}${alpha}`;
}

function resolveAccent(tokens, flavor, variant) {
  const shade = tokens.accent_shade[flavor][variant];
  return tokens.palette[variant][shade];
}

function bracketColors(tokens, flavor) {
  return tokens.variant_hues.map((hue) => {
    const shade = tokens.accent_shade[flavor][hue];
    return tokens.palette[hue][shade];
  });
}

function buildWorkbenchColors(tokens, flavor, variant) {
  const f = tokens.flavors[flavor];
  const { surface, text, border, state, semantic, ansi } = f;
  const isDark = f.type === "dark";
  const accent = resolveAccent(tokens, flavor, variant);
  const accentOn = isDark
    ? tokens.palette.gray["900"]
    : tokens.palette.gray["100"];
  const subtleAlpha = isDark ? ALPHA.a30 : ALPHA.a40;

  // Debug-state background must differ from accent so the debug bar (and the
  // accent-colored remote chip sitting on it) don't dissolve. For yellow/orange
  // variants the default semantic.warning would collide; use semantic.danger
  // there instead. Foreground (accentOn) contrasts cleanly against either.
  const debugBg =
    variant === "yellow" || variant === "orange"
      ? semantic.danger
      : semantic.warning;

  return {
    // base
    foreground: text.fg,
    "icon.foreground": text.fg_muted,
    descriptionForeground: text.fg_subtle,
    errorForeground: semantic.danger,
    focusBorder: accent,
    "widget.shadow": surface.bg_scrim,
    "selection.background": withAlpha(accent, ALPHA.a25),

    // window
    "window.activeBorder": border.default,
    "window.inactiveBorder": border.subtle,

    // editor
    "editor.background": surface.bg,
    "editor.foreground": text.fg,
    "editorLineNumber.foreground": text.fg_subtle,
    "editorLineNumber.activeForeground": text.fg,
    "editor.lineHighlightBackground": state.hover,
    "editor.lineHighlightBorder": "#00000000",
    "editor.selectionBackground": withAlpha(accent, ALPHA.a25),
    "editor.selectionHighlightBackground": withAlpha(accent, ALPHA.a15),
    "editor.inactiveSelectionBackground": withAlpha(accent, ALPHA.a15),
    // Word highlight (symbol-occurrences-at-cursor) uses cyan — palette-reserved
    // outside variant_hues so it never collides with the selection accent.
    // Two alphas distinguish read vs write access.
    "editor.wordHighlightBackground": withAlpha(
      tokens.palette.cyan[isDark ? "500" : "700"],
      ALPHA.a25,
    ),
    "editor.wordHighlightStrongBackground": withAlpha(
      tokens.palette.cyan[isDark ? "300" : "900"],
      ALPHA.a40,
    ),
    // findMatch uses semantic.warning so the cursored match stands out
    // against accent-tinted selection (which would otherwise collapse).
    "editor.findMatchBackground": withAlpha(semantic.warning, ALPHA.a40),
    "editor.findMatchHighlightBackground": withAlpha(accent, ALPHA.a20),
    "editor.findRangeHighlightBackground": withAlpha(accent, ALPHA.a10),
    "editor.hoverHighlightBackground": withAlpha(accent, ALPHA.a15),
    "editor.rangeHighlightBackground": state.hover,
    "editor.symbolHighlightBackground": withAlpha(accent, ALPHA.a20),
    "editorCursor.foreground": accent,
    "editorWhitespace.foreground": text.fg_disabled,
    "editorIndentGuide.background1": border.subtle,
    "editorIndentGuide.activeBackground1": border.default,
    "editorRuler.foreground": border.subtle,
    "editorCodeLens.foreground": text.fg_subtle,
    "editorBracketMatch.background": withAlpha(accent, ALPHA.a20),
    "editorBracketMatch.border": accent,
    "editorOverviewRuler.border": border.subtle,
    "editorOverviewRuler.findMatchForeground": withAlpha(accent, ALPHA.a60),
    "editorOverviewRuler.rangeHighlightForeground": withAlpha(
      accent,
      ALPHA.a40,
    ),
    "editorOverviewRuler.selectionHighlightForeground": withAlpha(
      accent,
      ALPHA.a40,
    ),
    "editorOverviewRuler.wordHighlightForeground": withAlpha(accent, ALPHA.a40),
    "editorOverviewRuler.modifiedForeground": semantic.info,
    "editorOverviewRuler.addedForeground": semantic.success,
    "editorOverviewRuler.deletedForeground": semantic.danger,
    "editorOverviewRuler.errorForeground": semantic.danger,
    "editorOverviewRuler.warningForeground": semantic.warning,
    "editorOverviewRuler.infoForeground": semantic.info,
    "editorOverviewRuler.bracketMatchForeground": accent,
    "editorError.foreground": semantic.danger,
    "editorWarning.foreground": semantic.warning,
    "editorInfo.foreground": semantic.info,
    "editorHint.foreground": text.fg_subtle,
    "editorLink.activeForeground": accent,
    "editorUnnecessaryCode.opacity": "#00000099",

    // editor gutter
    "editorGutter.background": surface.bg,
    "editorGutter.modifiedBackground": semantic.info,
    "editorGutter.addedBackground": semantic.success,
    "editorGutter.deletedBackground": semantic.danger,

    // Bracket pair colorization. Level 1 (outermost) is neutral text.fg so the
    // most-common pair doesn't shout; levels 2-6 cycle the variant hues. Purple
    // is dropped from the rotation (it's the keyword color and would collide).
    ...(() => {
      const colors = bracketColors(tokens, flavor);
      return {
        "editorBracketHighlight.foreground1": text.fg,
        "editorBracketHighlight.foreground2": colors[0],
        "editorBracketHighlight.foreground3": colors[1],
        "editorBracketHighlight.foreground4": colors[2],
        "editorBracketHighlight.foreground5": colors[3],
        "editorBracketHighlight.foreground6": colors[4],
        "editorBracketHighlight.unexpectedBracket.foreground": semantic.danger,
      };
    })(),

    // editor groups & tabs
    "editorGroup.border": border.subtle,
    "editorGroup.emptyBackground": surface.bg_sunk,
    "editorGroupHeader.tabsBackground": surface.bg_sunk,
    "editorGroupHeader.tabsBorder": border.subtle,
    "editorGroupHeader.noTabsBackground": surface.bg_sunk,
    "tab.activeBackground": surface.bg,
    "tab.activeForeground": text.fg,
    "tab.activeBorder": "#00000000",
    "tab.activeBorderTop": accent,
    "tab.inactiveBackground": surface.bg_sunk,
    "tab.inactiveForeground": text.fg_subtle,
    "tab.unfocusedActiveForeground": text.fg_muted,
    "tab.unfocusedInactiveForeground": text.fg_subtle,
    "tab.border": border.subtle,
    "tab.hoverBackground": surface.bg_soft,
    "tab.hoverForeground": text.fg,
    "tab.unfocusedHoverBackground": surface.bg_soft,
    "tab.activeModifiedBorder": semantic.warning,
    "tab.inactiveModifiedBorder": semantic.warning,

    // activity bar
    "activityBar.background": surface.bg_sunk,
    "activityBar.foreground": text.fg,
    "activityBar.inactiveForeground": text.fg_subtle,
    "activityBar.activeBorder": withAlpha(accent, ALPHA.a90),
    "activityBar.activeBackground": state.hover,
    "activityBar.border": border.subtle,
    "activityBarBadge.background": accent,
    "activityBarBadge.foreground": accentOn,

    // sidebar
    "sideBar.background": surface.bg_sunk,
    "sideBar.foreground": text.fg_muted,
    "sideBar.border": border.subtle,
    "sideBar.dropBackground": state.active,
    "sideBarTitle.foreground": text.fg,
    "sideBarSectionHeader.background": surface.bg,
    "sideBarSectionHeader.foreground": text.fg_muted,
    "sideBarSectionHeader.border": border.subtle,

    // status bar — neutral body so VS Code's own state signals (debugging
    // background, error/warning chips) stand out clearly. Folder-open is
    // signaled by a thin accent strip along the top edge via statusBar.border;
    // statusBar.noFolderBorder kills the strip when no folder is open.
    "statusBar.background": surface.bg_sunk,
    "statusBar.foreground": text.fg,
    "statusBar.border": accent,
    "statusBar.noFolderBackground": surface.bg_sunk,
    "statusBar.noFolderForeground": text.fg,
    "statusBar.noFolderBorder": border.subtle,
    "statusBar.debuggingBackground": debugBg,
    "statusBar.debuggingForeground": accentOn,
    "statusBar.debuggingBorder": border.subtle,
    "statusBarItem.activeBackground": isDark ? "#ffffff26" : "#00000026",
    "statusBarItem.hoverBackground": isDark ? "#ffffff1a" : "#0000001a",
    "statusBarItem.prominentBackground": isDark ? "#00000033" : "#00000014",
    "statusBarItem.prominentHoverBackground": isDark
      ? "#00000066"
      : "#00000026",
    "statusBarItem.remoteBackground": surface.bg_sunk,
    "statusBarItem.remoteForeground": text.fg,
    "statusBarItem.errorBackground": semantic.danger,
    "statusBarItem.errorForeground": accentOn,
    "statusBarItem.warningBackground": semantic.warning,
    "statusBarItem.warningForeground": accentOn,

    // title bar
    "titleBar.activeBackground": surface.bg_sunk,
    "titleBar.activeForeground": text.fg,
    "titleBar.inactiveBackground": surface.bg_sunk,
    "titleBar.inactiveForeground": text.fg_subtle,
    "titleBar.border": border.subtle,

    // menubar / menu
    "menubar.selectionBackground": state.hover,
    "menubar.selectionForeground": text.fg,
    "menubar.selectionBorder": "#00000000",
    "menu.background": surface.bg_overlay,
    "menu.foreground": text.fg,
    "menu.selectionBackground": state.selection,
    "menu.selectionForeground": text.fg,
    "menu.selectionBorder": "#00000000",
    "menu.separatorBackground": border.subtle,
    "menu.border": border.default,

    // buttons
    "button.background": accent,
    "button.foreground": accentOn,
    "button.hoverBackground": withAlpha(accent, ALPHA.a90),
    "button.secondaryBackground": surface.bg_overlay,
    "button.secondaryForeground": text.fg,
    "button.secondaryHoverBackground": surface.bg_soft,
    "button.border": border.default,
    "checkbox.background": surface.bg_overlay,
    "checkbox.foreground": text.fg,
    "checkbox.border": border.default,
    "checkbox.selectBackground": accent,
    "checkbox.selectBorder": accent,

    // inputs
    "input.background": surface.bg_overlay,
    "input.foreground": text.fg,
    "input.border": border.default,
    "input.placeholderForeground": text.fg_subtle,
    "inputOption.activeBackground": withAlpha(accent, ALPHA.a25),
    "inputOption.activeBorder": accent,
    "inputOption.activeForeground": text.fg,
    "inputOption.hoverBackground": state.hover,
    "inputValidation.errorBackground": withAlpha(semantic.danger, ALPHA.a20),
    "inputValidation.errorBorder": semantic.danger,
    "inputValidation.errorForeground": text.fg,
    "inputValidation.warningBackground": withAlpha(semantic.warning, ALPHA.a20),
    "inputValidation.warningBorder": semantic.warning,
    "inputValidation.warningForeground": text.fg,
    "inputValidation.infoBackground": withAlpha(semantic.info, ALPHA.a20),
    "inputValidation.infoBorder": semantic.info,
    "inputValidation.infoForeground": text.fg,

    // dropdown
    "dropdown.background": surface.bg_overlay,
    "dropdown.foreground": text.fg,
    "dropdown.border": border.default,
    "dropdown.listBackground": surface.bg_overlay,

    // lists & trees
    "list.activeSelectionBackground": state.selection,
    "list.activeSelectionForeground": text.fg,
    "list.activeSelectionIconForeground": accent,
    "list.inactiveSelectionBackground": state.selection,
    "list.inactiveSelectionForeground": text.fg_muted,
    "list.inactiveSelectionIconForeground": text.fg_muted,
    "list.hoverBackground": state.hover,
    "list.hoverForeground": text.fg,
    "list.focusBackground": state.selection,
    "list.focusForeground": text.fg,
    "list.focusOutline": accent,
    "list.focusHighlightForeground": accent,
    "list.dropBackground": state.active,
    "list.highlightForeground": accent,
    "list.errorForeground": semantic.danger,
    "list.warningForeground": semantic.warning,
    "list.deemphasizedForeground": text.fg_subtle,
    "list.invalidItemForeground": semantic.danger,
    "tree.indentGuidesStroke": border.subtle,
    "tree.inactiveIndentGuidesStroke": border.subtle,
    "listFilterWidget.background": surface.bg_overlay,
    "listFilterWidget.outline": accent,
    "listFilterWidget.noMatchesOutline": semantic.danger,

    // scrollbar
    "scrollbar.shadow": surface.bg_scrim,
    "scrollbarSlider.background": withAlpha(text.fg_subtle, subtleAlpha),
    "scrollbarSlider.hoverBackground": withAlpha(text.fg_subtle, ALPHA.a50),
    "scrollbarSlider.activeBackground": withAlpha(text.fg_subtle, ALPHA.a70),

    // minimap
    "minimap.background": surface.bg,
    "minimap.findMatchHighlight": withAlpha(accent, ALPHA.a40),
    "minimap.selectionHighlight": withAlpha(accent, ALPHA.a25),
    "minimap.errorHighlight": semantic.danger,
    "minimap.warningHighlight": semantic.warning,
    "minimap.selectionOccurrenceHighlight": withAlpha(accent, ALPHA.a20),
    "minimapSlider.background": withAlpha(text.fg_subtle, ALPHA.a20),
    "minimapSlider.hoverBackground": withAlpha(text.fg_subtle, ALPHA.a30),
    "minimapSlider.activeBackground": withAlpha(text.fg_subtle, ALPHA.a50),
    "minimapGutter.addedBackground": semantic.success,
    "minimapGutter.modifiedBackground": semantic.info,
    "minimapGutter.deletedBackground": semantic.danger,

    // badge
    "badge.background": accent,
    "badge.foreground": accentOn,

    // progress bar
    "progressBar.background": accent,

    // notifications
    "notifications.background": surface.bg_overlay,
    "notifications.foreground": text.fg,
    "notifications.border": border.default,
    "notificationCenter.border": border.default,
    "notificationCenterHeader.background": surface.bg_sunk,
    "notificationCenterHeader.foreground": text.fg,
    "notificationToast.border": border.default,
    "notificationLink.foreground": accent,
    "notificationsErrorIcon.foreground": semantic.danger,
    "notificationsWarningIcon.foreground": semantic.warning,
    "notificationsInfoIcon.foreground": semantic.info,

    // panel (terminal/output/etc container)
    "panel.background": surface.bg,
    "panel.border": border.subtle,
    "panel.dropBorder": accent,
    "panelTitle.activeBorder": accent,
    "panelTitle.activeForeground": text.fg,
    "panelTitle.inactiveForeground": text.fg_subtle,
    "panelInput.border": border.default,
    "panelSection.border": border.subtle,
    "panelSectionHeader.background": surface.bg_sunk,
    "panelSectionHeader.foreground": text.fg,

    // terminal
    "terminal.foreground": text.fg,
    "terminal.background": surface.bg,
    "terminal.border": border.subtle,
    "terminal.selectionBackground": withAlpha(accent, ALPHA.a30),
    "terminal.inactiveSelectionBackground": withAlpha(accent, ALPHA.a15),
    "terminal.findMatchBackground": withAlpha(semantic.warning, ALPHA.a40),
    "terminal.findMatchHighlightBackground": withAlpha(accent, ALPHA.a20),
    "terminalCursor.foreground": accent,
    "terminalCursor.background": surface.bg,
    "terminal.ansiBlack": ansi.black,
    "terminal.ansiRed": ansi.red,
    "terminal.ansiGreen": ansi.green,
    "terminal.ansiYellow": ansi.yellow,
    "terminal.ansiBlue": ansi.blue,
    "terminal.ansiMagenta": ansi.magenta,
    "terminal.ansiCyan": ansi.cyan,
    "terminal.ansiWhite": ansi.white,
    "terminal.ansiBrightBlack": ansi.bright_black,
    "terminal.ansiBrightRed": ansi.bright_red,
    "terminal.ansiBrightGreen": ansi.bright_green,
    "terminal.ansiBrightYellow": ansi.bright_yellow,
    "terminal.ansiBrightBlue": ansi.bright_blue,
    "terminal.ansiBrightMagenta": ansi.bright_magenta,
    "terminal.ansiBrightCyan": ansi.bright_cyan,
    "terminal.ansiBrightWhite": ansi.bright_white,

    // git decoration
    "gitDecoration.addedResourceForeground": semantic.success,
    "gitDecoration.modifiedResourceForeground": semantic.info,
    "gitDecoration.deletedResourceForeground": semantic.danger,
    "gitDecoration.renamedResourceForeground": semantic.info,
    "gitDecoration.untrackedResourceForeground": semantic.success,
    "gitDecoration.ignoredResourceForeground": text.fg_disabled,
    "gitDecoration.conflictingResourceForeground": semantic.warning,
    "gitDecoration.stageModifiedResourceForeground": semantic.warning,
    "gitDecoration.stageDeletedResourceForeground": semantic.danger,
    "gitDecoration.submoduleResourceForeground": text.fg_subtle,

    // diff editor
    "diffEditor.insertedTextBackground": withAlpha(semantic.success, ALPHA.a15),
    "diffEditor.removedTextBackground": withAlpha(semantic.danger, ALPHA.a15),
    "diffEditor.insertedLineBackground": withAlpha(semantic.success, ALPHA.a10),
    "diffEditor.removedLineBackground": withAlpha(semantic.danger, ALPHA.a10),
    "diffEditorGutter.insertedLineBackground": withAlpha(
      semantic.success,
      ALPHA.a20,
    ),
    "diffEditorGutter.removedLineBackground": withAlpha(
      semantic.danger,
      ALPHA.a20,
    ),
    "diffEditorOverview.insertedForeground": withAlpha(
      semantic.success,
      ALPHA.a40,
    ),
    "diffEditorOverview.removedForeground": withAlpha(
      semantic.danger,
      ALPHA.a40,
    ),

    // merge conflict
    "merge.currentHeaderBackground": withAlpha(semantic.info, ALPHA.a30),
    "merge.currentContentBackground": withAlpha(semantic.info, ALPHA.a15),
    "merge.incomingHeaderBackground": withAlpha(semantic.success, ALPHA.a30),
    "merge.incomingContentBackground": withAlpha(semantic.success, ALPHA.a15),
    "merge.commonHeaderBackground": withAlpha(text.fg_subtle, ALPHA.a30),
    "merge.commonContentBackground": withAlpha(text.fg_subtle, ALPHA.a15),
    "merge.border": border.subtle,

    // peek view
    "peekView.border": accent,
    "peekViewEditor.background": surface.bg,
    "peekViewEditor.matchHighlightBackground": withAlpha(accent, ALPHA.a30),
    "peekViewEditor.matchHighlightBorder": accent,
    "peekViewEditorGutter.background": surface.bg,
    "peekViewResult.background": surface.bg_sunk,
    "peekViewResult.fileForeground": text.fg,
    "peekViewResult.lineForeground": text.fg_muted,
    "peekViewResult.matchHighlightBackground": withAlpha(accent, ALPHA.a30),
    "peekViewResult.selectionBackground": state.selection,
    "peekViewResult.selectionForeground": text.fg,
    "peekViewTitle.background": surface.bg_sunk,
    "peekViewTitleDescription.foreground": text.fg_subtle,
    "peekViewTitleLabel.foreground": text.fg,

    // breadcrumbs
    "breadcrumb.background": surface.bg,
    "breadcrumb.foreground": text.fg_muted,
    "breadcrumb.focusForeground": text.fg,
    "breadcrumb.activeSelectionForeground": accent,
    "breadcrumbPicker.background": surface.bg_overlay,

    // editor widgets
    "editorWidget.background": surface.bg_overlay,
    "editorWidget.foreground": text.fg,
    "editorWidget.border": border.default,
    "editorWidget.resizeBorder": accent,
    "editorSuggestWidget.background": surface.bg_overlay,
    "editorSuggestWidget.border": border.default,
    "editorSuggestWidget.foreground": text.fg,
    "editorSuggestWidget.highlightForeground": accent,
    "editorSuggestWidget.focusHighlightForeground": accent,
    "editorSuggestWidget.selectedBackground": state.selection,
    "editorSuggestWidget.selectedForeground": text.fg,
    "editorSuggestWidget.selectedIconForeground": accent,
    "editorHoverWidget.background": surface.bg_overlay,
    "editorHoverWidget.border": border.default,
    "editorHoverWidget.foreground": text.fg,
    "editorHoverWidget.statusBarBackground": surface.bg_sunk,

    // quick input (Cmd+P, Cmd+Shift+P)
    "quickInput.background": surface.bg_overlay,
    "quickInput.foreground": text.fg,
    "quickInputList.focusBackground": state.selection,
    "quickInputList.focusForeground": text.fg,
    "quickInputList.focusIconForeground": accent,
    "quickInputTitle.background": surface.bg_sunk,
    "pickerGroup.foreground": accent,
    "pickerGroup.border": border.subtle,

    // text links / preformatted
    "textLink.foreground": accent,
    "textLink.activeForeground": accent,
    "textBlockQuote.background": surface.bg_sunk,
    "textBlockQuote.border": accent,
    "textCodeBlock.background": surface.bg_sunk,
    "textPreformat.foreground": f.syntax.string,
    "textSeparator.foreground": border.subtle,

    // settings editor
    "settings.headerForeground": text.fg,
    "settings.modifiedItemIndicator": accent,
    "settings.dropdownBackground": surface.bg_overlay,
    "settings.dropdownForeground": text.fg,
    "settings.dropdownBorder": border.default,
    "settings.checkboxBackground": surface.bg_overlay,
    "settings.checkboxForeground": text.fg,
    "settings.checkboxBorder": border.default,
    "settings.textInputBackground": surface.bg_overlay,
    "settings.textInputForeground": text.fg,
    "settings.textInputBorder": border.default,
    "settings.numberInputBackground": surface.bg_overlay,
    "settings.numberInputForeground": text.fg,
    "settings.numberInputBorder": border.default,

    // debug
    "debugToolBar.background": surface.bg_overlay,
    "debugToolBar.border": border.default,
    "debugIcon.breakpointForeground": semantic.danger,
    "debugIcon.breakpointDisabledForeground": text.fg_disabled,
    "debugIcon.breakpointUnverifiedForeground": text.fg_subtle,
    "debugIcon.startForeground": semantic.success,
    "debugIcon.pauseForeground": semantic.info,
    "debugIcon.stopForeground": semantic.danger,
    "debugIcon.disconnectForeground": semantic.warning,
    "debugIcon.restartForeground": semantic.success,
    "debugIcon.stepOverForeground": semantic.info,
    "debugIcon.stepIntoForeground": semantic.info,
    "debugIcon.stepOutForeground": semantic.info,
    "debugIcon.continueForeground": semantic.success,
    "debugConsole.infoForeground": semantic.info,
    "debugConsole.warningForeground": semantic.warning,
    "debugConsole.errorForeground": semantic.danger,
    "debugConsole.sourceForeground": text.fg_muted,
    "debugConsoleInputIcon.foreground": accent,
    "editor.stackFrameHighlightBackground": withAlpha(
      semantic.warning,
      ALPHA.a15,
    ),
    "editor.focusedStackFrameHighlightBackground": withAlpha(
      semantic.warning,
      ALPHA.a25,
    ),

    // problems
    "problemsErrorIcon.foreground": semantic.danger,
    "problemsWarningIcon.foreground": semantic.warning,
    "problemsInfoIcon.foreground": semantic.info,

    // welcome page
    "welcomePage.background": surface.bg,
    "welcomePage.tileBackground": surface.bg_sunk,
    "welcomePage.tileHoverBackground": surface.bg_soft,
    "welcomePage.progress.background": surface.bg_sunk,
    "welcomePage.progress.foreground": accent,
    "walkThrough.embeddedEditorBackground": surface.bg_sunk,

    // charts (Notebook, etc)
    "charts.foreground": text.fg,
    "charts.lines": text.fg_subtle,
    "charts.red": tokens.palette.red[isDark ? "300" : "700"],
    "charts.blue": tokens.palette.blue[isDark ? "300" : "700"],
    "charts.yellow": tokens.palette.yellow[isDark ? "500" : "700"],
    "charts.orange": tokens.palette.orange[isDark ? "500" : "700"],
    "charts.green": tokens.palette.green[isDark ? "500" : "700"],
    "charts.purple": tokens.palette.purple[isDark ? "300" : "700"],

    // notebook
    "notebook.cellBorderColor": border.subtle,
    "notebook.cellHoverBackground": state.hover,
    "notebook.cellInsertionIndicator": accent,
    "notebook.cellStatusBarItemHoverBackground": state.hover,
    "notebook.cellToolbarSeparator": border.subtle,
    "notebook.editorBackground": surface.bg,
    "notebook.focusedCellBackground": state.hover,
    "notebook.focusedCellBorder": accent,
    "notebook.focusedEditorBorder": accent,
    "notebook.inactiveFocusedCellBorder": border.default,
    "notebook.inactiveSelectedCellBorder": border.default,
    "notebook.outputContainerBackgroundColor": surface.bg_sunk,
    "notebook.selectedCellBackground": state.selection,
    "notebook.selectedCellBorder": border.default,
    "notebook.symbolHighlightBackground": withAlpha(accent, ALPHA.a15),

    // extensions
    "extensionButton.prominentBackground": accent,
    "extensionButton.prominentForeground": accentOn,
    "extensionButton.prominentHoverBackground": withAlpha(accent, ALPHA.a90),
    "extensionBadge.remoteBackground": accent,
    "extensionBadge.remoteForeground": accentOn,
    "extensionIcon.starForeground": semantic.warning,
    "extensionIcon.verifiedForeground": semantic.success,
    "extensionIcon.preReleaseForeground": semantic.info,
  };
}

// TextMate scope groupings — keep stable across all 24 themes.
// Each entry maps to one syntax slot from tokens.flavors[flavor].syntax.
function buildTokenColors(syntax, textFg, semanticDanger) {
  return [
    {
      name: "Comment",
      scope: ["comment", "punctuation.definition.comment", "string.comment"],
      settings: { foreground: syntax.comment, fontStyle: "italic" },
    },
    {
      name: "Shebang",
      scope: ["comment.line.shebang"],
      settings: { foreground: syntax.comment },
    },
    {
      name: "Keyword",
      scope: [
        "keyword",
        "keyword.control",
        "keyword.control.flow",
        "keyword.control.import",
        "keyword.control.from",
        "keyword.control.export",
        "keyword.control.conditional",
        "keyword.control.loop",
        "keyword.other",
        "keyword.operator.expression",
        "keyword.operator.new",
        "keyword.operator.delete",
        "keyword.operator.logical",
        "keyword.operator.word",
        "storage",
        "storage.type",
        "storage.modifier",
        "modifier",
      ],
      settings: { foreground: syntax.keyword },
    },
    {
      name: "Operator",
      scope: [
        "keyword.operator",
        "keyword.operator.arithmetic",
        "keyword.operator.assignment",
        "keyword.operator.comparison",
        "keyword.operator.relational",
        "punctuation.accessor",
      ],
      settings: { foreground: syntax.keyword },
    },
    {
      name: "String",
      scope: [
        "string",
        "string.quoted",
        "string.quoted.single",
        "string.quoted.double",
        "string.quoted.triple",
        "string.template",
        "string.unquoted",
        "punctuation.definition.string",
        "punctuation.definition.string.begin",
        "punctuation.definition.string.end",
      ],
      settings: { foreground: syntax.string },
    },
    {
      name: "Template string expression delimiter",
      scope: [
        "punctuation.definition.template-expression",
        "punctuation.section.embedded",
      ],
      settings: { foreground: syntax.keyword },
    },
    {
      name: "Regular Expression",
      scope: [
        "string.regexp",
        "punctuation.definition.string.regexp",
        "constant.other.character-class.regexp",
        "constant.character.escape.regexp",
        "keyword.control.anchor.regexp",
        "keyword.operator.quantifier.regexp",
      ],
      settings: { foreground: syntax.regex },
    },
    {
      name: "Number",
      scope: [
        "constant.numeric",
        "constant.numeric.integer",
        "constant.numeric.float",
        "constant.numeric.hex",
      ],
      settings: { foreground: syntax.number },
    },
    {
      name: "Boolean / null / language constant",
      scope: [
        "constant.language",
        "constant.language.boolean",
        "constant.language.null",
        "constant.language.undefined",
      ],
      settings: { foreground: syntax.constant },
    },
    {
      name: "Constant",
      scope: [
        "constant",
        "constant.character",
        "constant.other",
        "variable.other.constant",
      ],
      settings: { foreground: syntax.constant },
    },
    {
      name: "Escape sequence",
      scope: ["constant.character.escape"],
      settings: { foreground: syntax.keyword },
    },
    {
      name: "Function",
      scope: [
        "entity.name.function",
        "meta.function-call entity.name.function",
        "meta.function-call.generic",
        "support.function",
        "variable.function",
      ],
      settings: { foreground: syntax.function },
    },
    {
      name: "Builtin function",
      scope: ["support.function.builtin"],
      settings: { foreground: syntax.function },
    },
    {
      name: "Language variable / this / self / super",
      scope: [
        "variable.language.this",
        "variable.language.self",
        "variable.language.super",
        "variable.language",
      ],
      settings: { foreground: syntax.constant, fontStyle: "italic" },
    },
    {
      name: "Decorator / macro",
      scope: [
        "meta.decorator",
        "meta.decorator entity.name.function",
        "punctuation.decorator",
        "entity.name.function.decorator",
        "entity.name.function.macro",
        "meta.preprocessor",
        "keyword.other.macro",
      ],
      settings: { foreground: syntax.function },
    },
    {
      name: "Type",
      scope: [
        "entity.name.type",
        "entity.name.class",
        "entity.name.class.forward-decl",
        "entity.name.interface",
        "entity.name.enum",
        "entity.name.struct",
        "entity.name.union",
        "entity.other.inherited-class",
        "support.type",
        "support.type.primitive",
        "support.class",
      ],
      settings: { foreground: syntax.type, fontStyle: "" },
    },
    {
      name: "Namespace / module",
      scope: [
        "entity.name.namespace",
        "entity.name.module",
        "entity.name.package",
        "support.module",
      ],
      settings: { foreground: syntax.type },
    },
    {
      name: "Lifetime (Rust)",
      scope: [
        "storage.modifier.lifetime",
        "entity.name.lifetime",
        "punctuation.definition.lifetime",
      ],
      settings: { foreground: syntax.constant },
    },
    {
      name: "Variable",
      scope: [
        "variable",
        "variable.other",
        "variable.other.readwrite",
        "variable.other.object",
        "variable.other.object.property",
        "meta.definition.variable",
      ],
      settings: { foreground: textFg },
    },
    {
      name: "Parameter",
      scope: ["variable.parameter", "meta.function.parameters variable"],
      settings: { foreground: syntax.parameter, fontStyle: "italic" },
    },
    {
      name: "Property",
      scope: [
        "variable.other.property",
        "variable.other.object.property",
        "meta.object-literal.key",
        "meta.object.member",
        "support.type.property-name",
        "support.variable.property",
      ],
      settings: { foreground: textFg },
    },
    {
      name: "Punctuation",
      scope: [
        "punctuation",
        "punctuation.separator",
        "punctuation.terminator",
        "punctuation.section",
        "meta.brace",
      ],
      settings: { foreground: syntax.punct },
    },

    // Language-specific
    {
      name: "Shell variable",
      scope: ["source.shell variable.other", "variable.other.normal.shell"],
      settings: { foreground: syntax.keyword },
    },
    {
      name: "YAML alias",
      scope: ["variable.other.alias.yaml"],
      settings: { foreground: syntax.string, fontStyle: "italic underline" },
    },
    {
      name: "Python docstring",
      scope: ["string.quoted.docstring.multi"],
      settings: { foreground: syntax.comment, fontStyle: "italic" },
    },

    // HTML / JSX / XML
    {
      name: "Tag",
      scope: [
        "entity.name.tag",
        "punctuation.definition.tag",
        "meta.tag.sgml",
        "support.class.component",
      ],
      settings: { foreground: syntax.tag },
    },
    {
      name: "Attribute name",
      scope: ["entity.other.attribute-name", "meta.attribute"],
      settings: { foreground: syntax.attr, fontStyle: "italic" },
    },

    // Invalid / deprecated
    {
      name: "Invalid",
      scope: ["invalid"],
      settings: { foreground: syntax.regex, fontStyle: "italic underline" },
    },
    {
      name: "Deprecated",
      scope: ["invalid.deprecated"],
      settings: { foreground: syntax.regex, fontStyle: "italic" },
    },

    // CSS
    {
      name: "CSS selector",
      scope: [
        "entity.name.tag.css",
        "entity.name.tag.scss",
        "entity.other.attribute-name.id.css",
        "entity.other.attribute-name.class.css",
        "entity.other.attribute-name.pseudo-class",
        "entity.other.attribute-name.pseudo-element",
      ],
      settings: { foreground: syntax.tag },
    },
    {
      name: "CSS property",
      scope: [
        "support.type.property-name.css",
        "support.type.property-name.scss",
      ],
      settings: { foreground: syntax.attr },
    },
    {
      name: "CSS unit",
      scope: ["keyword.other.unit", "constant.numeric.css keyword.other.unit"],
      settings: { foreground: syntax.number },
    },
    {
      name: "CSS color (hex)",
      scope: ["constant.other.color", "constant.other.color.rgb-value.hex"],
      settings: { foreground: syntax.string },
    },
    {
      name: "CSS at-rule",
      scope: ["keyword.control.at-rule", "punctuation.definition.keyword"],
      settings: { foreground: syntax.keyword },
    },

    // JSDoc / documentation comments
    {
      name: "JSDoc tag",
      scope: [
        "comment.block.documentation keyword",
        "storage.type.class.jsdoc",
      ],
      settings: { foreground: syntax.keyword },
    },
    {
      name: "JSDoc type reference",
      scope: ["comment.block.documentation entity.name.type"],
      settings: { foreground: syntax.function, fontStyle: "italic" },
    },
    {
      name: "JSDoc parameter name",
      scope: ["comment.block.documentation variable"],
      settings: { foreground: syntax.number, fontStyle: "italic" },
    },

    // Markdown
    {
      name: "Markdown heading",
      scope: ["markup.heading", "entity.name.section.markdown"],
      settings: { foreground: syntax.keyword, fontStyle: "bold" },
    },
    {
      name: "Markdown heading punctuation",
      scope: ["punctuation.definition.heading.markdown"],
      settings: { foreground: syntax.comment },
    },
    {
      name: "Markdown bold",
      scope: ["markup.bold", "punctuation.definition.bold"],
      settings: { foreground: syntax.number, fontStyle: "bold" },
    },
    {
      name: "Markdown italic",
      scope: ["markup.italic", "punctuation.definition.italic"],
      settings: { foreground: syntax.type, fontStyle: "italic" },
    },
    {
      name: "Markdown bold+italic",
      scope: [
        "markup.bold.markdown markup.italic.markdown",
        "markup.italic.markdown markup.bold.markdown",
      ],
      settings: { foreground: syntax.type, fontStyle: "bold italic" },
    },
    {
      name: "Markdown link text",
      scope: [
        "string.other.link.description.markdown",
        "string.other.link.title.markdown",
      ],
      settings: { foreground: syntax.function },
    },
    {
      name: "Markdown link URL",
      scope: [
        "markup.underline.link",
        "constant.other.reference.link.markdown",
      ],
      settings: { foreground: syntax.string },
    },
    {
      name: "Markdown inline code / fenced code",
      scope: [
        "markup.inline.raw",
        "markup.fenced_code.block",
        "markup.raw.block",
      ],
      settings: { foreground: syntax.string },
    },
    {
      name: "Markdown quote",
      scope: ["markup.quote", "punctuation.definition.quote.begin"],
      settings: { foreground: syntax.type, fontStyle: "italic" },
    },
    {
      name: "Markdown list bullet",
      scope: [
        "beginning.punctuation.definition.list.markdown",
        "punctuation.definition.list_item",
      ],
      settings: { foreground: syntax.tag },
    },
    {
      name: "Markdown horizontal rule",
      scope: ["meta.separator.markdown"],
      settings: { foreground: syntax.comment },
    },

    // Diff (in unified diff files)
    {
      name: "Diff inserted",
      scope: ["markup.inserted", "meta.diff.header.to-file"],
      settings: { foreground: syntax.string },
    },
    {
      name: "Diff deleted",
      scope: ["markup.deleted", "meta.diff.header.from-file"],
      settings: { foreground: syntax.regex },
    },
    {
      name: "Diff changed",
      scope: ["markup.changed"],
      settings: { foreground: syntax.number },
    },
    {
      name: "Diff range / hunk header",
      scope: ["meta.diff.range", "meta.diff.header"],
      settings: { foreground: syntax.function },
    },

    // JSON / YAML keys
    {
      name: "JSON key",
      scope: [
        "support.type.property-name.json",
        "string.quoted.double.json support.type.property-name.json",
      ],
      settings: { foreground: syntax.tag },
    },
    {
      name: "YAML key",
      scope: [
        "entity.name.tag.yaml",
        "string.unquoted.plain.out.yaml entity.name.tag.yaml",
      ],
      settings: { foreground: syntax.tag },
    },

    // Doc comments (JSDoc / TSDoc / rustdoc / etc.)
    {
      name: "Doc comment keyword",
      scope: ["comment.block.documentation keyword"],
      settings: { foreground: syntax.keyword },
    },
    {
      name: "Doc comment type",
      scope: ["comment.block.documentation entity.name.type"],
      settings: { foreground: syntax.type, fontStyle: "italic" },
    },
    {
      name: "Doc comment param",
      scope: ["comment.block.documentation variable"],
      settings: { foreground: syntax.parameter, fontStyle: "italic" },
    },

    // Invalid / deprecated
    {
      name: "Invalid",
      scope: ["invalid.illegal", "invalid.broken"],
      settings: { foreground: semanticDanger, fontStyle: "italic underline" },
    },
    {
      name: "Invalid deprecated",
      scope: ["invalid.deprecated"],
      settings: { foreground: textFg, fontStyle: "italic underline" },
    },

    // JS/TS: prevent const-colored variables from over-matching the constant slot
    {
      name: "JS/TS variable constant fallthrough",
      scope: [
        "variable.other.constant.js",
        "variable.other.constant.ts",
        "variable.other.constant.tsx",
      ],
      settings: { foreground: textFg },
    },
  ];
}

// LSP-driven semantic highlighting. Mirrors the TextMate mapping so semantic
// types resolve to the same syntax slots.
function buildSemanticTokenColors(syntax, textFg) {
  return {
    variable: { foreground: textFg },
    parameter: { foreground: syntax.parameter, fontStyle: "italic" },
    property: { foreground: textFg },
    enumMember: { foreground: syntax.constant },
    function: { foreground: syntax.function },
    method: { foreground: syntax.function },
    macro: { foreground: syntax.function },
    class: { foreground: syntax.type, fontStyle: "" },
    interface: { foreground: syntax.type, fontStyle: "" },
    enum: { foreground: syntax.type, fontStyle: "" },
    struct: { foreground: syntax.type, fontStyle: "" },
    type: { foreground: syntax.type, fontStyle: "" },
    typeParameter: { foreground: syntax.type },
    namespace: { foreground: syntax.type },
    decorator: { foreground: syntax.function },
    keyword: { foreground: syntax.keyword },
    modifier: { foreground: syntax.keyword },
    operator: { foreground: syntax.keyword },
    string: { foreground: syntax.string },
    number: { foreground: syntax.number },
    regexp: { foreground: syntax.regex },
    comment: { foreground: syntax.comment, fontStyle: "italic" },
    "variable.readonly": { foreground: syntax.constant },
    "variable.defaultLibrary": {
      foreground: syntax.keyword,
      fontStyle: "italic",
    },
    "function.defaultLibrary": { foreground: syntax.function },
    "class.defaultLibrary": { foreground: syntax.type, fontStyle: "" },
    "type.defaultLibrary": { foreground: syntax.type, fontStyle: "" },
  };
}

export function buildTheme(flavor, variant, tokens) {
  const f = tokens.flavors[flavor];
  if (!f) throw new Error(`Unknown flavor: ${flavor}`);
  if (!tokens.variant_hues.includes(variant)) {
    throw new Error(`Unknown variant: ${variant}`);
  }
  return {
    $schema: "vscode://schemas/color-theme",
    name: `Vivid Life · ${f.label} · ${variant[0].toUpperCase()}${variant.slice(1)}`,
    type: f.type,
    semanticHighlighting: true,
    colors: buildWorkbenchColors(tokens, flavor, variant),
    tokenColors: buildTokenColors(f.syntax, f.text.fg, f.semantic.danger),
    semanticTokenColors: buildSemanticTokenColors(f.syntax, f.text.fg),
  };
}
