#!/usr/bin/env bash
# Patches the Expo-generated Android project for a signed, optimized release.
# Safe to run in CI after `expo prebuild`. Contains NO secrets.
set -euo pipefail

GRADLE_APP="android/app/build.gradle"
GRADLE_PROPS="android/gradle.properties"

if [ ! -f "$GRADLE_APP" ]; then
  echo "ERROR: $GRADLE_APP not found. Did 'expo prebuild' run?" >&2
  exit 1
fi

# 1. Append a release signing config to app/build.gradle.
#    It activates ONLY when android/keystore.properties exists (i.e. signing
#    secrets were provided). Otherwise the release stays debug-signed and the
#    build still succeeds.
cat >> "$GRADLE_APP" <<'GRADLE'

// --- RenovaMeter release signing (injected by CI) ---
def renovaKeystoreProps = new Properties()
def renovaKeystoreFile = rootProject.file("keystore.properties")
if (renovaKeystoreFile.exists()) {
    renovaKeystoreProps.load(new FileInputStream(renovaKeystoreFile))
    android {
        signingConfigs {
            release {
                storeFile file(renovaKeystoreProps['storeFile'])
                storePassword renovaKeystoreProps['storePassword']
                keyAlias renovaKeystoreProps['keyAlias']
                keyPassword renovaKeystoreProps['keyPassword']
            }
        }
        buildTypes {
            release {
                signingConfig signingConfigs.release
            }
        }
    }
}
GRADLE

# 2. Enable standard production optimization (minify + resource shrinking).
{
  echo ""
  echo "# Production optimization (RenovaMeter)"
  echo "android.enableProguardInReleaseBuilds=true"
  echo "android.enableShrinkResourcesInReleaseBuilds=true"
} >> "$GRADLE_PROPS"

echo "Android CI setup applied to $GRADLE_APP and $GRADLE_PROPS."
