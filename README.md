# DRG-App Codebase

## Setup Instructions

Follow these steps to set up and run the DRG-App locally:

### Prerequisites

1. Install [Node.js](https://nodejs.org/) (version 16 or higher).
2. Install [Expo CLI](https://docs.expo.dev/get-started/installation/) globally:
   ```bash
   npm install -g expo-cli
   ```
3. Ensure you have Java Development Kit (JDK) installed for Android development.
4. Set up Android Studio and configure the Android SDK for React Native development.

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd DRG-App
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run start
   ```
4. Run the app on an Android emulator or a connected device:
   ```bash
   npm run android
   ```
5. For iOS (requires macOS and Xcode):
   ```bash
   npm run ios
   ```
6. To run the app in a web browser:
   ```bash
   npm run web
   ```

### Deployment

- Deploy the app on all platforms using Expo Application Services (EAS):
  ```bash
  npm run deploy
  ```

### Additional Notes

- The app uses TypeScript for type safety and better developer experience.
- Tailwind CSS is integrated via Nativewind for styling.
- Ensure the environment variables and configurations are properly set up for API integrations and other services.

# Expo Router and Tailwind CSS

Use [Expo Router](https://docs.expo.dev/router/introduction/) with [Nativewind](https://www.nativewind.dev/v4/overview/) styling.