import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../(api)/auth.dart';
import '../../(api)/gallery.dart';
import '../../(api)/user.dart';
import '../../l10n/app_localizations.dart';
import '../../theme/app_colors.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/header_bar.dart';
import '../../widgets/slide_menu_bar.dart';
import '../../widgets/status_badge.dart';
import '../dmca/dmca_page.dart';
import 'gallery_image_card.dart';
import 'widgets/artwork_gallery_details_sheet.dart';

class GalleryPage extends StatefulWidget {
  const GalleryPage({super.key, this.apiService});

  // Injected by tests.
  final ApiService? apiService;

  @override
  State<GalleryPage> createState() => _GalleryPageState();
}

class _GalleryPageState extends State<GalleryPage> {
  late final ApiService _apiService = widget.apiService ?? ApiService();
  ArtworkStatus? _filter; // null = All
  String _searchQuery = '';
  bool _isLoading = true;
  bool _loadFailed = false;
  String _userAvatarUrl = 'assets/images/default_avatar.jpg';
  List<Map<String, dynamic>> _allArtworks = [];

  @override
  void initState() {
    super.initState();
    _loadUserAvatar();
    _loadArtworks();
  }

  Future<void> _loadUserAvatar() async {
    final key = await _apiService.secureStorage.read(key: ApiService.keyUserAvatar);
    var url = 'assets/images/default_avatar.jpg';
    if (key != null && key.isNotEmpty && key != 'null') {
      if (key.startsWith('http')) {
        url = key;
      } else if (key.startsWith('profiles/')) {
        try {
          final download = await _apiService.getAvatarDownloadUrl(key);
          if (download != null && download.isNotEmpty) url = download;
        } catch (e) {
          debugPrint('Avatar load error: $e');
        }
      } else {
        url = key;
      }
    }
    if (mounted) setState(() => _userAvatarUrl = url);
  }

  Future<void> _loadArtworks() async {
    setState(() {
      _isLoading = true;
      _loadFailed = false;
    });
    try {
      final data = await _apiService.fetchGalleryArtworks();
      if (!mounted) return;
      setState(() {
        if (data == null) {
          _loadFailed = true;
        } else {
          _allArtworks = data;
        }
        _isLoading = false;
      });
    } catch (_) {
      if (mounted) setState(() { _loadFailed = true; _isLoading = false; });
    }
  }

  List<Map<String, dynamic>> get _filteredArtworks {
    final query = _searchQuery.trim().toLowerCase();
    return _allArtworks.where((art) {
      if (_filter != null && statusOf(art) != _filter) return false;
      if (query.isEmpty) return true;
      final haystack = '${art['id']} ${art['title']} ${art['originalFilename']} ${art['date']}'.toLowerCase();
      return haystack.contains(query);
    }).toList();
  }

