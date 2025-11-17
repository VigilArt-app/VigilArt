import 'package:VigilArt/pages/dashboard/scan_report/scanResultCard.dart';
import 'package:VigilArt/widgets/column_view_selector.dart';
import 'package:VigilArt/widgets/toggleFilterSwitch.dart';
import 'package:VigilArt/widgets/date_picket_widget.dart';
import 'package:flutter/material.dart';

class ScanResultsPage extends StatefulWidget {
  const ScanResultsPage({Key? key}) : super(key: key);

  @override
  State<ScanResultsPage> createState() => _ScanResultsPageState();
}

class _ScanResultsPageState extends State<ScanResultsPage> {

  DateTime? _selectedDate;
  bool _filterUncredited = false;
  bool _filterRecent = false;
  String _selectedView = 'Number of Matches'; 

  final List<Map<String, dynamic>> _allResults = [
    {
      'id': 1,
      'image': 'https://i.pinimg.com/1200x/ca/17/e1/ca17e18361e06390d72cc6e6279c640b.jpg',
      'url': 'https://google.com',
      'matches': 5,
      'credibility': 'high',
      'source': 'google.com',
    },
    {
      'id': 2,
      'image': 'https://i.pinimg.com/736x/f4/8c/26/f48c263c59fdd80fcb0918d3ed099322.jpg',
      'url': 'https://instagram.com',
      'matches': 3,
      'credibility': 'medium',
      'source': 'instagram.com',
    },
    {
      'id': 3,
      'image': 'https://i.pinimg.com/736x/2e/55/7d/2e557d03a244ee4649c928f6a51404c3.jpg',
      'url': 'https://pinterest.com',
      'matches': 8,
      'credibility': 'low',
      'source': 'pinterest.com',
    },
    {
      'id': 4,
      'image': 'https://i.pinimg.com/736x/e6/41/f0/e641f0fe2d87bc61c83541ccdda5b063.jpg',
      'url': 'https://pinterest.com',
      'matches': 2,
      'credibility': 'high',
      'source': 'pinterest.com',
    },
    {
      'id': 5,
      'image': 'https://i.pinimg.com/1200x/8a/a6/f1/8aa6f1bc074b031dfdc858baa354a720.jpg',
      'url': 'https://pinterest.com',
      'matches': 12,
      'credibility': 'medium',
      'source': 'pinterest.com',
    },
  ];

  List<Map<String, dynamic>> get _filteredResults {
    return _allResults.where((result) {
      if (_selectedDate != null) {

      }

      if (_filterUncredited && result['credibility'] != 'low') {
        return false;
      }

      if (_filterRecent && result['matches'] < 5) {
        return false;
      }

      return true;
    }).toList();
  }

  String _getDisplayLabel() {
    switch (_selectedView) {
      case 'Number of Matches':
        return 'Matches';
      case 'Recent source':
        return 'Source';
      case 'Credited':
        return 'Credibility';
      default:
        return 'Details';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DatePickerField(
                label: 'Date',
                onDateSelected: (date) {
                  setState(() {
                    _selectedDate = date;
                  });
                },
                firstDate: DateTime(2020),
                lastDate: DateTime.now(),
              ),
              const SizedBox(height: 15),

              Container(
                padding: const EdgeInsets.all(10),
                child: Row(
                  children: [
                    ToggleFilterSwitch(
                      label: 'Only uncredited',
                      initialValue: false,
                      onChanged: (value) {
                        setState(() {
                          _filterUncredited = value;
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    ToggleFilterSwitch( 
                      label: 'Recent source',
                      initialValue: false,
                      onChanged: (value) {
                        setState(() {
                          _filterRecent = value;
                        });
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              Text(
                'View by:',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 8),
              ColumnViewSelector(
                selectedView: _selectedView,
                onViewChanged: (newView) {
                  setState(() {
                    _selectedView = newView;
                  });
                },
              ),
              const SizedBox(height: 24),

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 20),
                    const Text(
                      'ID',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF62636D),
                      ),
                    ),
                    const SizedBox(width: 30),
                    const Text(
                      'Image',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF62636D),
                      ),
                    ),
                    const Spacer(),
                    Text(
                      _getDisplayLabel(),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF62636D),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              if (_filteredResults.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(48),
                    child: Column(
                      children: [
                        Icon(
                          Icons.search_off,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No results found',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ..._filteredResults.map((result) {
                  return ScanResultCard(
                    id: result['id'],
                    imageUrl: result['image'],
                    sourceUrl: result['source'],
                    matchCount: result['matches'],
                    credibility: result['credibility'],
                    displayMode: _selectedView == 'Number of Matches'
                        ? 'matches'
                        : _selectedView == 'Recent source'
                            ? 'source'
                            : 'credited',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Tapped result #${result['id']}'),
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                  );
                }).toList(),
            ],
          ),
        ),
      ),
    );
  }
}
