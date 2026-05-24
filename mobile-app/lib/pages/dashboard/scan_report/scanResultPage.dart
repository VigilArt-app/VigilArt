import 'package:flutter/material.dart';
import 'scanResultCard.dart';
import 'components/scan_filter_bar.dart';
import 'components/scan_table_header.dart';
import 'components/scan_empty_state.dart';
import 'components/artwork_details_sheet.dart';
import '../../../(api)/auth.dart';
import '../../../(api)/scan_reports_api.dart';

enum TimelineFilter { all, week, month, quarter, year }

class ScanResultsPage extends StatefulWidget {
  const ScanResultsPage({Key? key}) : super(key: key);

  @override
  State<ScanResultsPage> createState() => _ScanResultsPageState();
}

class _ScanResultsPageState extends State<ScanResultsPage> {
  
  final TextEditingController _searchController = TextEditingController();
  final ApiService apiService = ApiService();
  
  List<Map<String, dynamic>> _allResults = []; 
  bool _isLoading = true;
  bool _isScanning = false; 

  String _searchQuery = "";
  bool _filterUncredited = false;
  bool _sortByDateToggle = false; 
  String? _sortField; 
  bool _isAscending = true;

  TimelineFilter _timelineFilter = TimelineFilter.all;
  int _currentPage = 1;
  final int _rowsPerPage = 4;

