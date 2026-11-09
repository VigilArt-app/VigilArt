import 'package:flutter/material.dart';

/// The official VigilArt wordmark, black on light themes and white on dark
/// themes. Never recoloured or redrawn.
class LogoHeader extends StatelessWidget {
  final double width;

  const LogoHeader({super.key, this.width = 180});

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Image.asset(
      dark ? 'assets/images/wordmark_white.png' : 'assets/images/wordmark_black.png',
      width: width,
      fit: BoxFit.contain,
      semanticLabel: 'VigilArt',
    );
  }
}

/// The official monogram, 32px by default (24px is the minimum).
class LogoMark extends StatelessWidget {
  final double size;

  const LogoMark({super.key, this.size = 32});

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Image.asset(
      dark ? 'assets/images/logo_white.png' : 'assets/images/logo_black.png',
      width: size,
      height: size,
      fit: BoxFit.contain,
      semanticLabel: 'VigilArt',
    );
  }
}
