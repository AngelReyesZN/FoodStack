import React, { useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { UserContext } from '../context/UserContext';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';

const PersonalDataScreen = ({ route }) => {
    const { registros, updateUser } = useContext(UserContext);
    const { label, userId } = route.params;
    const user = registros.find((u) => u.id === userId);

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingMail, setIsEditingMail] = useState(false);
    const [newName, setNewName] = useState(user?.nombre);
    const [newMail, setNewMail] = useState(user?.correo);

    const initialName = user?.nombre;
    const initialMail = user?.correo;

    const handleSave = () => {
        if (isEditingName || isEditingMail) {
            if (isEditingName) {
                updateUser(user.id, { nombre: newName });
            }
            if (isEditingMail) {
                updateUser(user.id, { correo: newMail });
            }
            setIsEditingName(false);
            setIsEditingMail(false);
            Alert.alert('Exitoso', 'La información ha sido actualizada.');
        }
    };

    const handleCancel = () => {
        setNewName(initialName);
        setNewMail(initialMail);
        setIsEditingName(false);
        setIsEditingMail(false);
    };

    return (
        <View style={styles.container}>
            <TopBar />
            <View style={styles.headerContainer}>
                <BackButton />
                <Text style={styles.headerTitle}>{label}</Text>
            </View>
            {user && (
                <View style={styles.userInfoContainer}>
                    <Image source={user.foto} style={styles.userPhoto} />
                    <TouchableOpacity>
                        <Text style={styles.changePhotoText}>Cambiar foto de perfil</Text>
                    </TouchableOpacity>
                    <Text style={styles.label}>Nombre de usuario</Text>
                    {isEditingName ? (
                        <TextInput
                            style={styles.input}
                            value={newName}
                            onChangeText={setNewName}
                        />
                    ) : (
                        <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.nombre}</Text>
                    )}
                    <TouchableOpacity style={styles.changeButton} onPress={() => setIsEditingName(true)}>
                        <Text style={styles.changeText}>Cambiar nombre de usuario</Text>
                    </TouchableOpacity>
                    <Text style={styles.label}>Teléfono</Text>
                    {isEditingMail ? (
                        <TextInput
                            style={styles.input}
                            value={newMail}
                            onChangeText={setNewMail}
                        />
                    ) : (
                        <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.correo}</Text>
                    )}
                    <TouchableOpacity style={styles.changeButton} onPress={() => setIsEditingMail(true)}>
                        <Text style={styles.changeText}>Cambiar teléfono</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.changePassButton}>
                        <Text style={styles.textCahngeP} >Cambiar Contraseña</Text>
                    </TouchableOpacity>

                    {(isEditingName || isEditingMail) && (
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
            )}
            <BottomMenuBar isMenuScreen={true} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
        marginBottom: 25,
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

    }
});

export default PersonalDataScreen;
