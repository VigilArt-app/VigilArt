import 'package:flutter/material.dart';

class ProfileHeader extends StatefulWidget {
  final String avatarUrl;
  final VoidCallback onAvatarTap;

  const ProfileHeader({
    super.key,
    required this.avatarUrl,
    required this.onAvatarTap,
  });

  @override
  State<ProfileHeader> createState() => _ProfileHeaderState();
}

class _ProfileHeaderState extends State<ProfileHeader> {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          height: 200,
          decoration: const BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(40),
              bottomRight: Radius.circular(40),
            ),
          ),
          child: Stack(
            children: [
              Positioned(
                bottom: -1,
                left: 0,
                right: 0,
                child: ClipPath(
                  clipper: WaveClipper(),
                  child: Container(
                    height: 60,
                    color: Colors.grey[50],
                  ),
                ),
              ),
            ],
          ),
        ),

        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Column(
            children: [
              GestureDetector(
                onTap: widget.onAvatarTap,
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.grey[50]!,
                      width: 4,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.15),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: CircleAvatar(
                    backgroundImage: widget.avatarUrl.startsWith('http')
                        ? NetworkImage(widget.avatarUrl)
                        : AssetImage(widget.avatarUrl) as ImageProvider,
                    radius: 60,
                    backgroundColor: Colors.grey[200],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }
}

class WaveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Path path = Path();
    path.lineTo(0, 20);
    
    Offset firstControlPoint = Offset(size.width / 4, 0);
    Offset firstPoint = Offset(size.width / 2, 30);
    path.quadraticBezierTo(
      firstControlPoint.dx,
      firstControlPoint.dy,
      firstPoint.dx,
      firstPoint.dy,
    );

    Offset secondControlPoint = Offset(size.width - size.width / 4, 60);
    Offset secondPoint = Offset(size.width, 20);
    path.quadraticBezierTo(
      secondControlPoint.dx,
      secondControlPoint.dy,
      secondPoint.dx,
      secondPoint.dy,
    );

    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(WaveClipper oldClipper) => false;
}
