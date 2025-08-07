import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { useAnimate } from "@/hooks/useAnimate";
import { Poppins_900Black } from "@expo-google-fonts/poppins"

const { height } = Dimensions.get('window');

export default function OnboardingScreen() {
    const [currentPage, setCurrentPage] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const fadeAnim = useAnimate();


    const animatePageTransition = () => {
        if (isAnimating) return;

        setIsAnimating(true);

        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsAnimating(false);
        });
    };

    const handleBack = () => {
        if (currentPage > 0 && !isAnimating) {
            animatePageTransition();
            setTimeout(() => {
                setCurrentPage(currentPage - 1);
            }, 200);
        }
    };

    const handleNext = () => {
        if (isAnimating) return;

        if (currentPage < 2) {
            animatePageTransition();
            setTimeout(() => {
                setCurrentPage(currentPage + 1);
            }, 200);
        } else {
            router.push('/permissions');
        }
    };

    const handleSkip = () => {
        if (!isAnimating) {
            router.push('/permissions');
        }
    };

    const renderFirstPage = () => (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.pageContent}>
                {/* Ícono principal consistente */}
                <View style={styles.iconContainer}>
                    <View style={styles.welcomeIcon}>
                        <View style={styles.iconGlow} />
                        <Text style={styles.iconText}>👋</Text>
                    </View>
                </View>

                <Text style={styles.title}>Bienvenido a{'\n'}GuardianApp</Text>
                <Text style={styles.subtitle}>
                    Tu aplicación de seguridad personal que te acompaña las 24 horas del día.
                    Comencemos configurando tu protección.
                </Text>

                {/* Features de bienvenida */}
                <View style={styles.welcomeFeatures}>
                    <View style={styles.welcomeFeature}>
                        <View style={styles.welcomeFeatureIcon}>
                            <Text style={styles.featureIcon}>🔐</Text>
                        </View>
                        <Text style={styles.welcomeFeatureText}>Seguridad garantizada</Text>
                    </View>
                    <View style={styles.welcomeFeature}>
                        <View style={styles.welcomeFeatureIcon}>
                            <Text style={styles.featureIcon}>📱</Text>
                        </View>
                        <Text style={styles.welcomeFeatureText}>Fácil de usar</Text>
                    </View>
                    <View style={styles.welcomeFeature}>
                        <View style={styles.welcomeFeatureIcon}>
                            <Text style={styles.featureIcon}>🚀</Text>
                        </View>
                        <Text style={styles.welcomeFeatureText}>Siempre activo</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderSecondPage = () => (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.pageContent}>
                <View style={styles.iconContainer}>
                    <View style={styles.protectionIcon}>
                        <View style={styles.iconGlow} />
                        <Text style={styles.iconText}>🛡️</Text>
                    </View>
                </View>

                <Text style={styles.title}>Tu Seguridad es{'\n'}Nuestra Prioridad</Text>
                <Text style={styles.subtitle}>
                    Una aplicación diseñada para detectar y prevenir situaciones de violencia,
                    manteniéndote protegido en todo momento.
                </Text>

                <View style={styles.featuresContainer}>
                    {[
                        { icon: '📱', text: 'Detección inteligente' },
                        { icon: '🔒', text: 'Datos seguros' },
                        { icon: '⚡', text: 'Respuesta rápida' }
                    ].map((feature, index) => (
                        <View key={index} style={styles.feature}>
                            <View style={styles.featureIconContainer}>
                                <Text style={styles.featureIcon}>{feature.icon}</Text>
                            </View>
                            <Text style={styles.featureText}>{feature.text}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );

    const renderThirdPage = () => (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.pageContent}>
                <View style={styles.felcvContainer}>
                    <View style={styles.felcvLogo}>
                        <Text style={styles.felcvLogoText}>🏛️</Text>
                        <View style={styles.felcvBadge}>
                            <Text style={styles.felcvBadgeText}>OFICIAL</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.title}>Respaldo Institucional</Text>
                <Text style={styles.subtitle}>
                    GuardianApp trabaja en colaboración directa con instituciones policiales especializadas
                    para garantizar una respuesta efectiva.
                </Text>

                <View style={styles.felcvInfoCard}>
                    <View style={styles.felcvHeader}>
                        <Text style={styles.felcvIcon}>🚔</Text>
                        <View style={styles.felcvInfo}>
                            <Text style={styles.felcvTitle}>En colaboración con</Text>
                            <Text style={styles.felcvName}>FELCV</Text>
                            <Text style={styles.felcvDescription}>
                                Fuerza Especial de Lucha Contra la Violencia
                            </Text>
                        </View>
                    </View>

                    <View style={styles.felcvFeatures}>
                        <View style={styles.felcvFeature}>
                            <Text style={styles.felcvFeatureIcon}>⚡</Text>
                            <Text style={styles.felcvFeatureText}>Respuesta inmediata</Text>
                        </View>
                        <View style={styles.felcvFeature}>
                            <Text style={styles.felcvFeatureIcon}>📍</Text>
                            <Text style={styles.felcvFeatureText}>Ubicación precisa</Text>
                        </View>
                        <View style={styles.felcvFeature}>
                            <Text style={styles.felcvFeatureIcon}>👮</Text>
                            <Text style={styles.felcvFeatureText}>Personal especializado</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 0:
                return renderFirstPage();
            case 1:
                return renderSecondPage();
            case 2:
                return renderThirdPage();
            default:
                return renderFirstPage();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#2d5a27', '#3e7b37']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Header con nombre de la app */}
            <View style={styles.header}>
                <Text style={styles.appName}>GuardianApp</Text>
                {/* Botón Saltar en header (solo en las primeras dos páginas) */}
                {currentPage < 2 && (
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButtonHeader}>
                        <Text style={styles.skipTextHeader}>Saltar</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Indicadores de página */}
            <View style={styles.pageIndicators}>
                {[0, 1, 2].map((page) => (
                    <View
                        key={page}
                        style={[
                            styles.pageIndicator,
                            currentPage === page && styles.activePageIndicator
                        ]}
                    />
                ))}
            </View>

            {/* Contenido principal */}
            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeAnim }
                ]}
            >
                {renderCurrentPage()}
            </Animated.View>

            {/* Botones de navegación */}
            <View style={styles.buttonContainer}>
                {/* Botón Atrás */}
                {currentPage > 0 && (
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <View style={styles.backButtonContent}>
                            <Text style={styles.backArrow}>←</Text>
                            <Text style={styles.backText}>Atrás</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Espaciador cuando no hay botón atrás */}
                {currentPage === 0 && <View style={styles.spacer} />}

                {/* Botón Siguiente/Comenzar */}
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#ffffff', '#f8f9fa']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentPage === 2 ? 'Comenzar' : 'Siguiente'}
                        </Text>
                        <View style={styles.buttonArrow}>
                            <Text style={styles.arrowText}>→</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1b2e1b',
        paddingVertical: Platform.select({ android: 20 }),
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 30,
    },
    appName: {
        fontFamily: Platform.select({
            ios: 'Inter-Black',
        }),
        fontWeight: Platform.select({
            android: 600,
        }),
        letterSpacing: Platform.select({
            android: 0.3,
        }),
        fontSize: 28,
        color: '#ffffff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    skipButtonHeader: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    skipTextHeader: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    pageIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 30,
        gap: 8,
    },
    pageIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    activePageIndicator: {
        backgroundColor: '#4CAF50',
        width: 24,
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingVertical: 20,
        minHeight: height * 0.6,
    },
    pageContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },

    // Primera página - Bienvenida
    welcomeIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.3)',
        position: 'relative',
    },
    welcomeFeatures: {
        width: '100%',
        marginTop: 40,
        gap: 20,
    },
    welcomeFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 25,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    welcomeFeatureIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    welcomeFeatureText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        flex: 1,
        letterSpacing: 0.3,
    },

    // Segunda página - Features (ya existente)
    iconContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    protectionIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.3)',
        position: 'relative',
    },
    iconGlow: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        top: -10,
        left: -10,
    },
    iconText: {
        fontSize: 50,
        zIndex: 2,
    },
    featuresContainer: {
        width: '100%',
        marginTop: 20,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 25,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    featureIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    featureIcon: {
        fontSize: 24,
    },
    featureText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        flex: 1,
        letterSpacing: 0.3,
    },

    // Tercera página - FELCV
    felcvContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    felcvLogo: {
        position: 'relative',
        alignItems: 'center',
    },
    felcvLogoText: {
        fontSize: 80,
        marginBottom: 10,
    },
    felcvBadge: {
        position: 'absolute',
        top: -5,
        right: -20,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
    },
    felcvBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    felcvInfoCard: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 20,
        padding: 25,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.4)',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
        marginTop: 20,
    },
    felcvHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    felcvIcon: {
        fontSize: 40,
        marginRight: 15,
    },
    felcvInfo: {
        flex: 1,
    },
    felcvTitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
        marginBottom: 2,
    },
    felcvName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4CAF50',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    felcvDescription: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '400',
        lineHeight: 16,
    },
    felcvFeatures: {
        gap: 15,
    },
    felcvFeature: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    felcvFeatureIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 24,
    },
    felcvFeatureText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '500',
    },

    // Estilos comunes
    title: {
        fontSize: 28,
        fontFamily: Platform.select({
            ios: 'Inter-Black',
        }),
        fontWeight: Platform.select({
            android: 600,
        }),

        letterSpacing: Platform.select({
            android: 0.3,
        }),
        textAlign: 'center',
        marginBottom: 20,
        color: '#ffffff',
        lineHeight: 38,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 17,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 26,
        paddingHorizontal: 10,
        fontWeight: '400',
    },

    // Botones de navegación
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 50,
        paddingTop: 30,
        gap: 10,
    },
    spacer: {
        width: 80,
    },
    backButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backArrow: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    backText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    nextButton: {
        borderRadius: 30,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
        transform: [{ scale: 1.05 }],
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.4)',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    nextButtonText: {
        color: '#2d5a27',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    buttonArrow: {
        marginLeft: 10,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    arrowText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

// Nota: Para usar LinearGradient, necesitas instalar:
// expo install expo-linear-gradient
