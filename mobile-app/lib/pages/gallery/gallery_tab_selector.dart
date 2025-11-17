import 'package:flutter/material.dart';

class GalleryTabSelector extends StatelessWidget {
  final String selectedTab;
  final ValueChanged<String> onTabChanged;

  const GalleryTabSelector({
    super.key,
    required this.selectedTab,
    required this.onTabChanged,
  });

  @override
  Widget build(BuildContext context) {
    final List<String> tabs = ['All', 'Scanning', 'Scanned', 'Protected'];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: List.generate(tabs.length, (index) {
          final String tab = tabs[index];
          final bool isSelected = selectedTab == tab;

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => onTabChanged(tab),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF5E3B7D) : Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: isSelected
                      ? null
                      : Border.all(
                          color: const Color(0xFFE0E0E0),
                          width: 1.5,
                        ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: const Color(0xFF5E3B7D).withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          )
                        ]
                      : [],
                ),
                child: Text(
                  tab,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? Colors.white : Colors.grey[700],
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
