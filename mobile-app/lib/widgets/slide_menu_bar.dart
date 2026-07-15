import 'package:flutter/material.dart';

class SlideMenuBar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onTabChange;

  const SlideMenuBar({
    super.key, 
    required this.selectedIndex,
    required this.onTabChange, 
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          IconButton(
            icon: const Icon(Icons.camera_alt_outlined),
            onPressed: () => onTabChange(0),
            color: selectedIndex == 0 ? const Color(0xFF5E3B7D) : Colors.grey,
          ),
          IconButton(
            icon: const Icon(Icons.dashboard_outlined),
            onPressed: () => onTabChange(1),
            color: selectedIndex == 1 ? const Color(0xFF5E3B7D) : Colors.grey,
          ),
          IconButton(
            icon: const Icon(Icons.gavel_rounded),
            onPressed: () => onTabChange(2),
            color: selectedIndex == 2 ? const Color(0xFF5E3B7D) : Colors.grey,
          ),
          IconButton(
            icon: const Icon(Icons.person_2_outlined),
            onPressed: () => onTabChange(3),
            color: selectedIndex == 3 ? const Color(0xFF5E3B7D) : Colors.grey,
          ),
        ],
      ),
    );
  }
}