  Future<void> _confirmDelete(Map<String, dynamic> art) async {
    final l10n = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final ok = await showAdaptiveDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog.adaptive(
        title: Text(l10n.artworkDelete),
        content: Text(l10n.artworkConfirmDelete),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l10n.cancel)),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l10n.delete, style: TextStyle(color: ctx.colors.error))),
        ],
      ),
    );
    if (ok != true) return;
    final deleted = await _apiService.deleteArtwork(art['id'].toString());
    if (!mounted) return;
    if (deleted) {
      setState(() => _allArtworks.removeWhere((a) => a['id'] == art['id']));
      messenger.showSnackBar(SnackBar(content: Text(l10n.artworkDeleted)));
    } else {
      messenger.showSnackBar(SnackBar(content: Text(l10n.artworkFailedDelete)));
    }
  }

  Future<void> _editDescription(Map<String, dynamic> art) async {
    final l10n = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final controller = TextEditingController(text: art['description']?.toString() ?? '');
    final saved = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(16, 0, 16, 16 + MediaQuery.of(ctx).viewInsets.bottom),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(l10n.artworkEditTitle, style: Theme.of(ctx).textTheme.titleLarge),
            const SizedBox(height: 4),
            Text(l10n.artworkEditBody, style: TextStyle(color: ctx.colors.textMuted)),
            const SizedBox(height: 12),
            TextField(controller: controller, maxLines: 3, autofocus: true),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: CustomButton(text: l10n.cancel, isOutlined: true, onPressed: () => Navigator.pop(ctx))),
                const SizedBox(width: 8),
                Expanded(child: CustomButton(text: l10n.save, onPressed: () => Navigator.pop(ctx, controller.text))),
              ],
            ),
          ],
        ),
      ),
    );
    controller.dispose();
    if (saved == null) return;
    final ok = await _apiService.updateArtworkDescription(art['id'].toString(), saved);
    if (!mounted) return;
    if (ok) {
      setState(() {
        art['description'] = saved;
        art['title'] = saved.isNotEmpty ? saved : art['originalFilename'];
      });
    } else {
      messenger.showSnackBar(SnackBar(content: Text(l10n.profileErrorUpdating)));
    }
  }

  void _openDetails(Map<String, dynamic> art) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => FractionallySizedBox(
        heightFactor: 0.85,
        child: ArtworkGalleryDetailsSheet(
          artwork: art,
          onViewReposts: () {
            Navigator.pop(ctx);
            Navigator.pushReplacementNamed(context, '/dashboard');
          },
          onFileDmca: () {
            Navigator.pop(ctx);
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => DmcaPage(artworkPrefill: {
                  'artworkId': art['id'],
                  'artworkTitle': art['title'] ?? art['originalFilename'] ?? art['id'],
                  'infringingUrls': ((art['matches'] as List?) ?? []).map((m) => (m as Map)['url']).whereType<String>().toList(),
                }),
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    final artworks = _filteredArtworks;
    final filters = <(ArtworkStatus?, String)>[
      (null, l10n.filterAll),
      (ArtworkStatus.notScanned, l10n.statusNotScanned),
      (ArtworkStatus.noMatches, l10n.statusNoMatches),
      (ArtworkStatus.matchesFound, l10n.statusMatchesFound),
      (ArtworkStatus.resultsUnavailable, l10n.statusUnavailable),
    ];

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(64),
        child: SafeArea(
          bottom: false,
          child: VigilArtHeaderBar(
            onLogoTap: () => Navigator.pushReplacementNamed(context, '/dashboard'),
            onProfileTap: () => Navigator.pushReplacementNamed(context, '/profile'),
            avatar: _userAvatarUrl,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadArtworks,
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(l10n.galleryTitle, style: Theme.of(context).textTheme.headlineLarge),
                          const SizedBox(height: 12),
                          TextField(
                            onChanged: (v) => setState(() => _searchQuery = v),
                            decoration: InputDecoration(hintText: l10n.gallerySearch, prefixIcon: const Icon(LucideIcons.search, size: 20)),
                          ),
                          const SizedBox(height: 8),
                          Text('${artworks.length} ${l10n.galleryImages}', style: const TextStyle(fontWeight: FontWeight.w500)),
                          SizedBox(
                            height: 52,
                            child: ListView(
                              scrollDirection: Axis.horizontal,
                              children: [
                                for (final f in filters)
                                  Padding(
                                    padding: const EdgeInsets.only(right: 8, top: 4, bottom: 4),
                                    child: ChoiceChip(
                                      label: Text(f.$2),
                                      selected: _filter == f.$1,
                                      labelStyle: TextStyle(color: _filter == f.$1 ? c.onPrimary : c.text, fontWeight: FontWeight.w500),
                                      onSelected: (_) => setState(() => _filter = f.$1),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (_loadFailed)
                    SliverFillRemaining(
                      hasScrollBody: false,
                      child: _Message(icon: LucideIcons.triangleAlert, title: l10n.artworkFailedLoad, action: l10n.retry, onAction: _loadArtworks),
                    )
                  else if (_allArtworks.isEmpty)
                    SliverFillRemaining(
                      hasScrollBody: false,
                      child: _Message(
                        icon: LucideIcons.image,
                        title: l10n.galleryEmptyTitle,
                        body: l10n.galleryEmptySubtitle,
                        action: l10n.uploadArtworks,
                        onAction: () => Navigator.pushReplacementNamed(context, '/dashboard'),
                      ),
                    )
                  else if (artworks.isEmpty)
                    SliverFillRemaining(hasScrollBody: false, child: _Message(icon: LucideIcons.search, title: l10n.galleryNoArtworks, body: l10n.galleryTryAdjusting))
                  else
                    SliverPadding(
                      padding: const EdgeInsets.all(16),
                      sliver: SliverGrid(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.8),
                        delegate: SliverChildBuilderDelegate(
                          (context, i) => GalleryImageCard(
                            artwork: artworks[i],
                            onTap: () => _openDetails(artworks[i]),
                            onEdit: () => _editDescription(artworks[i]),
                            onDelete: () => _confirmDelete(artworks[i]),
                          ),
                          childCount: artworks.length,
                        ),
                      ),
                    ),
                ],
              ),
            ),
      bottomNavigationBar: SlideMenuBar(
        selectedIndex: 0,
        onTabChange: (index) {
          switch (index) {
            case 1:
              Navigator.pushReplacementNamed(context, '/dashboard');
            case 2:
              Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const DmcaPage(artworkPrefill: {})));
            case 3:
              Navigator.pushReplacementNamed(context, '/profile');
          }
        },
      ),
    );
  }
}

class _Message extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? body;
  final String? action;
  final VoidCallback? onAction;

  const _Message({required this.icon, required this.title, this.body, this.action, this.onAction});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 48, color: c.primaryText),
          const SizedBox(height: 12),
          Text(title, textAlign: TextAlign.center, style: Theme.of(context).textTheme.titleLarge),
          if (body != null) ...[const SizedBox(height: 4), Text(body!, textAlign: TextAlign.center, style: TextStyle(color: c.textMuted))],
          if (action != null) ...[const SizedBox(height: 16), CustomButton(text: action!, onPressed: onAction)],
        ],
      ),
    );
  }
}
