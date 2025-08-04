import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Alert, SafeAreaView, StyleSheet, Animated, View, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthBiometric } from '@/hooks/useAuthBiometric';
import { useAnimate } from "@/hooks/useAnimate";

// Componente de fondo del tab bar con estética GuardianApp
function CustomTabBarBackground() {
    return (
        <View style={styles.tabBarBackground}>
            <LinearGradient
                colors={['rgba(45, 90, 39, 0.98)', 'rgba(62, 123, 55, 0.98)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {/* Línea superior con efecto glow */}
            <View style={styles.tabBarTopGlow} />
        </View>
    );
}

// Ícono de tab con estética GuardianApp
function CustomTabBarIcon({ name, focused, size = 24 }) {
    const scaleAnim = useAnimate(1);
    const glowAnim = useAnimate(focused ? 1 : 0);

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: focused ? 1 : 1,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            }),
            Animated.timing(glowAnim, {
                toValue: focused ? 1 : 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    }, [focused]);

    return (
        <View style={styles.iconContainer}>
            {/* Efecto de brillo para ícono activo */}
            <Animated.View
                style={[
                    styles.iconGlow,
                    { opacity: glowAnim }
                ]}
            />

            {/* Contenedor del ícono */}
            <Animated.View
                style={[
                    styles.iconWrapper,
                    { transform: [{ scale: scaleAnim }] },
                    focused && styles.activeIconWrapper
                ]}
            >
                <IconSymbol
                    size={size}
                    name={name}
                    color={focused ? '#ffffff' : '#ffffff'}
                />
            </Animated.View>
        </View>
    );
}

// Botón de tab con feedback mejorado
function CustomHapticTab(props) {
    const pressAnim = useAnimate(1);

    const handlePressIn = () => {
        Animated.timing(pressAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(pressAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 6,
        }).start();

        if (props.onPress) {
            props.onPress();
        }
    };

    return (
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
            <HapticTab
                {...props}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={undefined}
            />
        </Animated.View>
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { authenticate } = useAuthBiometric();
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const fadeAnim = useAnimate(0);

    useEffect(() => {
        const performAuthentication = async () => {
            try {
                const result = await authenticate();

                if (result.success) {
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }).start();

                    Alert.alert(
                        '✅ Acceso Permitido',
                        `¡Bienvenido con ${result.method}!`,
                        [{ text: 'Continuar', style: 'default' }],
                        { cancelable: false }
                    );
                } else {
                    Alert.alert(
                        '❌ Error de Autenticación',
                        result.error || 'Error desconocido',
                        [{ text: 'Reintentar', onPress: () => performAuthentication() }]
                    );
                }
            } catch (error) {
                Alert.alert('❌ Error', 'Error durante la autenticación');
            } finally {
                setIsAuthenticating(false);
            }
        };

        performAuthentication();
    }, [authenticate]);

    // Pantalla de carga con estética GuardianApp
    if (isAuthenticating) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#2d5a27" />
                <LinearGradient
                    colors={['#2d5a27', '#3e7b37']}
                    style={styles.loadingGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                <SafeAreaView style={styles.loadingSafeArea}>
                    <View style={styles.loadingContent}>
                        <View style={styles.loadingIconContainer}>
                            <View style={styles.loadingIconGlow} />
                            <Text style={styles.loadingEmoji}>🔐</Text>
                        </View>

                        <Text style={styles.loadingTitle}>GuardianApp</Text>
                        <Text style={styles.loadingSubtitle}>Verificando tu identidad...</Text>

                        <View style={styles.loadingSpinner}>
                            <View style={styles.spinnerDot} />
                            <View style={[styles.spinnerDot, styles.spinnerDelay1]} />
                            <View style={[styles.spinnerDot, styles.spinnerDelay2]} />
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2d5a27" />

            <LinearGradient
                colors={['#2d5a27', '#3e7b37']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <Text style={styles.appTitle}>GuardianApp</Text>
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Activo</Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* Contenido principal con navegación */}
            <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
                <Tabs
                    screenOptions={{
                        headerShown: false,
                        tabBarButton: CustomHapticTab,
                        tabBarBackground: CustomTabBarBackground,
                        tabBarStyle: styles.tabBarStyle,
                        tabBarLabelStyle: styles.tabBarLabel,
                        tabBarItemStyle: styles.tabBarItem,
                        tabBarActiveTintColor: '#ffffff',
                        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
                    }}>

                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Inicio',
                            tabBarIcon: ({ focused }) => (
                                <CustomTabBarIcon
                                    name="house.fill"
                                    focused={focused}
                                    size={24}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="recordings"
                        options={{
                            title: 'Grabaciones',
                            tabBarIcon: ({ focused }) => (
                                <CustomTabBarIcon
                                    name="waveform"
                                    focused={focused}
                                    size={24}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="explore"
                        options={{
                            title: 'Emergencia',
                            tabBarIcon: ({ focused }) => (
                                <CustomTabBarIcon
                                    name="exclamationmark.triangle.fill"
                                    focused={focused}
                                    size={24}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="law348"
                        options={{
                            title: 'Ley 348',
                            tabBarIcon: ({ focused }) => (
                                <CustomTabBarIcon
                                    name="book.fill"
                                    focused={focused}
                                    size={24}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="profile"
                        options={{
                            title: 'Perfil',
                            tabBarIcon: ({ focused }) => (
                                <CustomTabBarIcon
                                    name="person.circle.fill"
                                    focused={focused}
                                    size={24}
                                />
                            ),
                        }}
                    />
                </Tabs>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1b2e1b',
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },

    // Header Styles - Manteniendo estética GuardianApp
    headerSafeArea: {
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    appTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.25)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.4)',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 8,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // Main Content
    mainContent: {
        flex: 1,
    },

    // Tab Bar Styles - Estética GuardianApp mejorada
    tabBarStyle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 90 : 70,
        paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        paddingTop: 12,
        borderTopWidth: 0,
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    tabBarBackground: {
        flex: 1,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    tabBarTopGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 5,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.2,
        marginTop: 4,
    },
    tabBarItem: {
        paddingVertical: 4,
    },

    // Icon Styles - Manteniendo estética GuardianApp
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: 50,
        height: 50,
    },
    iconGlow: {
        position: 'absolute',
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        top: -2.5,
        left: -2.5,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 5,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    activeIconWrapper: {
        backgroundColor: 'rgba(76, 175, 80, 0.4)',
        borderColor: 'rgba(76, 175, 80, 0.6)',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },

    // Loading Screen - Manteniendo estética GuardianApp
    loadingContainer: {
        flex: 1,
        backgroundColor: '#1b2e1b',
    },
    loadingGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    loadingSafeArea: {
        flex: 1,
    },
    loadingContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    loadingIconGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        top: -10,
        left: -10,
    },
    loadingEmoji: {
        fontSize: 40,
        zIndex: 2,
    },
    loadingTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        marginBottom: 10,
    },
    loadingSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        fontWeight: '400',
        marginBottom: 40,
    },
    loadingSpinner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spinnerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
        marginHorizontal: 5,
        opacity: 0.4,
    },
    spinnerDelay1: {
        opacity: 0.7,
    },
    spinnerDelay2: {
        opacity: 1,
    },
});
