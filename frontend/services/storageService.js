import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebaseConfig';
/**
 * @param {string} uri - O URI local do arquivo da imagem (vindo do ImagePicker).
 * @param {string} path - O caminho no Storage onde a imagem será salva (ex: 'profile_pictures/userId.jpg').
 * @returns {Promise<string>} 
 */
export const uploadImageAndGetURL = async (uri, path) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Erro no upload da imagem:", error);
    throw new Error("Não foi possível fazer o upload da imagem.");
  }
};