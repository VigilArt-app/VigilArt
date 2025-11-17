import 'dart:ui';

import 'package:flutter/material.dart';

class ScanResultCard extends StatelessWidget {
  final int id;
  final String imageUrl;
  final String sourceUrl;
  final int matchCount;
  final String credibility;
  final String displayMode;
  final VoidCallback onTap;

  const ScanResultCard({
    Key? key,
    required this.id,
    required this.imageUrl,
    required this.sourceUrl,
    required this.matchCount,
    required this.credibility,
    required this.displayMode,
    required this.onTap,
  }) : super(key: key);

  Color _getCredibilityColor() {
    switch (credibility.toLowerCase()) {
      case 'high':
        return const Color(0xFF22C55E);
      case 'medium':
        return const Color(0xFFF59E0B);
      case 'low':
        return const Color(0xFFEF4444);
      default:
        return Colors.grey;
    }
  }

  Widget _buildDynamicContent() {
    switch (displayMode) {
      case 'matches':
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFF5E3B7D).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                matchCount.toString(),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: Color(0xFF5E3B7D),
                ),
              ),
              const Text(
                'Matches',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF5E3B7D),
                ),
              ),
            ],
          ),
        );

      case 'source':
        return Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF5E3B7D),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                sourceUrl,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        );

      case 'credited':
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: _getCredibilityColor(),
            border: Border.all(color: _getCredibilityColor(), width: 1.5),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            credibility.toUpperCase(),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Colors.white,
              letterSpacing: 0.5,
            ),
          ),
        );

      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!, width: 1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  '#${id.toString().padLeft(2, '0')}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                    color: Color(0xFF62636D),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),

            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                image: DecorationImage(
                  image: NetworkImage(imageUrl),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(child: _buildDynamicContent()),
          ],
        ),
      ),
    );     
  }
}
