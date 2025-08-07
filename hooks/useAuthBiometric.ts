import { useCallback, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

type BiometricResult = {
    success: boolean;
    error?: string;
    method?: 'Face ID' | 'Fingerprint' | 'Biometrics';
};

export const useAuthBiometric = () => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [biometryType, setBiometryType] = useState<string | null>(null);

    const checkDeviceForHardware = useCallback(async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsAvailable(compatible);
        return compatible;
    }, []);

    const checkForEnrolled = useCallback(async () => {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        return enrolled;
    }, []);

    const authenticate = useCallback(async (): Promise<BiometricResult> => {
        try {
            setIsAuthenticating(true);

            const compatible = await checkDeviceForHardware();
            if (!compatible) {
                return { success: false, error: 'Este dispositivo no tiene hardware biométrico.' };
            }

            const enrolled = await checkForEnrolled();
            if (!enrolled) {
                return { success: false, error: 'No hay huellas o rostros registrados.' };
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Autenticación biométrica requerida',
                fallbackLabel: 'Usar código',
                cancelLabel: 'Cancelar',
                disableDeviceFallback: false,
            });

            if (result.success) {
                const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
                const method = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
                    ? 'Fingerprint'
                    : types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
                        ? 'Face ID'
                        : 'Biometrics';

                setBiometryType(method);

                return { success: true, method };
            }

            return { success: false, error: 'La autenticación fue cancelada o falló.' };
        } catch (e: any) {
            return { success: false, error: e?.message || 'Error desconocido' };
        } finally {
            setIsAuthenticating(false);
        }
    }, [checkDeviceForHardware, checkForEnrolled]);

    return {
        isAvailable,
        isAuthenticating,
        biometryType,
        authenticate,
        checkDeviceForHardware,
        checkForEnrolled,
    };
};
