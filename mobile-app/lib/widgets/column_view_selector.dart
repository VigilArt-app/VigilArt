import 'package:flutter/material.dart';

class ColumnViewSelector extends StatelessWidget {
  final String selectedView;
  final ValueChanged<String> onViewChanged;

  const ColumnViewSelector({
    Key? key,
    required this.selectedView,
    required this.onViewChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final List<String> views = ['Number of Matches', 'Recent source', 'Credited'];
    
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey[300]!, width: 1),
      ),
      child: Row(
        children: List.generate(views.length, (index) {
          final String view = views[index];
          final bool isSelected = selectedView == view;

          return Expanded(
            child: GestureDetector(
              onTap: () => onViewChanged(view),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.black : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    view,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : Colors.grey[600],
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
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