  @override
  void initState() {
    super.initState();
    _fetchRealScanResults();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchRealScanResults() async {
    try {
      final matches = await apiService.getMasterScanReportMatches();
      if (matches != null && mounted) setState(() => _allResults = matches);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _runManualScan() async {
    setState(() => _isScanning = true);

    try {
      final reportData = await apiService.triggerManualScan();
      
      await _fetchRealScanResults();

      if (mounted) {
        _showReportModal(reportData);
      }

    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create report: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isScanning = false);
    }
  }

  void _showReportModal(Map<String, dynamic> reportData) {
    final List<dynamic> matchingPages = reportData['matchingPages'] ?? [];
    final int detectionCount = matchingPages.length;

    final String serverDateString = reportData['detectionDate'] ?? '';
    String formattedDate = 'Unknown Date';
    if (serverDateString.isNotEmpty) {
      final DateTime rawDate = DateTime.parse(serverDateString);
      formattedDate = "${rawDate.month}/${rawDate.day}/${rawDate.year}, ${TimeOfDay.fromDateTime(rawDate).format(context)}";
    }

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return Dialog(
          backgroundColor: const Color(0xFF1E1E1E), 
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Container(
            width: MediaQuery.of(context).size.width * 0.9,
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Report Details',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.grey, size: 20),
                      onPressed: () => Navigator.of(dialogContext).pop(),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_outline, color: Color(0xFF2E7D32), size: 24),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Report created',
                            style: TextStyle(color: Color(0xFF1B5E20), fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '$detectionCount detections found',
                            style: const TextStyle(color: Color(0xFF2E7D32), fontSize: 14),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      RichText(
                        text: TextSpan(
                          style: const TextStyle(color: Colors.black87, fontSize: 14),
                          children: [
                            const TextSpan(text: 'Detection date: ', style: TextStyle(fontWeight: FontWeight.bold)),
                            TextSpan(text: formattedDate),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      RichText(
                        text: TextSpan(
                          style: const TextStyle(color: Colors.black87, fontSize: 14),
                          children: [
                            const TextSpan(text: 'Number of detections: ', style: TextStyle(fontWeight: FontWeight.bold)),
                            TextSpan(text: '$detectionCount'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                Align(
                  alignment: Alignment.centerRight,
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(dialogContext).pop(),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFF444444)),
                      backgroundColor: const Color(0xFF2A2A2A),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                    child: const Text('Cancel'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _handleSort(String field) {
    setState(() {
      _sortByDateToggle = false; 
      if (_sortField == field) {
        if (_isAscending) { _isAscending = false; } 
        else { _sortField = null; _isAscending = true; }
      } else {
        _sortField = field;
        _isAscending = true;
      }
      _currentPage = 1; 
    });
  }

  DateTime _getTimelineStart(TimelineFilter filter) {
    final now = DateTime.now();
    switch (filter) {
      case TimelineFilter.week:
        return now.subtract(const Duration(days: 7));
      case TimelineFilter.month:
        return DateTime(now.year, now.month - 1, now.day);
      case TimelineFilter.quarter:
        return DateTime(now.year, now.month - 3, now.day);
      case TimelineFilter.year:
        return DateTime(now.year - 1, now.month, now.day);
      case TimelineFilter.all:
      return DateTime.fromMillisecondsSinceEpoch(0);
    }
  }

  List<Map<String, dynamic>> get _filteredAndSortedResults {
    final timelineStart = _getTimelineStart(_timelineFilter);

    List<Map<String, dynamic>> results = _allResults.where((result) {
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        if (!result['title'].toString().toLowerCase().contains(query) && 
            !result['mostRecentSource'].toString().toLowerCase().contains(query)) {
          return false;
        }
      }
      
      if (_filterUncredited) {
        final creditedMatches = result['creditedMatches'] ?? 0;
        final totalMatches = result['matchesCount'] ?? 0;
        if (creditedMatches == totalMatches && totalMatches > 0) return false;
      }

      if (_timelineFilter != TimelineFilter.all) {
        final String? dateString = result['mostRecentDate'];
        if (dateString != null) {
          final itemDate = DateTime.tryParse(dateString);
          if (itemDate != null && itemDate.isBefore(timelineStart)) {
            return false;
          }
        }
      }
      return true;
    }).toList();

    String? currentSortField = _sortField;
    bool currentIsAscending = _isAscending;

    if (_sortByDateToggle) {
       currentSortField = 'mostRecentDate';
       currentIsAscending = false;
    }

    if (currentSortField != null) {
      results.sort((a, b) {
        var valA = a[currentSortField]; var valB = b[currentSortField];
        if (valA == null && valB == null) return 0;
        if (valA == null) return currentIsAscending ? 1 : -1;
        if (valB == null) return currentIsAscending ? -1 : 1;
        if (valA is String && valB is String) return currentIsAscending ? valA.compareTo(valB) : valB.compareTo(valA);
        if (valA is num && valB is num) return currentIsAscending ? valA.compareTo(valB) : valB.compareTo(valA);
        return 0;
      });
    }
    return results;
  }

  int get _totalPages {
    final total = (_filteredAndSortedResults.length / _rowsPerPage).ceil();
    return total == 0 ? 1 : total;
  }

  List<Map<String, dynamic>> get _paginatedResults {
    final results = _filteredAndSortedResults;
    final startIndex = (_currentPage - 1) * _rowsPerPage;
    if (startIndex >= results.length) return [];
    final endIndex = startIndex + _rowsPerPage;
    return results.sublist(
      startIndex, 
      endIndex > results.length ? results.length : endIndex
    );
  }

  void _showArtworkDetailsSheet(Map<String, dynamic> artwork) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ArtworkDetailsSheet(artwork: artwork),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF5E3B7D)))
        : SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ScanFilterBar(
                    searchController: _searchController,
                    onSearchChanged: (val) => setState(() {
                      _searchQuery = val;
                      _currentPage = 1;
                    }),
                    sortByDateValue: _sortByDateToggle,
                    onSortByDateChanged: (val) => setState(() {
                      _sortByDateToggle = val;
                      _currentPage = 1;
                    }),
                    onlyUncreditedValue: _filterUncredited,
                    onOnlyUncreditedChanged: (val) => setState(() {
                      _filterUncredited = val;
                      _currentPage = 1;
                    }),
                  ),
                  
                  const SizedBox(height: 16),

                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: TimelineFilter.values.map((filter) {
                        final isSelected = _timelineFilter == filter;
                        String label = "ALL TIME";
                        if (filter == TimelineFilter.week) label = "LAST WEEK";
                        if (filter == TimelineFilter.month) label = "LAST MONTH";
                        if (filter == TimelineFilter.quarter) label = "LAST 3 MONTHS";
                        if (filter == TimelineFilter.year) label = "LAST YEAR";

                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ChoiceChip(
                            label: Text(label, style: TextStyle(fontSize: 12, color: isSelected ? Colors.white : Colors.black87)),
                            selected: isSelected,
                            selectedColor: const Color(0xFF5E3B7D),
                            onSelected: (bool selected) {
                              setState(() {
                                _timelineFilter = filter;
                                _currentPage = 1;
                              });
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  if (_allResults.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 48),
                      child: ScanEmptyState(onUploadPressed: () => Navigator.pushNamed(context, '/upload')),
                    )
                  else ...[
                    ScanTableHeader(
                      sortField: _sortField,
                      isAscending: _isAscending,
                      onSortTap: _handleSort,
                    ),
                    
                    const SizedBox(height: 12),
                    
                    if (_paginatedResults.isEmpty)
                      const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('No results match your filters', style: TextStyle(color: Colors.grey))))
                    else
                      ..._paginatedResults.map((result) {
                        return ScanResultCard(
                          title: result['title'],
                          imageUrl: result['imageUrl'],
                          matchesCount: result['matchesCount'],
                          mostRecentSource: result['mostRecentSource'],
                          onTap: () => _showArtworkDetailsSheet(result),
                        );
                      }).toList(),

                    const SizedBox(height: 24),

                    if (_filteredAndSortedResults.isNotEmpty)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Page $_currentPage / $_totalPages', style: const TextStyle(color: Colors.grey, fontSize: 14)),
                          Row(
                            children: [
                              OutlinedButton(onPressed: _currentPage > 1 ? () => setState(() => _currentPage--) : null, child: const Text('Previous')),
                              const SizedBox(width: 8),
                              OutlinedButton(onPressed: _currentPage < _totalPages ? () => setState(() => _currentPage++) : null, child: const Text('Next')),
                            ],
                          ),
                        ],
                      ),
                  ],
                    
                  const SizedBox(height: 32), 
                  
                  SizedBox(
                    width: double.infinity,
                    height: 64, 
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF333333), width: 1),
                        backgroundColor: const Color(0xFF1A1A1A), 
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: _isScanning ? null : _runManualScan,
                      child: _isScanning
                          ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                          : const Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Create report', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                                Icon(Icons.search, size: 24, color: Colors.grey),
                              ],
                            ),
                    ),
                  ),
                  const SizedBox(height: 32), 
                ],
              ),
            ),
          ),
    );
  }
}