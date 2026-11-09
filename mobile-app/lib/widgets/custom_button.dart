import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Full-width button of the design system: filled plum by default, outlined
/// or destructive on request. Colours come from the theme, so both themes and
/// the AAA contrast are respected.
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final Widget? icon;
  final bool showIcon;
  final bool isOutlined;
  final bool destructive;
  final bool isLoading;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.icon,
    this.showIcon = false,
    this.isOutlined = false,
    this.destructive = false,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final enabled = onPressed != null && !isLoading;
    final Color foreground = destructive
        ? (isOutlined ? c.error : c.onError)
        : isOutlined
            ? c.text
            : c.onPrimary;

    final child = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2.5, color: foreground),
          ),
          const SizedBox(width: 12),
        ] else if (showIcon && icon != null) ...[
          IconTheme(data: IconThemeData(size: 20, color: foreground), child: icon!),
          const SizedBox(width: 8),
        ],
        Flexible(child: Text(text, textAlign: TextAlign.center)),
      ],
    );

    if (isOutlined) {
      return OutlinedButton(
        onPressed: enabled ? onPressed : null,
        style: destructive ? OutlinedButton.styleFrom(foregroundColor: c.error, side: BorderSide(color: c.error)) : null,
        child: child,
      );
    }
    return FilledButton(
      onPressed: enabled ? onPressed : null,
      style: destructive ? FilledButton.styleFrom(backgroundColor: c.error, foregroundColor: c.onError) : null,
      child: child,
    );
  }
}
