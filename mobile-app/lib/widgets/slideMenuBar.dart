import 'package:flutter/material.dart';

class SlideMenuBar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onTabChange;

  const SlideMenuBar({
    Key? key, 
    required this.selectedIndex,
    required this.onTabChange, 
  }) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          IconButton(
            icon: Icon(Icons.camera_alt_outlined),
            onPressed:() => onTabChange(0),
            color: selectedIndex == 0 ? Colors.black : Colors.grey,
          ),
          IconButton(
            icon: Icon(Icons.dashboard),
            onPressed: () => onTabChange(1),
            color: selectedIndex == 1 ? Colors.black : Colors.grey,
          ),
          IconButton(
            icon: Icon(Icons.person_2_outlined),
            onPressed: () => onTabChange(2),
            color: selectedIndex == 2 ? Colors.black : Colors.grey,
          ),
        ],
      ),
    );
  }
}