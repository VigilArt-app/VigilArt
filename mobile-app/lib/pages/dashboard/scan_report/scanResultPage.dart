import 'package:flutter/material.dart';
import 'scanResultCard.dart';
import 'components/scan_filter_bar.dart';
import 'components/scan_table_header.dart';
import 'components/scan_empty_state.dart';
import 'components/artwork_details_sheet.dart';
import '../../../(api)/auth.dart';
import '../../../(api)/scan_reports_api.dart';

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

  String _searchQuery = "";
  bool _filterUncredited = false;
  bool _sortByDateToggle = false; 
  String? _sortField; 
  bool _isAscending = true;

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
    });
  }

  List<Map<String, dynamic>> get _filteredResults {
    List<Map<String, dynamic>> results = _allResults.where((result) {
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        if (!result['title'].toString().toLowerCase().contains(query) && 
            !result['mostRecentSource'].toString().toLowerCase().contains(query)) return false;
      }
      
      if (_filterUncredited) {
        final creditedMatches = result['creditedMatches'] ?? 0;
        final totalMatches = result['matchesCount'] ?? 0;
        if (creditedMatches == totalMatches && totalMatches > 0) return false;
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
        : _allResults.isEmpty 
            ? ScanEmptyState(onUploadPressed: () => Navigator.pushNamed(context, '/upload'))
            : SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ScanFilterBar(
                        searchController: _searchController,
                        onSearchChanged: (val) => setState(() => _searchQuery = val),
                        sortByDateValue: _sortByDateToggle,
                        onSortByDateChanged: (val) => setState(() => _sortByDateToggle = val),
                        onlyUncreditedValue: _filterUncredited,
                        onOnlyUncreditedChanged: (val) => setState(() => _filterUncredited = val),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      ScanTableHeader(
                        sortField: _sortField,
                        isAscending: _isAscending,
                        onSortTap: _handleSort,
                      ),
                      
                      const SizedBox(height: 12),
                      
                      if (_filteredResults.isEmpty)
                        const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('No results match your filters', style: TextStyle(color: Colors.grey))))
                      else
                        ..._filteredResults.map((result) {
                          return ScanResultCard(
                            title: result['title'],
                            imageUrl: result['imageUrl'],
                            matchesCount: result['matchesCount'],
                            mostRecentSource: result['mostRecentSource'],
                            onTap: () => _showArtworkDetailsSheet(result),
                          );
                        }).toList(),
                    ],
                  ),
                ),
              ),
    );
  }
}
