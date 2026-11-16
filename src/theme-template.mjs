// Maps Vivid Life foundation tokens to a VS Code color theme.
// One pure function: (flavor, variant, tokens) -> theme JSON object.

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

function resolveColor(key, syntax, textFg, semanticDanger) {
  if (!key || key === "fg") return textFg;
  if (key === "semantic.danger") return semanticDanger;
  return syntax[key] ?? textFg;
}

function resolveExt(ext) {
  if (!ext || typeof ext === "string")
    return { color: ext ?? "fg", styles: [] };
  return { color: ext.color ?? "fg", styles: ext.style ?? [] };
}

function buildGeneratedTokenRules(
  scopeRecs,
  extended,
  syntax,
  textFg,
  semanticDanger,
) {
  return Object.entries(scopeRecs).map(([key, scopes]) => {
    const { color, styles } = resolveExt(extended[key] ?? key);
    const settings = {
      foreground: resolveColor(color, syntax, textFg, semanticDanger),
    };
    if (styles.length) settings.fontStyle = styles.join(" ");
    return { name: key, scope: scopes, settings };
  });
}

function buildWorkbenchColors(tokens, flavor, variant) {
  const f = tokens.flavors[flavor];
  const { surface, text, border, semantic, ansi } = f;
  const isDark = f.type === "dark";
  const accent = resolveAccent(tokens, flavor, variant);
  // Every wash and mark is a gated foundation recipe; `o.<role>` is its
  // #rrggbbaa form. The two `fill` roles are solid and read `.flat`.
  const overlay = f.overlay[variant];
  const o = Object.fromEntries(
    Object.entries(overlay).map(([name, recipe]) => [name, recipe.hexa]),
  );
  const accentOn = f.accent_on;
  // The frame carries the variant's colour around the grey work areas (title
  // bar, activity bar, tab strip, sidebar, status bar, panel tab row). Text on
  // it is fg / fg_muted only — never fg_subtle — and accent-hued text uses
  // frame.accent_text, not the accent.
  const frame = f.frame[variant];

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
    descriptionForeground: text.fg_muted,
    errorForeground: semantic.danger,
    focusBorder: accent,
    "widget.shadow": surface.bg_scrim,
    "selection.background": o.selection,

    // window
    "window.activeBorder": border.default,
    "window.inactiveBorder": border.subtle,

    // editor
    "editor.background": surface.bg,
    "editor.foreground": text.fg,
    "editorLineNumber.foreground": text.fg_subtle,
    "editorLineNumber.activeForeground": text.fg,
    "editor.lineHighlightBackground": o.line_highlight,
    "editor.lineHighlightBorder": "#00000000",
    "editor.selectionBackground": o.selection,
    "editor.selectionHighlightBackground": o.highlight,
    "editor.inactiveSelectionBackground": o.inactive_selection,
    "editor.wordHighlightBackground": o.word_highlight_read,
    "editor.wordHighlightStrongBackground": o.word_highlight_write,
    "editor.findMatchBackground": o.find_match,
    "editor.findMatchBorder": overlay.find_match.border,
    "editor.findMatchHighlightBackground": o.find_match_other,
    "editor.findMatchHighlightBorder": overlay.find_match_other.border,
    "editor.findRangeHighlightBackground": o.find_range,
    "editor.hoverHighlightBackground": o.highlight,
    "editor.rangeHighlightBackground": o.highlight,
    "editor.symbolHighlightBackground": o.symbol_highlight,
    "editorCursor.foreground": accent,
    "editorWhitespace.foreground": text.fg_disabled,
    "editorIndentGuide.background1": border.subtle,
    "editorIndentGuide.activeBackground1": border.default,
    "editorRuler.foreground": border.subtle,
    "editorCodeLens.foreground": text.fg_subtle,
    "editorBracketMatch.background": o.symbol_highlight,
    "editorBracketMatch.border": accent,
    "editorOverviewRuler.border": border.subtle,
    "editorOverviewRuler.findMatchForeground": o.ruler_find,
    "editorOverviewRuler.rangeHighlightForeground": o.mark,
    "editorOverviewRuler.selectionHighlightForeground": o.mark,
    "editorOverviewRuler.wordHighlightForeground": o.mark,
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
    "editorGroupHeader.tabsBackground": frame.bg,
    "editorGroupHeader.tabsBorder": border.subtle,
    "editorGroupHeader.noTabsBackground": frame.bg,
    "tab.activeBackground": surface.bg,
    "tab.activeForeground": text.fg,
    "tab.activeBorder": "#00000000",
    "tab.activeBorderTop": accent,
    "tab.inactiveBackground": frame.bg,
    "tab.inactiveForeground": text.fg_muted,
    "tab.unfocusedActiveForeground": text.fg_muted,
    "tab.unfocusedInactiveForeground": text.fg_muted,
    "tab.border": border.subtle,
    "tab.hoverBackground": o.hover,
    "tab.hoverForeground": text.fg,
    "tab.unfocusedHoverBackground": o.hover,
    "tab.activeModifiedBorder": semantic.warning,
    "tab.inactiveModifiedBorder": semantic.warning,

    // activity bar
    "activityBar.background": frame.bg,
    "activityBar.foreground": text.fg,
    "activityBar.inactiveForeground": text.fg_muted,
    "activityBar.activeBorder": accent,
    "activityBar.activeBackground": o.active,
    "activityBar.border": border.subtle,
    "activityBarBadge.background": accent,
    "activityBarBadge.foreground": accentOn,

    // sidebar
    "sideBar.background": frame.bg,
    "sideBar.foreground": text.fg_muted,
    "sideBar.border": border.subtle,
    "sideBar.dropBackground": o.active,
    "sideBarTitle.foreground": text.fg,
    "sideBarSectionHeader.background": frame.bg,
    "sideBarSectionHeader.foreground": text.fg_muted,
    "sideBarSectionHeader.border": border.subtle,

    // status bar — neutral body so VS Code's own state signals (debugging
    // background, error/warning chips) stand out clearly. Folder-open is
    // signaled by a thin accent strip along the top edge via statusBar.border;
    // statusBar.noFolderBorder kills the strip when no folder is open.
    "statusBar.background": frame.bg,
    "statusBar.foreground": text.fg_muted,
    "statusBar.border": accent,
    "statusBar.noFolderBackground": frame.bg,
    "statusBar.noFolderForeground": text.fg_muted,
    "statusBar.noFolderBorder": border.subtle,
    "statusBar.debuggingBackground": debugBg,
    "statusBar.debuggingForeground": accentOn,
    "statusBar.debuggingBorder": border.subtle,
    "statusBarItem.activeBackground": o.active,
    "statusBarItem.hoverBackground": o.hover,
    // "prominent" is what VS Code uses for the Workspace Trust "Restricted
    // Mode" badge (kind: 'prominent') — a soft warning that needs to stand
    // out from the rest of the status bar, so it shares warning's colors.
    "statusBarItem.prominentBackground": semantic.warning,
    "statusBarItem.prominentForeground": accentOn,
    "statusBarItem.prominentHoverBackground": overlay.warning_hover.flat,
    // Remote indicator uses ansi.cyan — fixed per-flavor and outside
    // variant_hues, so it can't collide with semantic.danger/warning the way
    // the accent (which IS red/yellow on those variants) did. Same trick as
    // editor.wordHighlightBackground above.
    "statusBarItem.remoteBackground": ansi.cyan,
    "statusBarItem.remoteForeground": accentOn,
    "statusBarItem.errorBackground": semantic.danger,
    "statusBarItem.errorForeground": accentOn,
    "statusBarItem.warningBackground": semantic.warning,
    "statusBarItem.warningForeground": accentOn,
    // Remote Development's disconnected/offline indicator — VS Code's own
    // default (#6c1717) treats this as danger-severity, same as error.
    "statusBarItem.offlineBackground": semantic.danger,
    "statusBarItem.offlineForeground": accentOn,

    // terminal command decorations (shell integration gutter dots)
    "terminalCommandDecoration.defaultBackground": o.terminal_decoration,
    "terminalCommandDecoration.successBackground": semantic.success,
    "terminalCommandDecoration.errorBackground": semantic.danger,

    // title bar
    "titleBar.activeBackground": frame.bg,
    "titleBar.activeForeground": text.fg_muted,
    "titleBar.inactiveBackground": frame.bg,
    "titleBar.inactiveForeground": text.fg_muted,
    "titleBar.border": border.subtle,

    // menubar / menu
    "menubar.selectionBackground": o.hover,
    "menubar.selectionForeground": text.fg,
    "menubar.selectionBorder": "#00000000",
    "menu.background": surface.bg_overlay,
    "menu.foreground": text.fg,
    "menu.selectionBackground": o.selected,
    "menu.selectionForeground": text.fg,
    "menu.selectionBorder": "#00000000",
    "menu.separatorBackground": border.subtle,
    "menu.border": border.default,

    // buttons
    "button.background": accent,
    "button.foreground": accentOn,
    "button.hoverBackground": overlay.button_hover.flat,
    "button.secondaryBackground": surface.bg_overlay,
    "button.secondaryForeground": text.fg,
    "button.secondaryHoverBackground": surface.bg_soft,
    "button.border": border.control,
    "checkbox.background": surface.bg_overlay,
    "checkbox.foreground": text.fg,
    "checkbox.border": border.control,
    "checkbox.selectBackground": accent,
    "checkbox.selectBorder": accent,

    // inputs
    "input.background": surface.bg_overlay,
    "input.foreground": text.fg,
    "input.border": border.control,
    "input.placeholderForeground": text.fg_subtle,
    "inputOption.activeBackground": o.input_option_active,
    "inputOption.activeBorder": accent,
    "inputOption.activeForeground": text.fg,
    "inputOption.hoverBackground": o.hover,
    "inputValidation.errorBackground": o.validation_error,
    "inputValidation.errorBorder": semantic.danger,
    "inputValidation.errorForeground": text.fg,
    "inputValidation.warningBackground": o.validation_warning,
    "inputValidation.warningBorder": semantic.warning,
    "inputValidation.warningForeground": text.fg,
    "inputValidation.infoBackground": o.validation_info,
    "inputValidation.infoBorder": semantic.info,
    "inputValidation.infoForeground": text.fg,

    // dropdown
    "dropdown.background": surface.bg_overlay,
    "dropdown.foreground": text.fg,
    "dropdown.border": border.control,
    "dropdown.listBackground": surface.bg_overlay,

    // lists & trees
    // Lists sit on the frame (sidebar), so accent-hued text and the accent
    // cue next to the selected wash use frame.accent_text, which the
    // foundation gates there. On bg_overlay (quick input) it is never worse
    // than the plain accent.
    "list.activeSelectionBackground": o.selected,
    "list.activeSelectionForeground": text.fg,
    "list.activeSelectionIconForeground": frame.accent_text,
    "list.inactiveSelectionBackground": o.selected,
    "list.inactiveSelectionForeground": text.fg_muted,
    "list.inactiveSelectionIconForeground": text.fg_muted,
    "list.hoverBackground": o.hover,
    "list.hoverForeground": text.fg,
    "list.focusBackground": o.selected,
    "list.focusForeground": text.fg,
    "list.focusOutline": frame.accent_text,
    "list.focusHighlightForeground": frame.accent_text,
    "list.dropBackground": o.active,
    "list.highlightForeground": frame.accent_text,
    "list.errorForeground": semantic.danger,
    "list.warningForeground": semantic.warning,
    "list.deemphasizedForeground": text.fg_muted,
    "list.invalidItemForeground": semantic.danger,
    "tree.indentGuidesStroke": border.subtle,
    "tree.inactiveIndentGuidesStroke": border.subtle,
    "listFilterWidget.background": surface.bg_overlay,
    "listFilterWidget.outline": accent,
    "listFilterWidget.noMatchesOutline": semantic.danger,

    // scrollbar
    "scrollbar.shadow": surface.bg_scrim,
    "scrollbarSlider.background": o.slider,
    "scrollbarSlider.hoverBackground": o.slider_hover,
    "scrollbarSlider.activeBackground": o.slider_active,

    // minimap
    "minimap.background": surface.bg,
    "minimap.findMatchHighlight": o.mark,
    "minimap.selectionHighlight": o.minimap_selection,
    "minimap.errorHighlight": semantic.danger,
    "minimap.warningHighlight": semantic.warning,
    "minimap.selectionOccurrenceHighlight": o.minimap_occurrence,
    "minimapSlider.background": o.minimap_slider,
    "minimapSlider.hoverBackground": o.minimap_slider_hover,
    "minimapSlider.activeBackground": o.minimap_slider_active,
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

    // panel (terminal/output/etc container) — the frame colour, like the
    // sidebar/activity bar/status bar. VS Code draws the panel's tab row in
    // panel.background, and that strip of frame is what separates the
    // terminal from the editor: both share surface.bg (design-system 0.14.0).
    "panel.background": frame.bg,
    "panel.border": border.subtle,
    "panel.dropBorder": accent,
    "panelTitle.activeBorder": accent,
    "panelTitle.activeForeground": text.fg,
    "panelTitle.inactiveForeground": text.fg_muted,
    "panelInput.border": border.control,
    "panelSection.border": border.subtle,
    // Section headers take the grey surface.bg so they read apart from the
    // coloured panel.background.
    "panelSectionHeader.background": surface.bg,
    "panelSectionHeader.foreground": text.fg,

    // terminal — background uses surface.bg_terminal, the surface every
    // ansi.* colour is gated against. Since design-system 0.14.0 it equals
    // surface.bg on every flavor; the name is the contract, so keep reading
    // it. See CLAUDE.md.
    "terminal.foreground": text.fg,
    "terminal.background": surface.bg_terminal,
    "terminal.border": border.subtle,
    "terminal.selectionBackground": overlay.selection.terminal.flat,
    "terminal.selectionForeground": overlay.selection.terminal.foreground,
    "terminal.inactiveSelectionBackground":
      overlay.inactive_selection.terminal.flat,
    "terminal.findMatchBackground": o.find_match,
    "terminal.findMatchBorder": overlay.find_match.border,
    "terminal.findMatchHighlightBackground": o.find_match_other,
    "terminal.findMatchHighlightBorder": overlay.find_match_other.border,
    "terminalCursor.foreground": accent,
    "terminalCursor.background": surface.bg_terminal,
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
    "gitDecoration.submoduleResourceForeground": text.fg_muted,

    // diff editor
    "diffEditor.insertedTextBackground": o.diff_inserted_text,
    "diffEditor.removedTextBackground": o.diff_removed_text,
    "diffEditor.insertedLineBackground": o.diff_inserted_line,
    "diffEditor.removedLineBackground": o.diff_removed_line,
    "diffEditorGutter.insertedLineBackground": o.diff_inserted_gutter,
    "diffEditorGutter.removedLineBackground": o.diff_removed_gutter,
    "diffEditorOverview.insertedForeground": o.mark_inserted,
    "diffEditorOverview.removedForeground": o.mark_removed,

    // merge conflict
    "merge.currentHeaderBackground": o.merge_current_header,
    "merge.currentContentBackground": o.merge_current,
    "merge.incomingHeaderBackground": o.merge_incoming_header,
    "merge.incomingContentBackground": o.diff_inserted_line,
    "merge.commonHeaderBackground": o.merge_common_header,
    "merge.commonContentBackground": o.line_highlight,
    "merge.border": border.subtle,

    // peek view
    "peekView.border": accent,
    "peekViewEditor.background": surface.bg,
    "peekViewEditor.matchHighlightBackground": o.symbol_highlight,
    "peekViewEditor.matchHighlightBorder": accent,
    "peekViewEditorGutter.background": surface.bg,
    "peekViewResult.background": surface.bg_sunk,
    "peekViewResult.fileForeground": text.fg,
    "peekViewResult.lineForeground": text.fg_muted,
    "peekViewResult.matchHighlightBackground": o.symbol_highlight,
    "peekViewResult.selectionBackground": o.selected,
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
    "editorSuggestWidget.selectedBackground": o.selected,
    "editorSuggestWidget.selectedForeground": text.fg,
    "editorSuggestWidget.selectedIconForeground": accent,
    "editorHoverWidget.background": surface.bg_overlay,
    "editorHoverWidget.border": border.default,
    "editorHoverWidget.foreground": text.fg,
    "editorHoverWidget.statusBarBackground": surface.bg_sunk,

    // quick input (Cmd+P, Cmd+Shift+P)
    "quickInput.background": surface.bg_overlay,
    "quickInput.foreground": text.fg,
    "quickInputList.focusBackground": o.selected,
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
    "settings.dropdownBorder": border.control,
    "settings.checkboxBackground": surface.bg_overlay,
    "settings.checkboxForeground": text.fg,
    "settings.checkboxBorder": border.control,
    "settings.textInputBackground": surface.bg_overlay,
    "settings.textInputForeground": text.fg,
    "settings.textInputBorder": border.control,
    "settings.numberInputBackground": surface.bg_overlay,
    "settings.numberInputForeground": text.fg,
    "settings.numberInputBorder": border.control,

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
    "editor.stackFrameHighlightBackground": o.stack_frame,
    "editor.focusedStackFrameHighlightBackground": o.stack_frame_focused,

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
    // Cell backgrounds sit behind code, so they take the code overlay
    // line_highlight rather than the hover wash.
    "notebook.cellHoverBackground": o.line_highlight,
    "notebook.cellInsertionIndicator": accent,
    "notebook.cellStatusBarItemHoverBackground": o.hover,
    "notebook.cellToolbarSeparator": border.subtle,
    "notebook.editorBackground": surface.bg,
    "notebook.focusedCellBackground": o.line_highlight,
    "notebook.focusedCellBorder": accent,
    "notebook.focusedEditorBorder": accent,
    "notebook.inactiveFocusedCellBorder": border.default,
    "notebook.inactiveSelectedCellBorder": border.default,
    "notebook.outputContainerBackgroundColor": surface.bg_sunk,
    "notebook.selectedCellBackground": o.selected,
    "notebook.selectedCellBorder": border.default,
    "notebook.symbolHighlightBackground": o.highlight,

    // chat — the chat view renders on the frame in the sidebar/panel but on
    // surface.bg when popped out as an editor tab. bg_soft reads as raised
    // against both (and is the foundation's fill for anything on the frame),
    // so bubble/code surfaces use it rather than bg or the frame directly.
    "chat.requestBorder": border.subtle,
    "chat.requestBackground": surface.bg_soft,
    "chat.requestBubbleBackground": surface.bg_soft,
    "chat.requestBubbleHoverBackground": o.hover,
    "chat.requestCodeBorder": border.default,
    "chat.checkpointSeparator": border.subtle,
    "chat.thinkingShimmer": accent,
    // Avatar/slash-command chips join ansi.cyan rather than accent — the
    // 0.2.1→0.2.3 statusBarItem.remoteBackground history shows a second
    // accent-colored chip collides with activityBarBadge/badge/extensionBadge
    // on the Red/Yellow/Orange variants; ansi.cyan is fixed per-flavor and
    // stays outside variant_hues so it can't collide with the accent.
    "chat.avatarBackground": ansi.cyan,
    "chat.avatarForeground": accentOn,
    "chat.slashCommandBackground": o.slash_command,
    "chat.slashCommandForeground": ansi.cyan,
    "chat.editedFileForeground": accent,
    "chat.linesAddedForeground": semantic.success,
    "chat.linesRemovedForeground": semantic.danger,
    "chatManagement.sashBorder": border.subtle,

    // extensions
    "extensionButton.prominentBackground": accent,
    "extensionButton.prominentForeground": accentOn,
    "extensionButton.prominentHoverBackground": overlay.button_hover.flat,
    "extensionBadge.remoteBackground": accent,
    "extensionBadge.remoteForeground": accentOn,
    "extensionIcon.starForeground": semantic.warning,
    "extensionIcon.verifiedForeground": semantic.success,
    "extensionIcon.preReleaseForeground": semantic.info,
  };
}

