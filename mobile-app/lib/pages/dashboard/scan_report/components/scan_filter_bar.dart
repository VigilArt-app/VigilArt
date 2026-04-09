import 'package:flutter/material.dart';

class ScanFilterBar extends StatelessWidget {
  final TextEditingController searchController;
  final ValueChanged<String> onSearchChanged;
  final bool sortByDateValue;
  final ValueChanged<bool> onSortByDateChanged;
  final bool onlyUncreditedValue;
  final ValueChanged<bool> onOnlyUncreditedChanged;

  const ScanFilterBar({
    Key? key,
    required this.searchController,
    required this.onSearchChanged,
    required this.sortByDateValue,
    required this.onSortByDateChanged,
    required this.onlyUncreditedValue,
    required this.onOnlyUncreditedChanged,
  }) : super(key: key);

  Widget _buildWebStyleToggle(String label, bool value, ValueChanged<bool> onChanged) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(label, style: TextStyle(color: Colors.grey[800], fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(width: 6),
        SizedBox(
          height: 24, width: 40,
          child: FittedBox(
            fit: BoxFit.fill,
            child: Switch(
              value: value,
              onChanged: onChanged,
              activeColor: Colors.white,
              activeTrackColor: const Color(0xFF5E3B7D),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.grey[300],
              trackOutlineColor: WidgetStateProperty.resolveWith((states) => Colors.transparent),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: SizedBox(
            height: 40,
            child: TextField(
              controller: searchController,
              onChanged: onSearchChanged,
              style: const TextStyle(fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search by name or source',
                hintStyle: TextStyle(color: Colors.grey[400], fontSize: 13),
                prefixIcon: Icon(Icons.search, color: Colors.grey[400], size: 20),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey[300]!)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey[300]!)),
                focusedBorder: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(8)), borderSide: const BorderSide(color: Color(0xFF5E3B7D), width: 1.5)),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        _buildWebStyleToggle('Sort by date', sortByDateValue, onSortByDateChanged),
        const SizedBox(width: 16),
        _buildWebStyleToggle('Only uncredited', onlyUncreditedValue, onOnlyUncreditedChanged),
      ],
    );
  }
}
