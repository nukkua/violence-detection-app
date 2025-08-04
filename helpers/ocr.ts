import TesseractOcr, { LEVEL_WORD, LANG_ENGLISH } from 'react-native-tesseract-ocr';


export const processImageForOCR = async (imageUri: string) => {

    const tessOptions = { level: LEVEL_WORD };
    TesseractOcr.recognizeTokens(imageUri, LANG_ENGLISH, tessOptions);
};
