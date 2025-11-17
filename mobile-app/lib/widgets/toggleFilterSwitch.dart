import 'package:flutter/material.dart';

class ToggleFilterSwitch extends StatefulWidget {
  final String label;
  final bool initialValue;
  final ValueChanged<bool> onChanged;

  const ToggleFilterSwitch({
    Key? key,
    required this.label,
    this.initialValue = false,
    required this.onChanged,
  }) : super(key: key);

  @override
  State<ToggleFilterSwitch> createState() => _ToggleFilterSwitchState();
}

class _ToggleFilterSwitchState extends State<ToggleFilterSwitch> {
  late bool _isEnabled;

  @override
  void initState() {
    super.initState();
    _isEnabled = widget.initialValue;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          widget.label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
        Transform.scale(
          scale: 0.8,
          child: Switch(
            value: _isEnabled,
            onChanged: (value) {
              setState(() {
                _isEnabled = value;
              });
              widget.onChanged(value);
            },
            activeColor: Colors.white,
            activeTrackColor: const Color(0xFF5E3B7D),
            inactiveThumbColor: Colors.white,
            inactiveTrackColor: Colors.grey[400],
          ),
        ),
      ],
    );
  }
}
