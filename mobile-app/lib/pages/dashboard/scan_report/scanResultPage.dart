import 'package:flutter/material.dart';
import 'scanResultCard.dart';
import 'package:VigilArt/widgets/column_view_selector.dart';
import 'package:VigilArt/widgets/toggleFilterSwitch.dart';
import 'package:VigilArt/widgets/date_picket_widget.dart';

import '../../../(api)/auth.dart';
import '../../../(api)/scan_reports_api.dart';

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

  final ApiService apiService = ApiService();
  bool _isLoading = true;
  List<Map<String, dynamic>> _allResults = []; 

  @override
  void initState() {
    super.initState();
    _fetchRealScanResults();
  }

  Future<void> _fetchRealScanResults() async {
    try {
      final matches = await apiService.getMasterScanReportMatches();
      
      if (matches != null && mounted) {
        setState(() {
          _allResults = matches.map((match) {
            return {
              'id': match['id']?.toString() ?? match['matchId']?.toString() ?? 'N/A', 
              'image': match['imageUrl'], 
              'url': match['pageUrl'] ?? '',
              'matches': match['matchCount'] ?? 1, 
              'credibility': match['credibility']?.toString().toLowerCase() ?? 'unknown',
              'source': match['domain'] ?? 'Unknown Source',
              'date': match['createdAt'] ?? match['dateFound'] ?? null, 
            };
          }).toList();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading matches: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  List<Map<String, dynamic>> get _filteredResults {
    return _allResults.where((result) {
      // 1. Date Logic
      if (_selectedDate != null && result['date'] != null) {
        try {
          DateTime matchDate = DateTime.parse(result['date']);
          if (matchDate.year != _selectedDate!.year || 
              matchDate.month != _selectedDate!.month || 
              matchDate.day != _selectedDate!.day) {
            return false;
          }
        } catch (e) {//
                }
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
      case 'Number of Matches': return 'Matches';
      case 'Recent source': return 'Source';
      case 'Credited': return 'Credibility';
      default: return 'Details';
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: const Color(0xFF5E3B7D).withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.image_search_rounded,
                size: 72,
                color: Color(0xFF5E3B7D),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'No scan reports yet',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Upload some pictures to start monitoring your art across the web and protect your rights.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
                height: 1.5,
              ),
            ),
            const SizedBox(height: 36),
            ElevatedButton.icon(
              onPressed: () {
                //Navigator.pushNamed(context, UploadPhotosPage())
                // TODO: Route to your upload tab or page
                // Example: widget.onUploadRequested?.call(); or Navigator.pushNamed(...)
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Redirecting to Upload Page...')),
                );
              },
              icon: const Icon(Icons.cloud_upload_outlined, color: Colors.white, size: 20),
              label: const Text(
                'Upload Pictures',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                  letterSpacing: 0.5,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5E3B7D), // VigilArt primary brand color
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: _isLoading 
        ? const Center(
            child: CircularProgressIndicator(color: Color(0xFF5E3B7D)),
          )
        : _allResults.isEmpty 
            ? _buildEmptyState()
            : SingleChildScrollView(
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
                                  'No results match your filters',
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
                                  content: Text('Tapped match URL: ${result['url']}'),
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