function buildTokenColors(scopeRecs, extended, syntax, textFg, semanticDanger) {
  return [
    ...buildGeneratedTokenRules(
      scopeRecs,
      extended,
      syntax,
      textFg,
      semanticDanger,
    ),
    {
      name: "Template string delimiter",
      scope: [
        "punctuation.definition.template-expression",
        "punctuation.section.embedded",
      ],
      settings: { foreground: syntax.keyword },
    },
    // Format placeholders ({name} in a Python f-string, %s) sit in the
    // string like an escape and take the same colour.
    {
      name: "Escape sequence",
      scope: [
        "constant.character.escape",
        "constant.character.format.placeholder",
      ],
      settings: { foreground: syntax.keyword },
    },
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
    {
      name: "CSS at-rule",
      scope: ["keyword.control.at-rule", "punctuation.definition.keyword"],
      settings: { foreground: syntax.keyword },
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
      name: "Markdown inline/fenced code",
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
      name: "Diff hunk header",
      scope: ["meta.diff.range", "meta.diff.header"],
      settings: { foreground: syntax.function },
    },
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
  ];
}

function buildSemanticTokenColors(semRecs, syntax, textFg, semanticDanger) {
  const result = {};
  for (const [type, spec] of Object.entries(semRecs.types)) {
    const { color, styles } = resolveExt(spec);
    result[type] = {
      foreground: resolveColor(color, syntax, textFg, semanticDanger),
      fontStyle: styles.length ? styles.join(" ") : "",
    };
  }
  for (const [mod, spec] of Object.entries(semRecs.modifiers)) {
    if (spec === "none") continue;
    const entry = {};
    if (typeof spec === "string") {
      entry.foreground = resolveColor(spec, syntax, textFg, semanticDanger);
    } else {
      if (spec.color)
        entry.foreground = resolveColor(
          spec.color,
          syntax,
          textFg,
          semanticDanger,
        );
      if (spec.style && spec.style.length)
        entry.fontStyle = spec.style.join(" ");
    }
    result[`*.${mod}`] = entry;
  }
  return result;
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
    tokenColors: buildTokenColors(
      tokens.scope_recommendations,
      tokens.syntax_tokens.extended,
      f.syntax,
      f.text.fg,
      f.semantic.danger,
    ),
    semanticTokenColors: buildSemanticTokenColors(
      tokens.semantic_token_recommendations,
      f.syntax,
      f.text.fg,
      f.semantic.danger,
    ),
  };
}
