import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

/// Text field with its label above (8px gap), as in the design system.
/// Passwords get a show/hide button with an accessible name.
class CustomInputField extends StatefulWidget {
  final String? labelText;
  final String? hintText;
  final IconData? prefixIcon;
  final bool isPassword;
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final TextInputType keyboardType;
  final void Function(String)? onChanged;
  final int maxLines;
  final bool readOnly;
  final String? showPasswordLabel;
  final String? hidePasswordLabel;
  final TextInputAction? textInputAction;
  final Iterable<String>? autofillHints;

  const CustomInputField({
    super.key,
    this.labelText,
    this.hintText,
    this.prefixIcon,
    this.isPassword = false,
    this.controller,
    this.validator,
    this.keyboardType = TextInputType.text,
    this.onChanged,
    this.maxLines = 1,
    this.readOnly = false,
    this.showPasswordLabel,
    this.hidePasswordLabel,
    this.textInputAction,
    this.autofillHints,
  });

  @override
  State<CustomInputField> createState() => _CustomInputFieldState();
}

class _CustomInputFieldState extends State<CustomInputField> {
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final field = TextFormField(
      controller: widget.controller,
      validator: widget.validator,
      onChanged: widget.onChanged,
      keyboardType: widget.keyboardType,
      obscureText: widget.isPassword && _obscure,
      readOnly: widget.readOnly,
      maxLines: widget.isPassword ? 1 : widget.maxLines,
      textInputAction: widget.textInputAction,
      autofillHints: widget.autofillHints,
      style: theme.textTheme.bodyLarge,
      decoration: InputDecoration(
        hintText: widget.hintText,
        prefixIcon: widget.prefixIcon == null ? null : Icon(widget.prefixIcon, size: 20),
        suffixIcon: widget.isPassword
            ? IconButton(
                tooltip: _obscure ? widget.showPasswordLabel : widget.hidePasswordLabel,
                icon: Icon(_obscure ? LucideIcons.eye : LucideIcons.eyeOff, size: 20),
                onPressed: () => setState(() => _obscure = !_obscure),
              )
            : null,
      ),
    );
    if (widget.labelText == null) return field;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.labelText!, style: theme.textTheme.labelMedium),
        const SizedBox(height: 8),
        field,
      ],
    );
  }
}
