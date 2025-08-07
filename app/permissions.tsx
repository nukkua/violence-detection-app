import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, Alert, Platform} from "react-native";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Camera from 'expo-camera';
import {
    AudioModule,
} from 'expo-audio';


export default function PermissionsScreen() {
    const [permissions, setPermissions] = useState({
        location: false,
        camera: false,
        microphone: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const [permission, requestPermission] = Camera.useCameraPermissions();

    useEffect(() => {
        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Verificar permisos existentes
        checkExistingPermissions();
    }, []);

    const checkExistingPermissions = async () => {
        try {
            // Verificar ubicación
            const locationStatus = await Location.getForegroundPermissionsAsync();

            // Verificar cámara
            const cameraStatus = permission;

            // Verificar micrófono
            const audioStatus = await AudioModule.getRecordingPermissionsAsync();

            setPermissions({
                location: locationStatus.status === 'granted',
                camera: cameraStatus.status === 'granted',
                microphone: audioStatus.status === 'granted'
            });
        } catch (error) {
            console.error('Error checking permissions:', error);
        }
    };

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setPermissions(prev => ({ ...prev, location: status === 'granted' }));

            if (status !== 'granted') {
                Alert.alert(
                    'Permiso de Ubicación',
                    'Tu ubicación es crucial para enviar ayuda rápidamente en caso de emergencia. Puedes activarlo desde Configuración.',
                    [{ text: 'Entendido' }]
                );
            }
            // const location = await Location.getCurrentPositionAsync({});
        } catch (error) {
            Alert.alert('Error', 'No se pudo solicitar el permiso de ubicación');
        }
    };

    const requestCameraPermission = async () => {
        try {
            const { status } = await requestPermission();
            setPermissions(prev => ({ ...prev, camera: status === 'granted' }));

            if (status !== 'granted') {
                Alert.alert(
                    'Permiso de Cámara',
                    'Necesitamos acceso a la cámara para verificar tu identidad y capturar evidencia en caso de emergencia.',
                    [{ text: 'Entendido' }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo solicitar el permiso de cámara');
        }
    };

    const requestMicrophonePermission = async () => {
        try {
            const { status } = await AudioModule.requestRecordingPermissionsAsync();
            setPermissions(prev => ({ ...prev, microphone: status === 'granted' }));

            if (status !== 'granted') {
                Alert.alert(
                    'Permiso de Micrófono',
                    'El micrófono nos permite detectar patrones de audio que podrían indicar una situación de peligro.',
                    [{ text: 'Entendido' }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo solicitar el permiso de micrófono');
        }
    };

    const handleContinue = async () => {
        const allPermissionsGranted = Object.values(permissions).every(p => p);

        if (!allPermissionsGranted) {
            Alert.alert(
                'Permisos Requeridos',
                'Todos los permisos son necesarios para el correcto funcionamiento de GuardianApp. Sin ellos, no podremos protegerte adecuadamente.',
            );
            return;
        }

        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 500));

        setIsLoading(false);
        router.push('/register');
    };

    const permissionsData = [
        {
            key: 'location',
            icon: '📍',
            title: 'Ubicación',
            description: 'Para enviar tu ubicación exacta a los servicios de emergencia cuando sea necesario.',
            importance: 'Crítico para respuesta de emergencia',
            onPress: requestLocationPermission
        },
        {
            key: 'camera',
            icon: '📷',
            title: 'Cámara',
            description: 'Para verificar tu identidad mediante documentos y capturar evidencia visual en emergencias.',
            importance: 'Esencial para verificación',
            onPress: requestCameraPermission
        },
        {
            key: 'microphone',
            icon: '🎤',
            title: 'Micrófono',
            description: 'Para detectar patrones de audio que podrían indicar situaciones de peligro o violencia.',
            importance: 'Vital para detección automática',
            onPress: requestMicrophonePermission
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#2d5a27', '#3e7b37']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Text style={styles.backButtonText}>← Atrás</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {/* Ícono principal */}
                    <View style={styles.iconContainer}>
                        <View style={styles.permissionsIcon}>
                            <View style={styles.iconGlow} />
                            <Text style={styles.iconText}>🔐</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>Permisos de Seguridad</Text>
                    <Text style={styles.subtitle}>
                        Para protegerte de manera efectiva, GuardianApp necesita acceso a algunas funciones clave de tu dispositivo.
                    </Text>

                    {/* Lista de permisos */}
                    <View style={styles.permissionsList}>
                        {permissionsData.map((permission, index) => (
                            <Animated.View
                                key={permission.key}
                                style={[
                                    styles.permissionCard,
                                    permissions[permission.key] && styles.permissionGranted,
                                    {
                                        opacity: fadeAnim,
                                        transform: [{
                                            translateY: slideAnim.interpolate({
                                                inputRange: [0, 30],
                                                outputRange: [0, 30 + (index * 10)]
                                            })
                                        }]
                                    }
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.permissionContent}
                                    onPress={permission.onPress}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.permissionHeader}>
                                        <View style={[
                                            styles.permissionIconContainer,
                                            permissions[permission.key] && styles.permissionIconGranted
                                        ]}>
                                            <Text style={styles.permissionIcon}>{permission.icon}</Text>
                                        </View>
                                        <View style={styles.permissionInfo}>
                                            <View style={styles.permissionTitleRow}>
                                                <Text style={styles.permissionTitle}>{permission.title}</Text>
                                                <View style={[
                                                    styles.permissionStatus,
                                                    permissions[permission.key] && styles.permissionStatusGranted
                                                ]}>
                                                    <Text style={[
                                                        styles.permissionStatusText,
                                                        permissions[permission.key] && styles.permissionStatusTextGranted
                                                    ]}>
                                                        {permissions[permission.key] ? '✓ Concedido' : '⏸ Pendiente'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.permissionImportance}>{permission.importance}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.permissionDescription}>
                                        {permission.description}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Info de seguridad */}
                    <Animated.View
                        style={[
                            styles.securityInfo,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <Text style={styles.securityIcon}>🛡️</Text>
                        <View style={styles.securityTextContainer}>
                            <Text style={styles.securityTitle}>Tu privacidad está protegida</Text>
                            <Text style={styles.securityText}>
                                Estos permisos solo se usan en situaciones de emergencia. Nunca compartimos tu información personal.
                            </Text>
                        </View>
                    </Animated.View>
                </Animated.View>
            </ScrollView>

            {/* Botón continuar */}
            <Animated.View
                style={[
                    styles.buttonContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        isLoading && styles.continueButtonDisabled
                    ]}
                    onPress={handleContinue}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={isLoading ? ['#cccccc', '#999999'] : ['#ffffff', '#f8f9fa']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[
                            styles.continueButtonText,
                            isLoading && styles.continueButtonTextDisabled
                        ]}>
                            {isLoading ? 'Verificando...' : 'Continuar'}
                        </Text>
                        {!isLoading && (
                            <View style={styles.buttonArrow}>
                                <Text style={styles.arrowText}>→</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Indicador de progreso */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        {Object.values(permissions).filter(p => p).length} de 3 permisos concedidos
                    </Text>
                    <View style={styles.progressBar}>
                        <View style={[
                            styles.progressFill,
                            { width: `${(Object.values(permissions).filter(p => p).length / 3) * 100}%` }
                        ]} />
                    </View>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Contenedores principales
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

    // Header
    header: {
        paddingTop: 20,
        paddingHorizontal: 30,
        paddingBottom: 10,
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        alignSelf: 'flex-start',
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Scroll y contenido
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    content: {
        paddingHorizontal: 30,
        paddingTop: 20,
        alignItems: 'center',
    },

    // Ícono principal
    iconContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    permissionsIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.3)',
        position: 'relative',
    },
    iconGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        top: -10,
        left: -10,
    },
    iconText: {
        fontSize: 40,
        zIndex: 2,
    },

    // Títulos
    title: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 15,
        color: '#ffffff',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 10,
    },

    // Lista de permisos
    permissionsList: {
        width: '100%',
        gap: 20,
    },
    permissionCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    permissionGranted: {
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        borderColor: 'rgba(76, 175, 80, 0.4)',
        shadowColor: '#4CAF50',
        shadowOpacity: 0.3,
    },
    permissionContent: {
        padding: 20,
    },
    permissionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    permissionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    permissionIconGranted: {
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        shadowColor: '#4CAF50',
    },
    permissionIcon: {
        fontSize: 22,
    },
    permissionInfo: {
        flex: 1,
    },
    permissionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    permissionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        flex: 1,
    },
    permissionStatus: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    permissionStatusGranted: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'rgba(76, 175, 80, 0.4)',
    },
    permissionStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    permissionStatusTextGranted: {
        color: '#4CAF50',
    },
    permissionImportance: {
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    permissionDescription: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 22,
    },

    // Info de seguridad
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 15,
        padding: 20,
        marginTop: 30,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
        width: '100%',
    },
    securityIcon: {
        fontSize: 24,
        marginRight: 15,
        marginTop: 2,
    },
    securityTextContainer: {
        flex: 1,
    },
    securityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 5,
    },
    securityText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        lineHeight: 20,
    },

    // Botón y progreso
    buttonContainer: {
        paddingHorizontal: 30,
        paddingBottom: 50,
        paddingTop: 20,
    },
    continueButton: {
        borderRadius: 25,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
        marginBottom: 20,
    },
    continueButtonDisabled: {
        shadowOpacity: 0.1,
        elevation: 2,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.4)',
    },
    continueButtonText: {
        color: '#2d5a27',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    continueButtonTextDisabled: {
        color: '#666666',
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
    progressContainer: {
        alignItems: 'center',
    },
    progressText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 10,
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 3,
    },
});

// Nota: Para usar este componente necesitas instalar:
// expo install expo-location expo-camera expo-av expo-linear-gradient
