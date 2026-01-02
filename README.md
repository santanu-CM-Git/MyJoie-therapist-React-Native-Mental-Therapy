# TherapistApp

A comprehensive React Native mobile application designed for therapists to manage their practice, connect with clients, and handle scheduling and sessions.

## Overview

TherapistApp is a full-featured mobile application that enables therapists to manage their professional activities including client communication, session scheduling, earnings tracking, and more. The app supports both iOS and Android platforms.

## Features

### Authentication
- User login and registration
- OTP verification
- Password recovery
- Personal information management

### Communication
- Real-time chat with clients
- Video and audio calling using Agora SDK
- File sharing and document transfer
- In-chat file viewing capabilities

### Scheduling
- Session scheduling and management
- Calendar integration
- Upcoming sessions tracking
- Session history

### Professional Management
- Earnings tracking and reporting
- Session summary upload
- Profile management
- Client support

### Additional Features
- Push notifications
- Offline mode support
- Privacy policy and terms of use
- Cancellation policy
- Notification management

## Technology Stack

### Core
- React Native 0.72.4
- React 18.2.0
- Redux Toolkit for state management

### Navigation
- React Navigation (Stack, Drawer, Bottom Tabs)

### Backend Services
- Firebase (Authentication, Firestore, Realtime Database, Storage, Analytics, Messaging)
- Agora SDK for real-time communication

### Key Libraries
- React Native Gifted Chat for chat interface
- React Native Vector Icons
- React Native Calendars
- React Native Document Picker
- React Native PDF viewer
- Axios for HTTP requests
- Moment.js for date/time handling

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (version 16 or higher)
- npm or yarn package manager
- React Native development environment set up
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and Android SDK
- Firebase project configuration
- Agora account and credentials

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TherapistApp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. For iOS, install CocoaPods dependencies:
```bash
cd ios
pod install
cd ..
```

4. Configure Firebase:
   - Add your `google-services.json` file to `android/app/`
   - Add your `GoogleService-Info.plist` file to `ios/`

5. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add necessary API keys and configuration values

## Running the Application

### Start Metro Bundler

```bash
npm start
# or
yarn start
```

### Run on Android

```bash
npm run android
# or
yarn android
```

### Run on iOS

```bash
npm run ios
# or
yarn ios
```

## Project Structure

```
TherapistApp/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── src/
│   ├── assets/             # Images, fonts, and other assets
│   ├── components/         # Reusable React components
│   ├── context/            # React Context providers
│   ├── model/              # Data models
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   │   ├── AuthScreen/    # Authentication screens
│   │   └── NoAuthScreen/  # Main app screens
│   ├── store/              # Redux store configuration
│   └── utils/              # Utility functions and services
├── App.js                  # Main application entry point
├── package.json            # Project dependencies
└── README.md              # This file
```

## Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Configuration

### Firebase Setup
Ensure you have properly configured Firebase services:
- Authentication
- Firestore Database
- Realtime Database
- Cloud Storage
- Cloud Messaging
- Analytics

### Agora Setup
Configure Agora SDK with your App ID and other credentials for video/audio communication features.

### Permissions
The app requires the following permissions:
- Camera (for video calls)
- Microphone (for audio calls)
- Storage (for file uploads)
- Notifications (for push notifications)
- Network access

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npm start -- --reset-cache`

2. **iOS build issues**: 
   - Run `cd ios && pod install && cd ..`
   - Clean build folder in Xcode

3. **Android build issues**:
   - Clean gradle: `cd android && ./gradlew clean && cd ..`
   - Invalidate caches in Android Studio

4. **Firebase configuration errors**: Ensure `google-services.json` and `GoogleService-Info.plist` are correctly placed and configured

5. **Permission errors**: Check that all required permissions are declared in AndroidManifest.xml and Info.plist

## Development

### Code Style
The project uses ESLint for code linting. Run `npm run lint` to check for code style issues.

### Testing
Run tests using:
```bash
npm test
```

## Version

Current version: 2.1.8

## License

This project is private and proprietary.

## Support

For support and questions, please contact the development team or refer to the project documentation.

## Contributing

This is a private project. Contributions are managed internally by the development team.
