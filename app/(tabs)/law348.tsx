import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
    SafeAreaView,
    Linking,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAnimate } from "@/hooks/useAnimate";

const { width, height } = Dimensions.get('window');

// ============================================================================
// HERO SECTION COMPONENT
// ============================================================================
function HeroSection() {
    const fadeAnim = useAnimate(0);
    const scaleAnim = useAnimate(0.9);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <Animated.View 
            style={[
                styles.heroSection,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.heroGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>LEY INTEGRAL</Text>
                </View>
                <Text style={styles.heroTitle}>Ley 348</Text>
                <Text style={styles.heroSubtitle}>
                    Para garantizar a las mujeres una vida libre de violencia
                </Text>
                <Text style={styles.heroDate}>Promulgada el 9 de marzo de 2013</Text>
            </View>
            
            {/* Elementos decorativos */}
            <View style={styles.heroDecorative1} />
            <View style={styles.heroDecorative2} />
        </Animated.View>
    );
}

// ============================================================================
// STATS SECTION COMPONENT
// ============================================================================
function StatsSection() {
    return (
        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>30</Text>
                <Text style={styles.statLabel}>años de cárcel por feminicidio</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>tipos de violencia tipificados</Text>
            </View>
        </View>
    );
}

// ============================================================================
// MODERN CARD COMPONENT
// ============================================================================
function ModernCard({ iconName, title, content, delay = 0, variant = 'default', onPress }) {
    const fadeAnim = useAnimate(0);
    const translateAnim = useAnimate(20);
    const [pressed, setPressed] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(translateAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                })
            ]).start();
        }, delay);
    }, []);

    const getIconColor = () => {
        switch (variant) {
            case 'emergency': return '#dc2626';
            case 'warning': return '#ea580c';
            case 'info': return '#2563eb';
            default: return '#667eea';
        }
    };

    const getIconBackground = () => {
        switch (variant) {
            case 'emergency': return '#fee2e2';
            case 'warning': return '#fed7aa';
            case 'info': return '#dbeafe';
            default: return '#e0e7ff';
        }
    };

    return (
        <Animated.View
            style={[
                styles.modernCard,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: translateAnim }]
                }
            ]}
        >
            <TouchableOpacity
                activeOpacity={onPress ? 0.98 : 1}
                onPress={onPress}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                style={[
                    styles.cardTouchable,
                    pressed && styles.cardPressed
                ]}
            >
                <View style={styles.cardHeader}>
                    <View style={[
                        styles.modernIconContainer,
                        { backgroundColor: getIconBackground() }
                    ]}>
                        <IconSymbol 
                            name={iconName} 
                            size={24} 
                            color={getIconColor()}
                        />
                    </View>
                    <View style={styles.cardHeaderText}>
                        <Text style={styles.modernCardTitle}>
                            {title}
                        </Text>
                        {onPress && (
                            <View style={styles.cardChevron}>
                                <IconSymbol 
                                    name="chevron.right" 
                                    size={16} 
                                    color="#94a3b8"
                                />
                            </View>
                        )}
                    </View>
                </View>
                
                <View style={styles.modernCardContent}>
                    {content}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ============================================================================
