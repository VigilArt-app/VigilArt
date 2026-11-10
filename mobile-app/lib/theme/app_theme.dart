import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Radii and spacing from the design system (8px grid).
class AppSpacing {
  static const double s1 = 4;
  static const double s2 = 8;
  static const double s3 = 16;
  static const double s4 = 24;
  static const double s5 = 32;
  static const double radiusControl = 8;
  static const double radiusContainer = 12;
  static const double radiusSheet = 24;
  static const double minTap = 48;
}

const String kFontSans = 'Geist';
const String kFontMono = 'GeistMono';

ThemeData buildAppTheme(Brightness brightness) {
  final c = brightness == Brightness.dark ? AppColors.dark : AppColors.light;
  final scheme = ColorScheme(
    brightness: brightness,
    primary: c.primary,
    onPrimary: c.onPrimary,
    primaryContainer: c.primaryTint,
    onPrimaryContainer: c.onPrimaryTint,
    secondary: c.primary,
    onSecondary: c.onPrimary,
    error: c.error,
    onError: c.onError,
    errorContainer: c.errorBg,
    onErrorContainer: c.error,
    surface: c.surface,
    onSurface: c.text,
    onSurfaceVariant: c.textMuted,
    surfaceContainerHighest: c.surfaceSubtle,
    surfaceContainerHigh: c.surfaceSubtle,
    surfaceContainer: c.surfaceSubtle,
    surfaceContainerLow: c.surface,
    outline: c.fieldBorder,
    outlineVariant: c.border,
    scrim: c.scrim,
    shadow: Colors.black,
  );

  const radius = BorderRadius.all(Radius.circular(AppSpacing.radiusControl));
  OutlineInputBorder inputBorder(Color color, [double width = 1]) =>
      OutlineInputBorder(borderRadius: radius, borderSide: BorderSide(color: color, width: width));

  final base = ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    fontFamily: kFontSans,
    scaffoldBackgroundColor: c.bg,
    canvasColor: c.bg,
    extensions: <ThemeExtension<dynamic>>[c],
    materialTapTargetSize: MaterialTapTargetSize.padded,
    visualDensity: VisualDensity.standard,
    dividerTheme: DividerThemeData(color: c.border, thickness: 1, space: 1),
    focusColor: c.focusRing,
  );

  final text = base.textTheme.apply(bodyColor: c.text, displayColor: c.text, fontFamily: kFontSans).copyWith(
        headlineLarge: TextStyle(fontSize: 30, height: 36 / 30, fontWeight: FontWeight.w600, letterSpacing: -0.3, color: c.text),
        headlineMedium: TextStyle(fontSize: 26, height: 32 / 26, fontWeight: FontWeight.w600, letterSpacing: -0.2, color: c.text),
        titleLarge: TextStyle(fontSize: 20, height: 28 / 20, fontWeight: FontWeight.w600, color: c.text),
        titleMedium: TextStyle(fontSize: 16, height: 24 / 16, fontWeight: FontWeight.w600, color: c.text),
        bodyLarge: TextStyle(fontSize: 16, height: 24 / 16, fontWeight: FontWeight.w400, color: c.text),
        bodyMedium: TextStyle(fontSize: 14, height: 20 / 14, fontWeight: FontWeight.w400, color: c.text),
        bodySmall: TextStyle(fontSize: 12, height: 16 / 12, fontWeight: FontWeight.w400, color: c.textMuted),
        labelLarge: TextStyle(fontSize: 16, height: 24 / 16, fontWeight: FontWeight.w500, color: c.text),
        labelMedium: TextStyle(fontSize: 14, height: 20 / 14, fontWeight: FontWeight.w500, color: c.text),
        labelSmall: TextStyle(fontSize: 12, height: 16 / 12, fontWeight: FontWeight.w500, color: c.textMuted),
      )
      // The styles above replace the defaults, so give each one the font again.
      .apply(fontFamily: kFontSans);

  const buttonShape = RoundedRectangleBorder(borderRadius: radius);
  const buttonPadding = EdgeInsets.symmetric(horizontal: 24, vertical: 14);
  final buttonText = text.labelLarge;

  return base.copyWith(
    textTheme: text,
    appBarTheme: AppBarTheme(
      backgroundColor: c.surface,
      foregroundColor: c.text,
      elevation: 0,
      scrolledUnderElevation: 0,
      surfaceTintColor: Colors.transparent,
      centerTitle: true,
      titleTextStyle: text.titleMedium,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: c.surface,
      hintStyle: TextStyle(color: c.textMuted, fontSize: 16),
      labelStyle: TextStyle(color: c.text, fontSize: 14, fontWeight: FontWeight.w500),
      floatingLabelStyle: TextStyle(color: c.text, fontSize: 14, fontWeight: FontWeight.w500),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      border: inputBorder(c.fieldBorder),
      enabledBorder: inputBorder(c.fieldBorder),
      focusedBorder: inputBorder(c.focusRing, 2),
      errorBorder: inputBorder(c.error),
      focusedErrorBorder: inputBorder(c.error, 2),
      errorStyle: TextStyle(color: c.error, fontSize: 12),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: c.primary,
        foregroundColor: c.onPrimary,
        disabledBackgroundColor: c.surfaceSubtle,
        disabledForegroundColor: c.textMuted,
        minimumSize: const Size.fromHeight(AppSpacing.minTap),
        padding: buttonPadding,
        shape: buttonShape,
        textStyle: buttonText,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: c.primary,
        foregroundColor: c.onPrimary,
        disabledBackgroundColor: c.surfaceSubtle,
        disabledForegroundColor: c.textMuted,
        minimumSize: const Size.fromHeight(AppSpacing.minTap),
        padding: buttonPadding,
        elevation: 0,
        shape: buttonShape,
        textStyle: buttonText,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: c.text,
        minimumSize: const Size.fromHeight(AppSpacing.minTap),
        padding: buttonPadding,
        side: BorderSide(color: c.fieldBorder),
        shape: buttonShape,
        textStyle: buttonText,
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: c.primaryText,
        minimumSize: const Size(AppSpacing.minTap, AppSpacing.minTap),
        shape: buttonShape,
        textStyle: buttonText,
      ),
    ),
    iconButtonTheme: IconButtonThemeData(
      style: IconButton.styleFrom(
        foregroundColor: c.text,
        minimumSize: const Size(AppSpacing.minTap, AppSpacing.minTap),
      ),
    ),
    cardTheme: CardThemeData(
      color: c.surface,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusContainer),
        side: BorderSide(color: c.border),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: c.surface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusContainer)),
      titleTextStyle: text.titleLarge,
      contentTextStyle: text.bodyLarge?.copyWith(color: c.textMuted),
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: c.surface,
      surfaceTintColor: Colors.transparent,
      showDragHandle: true,
      dragHandleColor: c.fieldBorder,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusSheet)),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: c.text,
      contentTextStyle: TextStyle(color: c.bg, fontSize: 14, fontFamily: kFontSans),
      actionTextColor: c.primary,
      shape: const RoundedRectangleBorder(borderRadius: radius),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? c.onPrimary : c.fieldBorder),
      trackColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? c.primary : c.surfaceSubtle),
      trackOutlineColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? c.primary : c.fieldBorder),
    ),
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? c.primary : Colors.transparent),
      checkColor: WidgetStatePropertyAll(c.onPrimary),
      side: BorderSide(color: c.fieldBorder, width: 2),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(color: c.primary, linearTrackColor: c.surfaceSubtle),
    chipTheme: ChipThemeData(
      backgroundColor: c.surface,
      selectedColor: c.primary,
      labelStyle: TextStyle(color: c.text, fontSize: 14, fontWeight: FontWeight.w500, fontFamily: kFontSans),
      secondaryLabelStyle: TextStyle(color: c.onPrimary, fontSize: 14, fontWeight: FontWeight.w500, fontFamily: kFontSans),
      side: BorderSide(color: c.fieldBorder),
      shape: const StadiumBorder(),
      showCheckmark: false,
    ),
  );
}
