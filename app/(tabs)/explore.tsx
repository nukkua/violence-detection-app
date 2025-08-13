import { Text, View } from 'react-native';
import { useSession } from '@/context/ctx';

export default function Explore() {
    const { signOut } = useSession();


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text
                onPress={() => {
                    console.log('pressing the sign out button');
                    signOut();
                }}>
                Sign Out
            </Text>
        </View>
    );
}
