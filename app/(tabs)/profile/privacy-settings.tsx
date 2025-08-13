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

function PrivacyHeader() {
    const fadeAnim = useAnimate(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.privacyHeader, { opacity: fadeAnim }]}>
            <View style={styles.headerIcon}>
                <IconSymbol name="lock.shield" size={32} color="#3b82f6" />
            </View>
            <Text style={styles.headerTitle}>Privacidad y Datos</Text>
            <Text style={styles.headerSubtitle}>
                Controla cómo se almacenan y procesan tus datos personales
            </Text>
        </Animated.View>
    );
}


function PrivacyControlsSection() {
    const [shareAnalytics, setShareAnalytics] = useState(false);
    const [shareLocation, setShareLocation] = useState(true);
    const [shareContacts, setShareContacts] = useState(true);
    const fadeAnim = useAnimate(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const PrivacyCard = ({ title, subtitle, value, onValueChange, icon, required = false }) => (
        <View style={[styles.settingCard, required && styles.requiredCard]}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, required && styles.requiredIcon]}>
                    <IconSymbol
                        name={icon}
                        size={20}
                        color={required ? "#10b981" : "#64748b"}
                    />
                </View>
                <View style={styles.settingContent}>
                    <View style={styles.titleRow}>
                        <Text style={styles.settingTitle}>{title}</Text>
                    </View>
                    {required && <Text style={styles.requiredBadge}>Requerido</Text>}
                    <Text style={styles.settingSubtitle}>{subtitle}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={required ? undefined : onValueChange}
                trackColor={{ false: '#e2e8f0', true: required ? '#10b981' : '#3b82f6' }}
                thumbColor={value ? '#ffffff' : '#64748b'}
                disabled={required}
            />
        </View>
    );

    return (
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Controles de Privacidad</Text>

            <PrivacyCard
                title="Compartir ubicación"
                subtitle="Para servicios de emergencia"
                value={shareLocation}
                onValueChange={setShareLocation}
                icon="location"
                required={true}
            />

            <PrivacyCard
                title="Acceso a contactos"
                subtitle="Para notificar a personas de confianza"
                value={shareContacts}
                onValueChange={setShareContacts}
                icon="person.2"
                required={true}
            />

        </Animated.View>
    );
}


function SecurityInfoSection() {
    const fadeAnim = useAnimate(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const InfoCard = ({ icon, title, description }) => (
        <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
                <IconSymbol name={icon} size={24} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{title}</Text>
                <Text style={styles.infoDescription}>{description}</Text>
            </View>
        </View>
    );

    return (
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Seguridad de la Información</Text>

            <InfoCard
                icon="lock.fill"
                title="Encriptación end-to-end"
                description="Todas las grabaciones se encriptan antes de almacenarse"
            />

            <InfoCard
                icon="eye.slash.fill"
                title="Privacidad por diseño"
                description="Solo tú tienes acceso a tus datos personales"
            />

            <InfoCard
                icon="shield.checkered"
                title="Almacenamiento seguro"
                description="Los datos se guardan en servidores certificados"
            />
        </Animated.View>
    );
}

export default function PrivacySettingsPage() {
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
                    <Text style={styles.headerTitleText}>Privacidad</Text>
                    <View style={styles.headerSpacer} />
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <PrivacyHeader />
                <PrivacyControlsSection />
                <SecurityInfoSection />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Última actualización de privacidad: 15 de Enero, 2024
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
    headerTitleText: {
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

    // Privacy Header
    privacyHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 32,
    },
    headerIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        letterSpacing: -0.5,
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 22,
    },

    // Sections
    section: {
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

    // Setting Cards
    settingCard: {
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
    warningCard: {
        borderColor: '#fed7aa',
        backgroundColor: '#fffbeb',
    },
    requiredCard: {
        borderColor: '#bbf7d0',
        backgroundColor: '#f0fdf4',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    warningIcon: {
        backgroundColor: '#fef3c7',
        borderColor: '#fde68a',
    },
    requiredIcon: {
        backgroundColor: '#dcfce7',
        borderColor: '#bbf7d0',
    },
    dangerIcon: {
        backgroundColor: '#fee2e2',
        borderColor: '#fecaca',
    },
    settingContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    requiredBadge: {
        fontSize: 11,
        fontWeight: '600',
        color: '#16a34a',
        paddingVertical: 2,
        borderRadius: 8,
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
        lineHeight: 16,
    },

    // Action Buttons
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
    dangerButton: {
        borderColor: '#fecaca',
        backgroundColor: '#fef2f2',
    },
    actionContent: {
        marginLeft: 12,
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    dangerTitle: {
        color: '#dc2626',
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },

    // Info Cards
    infoCard: {
        flexDirection: 'row',
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
    infoIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    infoDescription: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        lineHeight: 20,
    },

    // Footer
    footer: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    footerText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
        textAlign: 'center',
    },
});
