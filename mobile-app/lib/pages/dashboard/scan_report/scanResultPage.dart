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
  
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = "";
  String? _sortField; 
  bool _isAscending = true;

  final ApiService apiService = ApiService();
  bool _isLoading = true;
  List<Map<String, dynamic>> _allResults = []; 

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
      if (matches != null && mounted) {
        setState(() {
          _allResults = matches;
        });
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleSort(String field) {
    setState(() {
      if (_sortField == field) {
        if (_isAscending) _isAscending = false;
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
            !result['mostRecentSource'].toString().toLowerCase().contains(query)) {
          return false;
        }
      }
      if (_selectedDate != null && result['mostRecentDate'] != null) {
        try {
          DateTime matchDate = DateTime.parse(result['mostRecentDate']);
          if (matchDate.year != _selectedDate!.year || matchDate.month != _selectedDate!.month || matchDate.day != _selectedDate!.day) return false;
        } catch (e) {}
      }
      return true;
    }).toList();

    if (_sortField != null) {
      results.sort((a, b) {
        var valA = a[_sortField]; var valB = b[_sortField];
        if (valA == null && valB == null) return 0;
        if (valA == null) return _isAscending ? 1 : -1;
        if (valB == null) return _isAscending ? -1 : 1;
        if (valA is String && valB is String) return _isAscending ? valA.compareTo(valB) : valB.compareTo(valA);
        if (valA is num && valB is num) return _isAscending ? valA.compareTo(valB) : valB.compareTo(valA);
        return 0;
      });
    }
    return results;
  }

  void _showArtworkDetailsSheet(Map<String, dynamic> artwork) {
    List<dynamic> matchingPages = artwork['matchingPages'] ?? [];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(color: Colors.black, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(child: Text(artwork['title'], style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold, height: 1.2), maxLines: 2, overflow: TextOverflow.ellipsis)),
                    IconButton(icon: const Icon(Icons.close, color: Colors.white, size: 28), onPressed: () => Navigator.pop(context)),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Total Matches: ${artwork['matchesCount']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 4),
                      Text('Most Recent Source: ${artwork['mostRecentSource']}', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                      const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Divider()),
                      const Text('All detected reposts:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.black)),
                      const SizedBox(height: 16),
                      if (matchingPages.isEmpty)
                        const Center(child: Padding(padding: EdgeInsets.all(20), child: Text("No matches found for this artwork.")))
                      else
                        ...matchingPages.map((page) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey[300]!)),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (page['imageUrl'] != null)
                                  ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.network(page['imageUrl'], width: 60, height: 60, fit: BoxFit.cover)),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Category: ${page['category'] ?? 'N/A'}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                      Text('Website: ${page['websiteName'] ?? 'Unknown'}', style: const TextStyle(fontSize: 12)),
                                      Text('Title: ${page['pageTitle'] ?? 'N/A'}', style: const TextStyle(fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                                      Text('Found: ${page['firstDetectedAt']?.toString().split('T')[0] ?? ''}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
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
              decoration: BoxDecoration(color: const Color(0xFF5E3B7D).withOpacity(0.08), shape: BoxShape.circle),
              child: const Icon(Icons.image_search_rounded, size: 72, color: Color(0xFF5E3B7D)),
            ),
            const SizedBox(height: 24),
            const Text('No scan reports yet', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.black87)),
            const SizedBox(height: 36),
            ElevatedButton.icon(
              onPressed: () {Navigator.pushNamed(context, '/upload');}, 
              icon: const Icon(Icons.cloud_upload_outlined, color: Colors.white, size: 20),
              label: const Text('Upload Pictures', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5E3B7D),
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(12), 
        border: Border.all(color: Colors.grey.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => _handleSort('title'), 
            child: Row(children: [const Text('Name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)), Icon(_sortField == 'title' ? (_isAscending ? Icons.arrow_upward : Icons.arrow_downward) : Icons.swap_vert, size: 14)])
          ),
          const Spacer(),
          GestureDetector(
            onTap: () => _handleSort('matchesCount'), 
            child: Row(children: [const Text('Matches', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)), Icon(_sortField == 'matchesCount' ? (_isAscending ? Icons.arrow_upward : Icons.arrow_downward) : Icons.swap_vert, size: 14)])
          ),
          const SizedBox(width: 20),
          const Text('Recent', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF5E3B7D)))
        : _allResults.isEmpty 
            ? _buildEmptyState()
            : SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        controller: _searchController,
                        onChanged: (val) => setState(() => _searchQuery = val),
                        decoration: InputDecoration(
                          hintText: 'Search by Artwork name...',
                          prefixIcon: const Icon(Icons.search, color: Colors.grey),
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      DatePickerField(
                        label: 'Date', 
                        onDateSelected: (date) => setState(() => _selectedDate = date), 
                        firstDate: DateTime(2020), 
                        lastDate: DateTime.now()
                      ),
                      const SizedBox(height: 15),
                      
                      Row(
                        children: [
                          Expanded(child: ToggleFilterSwitch(label: 'Only uncredited', initialValue: _filterUncredited, onChanged: (v) => setState(() => _filterUncredited = v))),
                          const SizedBox(width: 12),
                          Expanded(child: ToggleFilterSwitch(label: 'Recent source', initialValue: _filterRecent, onChanged: (v) => setState(() => _filterRecent = v))),
                        ],
                      ),
                      const SizedBox(height: 24),
                      
                      const Text('View by:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF62636D))),
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
                      
                      _buildTableHeader(),
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
