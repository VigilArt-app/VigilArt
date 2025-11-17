# VigilArt Mobile App 📱🎨

> A powerful Flutter application to help artists monitor and protect their digital works against unauthorized use and plagiarism.

[![Flutter](https://img.shields.io/badge/Flutter-3.0%2B-02569B?logo=flutter)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.0%2B-0175C2?logo=dart)](https://dart.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey)](https://flutter.dev)

---

## 🎯 About VigilArt

VigilArt is a comprehensive digital rights management solution that empowers artists to:

- **📊 Monitor artworks** in real-time across the internet
- **🔔 Receive instant alerts** when unauthorized use is detected
- **🔍 Identify original creators** of unattributed artwork
- **📋 Generate automated DMCA forms** for takedown requests
- **🛡️ Protect artwork** with watermarks and metadata modifications
- **✨ Manage subscriptions** with flexible pricing plans

This is the **mobile component** of VigilArt, built with Flutter for seamless cross-platform performance on iOS and Android devices.

---

## 🚀 Quick Start

### Prerequisites

- **Flutter SDK**: >= 3.0.0 ([Install Flutter](https://flutter.dev/docs/get-started/install))
- **Dart SDK**: >= 3.0.0 (included with Flutter)
- **Android**: Android SDK 21+ (for Android development)
- **iOS**: Xcode 12+ (for iOS development)
- **Git**: For version control

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/VigilArt/vigilart-mobile.git
cd vigilart-mobile
```

#### 2. Install Dependencies
```bash
flutter pub get
```

#### 3. Configure Environment Variables

Create a `.env` file in the project root:
```env
API_BASE_URL=https://api.vigilart.dev
API_KEY=your_api_key_here
GOOGLE_CLOUD_VISION_KEY=your_vision_api_key
SENTRY_DSN=your_sentry_dsn
STRIPE_PUBLIC_KEY=your_stripe_public_key
ENVIRONMENT=development
```

**Note**: Never commit `.env` files. Use `.env.example` as a template.

#### 4. Run the App

**For Android:**
```bash
flutter run -d android
```

**For iOS:**
```bash
flutter run -d ios
```

**For Web (development):**
```bash
flutter run -d web
```

---

## 📁 Project Structure

```
vigilart-mobile/
├── lib/
│   ├── main.dart                    # App entry point
│   ├── core/
│   │   ├── constants/               # App constants & config
│   │   ├── errors/                  # Error handling
│   │   ├── theme/                   # Design system & theming
│   │   └── utils/                   # Utility functions
│   ├── data/
│   │   ├── datasources/             # API & local data sources
│   │   ├── models/                  # Data models
│   │   └── repositories/            # Repository implementations
│   ├── domain/
│   │   ├── entities/                # Business logic entities
│   │   ├── repositories/            # Repository interfaces
│   │   └── usecases/                # Business logic use cases
│   ├── presentation/
│   │   ├── pages/                   # Screen pages
│   │   ├── widgets/                 # Reusable UI components
│   │   ├── providers/               # State management (Riverpod)
│   │   └── routes/                  # Navigation routes
│   └── services/
│       ├── notification_service.dart
│       ├── analytics_service.dart
│       ├── auth_service.dart
│       └── storage_service.dart
├── test/
│   ├── unit/                        # Unit tests
│   ├── widget/                      # Widget tests
│   └── integration/                 # Integration tests
├── android/                         # Android native code
├── ios/                             # iOS native code
├── pubspec.yaml                     # Project dependencies
├── .gitignore                       # Git ignore rules
├── .dockerignore                    # Docker ignore rules
├── Dockerfile                       # Docker configuration
├── docker-compose.yml               # Docker Compose setup
└── README.md                        # This file
```

---

## 🛠️ Technology Stack

### Core Framework
- **Flutter**: 3.0+ - UI framework
- **Dart**: 3.0+ - Programming language

### State Management
- **Riverpod**: Reactive state management
- **StateNotifier**: Managing complex states

### API & Networking
- **Dio**: HTTP client with interceptors
- **Retrofit**: Type-safe REST client
- **JSON Serializable**: JSON serialization

### Local Storage
- **Hive**: Fast, embedded key-value database
- **Secure Storage**: Platform-specific secure storage

### Notifications
- **Firebase Cloud Messaging**: Push notifications
- **Local Notifications**: In-app notifications

### Authentication
- **Firebase Auth**: Authentication provider (optional)
- **JWT**: JSON Web Tokens for API security

### Analytics & Monitoring
- **Firebase Analytics**: User behavior tracking
- **Sentry**: Error tracking and monitoring

### Other Libraries
- **GetIt**: Dependency injection
- **Go Router**: Modern routing
- **Freezed**: Code generation for immutable models
- **Intl**: Internationalization support

See `pubspec.yaml` for complete dependencies.

---

## 🔧 Development

### Building the App

#### Debug Mode
```bash
flutter build apk --debug
flutter build ios --debug
```

#### Release Mode
```bash
flutter build apk --release
flutter build aab --release  # Android App Bundle
flutter build ios --release
flutter build ipa           # iOS app
```

### Running Tests

#### Unit Tests
```bash
flutter test
```

#### Widget Tests
```bash
flutter test test/widget/
```

#### Integration Tests
```bash
flutter test integration_test/
```


### Analyzing Code Quality

```bash
# Dart analysis
flutter analyze

# Format code
flutter format .

# Check for issues
dart fix --dry-run
dart fix --apply
```

---

## 🐳 Docker Support

### Building Docker Image

```bash
# Standard build
docker build -t vigilart-flutter:latest .

# Production build
docker build --build-arg BUILD_MODE=release -t vigilart-flutter:prod .
```

### Docker Compose

```bash
# Run complete stack (app + backend + database)
docker-compose up

# Run specific service
docker-compose up flutter-app

# View logs
docker-compose logs -f flutter-app

# Stop all services
docker-compose down
```

---

## 📱 Features

### Authentication
- ✅ Email/Password authentication
<!-- - ✅ Social login (Google, Apple, GitHub)
- ✅ JWT token management
- ✅ Refresh token handling
- ✅ Secure token storage -->

### Artwork Management
- ✅ Upload artwork directly
<!-- - ✅ Connect social media accounts (Instagram, Twitter, DeviantArt)
- ✅ Manage artwork portfolio
- ✅ View artwork metadata
- ✅ Edit artwork details -->

### Monitoring & Alerts
- ✅ On-demand scans (MVP: 20 scans limit)
<!-- - ✅ Weekly automated scans
- ✅ Real-time notifications
- ✅ Email alerts
- ✅ Scan history & detailed reports -->
<!-- 
### Artist Identification
- ✅ Reverse image search
- ✅ Identify original creators
- ✅ AI-generated art detection
- ✅ Plagiarism detection

### DMCA Support
- ✅ Pre-filled DMCA forms
- ✅ Automated takedown requests
- ✅ Platform integration
- ✅ Request tracking

### Protection Tools
- ✅ Watermark generation
- ✅ Metadata editing
- ✅ AI training prevention
- ✅ Export options

### Subscription Management
- ✅ Multiple plans (Free, Creator, Pro)
- ✅ Stripe integration
- ✅ Usage tracking
- ✅ Plan upgrades/downgrades
- ✅ Billing history -->

---

## 🔐 Security

- **Authentication**: JWT with secure token storage
- **Data Encryption**: TLS/SSL for all network communications
- **Secure Storage**: Platform-specific secure storage for sensitive data
- **Environment Variables**: Doppler for secrets management
- **Error Tracking**: Sentry for error monitoring and security issues
- **API Security**: Cloudflare rate limiting and DDoS protection
- **Password Security**: Bcrypt hashing on backend

See [`sécurité-VigilArt.pdf`](coming soon) for detailed security information.

---

## 🌐 Connectivity

### API Integration

The app connects to the VigilArt backend API:

**Base URL**: `https://api.vigilart.dev/api/v1`

**Endpoints**: See backend documentation

### Error Handling

All network requests include:
- Automatic retry with exponential backoff
- Timeout handling
- Comprehensive error messages
- User-friendly error dialogs

---

## 🎨 Design System

The app follows a modern, accessible design system with:

- **Color Palette**: Primary teal, neutral grays, semantic colors
- **Typography**: Readable, hierarchical font system
- **Components**: Reusable, well-documented widgets
- **Accessibility**: WCAG compliance, screen reader support
- **Responsiveness**: Adapts to all screen sizes

See [`accessibilité-VigilArt.pdf`](coming soon) for accessibility details.

---

## 📊 Performance

### Optimization Strategies

- **Lazy Loading**: Images and lists loaded on demand
- **Caching**: Network responses cached locally
- **Image Optimization**: Compressed before upload
- **Database Indexing**: Optimized queries
- **Memory Management**: Proper disposal of resources
- **Build Optimization**: Tree shaking and code minification

### Performance Metrics

- App startup: < 2 seconds
- Average screen load: < 500ms
- Image upload: Optimized for mobile networks
- Scan results display: Instant (cached)


## 📈 Analytics

The app tracks:
- User onboarding flow
- Feature usage
- Error rates
- Performance metrics
- User engagement

**Note**: All tracking is GDPR-compliant and users can opt-out.

---

## 🌍 Internationalization

The app supports multiple languages:
- English (en)
- French (fr)
- Spanish (es)

Add new languages in `lib/core/localization/`

```bash
flutter pub run intl_utils:generate
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Automated workflows for:
- ✅ Testing on every push
- ✅ Code quality analysis
- ✅ Building APK/AAB
- ✅ Deployment to app stores
- ✅ Release management

See `.github/workflows/` for pipeline configuration.

---

## 📦 Deployment

### Play Store (Android)

1. Build App Bundle:
   ```bash
   flutter build aab --release
   ```

2. Upload to Play Store Console

3. Release to users

### App Store (iOS)

1. Build IPA:
   ```bash
   flutter build ipa --release
   ```

2. Upload via App Store Connect

3. Wait for review and approval

### Cloud Deployment

- **Hosting**: Google Cloud Run
- **Database**: Cloud SQL (PostgreSQL)
- **CDN**: Firebase Hosting (for web version)
- **Storage**: Cloud Storage (for artwork uploads)

---

## 📚 Documentation

- [API Documentation](../docs/API.md) - Backend API endpoints
- [Security Policy](./docs/SECURITY.md) - Security measures
- [Accessibility Features](./docs/ACCESSIBILITY.md) - WCAG compliance
- [Legal Policies](./docs/LEGAL.md) - Terms of Service, Privacy Policy

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork & Clone
```bash
git clone https://github.com/your-username/vigilart-mobile.git
cd vigilart-mobile
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Follow Code Standards
```bash
flutter format .
flutter analyze
```

### 4. Commit with Clear Messages
```bash
git commit -m "feat: add new feature description"
```

### 5. Push & Create Pull Request
```bash
git push origin feature/your-feature-name
```

### Code Style Guide

- Follow [Google's Dart Style Guide](https://dart.dev/guides/language/effective-dart/style)
- Use meaningful variable names
- Write comments for complex logic
- Add tests for new features

---

## 📋 Git Workflow

### Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation
- `chore/description` - Maintenance

### Commit Message Format
```
type(scope): subject

body

footer
```

**Types**: feat, fix, docs, style, refactor, test, chore

See `.gitignore` for files excluded from version control.

---

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clean build
flutter clean
flutter pub get
flutter pub run build_runner build

# For iOS
cd ios && pod install && cd ..
```

#### Performance Issues
- Check for memory leaks: `flutter run --profile`
- Analyze startup time: `flutter run --profile --trace-startup`
- Profile app: Use DevTools profiler

#### Network Issues
- Check `API_BASE_URL` environment variable
- Verify API server is running
- Check internet connectivity
- Review Sentry error logs

#### Platform-Specific Issues

**Android**:
```bash
flutter clean
flutter pub get
cd android && ./gradlew clean && cd ..
```

**iOS**:
```bash
flutter clean
cd ios && rm -rf Pods && rm Podfile.lock && cd ..
flutter pub get
cd ios && pod install && cd ..
```

---

## 📞 Support

### Getting Help

- **Documentation**: Check this README and docs folder
- **Issues**: [GitHub Issues](https://github.com/VigilArt/vigilart-mobile/issues)
- **Discord**: [VigilArt Community Server](https://discord.gg/vigilart)
- **Email**: support@vigilart.dev

### Reporting Bugs

1. Check existing issues
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Device/OS information
   - Error logs/screenshots

---

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👥 Team

**VigilArt Mobile Development Team**:

- **Yasmine Bedrane** - Mobile Developer & Scrum Master
- **Sacha Polerowicz** - QA Specialist
- **Séphorah Aniambossou** - Product Manager
- **Gianni Henriques** - Backend & QA

---

## 🙏 Acknowledgments

- Flutter community and documentation
- Our beta testers and artists using VigilArt
- Open-source libraries and tools
- Google Cloud Vision API
- Firebase team

---

## 🎯 Roadmap

### Current Sprint (Sprint 1)
- [x] Project setup and architecture
- [x] Authentication system
- [ ] User dashboard
- [ ] Artwork upload
- [ ] On-demand scans

### Upcoming Features
- Weekly automated scans
- DMCA form generation
- Artist identification
- Watermarking tools
- Mobile push notifications
- Advanced analytics


---

## 📱 App Links

- **Google Play Store**: [Coming Soon]
- **Apple App Store**: [Coming Soon]
- **Website**: [vigilart.dev](https://vigilart.dev)
- **Support**: [support@vigilart.dev](mailto:support@vigilart.dev)

---

**Made with ❤️ to protect artists' creative works** 🎨🛡️✨

*Last Updated: November 2025*