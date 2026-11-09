import 'package:flutter/material.dart';

import 'custom_input_field.dart';

/// Label-above field used by the profile and DMCA forms.
class EditableFormField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final bool isPassword;
  final String? Function(String?)? validator;
  final bool isReadOnly;
  final TextInputType keyboardType;
  final int maxLines;

  const EditableFormField({
    super.key,
    required this.label,
    required this.controller,
    this.isPassword = false,
    this.validator,
    this.isReadOnly = false,
    this.keyboardType = TextInputType.text,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return CustomInputField(
      labelText: label,
      controller: controller,
      isPassword: isPassword,
      validator: validator,
      readOnly: isReadOnly,
      keyboardType: keyboardType,
      maxLines: maxLines,
    );
  }
}
