import { TextInput, StyleSheet } from 'react-native';

export default function Input(props: any) {
    return <TextInput {...props} style={styles.input} />;
}

const styles = StyleSheet.create({
    input: {
        borderBottomWidth: 1,
        marginBottom: 15,
        padding: 8,
    },
});