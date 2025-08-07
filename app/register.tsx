import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image, Alert, Modal } from "react-native";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { useCameraPermissions, CameraView } from "expo-camera";
import { useSession } from "@/context/ctx";



const { width, height } = Dimensions.get('window');

export default function RegistrationScreen() {
    const { signIn } = useSession();

    const [formData, setFormData] = useState({
        fullName: '',
        birthDate: '',
        birthPlace: '',
        maritalStatus: '',
        profession: '',
        address: '',
        idNumber: ''
    });

    const [dniImage, setDniImage] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showMaritalPicker, setShowMaritalPicker] = useState(false);
    const [tempDateInput, setTempDateInput] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const cameraRef = useRef(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
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
    }, []);


    const validateIdNumber = (idNumber) => {
        const idRegex = /^\d{8}$/;
        return idRegex.test(idNumber);
    };

    const validateDate = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        const minAge = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
        const maxAge = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());

        return date >= minAge && date <= maxAge;
    };

    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'fullName':
                if (!value.trim()) {
                    error = 'Nombre completo es obligatorio';
                } else if (value.trim().length < 3) {
                    error = 'Debe tener al menos 3 caracteres';
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
                    error = 'Solo se permiten letras y espacios';
                }
                break;
            case 'birthDate':
                if (!value) {
                    error = 'Fecha de nacimiento es obligatoria';
                } else if (!validateDate(value)) {
                    error = 'Edad debe estar entre 16 y 100 años';
                }
                break;
            case 'birthPlace':
                if (!value.trim()) {
                    error = 'Lugar de nacimiento es obligatorio';
                } else if (value.trim().length < 2) {
                    error = 'Debe tener al menos 2 caracteres';
                }
                break;
            case 'maritalStatus':
                if (!value) {
                    error = 'Estado civil es obligatorio';
                }
                break;
            case 'profession':
                if (!value.trim()) {
                    error = 'Profesión es obligatoria';
                } else if (value.trim().length < 2) {
                    error = 'Debe tener al menos 2 caracteres';
                }
                break;
            case 'address':
                if (!value.trim()) {
                    error = 'Domicilio es obligatorio';
                } else if (value.trim().length < 5) {
                    error = 'Debe tener al menos 5 caracteres';
                }
                break;
            case 'idNumber':
                if (!value) {
                    error = 'Número de carnet es obligatorio';
                } else if (!validateIdNumber(value)) {
                    error = 'Debe tener exactamente 8 dígitos';
                }
                break;
        }

        setErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Validar en tiempo real
        if (errors[field]) {
            validateField(field, value);
        }
    };

    const takeDNIPhoto = async () => {
        if (!permission) {
            // Permisos aún se están cargando
            return;
        }

        if (!permission.granted) {
            // Solicitar permisos
            const response = await requestPermission();
            if (!response.granted) {
                Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para fotografiar tu carnet');
                return;
            }
        }

        setShowCamera(true);
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 1,
                    base64: false,
                    skipProcessing: false,
                });


                setDniImage(photo.uri);
                setShowCamera(false);

            } catch (error) {
                Alert.alert('Error', 'No se pudo tomar la foto');
            }
        }
    };

    const closeCameraModal = () => {
        setShowCamera(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        // Usar el string directamente sin crear objeto Date para evitar problemas de zona horaria
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const maritalStatusOptions = [
        { label: 'Soltero(a)', value: 'soltero' },
        { label: 'Casado(a)', value: 'casado' },
        { label: 'Divorciado(a)', value: 'divorciado' },
        { label: 'Viudo(a)', value: 'viudo' },
        { label: 'Conviviente', value: 'conviviente' }
    ];

    const handleSubmit = async () => {
        // Validar todos los campos
        const fieldsToValidate = ['fullName', 'birthDate', 'birthPlace', 'maritalStatus', 'profession', 'address', 'idNumber'];
        let hasErrors = false;

        fieldsToValidate.forEach(field => {
            if (!validateField(field, formData[field])) {
                hasErrors = true;
            }
        });

        if (hasErrors) {
            Alert.alert('Errores en el formulario', 'Por favor corrige los errores antes de continuar');
            return;
        }

        setIsLoading(true);

        try {
            // Simular proceso de registro
            await new Promise(resolve => setTimeout(resolve, 2000));
            signIn();


        } catch (error) {
            Alert.alert('Error', 'No se pudo completar el registro. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderInputField = (field, placeholder, keyboardType = 'default', maxLength = null, multiline = false) => (
        <Animated.View
            style={[
                styles.inputContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.textArea,
                    errors[field] && styles.inputError
                ]}
                placeholder={placeholder}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={formData[field]}
                onChangeText={(value) => handleInputChange(field, value)}
                onBlur={() => validateField(field, formData[field])}
                keyboardType={keyboardType}
                maxLength={maxLength}
                autoCapitalize={field === 'email' ? 'none' : 'words'}
                autoCorrect={false}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </Animated.View>
    );

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

                {
                    !dniImage ? (

                        <TouchableOpacity
                            onPress={takeDNIPhoto}
                            style={styles.cameraButton}
                        >
                            <View style={styles.cameraButtonContent}>
                                <Text style={styles.cameraIcon}>📷</Text>
                            </View>
                        </TouchableOpacity>
                    ) :
                        <Text onPress={() => recognizeTextFromImage(dniImage)}>Ya esta</Text>
                }
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
                            <View style={styles.registrationIcon}>
                                <View style={styles.iconGlow} />
                                <Text style={styles.iconText}>📝</Text>
                            </View>
                        </View>

                        <Text style={styles.title}>Crear tu Cuenta</Text>
                        <Text style={styles.subtitle}>
                            Completa tu información personal para activar tu protección con GuardianApp
                        </Text>

                        {/* Imagen del carnet (opcional) */}
                        {dniImage && (
                            <Animated.View style={styles.dniPreview}>
                                <Text style={styles.dniPreviewTitle}>✅ Foto del carnet capturada</Text>
                                <Image source={{ uri: dniImage }} style={styles.dniImage} />
                                <TouchableOpacity
                                    onPress={takeDNIPhoto}
                                    style={styles.retakeButton}
                                >
                                    <Text style={styles.retakeButtonText}>Tomar nueva foto</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Formulario */}
                        <View style={styles.form}>
                            {/* Nombre completo */}
                            {renderInputField('fullName', 'Nombre completo *')}

                            {/* Fecha de nacimiento */}
                            <Animated.View
                                style={[
                                    styles.inputContainer,
                                    {
                                        opacity: fadeAnim,
                                        transform: [{ translateY: slideAnim }]
                                    }
                                ]}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.input,
                                        styles.dateInputButton,
                                        errors.birthDate && styles.inputError
                                    ]}
                                    onPress={() => {
                                        setTempDateInput(formData.birthDate ? formatDate(formData.birthDate) : '');
                                        setShowDatePicker(true);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.dateText,
                                        !formData.birthDate && styles.placeholderText
                                    ]}>
                                        {formData.birthDate ? formatDate(formData.birthDate) : 'Fecha de nacimiento *'}
                                    </Text>
                                    <Text style={styles.dateIcon}>📅</Text>
                                </TouchableOpacity>
                                {errors.birthDate && (
                                    <Text style={styles.errorText}>{errors.birthDate}</Text>
                                )}
                            </Animated.View>

                            {/* Lugar de nacimiento */}
                            {renderInputField('birthPlace', 'Lugar de nacimiento *')}

                            {/* Estado civil */}
                            <Animated.View
                                style={[
                                    styles.inputContainer,
                                    {
                                        opacity: fadeAnim,
                                        transform: [{ translateY: slideAnim }]
                                    }
                                ]}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.input,
                                        styles.pickerInputButton,
                                        errors.maritalStatus && styles.inputError
                                    ]}
                                    onPress={() => setShowMaritalPicker(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.pickerText,
                                        !formData.maritalStatus && styles.placeholderText
                                    ]}>
                                        {formData.maritalStatus
                                            ? maritalStatusOptions.find(opt => opt.value === formData.maritalStatus)?.label
                                            : 'Estado civil *'
                                        }
                                    </Text>
                                    <Text style={styles.pickerIcon}>▼</Text>
                                </TouchableOpacity>
                                {errors.maritalStatus && (
                                    <Text style={styles.errorText}>{errors.maritalStatus}</Text>
                                )}
                            </Animated.View>

                            {/* Profesión */}
                            {renderInputField('profession', 'Profesión *')}

                            {/* Domicilio */}
                            {renderInputField('address', 'Domicilio *', 'default', null, true)}

                            {/* Número de carnet */}
                            {renderInputField('idNumber', 'Número de carnet *', 'numeric', 8)}
                        </View>

                        {/* Info de seguridad */}
                        <View style={styles.securityInfo}>
                            <Text style={styles.securityIcon}>🔐</Text>
                            <Text style={styles.securityText}>
                                Tus datos están protegidos con encriptación de extremo a extremo
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>

                {/* Botón de registro */}
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
                            styles.submitButton,
                            isLoading && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
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
                                styles.submitButtonText,
                                isLoading && styles.submitButtonTextDisabled
                            ]}>
                                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                            </Text>
                            {!isLoading && (
                                <View style={styles.buttonArrow}>
                                    <Text style={styles.arrowText}>→</Text>
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>

            {/* Modal selector de fecha */}
            {showDatePicker && (
                <View style={styles.modalOverlay}>
                    <View style={styles.datePickerModal}>
                        <Text style={styles.modalTitle}>Selecciona tu fecha de nacimiento</Text>
                        <View style={styles.datePickerContainer}>
                            <Text style={styles.datePickerNote}>
                                Ingresa tu fecha de nacimiento en formato DD/MM/YYYY
                            </Text>
                            <TextInput
                                style={styles.dateInputField}
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                value={tempDateInput}
                                onChangeText={(text) => {
                                    // Formatear automáticamente mientras se escribe
                                    let formatted = text.replace(/\D/g, ''); // Solo números

                                    // Aplicar formato DD/MM/YYYY
                                    if (formatted.length >= 3 && formatted.length <= 4) {
                                        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
                                    } else if (formatted.length >= 5) {
                                        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4) + '/' + formatted.slice(4, 8);
                                    }

                                    setTempDateInput(formatted);
                                }}
                                maxLength={10}
                                keyboardType="numeric"
                                autoFocus={true}
                            />
                            <View style={styles.datePickerButtons}>
                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={() => {
                                        setTempDateInput('');
                                        setShowDatePicker(false);
                                    }}
                                >
                                    <Text style={styles.datePickerButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
                                    onPress={() => {
                                        if (tempDateInput.length === 10) {
                                            const parts = tempDateInput.split('/');
                                            if (parts.length === 3) {
                                                const day = parts[0].padStart(2, '0');
                                                const month = parts[1].padStart(2, '0');
                                                const year = parts[2];

                                                // Validar fecha básica
                                                if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year.length === 4) {
                                                    const isoDate = `${year}-${month}-${day}`;

                                                    if (validateDate(isoDate)) {
                                                        handleInputChange('birthDate', isoDate);
                                                        setTempDateInput('');
                                                        setShowDatePicker(false);
                                                    } else {
                                                        Alert.alert('Fecha inválida', 'La edad debe estar entre 16 y 100 años');
                                                    }
                                                } else {
                                                    Alert.alert('Fecha inválida', 'Por favor ingresa una fecha válida');
                                                }
                                            }
                                        } else {
                                            Alert.alert('Fecha incompleta', 'Por favor completa la fecha en formato DD/MM/YYYY');
                                        }
                                    }}
                                >
                                    <Text style={styles.datePickerButtonTextPrimary}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Modal selector de estado civil */}
            {showMaritalPicker && (
                <View style={styles.modalOverlay}>
                    <View style={styles.pickerModal}>
                        <Text style={styles.modalTitle}>Selecciona tu estado civil</Text>
                        <View style={styles.pickerOptions}>
                            {maritalStatusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={styles.pickerOption}
                                    onPress={() => {
                                        handleInputChange('maritalStatus', option.value);
                                        setShowMaritalPicker(false);
                                    }}
                                >
                                    <Text style={styles.pickerOptionText}>{option.label}</Text>
                                    {formData.maritalStatus === option.value && (
                                        <Text style={styles.pickerSelectedIcon}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.pickerCloseButton}
                            onPress={() => setShowMaritalPicker(false)}
                        >
                            <Text style={styles.pickerCloseButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Modal de cámara personalizada */}
            <Modal
                visible={showCamera}
                animationType="slide"
                statusBarTranslucent={true}
            >
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        ref={cameraRef}
                    />
                    {/* Overlay con marco para DNI */}
                    <View style={styles.cameraOverlay}>
                        {/* Header de la cámara */}
                        <View style={styles.cameraHeader}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={closeCameraModal}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                            <Text style={styles.cameraTitle}>Fotografiar Carnet</Text>
                            <View style={styles.spacer} />
                        </View>

                        {/* Área central con marco */}
                        <View style={styles.frameArea}>
                            <Text style={styles.instructionText}>
                                Coloca tu carnet dentro del marco
                            </Text>

                            {/* Marco del DNI */}
                            <View style={styles.documentFrame}>
                                <View style={styles.frameCorners}>
                                    {/* Esquinas del marco */}
                                    <View style={[styles.corner, styles.topLeft]} />
                                    <View style={[styles.corner, styles.topRight]} />
                                    <View style={[styles.corner, styles.bottomLeft]} />
                                    <View style={[styles.corner, styles.bottomRight]} />
                                </View>
                            </View>

                            <Text style={styles.tipText}>
                                Asegúrate de que esté bien iluminado y enfocado
                            </Text>
                        </View>

                        {/* Botones de la cámara */}
                        <View style={styles.cameraControls}>
                            <View style={styles.controlsRow}>
                                <View style={styles.controlSpacer} />

                                {/* Botón de captura */}
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={takePicture}
                                >
                                    <View style={styles.captureButtonInner} />
                                </TouchableOpacity>

                                <View style={styles.controlSpacer} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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
    flex: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    cameraButton: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.4)',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    cameraButtonContent: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    cameraIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    cameraText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    optionalText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 10,
        fontWeight: '500',
        marginTop: 1,
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
    registrationIcon: {
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
        marginBottom: 30,
        paddingHorizontal: 10,
    },

    // Preview de imagen
    dniPreview: {
        width: '100%',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
        alignItems: 'center',
    },
    dniPreviewTitle: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
    },
    dniImage: {
        width: 320,
        height: 180,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    retakeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    retakeButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
    },

    // Formulario
    form: {
        width: '100%',
        gap: 20,
    },
    inputContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        color: '#ffffff',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 16,
    },
    inputError: {
        borderColor: '#ff4444',
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '500',
    },

    // Campos especiales (fecha y picker)
    dateInputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    dateText: {
        fontSize: 16,
        color: '#ffffff',
        flex: 1,
    },
    dateIcon: {
        fontSize: 20,
        marginLeft: 10,
    },
    placeholderText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    pickerInputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    pickerText: {
        fontSize: 16,
        color: '#ffffff',
        flex: 1,
    },
    pickerIcon: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        marginLeft: 10,
    },

    // Info de seguridad
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 15,
        padding: 16,
        marginTop: 30,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    securityIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    securityText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        flex: 1,
        lineHeight: 18,
    },

    // Botón principal
    buttonContainer: {
        paddingHorizontal: 30,
        paddingBottom: 50,
        paddingTop: 20,
    },
    submitButton: {
        borderRadius: 25,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    submitButtonDisabled: {
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
    submitButtonText: {
        color: '#2d5a27',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    submitButtonTextDisabled: {
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

    // Modals - Overlay
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },

    // Modal de fecha
    datePickerModal: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 30,
        margin: 20,
        width: width * 0.85,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d5a27',
        textAlign: 'center',
        marginBottom: 20,
    },
    datePickerContainer: {
        alignItems: 'center',
    },
    datePickerNote: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 15,
        textAlign: 'center',
    },
    dateInputField: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        color: '#333333',
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
        fontWeight: '600',
        letterSpacing: 1,
    },
    datePickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 15,
    },
    datePickerButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 15,
        alignItems: 'center',
    },
    datePickerButtonPrimary: {
        backgroundColor: '#4CAF50',
    },
    datePickerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
    },
    datePickerButtonTextPrimary: {
        color: '#ffffff',
    },

    // Modal de estado civil
    pickerModal: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        margin: 20,
        width: width * 0.85,
        maxHeight: height * 0.6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    pickerOptions: {
        maxHeight: 300,
    },
    pickerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    pickerOptionText: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
    pickerSelectedIcon: {
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    pickerCloseButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 15,
        alignItems: 'center',
    },
    pickerCloseButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
    },

    // Cámara personalizada
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        flex: 1,
    },
    cameraHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cameraTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    spacer: {
        width: 40,
    },
    frameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    instructionText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    documentFrame: {
        width: (width * 0.8) - 16,
        height: (width * 0.8 * (9 / 16)) + 16, // Proporción 16:9
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.8)',
        borderRadius: 12,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        position: 'relative',
        marginBottom: 20,
    },
    frameCorners: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#4CAF50',
        borderWidth: 3,
    },
    topLeft: {
        top: -2,
        left: -2,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 12,
    },
    topRight: {
        top: -2,
        right: -2,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 12,
    },
    bottomLeft: {
        bottom: -2,
        left: -2,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 12,
    },
    bottomRight: {
        bottom: -2,
        right: -2,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 12,
    },
    tipText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    cameraControls: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlSpacer: {
        flex: 1,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 4,
        borderColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ffffff',
    },
});

// Nota: Para usar este componente necesitas instalar:
// expo install expo-image-picker expo-linear-gradient
