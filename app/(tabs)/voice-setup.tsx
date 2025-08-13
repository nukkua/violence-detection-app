import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    ScrollView,
    SafeAreaView,
    TextInput,
    Platform,
    Alert,
    Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAnimate } from "@/hooks/useAnimate";
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// ============================================================================
// HEADER COMPONENT
// ============================================================================
function Header() {
    const fadeAnim = useAnimate(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <SafeAreaView style={styles.headerSafeArea}>
            <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <IconSymbol 
                        name="chevron.left" 
                        size={18} 
                        color="#1e293b"
                    />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>Configurar Gesto por Voz</Text>
                
                <View style={styles.headerSpacer} />
            </Animated.View>
        </SafeAreaView>
    );
}

// ============================================================================
// VOICE VISUALIZATION COMPONENT
// ============================================================================
function VoiceVisualization({ isRecording, isListening }) {
    const pulseAnim = useAnimate(1);
    const waveAnim1 = useAnimate(0);
    const waveAnim2 = useAnimate(0);
    const waveAnim3 = useAnimate(0);

    useEffect(() => {
        if (isRecording || isListening) {
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    })
                ])
            );
            animation.start();

            // Wave animations
            Animated.stagger(200, [
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(waveAnim1, { toValue: 1, duration: 1000, useNativeDriver: true }),
                        Animated.timing(waveAnim1, { toValue: 0, duration: 1000, useNativeDriver: true })
                    ])
                ),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(waveAnim2, { toValue: 1, duration: 1000, useNativeDriver: true }),
                        Animated.timing(waveAnim2, { toValue: 0, duration: 1000, useNativeDriver: true })
                    ])
                ),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(waveAnim3, { toValue: 1, duration: 1000, useNativeDriver: true }),
                        Animated.timing(waveAnim3, { toValue: 0, duration: 1000, useNativeDriver: true })
                    ])
                )
            ]).start();

            return () => {
                animation.stop();
            };
        } else {
            pulseAnim.setValue(1);
            waveAnim1.setValue(0);
            waveAnim2.setValue(0);
            waveAnim3.setValue(0);
        }
    }, [isRecording, isListening]);

    return (
        <View style={styles.visualizationContainer}>
            <Animated.View 
                style={[
                    styles.micContainer,
                    { transform: [{ scale: pulseAnim }] }
                ]}
            >
                <LinearGradient
                    colors={isRecording ? ['#ff6b6b', '#ee5a52'] : ['#667eea', '#764ba2']}
                    style={styles.micGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <IconSymbol 
                    name={isRecording ? "mic.fill" : "mic"} 
                    size={40} 
                    color="white"
                />
            </Animated.View>

            {/* Animated Waves */}
            <Animated.View 
                style={[
                    styles.waveRing,
                    styles.wave1,
                    { opacity: waveAnim1 }
                ]} 
            />
            <Animated.View 
                style={[
                    styles.waveRing,
                    styles.wave2,
                    { opacity: waveAnim2 }
                ]} 
            />
            <Animated.View 
                style={[
                    styles.waveRing,
                    styles.wave3,
                    { opacity: waveAnim3 }
                ]} 
            />
        </View>
    );
}

// ============================================================================
// MAIN VOICE SETUP COMPONENT
// ============================================================================
export default function VoiceSetupScreen() {
    const fadeAnim = useAnimate(0);
    const [voicePhrase, setVoicePhrase] = useState('');

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleSave = () => {
        if (!voicePhrase.trim()) {
            Alert.alert('Atención', 'Por favor, ingresa una frase antes de guardar.');
            return;
        }
        
        Alert.alert(
            'Configuración Guardada',
            `Tu gesto por voz "${voicePhrase}" ha sido configurado correctamente.`,
            [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]
        );
    };

    const suggestedPhrases = [
        "Ayuda",
        "Me violan",
        "Me pasas mi chompa roja",
        "Auxilio",
        "Te Verde"
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.backgroundGradient}
            />
            
            <Header />
            
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {/* Instructions */}
                    <View style={styles.instructionsCard}>
                        <View style={styles.instructionHeader}>
                            <IconSymbol name="info.circle.fill" size={24} color="#667eea" />
                            <Text style={styles.instructionTitle}>¿Cómo funciona?</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Escribe una frase única. Esta será tu comando de voz para activar la alerta 
                        </Text>
                    </View>

                    {/* Voice Phrase Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Tu frase de activación</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={voicePhrase}
                                onChangeText={setVoicePhrase}
                                placeholder="Ej: Auxilio"
                                placeholderTextColor="#94a3b8"
                                maxLength={50}
                            />
                            {voicePhrase.length > 0 ? (
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => setVoicePhrase('')}
                                    activeOpacity={0.7}
                                >
                                    <IconSymbol name="xmark.circle.fill" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.inputIcon}>
                                    <IconSymbol name="text.quote" size={20} color="#667eea" />
                                </View>
                            )}
                        </View>
                        <Text style={styles.characterCount}>{voicePhrase.length}/50 caracteres</Text>
                    </View>

                    {/* Suggested Phrases */}
                    <View style={styles.suggestionsSection}>
                        <Text style={styles.suggestionsTitle}>Frases sugeridas</Text>
                        <View style={styles.suggestionsGrid}>
                            {suggestedPhrases.map((phrase, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.suggestionChip,
                                        voicePhrase === phrase && styles.suggestionChipSelected
                                    ]}
                                    onPress={() => setVoicePhrase(phrase)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.suggestionText,
                                        voicePhrase === phrase && styles.suggestionTextSelected
                                    ]}>
                                        {phrase}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Fixed Save Button at Bottom */}
            <View style={styles.bottomContainer}>
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            !voicePhrase.trim() && styles.saveButtonDisabled
                        ]}
                        onPress={handleSave}
                        disabled={!voicePhrase.trim()}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={voicePhrase.trim() ? ['#667eea', '#764ba2'] : ['#e2e8f0', '#cbd5e1']}
                            style={styles.saveButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <Text style={[
                            styles.saveButtonText,
                            !voicePhrase.trim() && styles.saveButtonTextDisabled
                        ]}>
                            Guardar Configuración
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        backgroundColor: '#ffffff',
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120, // Espacio para el botón flotante
    },
    content: {
        paddingHorizontal: 20,
    },

    // Header Styles
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

    // Instructions Card
    instructionsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    instructionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    instructionText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },

    // Input Section
    inputSection: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    inputContainer: {
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    textInput: {
        fontSize: 16,
        color: '#1e293b',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingRight: 50,
        fontWeight: '400',
    },
    inputIcon: {
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    clearButton: {
        position: 'absolute',
        right: 12,
        top: '43%',
        transform: [{ translateY: -10 }],
        padding: 4,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    characterCount: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'right',
        marginTop: 8,
    },

    // Suggestions Section
    suggestionsSection: {
        marginBottom: 32,
    },
    suggestionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    suggestionChip: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    suggestionChipSelected: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    suggestionText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    suggestionTextSelected: {
        color: 'white',
    },

    // Bottom Container & Action Section
    bottomContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 34 : 20,
        left: 20,
        right: 20,
        height: 80,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionSection: {
        width: '100%',
    },
    saveButton: {
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    saveButtonDisabled: {
        shadowOpacity: 0.05,
        elevation: 2,
    },
    saveButtonGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: 40,
    },
    saveButtonContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    saveButtonTextDisabled: {
        color: '#94a3b8',
    },
});
