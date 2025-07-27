// src/components/ProfileEditor.tsx
import { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AvatarUploader from './AvatarUploader';

const ProfileEditor = ({ user, onClose }: { user: any, onClose: () => void }) => {
  const [nickname, setNickname] = useState(user.displayName || '');
  const [description, setDescription] = useState('');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setDescription(userDoc.data().description || '');
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Обновляем профиль в Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: nickname,
        photoURL: photoURL || null
      });

      // Обновляем дополнительные данные в Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        nickname,
        description,
        photoURL: photoURL || null
      });

      onClose();
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-editor-modal">
      <div className="profile-editor-content">
        <h2>Редактирование профиля</h2>
        <div className="form-group">
          <label>Никнейм</label>
          <input 
            type="text" 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Фото профиля</label>
          <AvatarUploader onUpload={setPhotoURL} currentImage={photoURL} />
        </div>
        <div className="form-group">
          <label>О себе</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="buttons">
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleSave} disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;