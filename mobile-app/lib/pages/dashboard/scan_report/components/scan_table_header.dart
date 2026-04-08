import 'package:flutter/material.dart';

class ScanTableHeader extends StatelessWidget {
  final String? sortField;
  final bool isAscending;
  final Function(String) onSortTap;

  const ScanTableHeader({
    Key? key,
    required this.sortField,
    required this.isAscending,
    required this.onSortTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => onSortTap('title'),
            child: Row(children: [
              const Text('Name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              Icon(sortField == 'title' ? (isAscending ? Icons.arrow_upward : Icons.arrow_downward) : Icons.swap_vert, size: 14)
            ]),
          ),
          const Spacer(),
          GestureDetector(
            onTap: () => onSortTap('matchesCount'),
            child: Row(children: [
              const Text('Matches', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              Icon(sortField == 'matchesCount' ? (isAscending ? Icons.arrow_upward : Icons.arrow_downward) : Icons.swap_vert, size: 14)
            ]),
          ),
          const SizedBox(width: 20),
          const Text('Recent', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}