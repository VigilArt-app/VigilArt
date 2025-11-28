import 'package:flutter/material.dart';

class LogoHeader extends StatelessWidget {
  final String logoImagePath;
  final String appName;
  final double logoSize;
  final double spacing;
  final TextStyle? textStyle;

  const LogoHeader({
    Key? key,
    required this.logoImagePath,
    required this.appName,
    this.logoSize = 60.0,
    this.spacing = 12.0,
    this.textStyle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Image.asset(
          logoImagePath,
          width: logoSize,
          height: logoSize,
          fit: BoxFit.contain,
        ),
        SizedBox(width: spacing),
        Text(
          appName,
          style: textStyle ??
              const TextStyle(
                fontFamily: "Giaza",
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
                letterSpacing: 1.0,
              ),
        ),
      ],
    );
  }
}
