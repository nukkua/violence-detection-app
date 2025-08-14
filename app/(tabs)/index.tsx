import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAnimate } from "@/hooks/useAnimate";
import { router } from 'expo-router';


const { width, height } = Dimensions.get('window');



// ============================================================================
// VOICE SETUP CARD COMPONENT
// ============================================================================
function VoiceSetupCard() {
    const scaleAnim = useAnimate(0.95);
    const fadeAnim = useAnimate(0);
    const [pressed, setPressed] = useState(false);
    

    useEffect(() => {
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                })
            ]).start();
        }, 400);
    }, []);

    const handlePress = () => {
        router.push('/voice-setup'); // Ajusta la ruta según tu estructura
    };

    return (
        <Animated.View
            style={[
                styles.voiceCard,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.95}
                onPress={handlePress}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                style={[
                    styles.cardTouchable,
                    pressed && styles.cardPressed
                ]}
            >
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                {/* Elementos decorativos */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
                <View style={styles.decorativeCircle3} />

                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconBackground}>
                            <IconSymbol
                                name="mic.fill"
                                size={32}
                                color="white"
                            />
                        </View>
                        <View style={styles.micWave1} />
                        <View style={styles.micWave2} />
                        <View style={styles.micWave3} />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.cardTitle}>Gesto por Voz</Text>
                        <Text style={styles.cardSubtitle}>Configura tu gesto de voz para poder alertar y notificar a la FELCV</Text>

                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <IconSymbol name="checkmark.circle.fill" size={16} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.featureText}>Reconocimiento de gesto por voz</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <IconSymbol name="checkmark.circle.fill" size={16} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.featureText}>Para comenzar a grabar</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <IconSymbol name="checkmark.circle.fill" size={16} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.featureText}>Notificaciones instantáneas</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.actionContainer}>
                        <View style={styles.actionButton}>
                            <Text style={styles.actionText}>Configurar Ahora</Text>
                            <IconSymbol
                                name="arrow.right"
                                size={18}
                                color="white"
                            />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
export default function HomeScreen() {
    const fadeAnim = useAnimate(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            <SafeAreaView style={styles.safeArea}>
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

                    {/* Hero Section */}

                    {/* Main Content */}
                    <ScrollView style={styles.mainContent}>

                        {/* Voice Setup Card */}
                        <VoiceSetupCard />


                    </ScrollView>

                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
    // Base Container Styles
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
    },

    // Hero Section Styles
    heroSection: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 32,
    },
    heroContent: {
        alignItems: 'center',
    },
    welcomeBadge: {
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },
    welcomeBadgeText: {
        color: '#667eea',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        fontWeight: '400',
    },

    // Main Content Styles
    mainContent: {
        flex: 1,
        paddingHorizontal: 20,
    },

    // Voice Setup Card Styles
    voiceCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    cardTouchable: {
        position: 'relative',
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
    },
    cardGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    cardContent: {
        padding: 32,
        minHeight: 280,
    },

    // Decorative Elements
    decorativeCircle1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -60,
        left: -60,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    decorativeCircle3: {
        position: 'absolute',
        top: '50%',
        right: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },

    // Icon Container with Waves
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    iconBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
    },
    micWave1: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 2,
    },
    micWave2: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        zIndex: 1,
    },
    micWave3: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 0,
    },

    // Text Container
    textContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: 28,
    },
    cardSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
        paddingHorizontal: 10,
    },

    // Features List
    featuresList: {
        gap: 12,
        alignSelf: 'stretch',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },

    // Action Container
    actionContainer: {
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    actionText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },

    // Quick Stats Styles
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 16,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 24,
    },
});
