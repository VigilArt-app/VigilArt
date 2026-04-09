import 'package:flutter/material.dart';

class VigilArtHeaderBar extends StatefulWidget {
  final VoidCallback onLogoTap;
  final VoidCallback onNotificationsTap;
  final VoidCallback onProfileTap;
  final String avatar;
  final int notificationCount; // Optional badge count

  const VigilArtHeaderBar({
    Key? key,
    required this.onLogoTap,
    required this.onNotificationsTap,
    required this.onProfileTap,
    required this.avatar,
    this.notificationCount = 0,
  }) : super(key: key);

  @override
  State<VigilArtHeaderBar> createState() => _VigilArtHeaderBarState();
}

class _VigilArtHeaderBarState extends State<VigilArtHeaderBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _onAvatarTap() {
    _animationController.forward().then((_) {
      _animationController.reverse();
    });
    widget.onProfileTap();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
            spreadRadius: 2,
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: widget.onLogoTap,
              child: MouseRegion(
                cursor: SystemMouseCursors.click,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF5E3B7D).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Image.asset(
                      'assets/icons/vigilart_app_icon.png',
                      height: 32,
                      width: 32,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ),
            ),

            Text(
              'VigilArt',
              style: TextStyle(
                fontFamily: "Giaza",
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF1F2121),
                letterSpacing: 0.5,
                shadows: [
                  Shadow(
                    color: Colors.black.withOpacity(0.05),
                    offset: const Offset(0, 2),
                    blurRadius: 4,
                  ),
                ],
              ),
            ),

            Row(
              children: [
                GestureDetector(
                  onTap: widget.onNotificationsTap,
                  child: MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: Colors.grey[200]!,
                          width: 1,
                        ),
                      ),
                      child: Stack(
                        children: [
                          const Icon(
                            Icons.notifications_none_rounded,
                            color: Color(0xFF5E3B7D),
                            size: 22,
                          ),

                          if (widget.notificationCount > 0)
                            Positioned(
                              top: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEF4444),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  widget.notificationCount > 9
                                      ? '9+'
                                      : widget.notificationCount.toString(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                GestureDetector(
                  onTap: _onAvatarTap,
                  child: MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: const Color(0xFF5E3B7D),
                          width: 2,
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF5E3B7D).withOpacity(0.15),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: CircleAvatar(
                        radius: 18,
                        backgroundColor: Colors.grey[200],
                        backgroundImage: widget.avatar.isEmpty
                            ? const AssetImage('assets/images/default_avatar.jpg') as ImageProvider
                            : (widget.avatar.startsWith('http')
                                ? NetworkImage(widget.avatar)
                                : AssetImage(widget.avatar) as ImageProvider),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
