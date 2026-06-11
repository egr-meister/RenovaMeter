# RenovaMeter ProGuard / R8 rules.
# Used only for standard Android production optimization and app size reduction.

# --- React Native core ---
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**

# --- Expo ---
-keep class expo.modules.** { *; }
-dontwarn expo.modules.**

# --- AsyncStorage ---
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# --- Keep JavaScript bridge annotations ---
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keep @com.facebook.proguard.annotations.DoNotStrip class *

# --- Native methods ---
-keepclasseswithmembernames class * {
    native <methods>;
}

# --- Enums ---
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# --- Suppress common warnings ---
-dontwarn okio.**
-dontwarn javax.annotation.**
