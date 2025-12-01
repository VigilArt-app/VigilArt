import 'package:flutter/material.dart';

class ProfileHeader extends StatefulWidget {
  final String userName;
  final String avatarUrl;
  final bool isEditMode;
  final VoidCallback onEditTap;
  final VoidCallback onAvatarTap;

  const ProfileHeader({
    Key? key,
    required this.userName,
    required this.avatarUrl,
    required this.isEditMode,
    required this.onEditTap,
    required this.onAvatarTap,
  }) : super(key: key);

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
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: CircleAvatar(
                    backgroundImage: NetworkImage(widget.avatarUrl),
                    radius: 60,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (!widget.isEditMode)
                    GestureDetector(
                      onTap: widget.onEditTap,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: const [
                            Icon(
                              Icons.edit_outlined,
                              color: Colors.white,
                              size: 16,
                            ),
                            SizedBox(width: 6),
                            Text(
                              'Edit',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    GestureDetector(
                      onTap: widget.onEditTap,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF5E3B7D),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: const [
                            Icon(
                              Icons.save_outlined,
                              color: Colors.white,
                              size: 16,
                            ),
                            SizedBox(width: 6),
                            Text(
                              'Save',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
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
