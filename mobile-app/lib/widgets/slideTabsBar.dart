import 'package:flutter/material.dart';

class SlideTabsBar extends StatelessWidget {
  final List<String> tabs;
  final int selectedTab;
  final ValueChanged<int> onTabSelected;

  const SlideTabsBar({
    Key? key,
    required this.tabs,
    required this.selectedTab,
    required this.onTabSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      
      children: List.generate(tabs.length, (index) {

        final bool isSelected = selectedTab == index;
        return GestureDetector(
          onTap: () => onTabSelected(index),
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 18, vertical: 9),
            decoration: BoxDecoration(
              color: isSelected ? Colors.black : Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                if (isSelected)
                  BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0,2))
              ],
            ),
            child: Text(
              tabs[index],
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black54,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        );
      }),
    );
  }
}
