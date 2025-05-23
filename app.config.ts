import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: config.name,
    slug: config.slug,
    extra: {
        // Public config (accessible in JS)
        EXPO_PUBLIC_APPLICATION_NAME: process.env.EXPO_PUBLIC_APPLICATION_NAME,
        EXPO_PUBLIC_DR_G_VOICE_ID: process.env.EXPO_PUBLIC_DR_G_VOICE_ID,
        EXPO_PUBLIC_DR_G_AVATAR_ID: process.env.EXPO_PUBLIC_DR_G_AVATAR_ID,
        EXPO_PUBLIC_ICORE_CONSOLE: process.env.EXPO_PUBLIC_ICORE_CONSOLE,
        EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
        EXPO_PUBLIC_BASE_URL_GQL: process.env.EXPO_PUBLIC_BASE_URL_GQL,
        EXPO_PUBLIC_HEYGEN_KEEPALIVE: process.env.EXPO_PUBLIC_HEYGEN_KEEPALIVE === 'true',
        EXPO_PUBLIC_HEYGEN_KEEPALIVE_FOREVER: process.env.EXPO_PUBLIC_HEYGEN_KEEPALIVE_FOREVER === 'true',

        // Private config (not accessible in JS directly)
        BUILD_DATE: process.env.BUILD_DATE,
        BUILD_VERSION: process.env.BUILD_VERSION,
        BUILD_NUMBER: process.env.BUILD_NUMBER,
        SECRET_KEY: process.env.SECRET_KEY,
    },
});
