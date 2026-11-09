import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Renders a website string such as
/// `I accept the <terms>Terms</terms> and the <privacy>Privacy Policy</privacy>.`
/// with each tagged part as a tappable link.
class MarkupText extends StatefulWidget {
  final String text;
  final Map<String, VoidCallback> links;
  final TextStyle? style;

  const MarkupText({super.key, required this.text, required this.links, this.style});

  @override
  State<MarkupText> createState() => _MarkupTextState();
}

class _MarkupTextState extends State<MarkupText> {
  final List<TapGestureRecognizer> _recognizers = [];

  @override
  void dispose() {
    for (final r in _recognizers) {
      r.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    for (final r in _recognizers) {
      r.dispose();
    }
    _recognizers.clear();
    final c = context.colors;
    final spans = <InlineSpan>[];
    final pattern = RegExp(r'<(\w+)>(.*?)</\1>');
    var last = 0;
    for (final m in pattern.allMatches(widget.text)) {
      if (m.start > last) spans.add(TextSpan(text: widget.text.substring(last, m.start)));
      final tag = m.group(1)!;
      final recognizer = TapGestureRecognizer()..onTap = widget.links[tag];
      _recognizers.add(recognizer);
      spans.add(TextSpan(
        text: m.group(2),
        recognizer: recognizer,
        style: TextStyle(color: c.primaryText, decoration: TextDecoration.underline, fontWeight: FontWeight.w500),
      ));
      last = m.end;
    }
    if (last < widget.text.length) spans.add(TextSpan(text: widget.text.substring(last)));
    return Text.rich(TextSpan(style: widget.style ?? Theme.of(context).textTheme.bodyMedium, children: spans));
  }
}
