# RenovaMeter

Simple measurement tools for home projects. RenovaMeter is an offline renovation and home-measurement calculator built with React Native and Expo.

## Project Description

RenovaMeter helps you plan home renovation projects with a set of small, focused calculators. It runs entirely on your device — no account, no internet connection, and no external services required. Everything you calculate stays on your phone.

## Features

- **Basic Calculator** — quick arithmetic with one operation at a time (addition, subtraction, multiplication, division).
- **Renova Tools** — five renovation calculators:
  - Floor area (length × width)
  - Wall area (width × height)
  - Paint amount (liters needed)
  - Tile amount (tiles needed, including waste)
  - Wallpaper rolls (rolls needed)
- **Saved Calculations** — save any Renova Tools result and review it later, with input summary and date/time.
- **Settings** — metric unit system, decimal precision (1 or 2), and a privacy note.
- Works fully offline. Light, clean, home-improvement themed UI.

## Privacy

RenovaMeter does not collect, store, or share personal information. The app works offline. Saved calculations and settings are stored only on the user's device.

## Tech Stack

- React Native + Expo (SDK 51)
- React Navigation (native stack)
- AsyncStorage for local settings and saved calculations

No backend, Firebase, ads, analytics, payments, or external APIs are used.

## Project Structure

```
App.js
app.json
package.json
babel.config.js

src/
  navigation/
    AppNavigator.js
  screens/
    HomeScreen.js
    BasicCalculatorScreen.js
    RenovaToolsScreen.js
    HistoryScreen.js
    SettingsScreen.js
  components/
    AppButton.js
    InputField.js
    ResultCard.js
    ToolCard.js
    ScreenContainer.js
  utils/
    basicCalculator.js
    renovaCalculations.js
    formatters.js
  storage/
    appStorage.js
  theme/
    colors.js

android/app/proguard-rules.pro
.github/workflows/android-build.yml
```

## How to Run Locally

```bash
npm install
npx expo start
```

Then press `a` to open the app in an Android emulator, or scan the QR code with the Expo Go app on a physical Android device.

To run directly on a connected Android device or emulator with a native build:

```bash
npx expo run:android
```

## How to Build Android (APK and AAB)

Android release builds are produced automatically by GitHub Actions, but you can also build locally:

```bash
# Generate the native android/ project
npx expo prebuild --platform android

# Build a release APK
cd android
./gradlew assembleRelease

# Build a release AAB (for Google Play)
./gradlew bundleRelease
```

Outputs:

- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## How to Generate a Keystore

You need a signing keystore to produce a release build. Generate one with:

```bash
keytool -genkeypair -v -keystore renovameter-release-key.keystore -alias renovameter_key -keyalg RSA -keysize 2048 -validity 10000
```

Keep this file private. **Do not commit the keystore or its passwords to the repository.**

## How to Add GitHub Secrets

The build workflow reads signing credentials from GitHub Secrets. In your GitHub repository, go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret name | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded keystore file (see below) |
| `ANDROID_KEYSTORE_PASSWORD` | The keystore (store) password |
| `ANDROID_KEY_ALIAS` | The key alias (e.g. `renovameter_key`) |
| `ANDROID_KEY_PASSWORD` | The key password |

Convert the keystore to base64:

```bash
# macOS / Linux
base64 -i renovameter-release-key.keystore -o keystore-base64.txt

# Linux alternative
base64 -w 0 renovameter-release-key.keystore > keystore-base64.txt
```

Copy the contents of `keystore-base64.txt` into the `ANDROID_KEYSTORE_BASE64` secret.

## GitHub Actions Build Explanation

The workflow at `.github/workflows/android-build.yml`:

1. Runs on every push to the `main` branch (and can be triggered manually).
2. Installs Node.js 20 and JDK 17, and sets up the Android SDK.
3. Installs project dependencies with `npm install`.
4. Generates the native Android project with `npx expo prebuild`.
5. Decodes the keystore from `ANDROID_KEYSTORE_BASE64` and writes a `keystore.properties` file from the other secrets.
6. Builds the release APK with `./gradlew assembleRelease`.
7. Builds the release AAB with `./gradlew bundleRelease`.
8. Uploads `renovameter-release.apk` and `renovameter-release.aab` as workflow artifacts.

## Android Signing Configuration

After `expo prebuild` generates `android/`, configure signing and release optimization in `android/app/build.gradle`.

Load the keystore properties near the top of the file:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add a release signing config and enable production optimization inside `android { ... }`:

```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

The included `android/app/proguard-rules.pro` keeps the rules needed by React Native, Expo, and AsyncStorage. Minification and resource shrinking are used only for standard production optimization and app size reduction.

## License

This project is provided as-is for personal and educational use.