// PRINCIPLES LIST COMPONENT
// ============================================================================
function PrinciplesList({ principles }) {
    return (
        <View style={styles.modernPrinciplesList}>
            {principles.map((principle, index) => (
                <View key={index} style={styles.modernPrincipleItem}>
                    <View style={styles.principleIconContainer}>
                        <IconSymbol 
                            name="checkmark.circle.fill" 
                            size={20} 
                            color="#10b981"
                        />
                    </View>
                    <View style={styles.modernPrincipleContent}>
                        <Text style={styles.modernPrincipleTitle}>{principle.title}</Text>
                        <Text style={styles.modernPrincipleDesc}>{principle.desc}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

// ============================================================================
// VIOLENCE TYPES GRID COMPONENT
// ============================================================================
function ViolenceTypesGrid({ types }) {
    return (
        <View style={styles.modernTypesGrid}>
            {types.map((type, index) => (
                <View key={index} style={styles.modernTypeCard}>
                    <View style={styles.typeHeader}>
                        <View style={styles.typeIconContainer}>
                            <IconSymbol 
                                name="exclamationmark.triangle.fill" 
                                size={16} 
                                color="#dc2626"
                            />
                        </View>
                        <Text style={styles.modernTypeTitle}>{type.title}</Text>
                    </View>
                    <Text style={styles.modernTypeDescription}>{type.description}</Text>
                </View>
            ))}
        </View>
    );
}

// ============================================================================
// EMERGENCY SECTION COMPONENT
// ============================================================================
function EmergencySection() {
    const scaleAnim = useAnimate(0.95);

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleCall = (number) => {
        Linking.openURL(`tel:${number}`);
    };

    const institutions = [
        { name: 'Policía Boliviana', subtitle: 'Fuerza Especial', icon: 'shield' },
        { name: 'SLIM', subtitle: 'Servicios Legales', icon: 'scale.3d' },
        { name: 'Ministerio Público', subtitle: 'Fiscalías', icon: 'building.columns' },
        { name: 'Defensoría', subtitle: 'Protección', icon: 'person.badge.shield.checkmark' }
    ];

    return (
        <Animated.View style={[styles.modernEmergencySection, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
                colors={['#ff6b6b', '#ee5a52']}
                style={styles.emergencyGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.emergencyHeader}>
                <View style={styles.emergencyIconContainer}>
                    <IconSymbol 
                        name="phone.fill" 
                        size={28} 
                        color="white"
                    />
                </View>
                <View>
                    <Text style={styles.emergencyMainTitle}>Líneas de Emergencia</Text>
                    <Text style={styles.emergencyMainSubtitle}>Ayuda inmediata las 24 horas</Text>
                </View>
            </View>
            
            <View style={styles.phoneGrid}>
                <TouchableOpacity
                    style={styles.modernPhoneButton}
                    onPress={() => handleCall('110')}
                    activeOpacity={0.8}
                >
                    <IconSymbol 
                        name="shield.fill" 
                        size={20} 
                        color="white"
                    />
                    <Text style={styles.phoneLabel}>Policía</Text>
                    <Text style={styles.modernPhoneNumber}>110</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.modernPhoneButton}
                    onPress={() => handleCall('800140348')}
                    activeOpacity={0.8}
                >
                    <IconSymbol 
                        name="headphones" 
                        size={20} 
                        color="white"
                    />
                    <Text style={styles.phoneLabel}>Línea Gratuita</Text>
                    <Text style={styles.modernPhoneNumber}>800-140-348</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.modernInstitutionsGrid}>
                {institutions.map((inst, index) => (
                    <View key={index} style={styles.modernInstitutionCard}>
                        <IconSymbol 
                            name={inst.icon} 
                            size={20} 
                            color="white"
                        />
                        <Text style={styles.modernInstitutionName}>{inst.name}</Text>
                        <Text style={styles.modernInstitutionSubtitle}>{inst.subtitle}</Text>
                    </View>
                ))}
            </View>
        </Animated.View>
    );
}

// ============================================================================
// MAIN SCREEN COMPONENT
// ============================================================================
export default function Law348Screen() {
    const fadeAnim = useAnimate(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    // Data constants
    const violenceTypes = [
        { title: 'Violencia Física', description: 'Actos que causen lesiones y daño corporal' },
        { title: 'Feminicidio', description: 'Acción extrema de violencia que cause muerte' },
        { title: 'Violencia Psicológica', description: 'Desvalorización, intimidación y control' },
        { title: 'Violencia Sexual', description: 'Contra la autodeterminación sexual' },
        { title: 'Violencia Económica', description: 'Control o limitación de recursos económicos' },
        { title: 'Violencia Laboral', description: 'Discriminación en el ámbito laboral' },
        { title: 'Violencia Mediática', description: 'Estereotipos denigrantes en medios' },
        { title: 'Violencia Institucional', description: 'Actos discriminatorios por servidores públicos' }
    ];

    const principles = [
        { title: 'Vivir Bien', desc: 'Vida íntegra en armonía y equilibrio' },
        { title: 'Igualdad', desc: 'Igualdad real y efectiva entre mujeres y hombres' },
        { title: 'Inclusión', desc: 'Respeto e incorporación de la diversidad cultural' },
        { title: 'Trato Digno', desc: 'Atención prioritaria, oportuna y respetuosa' },
        { title: 'Despatriarcalización', desc: 'Erradicación del sistema patriarcal' },
        { title: 'Especialidad', desc: 'Atención diferenciada y especializada' }
    ];

    const protectionMeasures = [
        'Prohibición de acercamiento y comunicación con la víctima',
        'Salida inmediata del agresor del domicilio familiar',
        'Suspensión temporal del régimen de visitas',
        'Prohibición de enajenación de bienes de la víctima',
        'Medidas de protección laboral y económica',
        'Atención médica y psicológica especializada'
    ];

    const sanctions = [
        { crime: 'Feminicidio', penalty: '30 años sin derecho a indulto', severity: 'high' },
        { crime: 'Violación', penalty: '15 a 20 años de prisión', severity: 'high' },
        { crime: 'Acoso sexual', penalty: '4 a 8 años de prisión', severity: 'medium' },
        { crime: 'Violencia familiar', penalty: '2 a 4 años de prisión', severity: 'medium' },
        { crime: 'Violencia económica', penalty: '2 a 4 años de prisión', severity: 'medium' }
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#667eea" />
            
            <SafeAreaView style={styles.safeArea}>
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Hero Section */}
                        <HeroSection />

                        {/* Stats Section */}
                        <StatsSection />

                        {/* Objetivo */}
                        <ModernCard
                            iconName="target"
                            title="Objetivo Principal"
                            delay={100}
                            content={
                                <View>
                                    <Text style={styles.modernCardText}>
                                        Establecer mecanismos, medidas y políticas integrales de prevención, 
                                        atención, protección y reparación a las mujeres en situación de violencia.
                                    </Text>
                                    <View style={styles.modernHighlightBox}>
                                        <IconSymbol 
                                            name="lightbulb.fill" 
                                            size={16} 
                                            color="#0ea5e9"
                                            style={styles.highlightIcon}
                                        />
                                        <Text style={styles.modernHighlightText}>
                                            <Text style={styles.highlightBold}>Meta:</Text> Garantizar a las mujeres 
                                            una vida digna y el ejercicio pleno de sus derechos para Vivir Bien.
                                        </Text>
                                    </View>
                                </View>
                            }
                        />

                        {/* Principios */}
                        <ModernCard
                            iconName="list.bullet"
                            title="Principios Fundamentales"
                            delay={150}
                            content={<PrinciplesList principles={principles} />}
                        />

                        {/* Tipos de Violencia */}
                        <ModernCard
                            iconName="exclamationmark.triangle"
                            title="Tipos de Violencia Tipificados"
                            variant="warning"
                            delay={200}
                            content={<ViolenceTypesGrid types={violenceTypes} />}
                        />

                        {/* Medidas de Protección */}
                        <ModernCard
                            iconName="shield.checkered"
                            title="Medidas de Protección"
                            variant="info"
                            delay={250}
                            content={
                                <View style={styles.modernMeasuresList}>
                                    {protectionMeasures.map((measure, index) => (
                                        <View key={index} style={styles.modernMeasureItem}>
                                            <View style={styles.measureBullet}>
                                                <IconSymbol 
                                                    name="checkmark" 
                                                    size={12} 
                                                    color="white"
                                                />
                                            </View>
                                            <Text style={styles.modernMeasureText}>{measure}</Text>
                                        </View>
                                    ))}
                                </View>
                            }
                        />

                        {/* Sanciones */}
                        <ModernCard
                            iconName="hammer"
                            title="Sanciones Principales"
                            variant="emergency"
                            delay={300}
                            content={
                                <View style={styles.modernSanctionsList}>
                                    {sanctions.map((sanction, index) => (
                                        <View key={index} style={[
                                            styles.modernSanctionItem,
                                            sanction.severity === 'high' && styles.highSeverity
                                        ]}>
                                            <View style={styles.sanctionHeader}>
                                                <View style={styles.sanctionTitleContainer}>
                                                    <IconSymbol 
                                                        name={sanction.severity === 'high' ? 'exclamationmark.octagon.fill' : 'exclamationmark.circle.fill'} 
                                                        size={16} 
                                                        color={sanction.severity === 'high' ? '#991b1b' : '#dc2626'}
                                                    />
                                                    <Text style={[
                                                        styles.modernCrimeText,
                                                        sanction.severity === 'high' && styles.highSeverityText
                                                    ]}>
                                                        {sanction.crime}
                                                    </Text>
                                                </View>
                                                {sanction.severity === 'high' && (
                                                    <View style={styles.severityBadge}>
                                                        <Text style={styles.severityBadgeText}>GRAVE</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.modernPenaltyText}>{sanction.penalty}</Text>
                                        </View>
                                    ))}
                                </View>
                            }
                        />

                        {/* Sección de Emergencia */}
                        <EmergencySection />

                        <View style={styles.bottomSpacing} />
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },

    // Hero Section Styles
    heroSection: {
        height: 280,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 24,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    heroGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    heroContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 2,
    },
    heroBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },
    heroBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: '800',
        color: 'white',
        marginBottom: 8,
        letterSpacing: -1,
    },
    heroSubtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 8,
        fontWeight: '500',
    },
    heroDate: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '400',
    },
    heroDecorative1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    heroDecorative2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },

    // Stats Section Styles
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: '#667eea',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 18,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 20,
    },

    // Modern Card Styles
    modernCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTouchable: {
        borderRadius: 16,
    },
    cardPressed: {
        transform: [{ scale: 0.995 }],
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    modernIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardHeaderText: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modernCardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        flex: 1,
        lineHeight: 24,
    },
    cardChevron: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modernCardContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    modernCardText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#475569',
        marginBottom: 20,
        fontWeight: '400',
    },

    // Modern Highlight Box Styles
    modernHighlightBox: {
        backgroundColor: '#f0f9ff',
        borderWidth: 1,
        borderColor: '#e0f2fe',
        padding: 20,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#0ea5e9',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    highlightIcon: {
        marginRight: 16,
        marginTop: 1,
    },
    modernHighlightText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#0c4a6e',
        fontWeight: '400',
        flex: 1,
    },
    highlightBold: {
        fontWeight: '700',
    },

    // Modern Principles List Styles
    modernPrinciplesList: {
        gap: 20,
    },
    modernPrincipleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    principleIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ecfdf5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        marginTop: 2,
    },
    modernPrincipleContent: {
        flex: 1,
        paddingTop: 2,
    },
    modernPrincipleTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 6,
        lineHeight: 22,
    },
    modernPrincipleDesc: {
        fontSize: 15,
        color: '#64748b',
        lineHeight: 22,
    },

    // Modern Types Grid Styles
    modernTypesGrid: {
        gap: 16,
    },
    modernTypeCard: {
        backgroundColor: '#fafafa',
        padding: 20,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
    },
    typeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    typeIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    modernTypeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
        lineHeight: 20,
    },
    modernTypeDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },

    // Modern Measures List Styles
    modernMeasuresList: {
        gap: 16,
    },
    modernMeasureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    measureBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        marginTop: 2,
    },
    modernMeasureText: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
        flex: 1,
    },

    // Modern Sanctions List Styles
    modernSanctionsList: {
        gap: 16,
    },
    modernSanctionItem: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        padding: 20,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    highSeverity: {
        backgroundColor: '#fef1f1',
        borderColor: '#fca5a5',
        borderLeftColor: '#dc2626',
    },
    sanctionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sanctionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modernCrimeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#dc2626',
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
    highSeverityText: {
        color: '#991b1b',
    },
    severityBadge: {
        backgroundColor: '#dc2626',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    severityBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    modernPenaltyText: {
        fontSize: 14,
        color: '#7f1d1d',
        fontWeight: '500',
        marginTop: 6,
        lineHeight: 20,
    },

    // Modern Emergency Section Styles
    modernEmergencySection: {
        marginHorizontal: 20,
        marginVertical: 24,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    emergencyGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    emergencyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 28,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    emergencyIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    emergencyMainTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: 'white',
        marginBottom: 2,
    },
    emergencyMainSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    phoneGrid: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 24,
    },
    modernPhoneButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    phoneLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    modernPhoneNumber: {
        fontSize: 19,
        fontWeight: '800',
        color: 'white',
    },
    modernInstitutionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        paddingBottom: 28,
        gap: 12,
    },
    modernInstitutionCard: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    modernInstitutionName: {
        fontSize: 13,
        fontWeight: '700',
        color: 'white',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 4,
    },
    modernInstitutionSubtitle: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        fontWeight: '500',
    },

    // Bottom Spacing
    bottomSpacing: {
        height: Platform.OS === 'ios' ? 40 : 20,
    },
});
