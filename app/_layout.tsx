import { Stack } from 'expo-router';
import { SessionProvider, useSession } from '@/context/ctx';
import { SplashScreenController } from '@/screens/splash-screen';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Root() {
    return (
        <SessionProvider>
            <SplashScreenController />
            <RootNavigator />
        </SessionProvider>
    );
}


function RootNavigator() {
    const { session, isLoading } = useSession();


    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <Stack>
            <Stack.Protected guard={session !== null}>
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack.Protected>

            <Stack.Protected guard={session === null}>
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="permissions" options={{ headerShown: false }} />
            </Stack.Protected>

            <StatusBar style="auto" />
        </Stack>
    );
}
