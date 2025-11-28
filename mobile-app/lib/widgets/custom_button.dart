import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final IconData? icon;
  final bool showIcon;
  final Color? backgroundColor;
  final Color? textColor;
  final double height;
  final double borderRadius;
  final bool isOutlined;
  final EdgeInsetsGeometry? padding;

  const CustomButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.icon,
    this.showIcon = false,
    this.backgroundColor,
    this.textColor,
    this.height = 56.0,
    this.borderRadius = 12.0,
    this.isOutlined = false,
    this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final defaultBackgroundColor = backgroundColor ?? Colors.black87;
    final defaultTextColor = textColor ?? Colors.white;

    return SizedBox(
      width: double.infinity,
      height: height,
      child: isOutlined
          ? OutlinedButton(
              onPressed: onPressed,
              style: OutlinedButton.styleFrom(
                side: BorderSide(
                  color: defaultBackgroundColor,
                  width: 1.5,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(borderRadius),
                ),
                padding: padding ??
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              ),
              child: _buildButtonContent(defaultBackgroundColor),
            )
          : ElevatedButton(
              onPressed: onPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: defaultBackgroundColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(borderRadius),
                ),
                elevation: 0,
                padding: padding ??
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              ),
              child: _buildButtonContent(defaultTextColor),
            ),
    );
  }

  Widget _buildButtonContent(Color contentColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (showIcon && icon != null) ...[
          Icon(
            icon,
            color: contentColor,
            size: 20,
          ),
          const SizedBox(width: 8),
        ],
        Text(
          text,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: contentColor,
          ),
        ),
      ],
    );
  }
}
