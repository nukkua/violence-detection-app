import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Animated,
    Alert,
    Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAnimate } from "@/hooks/useAnimate";
import { router } from 'expo-router';

// Datos del usuario (normalmente vendrían de un context o estado global)
const userData = {
    fullName: 'Albert Stevano',
    birthDate: '15 de Marzo, 1992',
    birthPlace: 'La Paz, Bolivia',
    maritalStatus: 'Soltero',
    profession: 'Ingeniero de Software',
    address: 'Zona Sur, La Paz',
    idNumber: '*****234'
};

// Estadísticas simuladas
const userStats = {
    recordingsCount: 47,
    safetyScore: 92,
    emergencyContacts: 3,
    activeSince: 'Enero 2024'
};

function ProfileHeader() {
    const fadeAnim = useAnimate(0);
    const slideAnim = useAnimate(50);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.profileHeader,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.avatarContainer}>
                <LinearGradient
                    colors={['#f8fafc', '#e2e8f0']}
                    style={styles.avatarGradient}
                />
                <Text style={styles.avatarEmoji}>👨‍💼</Text>
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.userName}>{userData.fullName}</Text>
                <Text style={styles.userProfession}>{userData.profession}</Text>
                <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Protegido</Text>
                </View>
            </View>
        </Animated.View>
    );
}

function StatsGrid() {
    const fadeAnim = useAnimate(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const StatCard = ({ title, value, icon, color = '#64748b' }) => (
        <View style={styles.statCard}>
            <IconSymbol name={icon} size={24} color={color} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    );

    return (
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Estadísticas de Protección</Text>
            <View style={styles.statsGrid}>
                <StatCard
                    title="Grabaciones"
                    value={userStats.recordingsCount}
                    icon="waveform"
                    color="#3b82f6"
                />
                <StatCard
                    title="Puntuación"
                    value={`${userStats.safetyScore}%`}
                    icon="shield.checkered"
                    color="#10b981"
                />
                <StatCard
                    title="Contactos"
                    value={userStats.emergencyContacts}
                    icon="person.2.fill"
                    color="#f59e0b"
                />
                <StatCard
                    title="Activo desde"
                    value={userStats.activeSince}
                    icon="calendar"
                    color="#8b5cf6"
                />
            </View>
        </Animated.View>
    );
}

function PersonalInfo() {
    const [isExpanded, setIsExpanded] = useState(false);
    const expandAnim = useAnimate(0);
    const fadeAnim = useAnimate(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        Animated.timing(expandAnim, {
            toValue: isExpanded ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const InfoRow = ({ label, value, isSecret = false }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>
                {isSecret && !isExpanded ? '••••••••' : value}
            </Text>
        </View>
    );

    return (
        <Animated.View style={[styles.personalInfoContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity
                style={styles.sectionHeader}
                onPress={toggleExpanded}
                activeOpacity={0.7}
            >
                <Text style={styles.sectionTitle}>Información Personal</Text>
                <IconSymbol
                    name={isExpanded ? "eye.slash" : "eye"}
                    size={20}
                    color="#64748b"
                />
            </TouchableOpacity>

            <View style={styles.infoContent}>
                <InfoRow label="Nombre completo" value={userData.fullName} />
                <InfoRow label="Fecha de nacimiento" value={userData.birthDate} />
                <InfoRow label="Lugar de nacimiento" value={userData.birthPlace} />
                <InfoRow label="Estado civil" value={userData.maritalStatus} />
                <InfoRow label="Profesión" value={userData.profession} />
                <InfoRow label="Dirección" value={userData.address} isSecret />
                <InfoRow label="Documento" value={userData.idNumber} isSecret />
            </View>
        </Animated.View>
    );
}


function ActionButtons() {
    const fadeAnim = useAnimate(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const ActionButton = ({ title, subtitle, icon, onPress, variant = 'default' }) => (
        <TouchableOpacity
            style={[
                styles.actionButton,
                variant === 'danger' && styles.actionButtonDanger
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <IconSymbol
                name={icon}
                size={20}
                color={variant === 'danger' ? '#ef4444' : '#64748b'}
            />
            <View style={styles.actionButtonText}>
                <Text style={[
                    styles.actionButtonTitle,
                    variant === 'danger' && styles.actionButtonTitleDanger
                ]}>
                    {title}
                </Text>
                <Text style={styles.actionButtonSubtitle}>{subtitle}</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color="#94a3b8" />
        </TouchableOpacity>
    );

    const handleEmergencyContacts = () => {
        Alert.alert(
            "Contactos de Emergencia",
            "Aquí puedes gestionar tus contactos de emergencia para situaciones de riesgo.",
            [{ text: "Entendido", style: "default" }]
        );
    };

    const handlePrivacySettings = () => {
        router.push('/profile/privacy-settings')
    };

    const handleSupportCenter = () => {
        Alert.alert(
            "Centro de Ayuda",
            "Recursos, guías y asistencia para usar GuardianApp de manera efectiva.",
            [{ text: "Entendido", style: "default" }]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás segura de que quieres cerrar sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Cerrar sesión", style: "destructive", onPress: () => router.replace('/') }
            ]
        );
    };

    return (
        <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
            <ActionButton
                title="Contactos de emergencia"
                subtitle="Gestionar personas de confianza"
                icon="person.badge.plus"
                onPress={handleEmergencyContacts}
            />

            <ActionButton
                title="Privacidad y datos"
                subtitle="Control de información personal"
                icon="lock.shield"
                onPress={handlePrivacySettings}
            />

            <ActionButton
                title="Centro de ayuda"
                subtitle="Recursos y asistencia"
                icon="questionmark.circle"
                onPress={handleSupportCenter}
            />

            <ActionButton
                title="Cerrar sesión"
                subtitle="Salir de la aplicación"
                icon="rectangle.portrait.and.arrow.right"
                onPress={handleLogout}
                variant="danger"
            />
        </Animated.View>
    );
}

export default function ProfilePage() {
    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.backgroundGradient}
            />

            {/* Header */}
            <SafeAreaView style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        activeOpacity={0.7}
                    >
                        <IconSymbol name="chevron.left" size={18} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                    <View style={styles.headerSpacer} />
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <ProfileHeader />
                <StatsGrid />
                <PersonalInfo />
                <ActionButtons />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>GuardianApp v1.0.0</Text>
                    <Text style={styles.footerSubtext}>
                        Protegiendo a las mujeres con tecnología
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
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

    // Header
    headerSafeArea: {
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        height: 60,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        letterSpacing: -0.2,
    },
    headerSpacer: {
        width: 40,
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },

    // Profile Header
    profileHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        overflow: 'hidden',
    },
    avatarGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarEmoji: {
        fontSize: 40,
        zIndex: 1,
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    userProfession: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#16a34a',
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#15803d',
    },

    // Stats Grid
    statsContainer: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
        letterSpacing: -0.2,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statValue: {
        fontSize: 19,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 8,
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
        textAlign: 'center',
    },

    // Personal Info
    personalInfoContainer: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
    },

    // Settings
    settingsContainer: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },

    // Actions
    actionsContainer: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    actionButtonDanger: {
        borderColor: '#fecaca',
        backgroundColor: '#fef2f2',
    },
    actionButtonText: {
        marginLeft: 12,
        flex: 1,
    },
    actionButtonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    actionButtonTitleDanger: {
        color: '#dc2626',
    },
    actionButtonSubtitle: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },

    // Footer
    footer: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    footerText: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '500',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: '#cbd5e1',
        fontWeight: '500',
        textAlign: 'center',
    },
});
