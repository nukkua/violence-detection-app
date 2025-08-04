import { useRef, useEffect } from "react";
import { Animated } from "react-native";

export const useAnimate = () => {

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    return fadeAnim;
} 
