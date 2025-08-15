import React, { useEffect, useState } from 'react';
import { Platform, Alert, SafeAreaView, StyleSheet, Animated, View, Text, StatusBar, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthBiometric } from '@/hooks/useAuthBiometric';
import { useAnimate } from "@/hooks/useAnimate";
import { Tabs, router, usePathname } from 'expo-router';

function CleanTabBar() {
    return (
        <View style={styles.tabBarContainer}>
            <LinearGradient
                colors={['rgba(28, 28, 30, 0.98)', 'rgba(44, 44, 46, 0.95)']}
                style={styles.tabBarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
        </View>
    );
}

function MinimalTabIcon({ name, focused, size = 24 }) {
    const scaleAnim = useAnimate(1);

    React.useEffect(() => {
        Animated.timing(scaleAnim, {
            toValue: focused ? 1.1 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [focused]);

    const getIconForPlatform = (iconName) => {
        if (Platform.OS === 'android') {
            const androidIcons = {
                'house.fill': 'house',
                'waveform': 'music.note',
                'book.closed.fill': 'book',
                'person.circle.fill': 'person.circle'
            };
            return androidIcons[iconName] || iconName;
        }
        return iconName;
    };

    return (
        <Animated.View
            style={[
                styles.minimalIconContainer,
                { transform: [{ scale: scaleAnim }] }
            ]}
        >
            <IconSymbol
                size={size}
                name={getIconForPlatform(name)}
                color={focused ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'}
            />
        </Animated.View>
    );
}

function CleanHapticTab(props) {
    const pressAnim = useAnimate(1);

    const handlePressIn = () => {
        Animated.timing(pressAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(pressAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();

        if (props.onPress) {
            props.onPress();
        }
    };

    return (
        <Animated.View
            style={{
                transform: [{ scale: pressAnim }],
                backgroundColor: 'transparent',
                flex: 1,
            }}
        >
            <HapticTab
                {...props}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={undefined}
                style={[
                    props.style,
                    {
                        backgroundColor: 'transparent',
                        flex: 1,
                    }
                ]}
            />
        </Animated.View>
    );
}

// Componente del header dinámico mejorado con altura fija
function DynamicHeader({ currentPath, onBackPress }) {
    const fadeAnim = useAnimate(0);

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [currentPath]);

    const isHome = currentPath === '/';
    const isProfile = currentPath === '/profile' || currentPath === '/profile/privacy-settings' || currentPath === '/voice-setup';

    if (isProfile) return null;

    const getHeaderContent = () => {
        switch (currentPath) {
            case '/recordings':
                return { title: 'Grabaciones', subtitle: 'Tus grabaciones de audio', showBack: true };
            case '/law348':
                return { title: 'Ley 348', subtitle: 'Protección integral a las mujeres', showBack: true };
            case '/explore':
                return { title: 'Documentos', subtitle: 'Información legal', showBack: true };
            default:
                return { title: null, subtitle: null, showBack: false };
        }
    };

    const { title, subtitle, showBack } = getHeaderContent();

    return (
        <View style={styles.headerContainer}>
            <Animated.View
                style={[
                    styles.header,
                    { opacity: fadeAnim }
                ]}
            >
                {isHome ? (
                    <>
                        <View style={styles.greetingSection}>
                            <Text style={styles.greetingText}>Hello, Welcome 👋</Text>
                            <Text style={styles.userName}>Albert Stevano</Text>
                        </View>
                        <ProfileButton />
                    </>
                ) : (
                    <>
                        <View style={styles.headerWithBack}>
                            <View style={styles.titleSection}>
                                <Text style={styles.headerTitle}>{title}</Text>
                                <Text style={styles.headerSubtitle}>{subtitle}</Text>
                            </View>
                        </View>
                        <ProfileButton />
                    </>
                )}
            </Animated.View>
        </View>
    );
}

// Componente del botón de perfil mejorado - estilo Vercel
function ProfileButton() {
    const pressAnim = useAnimate(1);

    const handlePressIn = () => {
        Animated.timing(pressAnim, {
            toValue: 0.96,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(pressAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
        }).start();

        router.push('/profile');
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={styles.profileButtonContainer}
        >
            <Animated.View
                style={[
                    styles.profileImageHeader,
                    { transform: [{ scale: pressAnim }] }
                ]}
            >
                <Text style={styles.profileEmojiHeader}>👨‍💼</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function AppLayout() {
    const colorScheme = useColorScheme();
    const { authenticate } = useAuthBiometric();
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [hasAuthenticated, setHasAuthenticated] = useState(false);
    const fadeAnim = useAnimate(0);
    const pathname = usePathname();

    const handleBackPress = () => {
        router.back();
    };


    useEffect(() => {
        // Solo autenticar una vez, no en cada cambio de tab
        if (hasAuthenticated) return;

        const performAuthentication = async () => {
            try {
                const result = await authenticate();

                if (result.success) {
                    setHasAuthenticated(true);
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 1000,
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
                    );
                }
            } catch (error) {
                Alert.alert('❌ Error', 'Error durante la autenticación');
            } finally {
                setIsAuthenticating(false);
            }
        };

        performAuthentication();
    }, []); // Dependencias vacías para que solo se ejecute una vez

    // Pantalla de carga mejorada
    if (isAuthenticating) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="#ffffff"
                />

                <LinearGradient
                    colors={['#ffffff', '#f8f9fa']}
                    style={styles.loadingGradient}
                />

                <SafeAreaView style={styles.loadingContent}>
                    <View style={styles.loadingIconContainer}>
                        <LinearGradient
                            colors={['#ffffff', '#f0f0f0']}
                            style={styles.loadingIconGradient}
                        />
                        <Text style={styles.loadingEmoji}>🔐</Text>
                    </View>

                    <Text style={styles.loadingTitle}>GuardianApp</Text>
                    <Text style={styles.loadingSubtitle}>Verificando tu identidad...</Text>

                    <View style={styles.loadingSpinner}>
                        <View style={[styles.spinnerDot, styles.spinnerDot1]} />
                        <View style={[styles.spinnerDot, styles.spinnerDot2]} />
                        <View style={[styles.spinnerDot, styles.spinnerDot3]} />
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#ffffff"
                translucent={false}
            />

            <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.backgroundGradient}
            />

            {/* Header dinámico */}
            <SafeAreaView style={styles.headerSafeArea}>
                <DynamicHeader
                    currentPath={pathname}
                    onBackPress={handleBackPress}
                />
            </SafeAreaView>

            {/* Contenido principal */}
            <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
                <Tabs
                    backBehavior='fullHistory'
                    screenOptions={{
                        headerShown: false,
                        tabBarButton: CleanHapticTab,
                        tabBarBackground: CleanTabBar,
                        tabBarStyle: [
                            styles.tabBarStyle,
                            (pathname === '/profile' || pathname === '/profile/privacy-settings' || pathname === '/voice-setup') && { display: 'none' }
                        ],
                        tabBarShowLabel: false,
                        tabBarItemStyle: styles.tabBarItem,
                        tabBarActiveTintColor: '#ffffff',
                        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
                    }}>

                    <Tabs.Screen
                        name="index"
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <MinimalTabIcon
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
                            tabBarIcon: ({ focused }) => (
                                <MinimalTabIcon
                                    name="waveform"
                                    focused={focused}
                                    size={24}
                                />
                            ),

                        }}
                    />

                    <Tabs.Screen
                        name="law348"
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <MinimalTabIcon
                                    name="book.closed.fill"
                                    focused={focused}
                                    size={24}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="profile"
                        options={{
                            href: null,
                            tabBarIcon: ({ focused }) => (
                                <MinimalTabIcon
                                    name="person.circle.fill"
                                    focused={focused}
                                    size={24}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="explore"
                        options={{
                            href: null,
                        }}
                    />

                    <Tabs.Screen
                        name="voice-setup"
                        options={{
                            href: null,
                        }}
                    />
                </Tabs>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },

    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },

    // Header con altura fija - estilo Vercel/Meru
    headerSafeArea: {
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    headerContainer: {
        height: 100, // Altura fija para evitar inconsistencias
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        height: '100%',
    },
    greetingSection: {
        flex: 1,
        justifyContent: 'center',
    },
    greetingText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
        marginBottom: 4,
    },
    userName: {
        fontSize: 26,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: -0.5,
    },

    // Header dinámico con altura consistente
    headerWithBack: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        height: '100%',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    backButtonContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleSection: {
        flex: 1,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
        marginTop: 2,
    },

    // Botón de perfil - estilo Vercel clean
    profileButtonContainer: {
        marginLeft: 16,
    },
    profileImageHeader: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    profileEmojiHeader: {
        fontSize: 24,
    },

    // Contenido principal
    mainContent: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    // Tab Bar completamente rediseñada
    tabBarStyle: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 34 : 20,
        marginHorizontal: 20,
        height: 80,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        borderRadius: 40,
        paddingHorizontal: 5,
    },

    tabBarContainer: {
        flex: 1,
        borderRadius: 40,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },

    tabBarGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },

    tabBarItem: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Íconos minimalistas - estilo Vercel
    minimalIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },

    // Loading mejorado
    loadingContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
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
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
        overflow: 'hidden',
    },
    loadingIconGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    loadingEmoji: {
        fontSize: 40,
        zIndex: 1,
    },
    loadingTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1c1c1e',
        letterSpacing: -0.8,
        marginBottom: 12,
    },
    loadingSubtitle: {
        fontSize: 16,
        color: '#8e8e93',
        textAlign: 'center',
        fontWeight: '500',
        marginBottom: 50,
    },
    loadingSpinner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spinnerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1c1c1e',
        marginHorizontal: 6,
    },
    spinnerDot1: {
        opacity: 0.4,
    },
    spinnerDot2: {
        opacity: 0.7,
    },
    spinnerDot3: {
        opacity: 1,
    },
});
