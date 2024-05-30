import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Keyboard, Platform } from 'react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { getDocs, query, collection, where, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../services/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';

const PersonalDataScreen = ({ route, navigation }) => {
    const [user, setUser] = useState(null);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [newDescription, setNewDescription] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (currentUser) {
                try {
                    const q = query(collection(db, 'usuarios'), where('correo', '==', currentUser.email));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        const userData = userDoc.data();
                        setUser({ ...userData, id: userDoc.id });
                        setNewPhone(userData.telefono);
                        setNewDescription(userData.descripcionUsuario || '');
                    }
                    else {
                        console.error('No se encontró el usuario con el correo:', currentUser.email);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const updateUser = async (userId, updatedData) => {
        try {
            const userRef = doc(db, 'usuarios', userId);
            await updateDoc(userRef, updatedData);
            setUser((prevUser) => ({ ...prevUser, ...updatedData }));
            Alert.alert('Exitoso', 'La información ha sido actualizada.');
        } catch (error) {
            console.error('Error updating user data:', error);
            Alert.alert('Error', 'Hubo un problema al actualizar la información.');
        }
    };

    const handleSave = () => {
        const updatedData = {};
        if (isEditingPhone) {
            updatedData.telefono = newPhone;
            setIsEditingPhone(false);
        }
        if (isEditingDescription) {
            updatedData.descripcionUsuario = newDescription;
            setIsEditingDescription(false);
        }
        if (Object.keys(updatedData).length > 0) {
            updateUser(user.id, updatedData);
        }
    };

    const handleCancel = () => {
        setNewPhone(user?.telefono);
        setIsEditingPhone(false);
    };

    const handleChangePassword = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                await sendPasswordResetEmail(auth, currentUser.email);
                Alert.alert('Éxito', 'Se ha enviado un enlace para restablecer la contraseña a tu correo electrónico.');
            } catch (error) {
                console.error('Error al enviar el correo de restablecimiento de contraseña:', error);
                Alert.alert('Error', 'Hubo un problema al enviar el correo de restablecimiento de contraseña.');
            }
        } else {
            Alert.alert('Error', 'No se ha encontrado el usuario.');
        }
    };

    const handleChangePhoto = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            const filename = localUri.split('/').pop();
            const response = await fetch(localUri);
            const blob = await response.blob();

            const storage = getStorage();
            const storageRef = ref(storage, `profile_pictures/${filename}`);

            await uploadBytes(storageRef, blob);
            const newPhotoUrl = await getDownloadURL(storageRef);

            updateUser(user.id, { foto: newPhotoUrl });
        }
    };

    if (!user) {
        return null;
    }

    return (
        <KeyboardAvoidingView
            style={styles.safeContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TopBar />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.contentContainer}>
                    <View style={styles.headerContainer}>
                        <BackButton />
                        <Text style={styles.headerTitle}>Información Personal</Text>
                    </View>
                    <View style={styles.userInfoContainer}>
                        <Image source={{ uri: user.foto }} style={styles.userPhoto} />
                        <TouchableOpacity onPress={handleChangePhoto}>
                            <Text style={styles.changePhotoText}>Cambiar foto de perfil</Text>
                        </TouchableOpacity>
                        <Text style={styles.label}>Nombre de usuario</Text>
                        <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.nombre}</Text>

                        <Text style={styles.label}>Correo</Text>
                        <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.correo}</Text>

                        <Text style={styles.label}>Expediente</Text>
                        <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.expediente}</Text>

                        <Text style={styles.label}>Teléfono</Text>
                        {isEditingPhone ? (
                            <TextInput
                                style={styles.input}
                                value={newPhone}
                                onChangeText={setNewPhone}
                                keyboardType="numeric"
                            />
                        ) : (
                            <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.telefono}</Text>
                        )}
                        <TouchableOpacity style={styles.changeButton} onPress={() => setIsEditingPhone(true)}>
                            <Text style={styles.changeText}>Cambiar teléfono</Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>Descripción</Text>
                        {isEditingDescription ? (
                            <TextInput
                                style={[styles.input, styles.descripcionInput]}
                                value={newDescription}
                                onChangeText={setNewDescription}
                                multiline
                                numberOfLines={4}
                            />
                        ) : (
                            <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.descripcionUsuario}</Text>
                        )}
                        <TouchableOpacity style={styles.changeButton} onPress={() => setIsEditingDescription(true)}>
                            <Text style={styles.changeText}>Cambiar descripción</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.changePassButton} onPress={handleChangePassword}>
                            <Text style={styles.textCahngeP}>Cambiar Contraseña</Text>
                        </TouchableOpacity>

                        {(isEditingPhone || isEditingDescription) && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.saveButtonText}>Guardar cambios</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
            {!keyboardVisible && <BottomMenuBar isMenuScreen={true} />}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    contentContainer: {
        paddingBottom: 120,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#030A8C',
        marginLeft: 10,
    },
    userInfoContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        margin: 20,
    },
    userPhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        backgroundColor: '#e1e4e8',
    },
    changePhotoText: {
        color: '#030A8C',
        marginBottom: 20,
        fontSize: 16,
    },
    label: {
        marginTop: 20,
        fontSize: 20,
        color: '#000',
        alignSelf: 'flex-start',
        marginBottom: 5,
    },
    userInfo: {
        fontSize: 16,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    changeButton: {
        alignSelf: 'flex-end',
    },
    changeText: {
        color: '#030A8C',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#030A8C',
        marginBottom: 10,
        fontSize: 18,
        width: '100%',
        color: '#000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#030A8C',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#d9534f',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginLeft: 10,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    changePassButton: {
        backgroundColor: '#030A8C',
        alignSelf: 'flex-start',
        borderRadius: 5,
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginTop: 20,
    },
    textCahngeP: {
        color: '#fff',
        fontSize: 15,
    },
    descripcionInput: {
        width: '100%',
        height: 100,
    },
});

export default PersonalDataScreen;
