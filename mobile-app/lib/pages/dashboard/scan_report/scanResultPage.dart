import 'package:flutter/material.dart';
import 'dart:convert';
import '../../../(api)/auth.dart';
import '../../../(api)/scan_reports_api.dart';
import 'widgets/scan_result_card.dart';
import 'widgets/artwork_details_sheet.dart';

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
  TimelineFilter _timelineFilter = TimelineFilter.all;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final matches = await apiService.getMasterScanReportMatches();
      if (matches != null && mounted) setState(() => _allResults = matches);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        icon: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.red.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.error_outline_rounded, color: Colors.redAccent, size: 40),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 20)),
        content: Text(
          message,
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey[700], fontSize: 15, height: 1.4),
        ),
        actionsAlignment: MainAxisAlignment.center,
        actionsPadding: const EdgeInsets.only(bottom: 20, left: 20, right: 20),
        actions: [
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => Navigator.of(ctx).pop(),
              style: FilledButton.styleFrom(
                backgroundColor: Colors.grey[200],
                foregroundColor: Colors.black87,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: const Text('Understood', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _runManualScan() async {
    setState(() => _isScanning = true);

    try {
      final reportData = await apiService.triggerManualScan();
      
      await _fetchData();

      if (mounted) {
        final List<dynamic> matchingPages = reportData['matchingPages'] ?? [];
        final int detectionCount = matchingPages.length;

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 12),
                Expanded(child: Text('Scan complete! Found $detectionCount new detections.')),
              ],
            ), 
            backgroundColor: const Color(0xFF22C55E),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        String serverMessage = 'An error occurred.';
        String title = 'Error';

        try {
          String errorString = e.toString();
          int jsonStartIndex = errorString.indexOf('{');
          
          if (jsonStartIndex != -1) {
            String jsonPart = errorString.substring(jsonStartIndex);
            final Map<String, dynamic> errorJson = jsonDecode(jsonPart);
            
            if (errorJson.containsKey('message')) {
              var msg = errorJson['message'];
              serverMessage = msg is List ? msg.join('\n') : msg.toString();
            }
          } else {
            serverMessage = errorString.replaceAll('Exception:', '').trim();
          }
        } catch (_) {
          serverMessage = e.toString().replaceAll('Exception:', '').trim();
        }

        if (serverMessage.toLowerCase().contains('unauthorized')) {
          title = 'Authentication Error';
        } else if (serverMessage.toLowerCase().contains('30 days')) {
          title = 'Scan Limit';
        }

        _showErrorDialog(title, serverMessage);
      }
    } finally {
      if (mounted) setState(() => _isScanning = false);
    }
  }

  List<Map<String, dynamic>> get _filteredResults {
    return _allResults.where((result) {
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        if (!result['title'].toString().toLowerCase().contains(query)) return false;
      }
      return true;
    }).toList();
  }

  void _showDetailsSheet(Map<String, dynamic> artwork) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FractionallySizedBox(
        heightFactor: 0.85, 
        child: ArtworkDetailsSheet(artwork: artwork),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final results = _filteredResults;

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: SafeArea( 
        child: _isLoading 
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF5E3B7D)))
          : RefreshIndicator(
              onRefresh: _fetchData,
              color: const Color(0xFF5E3B7D),
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TextField(
                            controller: _searchController,
                            onChanged: (val) => setState(() => _searchQuery = val),
                            decoration: InputDecoration(
                              hintText: 'Search artworks...',
                              prefixIcon: const Icon(Icons.search, color: Colors.grey),
                              filled: true,
                              fillColor: Colors.white,
                              contentPadding: const EdgeInsets.symmetric(vertical: 14),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: BorderSide(color: Colors.grey[200]!),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: BorderSide(color: Colors.grey[200]!),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: const BorderSide(color: Color(0xFF5E3B7D), width: 1.5),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            physics: const BouncingScrollPhysics(),
                            child: Row(
                              children: TimelineFilter.values.map((filter) {
                                final isSelected = _timelineFilter == filter;
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8.0),
                                  child: ChoiceChip(
                                    label: Text(filter.name.toUpperCase()),
                                    selected: isSelected,
                                    selectedColor: const Color(0xFF5E3B7D),
                                    backgroundColor: Colors.white,
                                    side: BorderSide(color: isSelected ? const Color(0xFF5E3B7D) : Colors.grey[300]!),
                                    labelStyle: TextStyle(
                                      color: isSelected ? Colors.white : Colors.black87,
                                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                      fontSize: 12,
                                    ),
                                    onSelected: (bool selected) {
                                      setState(() => _timelineFilter = filter);
                                    },
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: results.isEmpty
                      ? const SliverToBoxAdapter(
                          child: Padding(
                            padding: EdgeInsets.only(top: 60),
                            child: Center(
                              child: Column(
                                children: [
                                  Icon(Icons.image_search_rounded, size: 64, color: Colors.black12),
                                  SizedBox(height: 16),
                                  Text("No scans found matching your criteria.", style: TextStyle(color: Colors.black54)),
                                ],
                              ),
                            ),
                          ),
                        )
                      : SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              return ScanResultCard(
                                result: results[index],
                                onTap: () => _showDetailsSheet(results[index]),
                              );
                            },
                            childCount: results.length,
                          ),
                        ),
                  ),
                ],
              ),
            ),
      ),
          
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 20,
                offset: const Offset(0, -5),
              )
            ],
          ),
          child: SizedBox(
            height: 56,
            child: ElevatedButton(
              onPressed: _isLoading || _isScanning ? null : _runManualScan,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5E3B7D), 
                disabledBackgroundColor: Colors.grey[300],
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: _isScanning
                  ? const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5)),
                        SizedBox(width: 12),
                        Text('GENERATING...', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 1.0)),
                      ],
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.radar_rounded, color: Colors.white, size: 22),
                        SizedBox(width: 12),
                        Text('CREATE NEW REPORT', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 1.0)),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
