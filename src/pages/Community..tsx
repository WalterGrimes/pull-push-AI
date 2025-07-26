import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Community.css';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: any;
  likes: string[];
}

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка постов
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (err) => {
      console.error("Ошибка загрузки постов:", err);
      setError('Ошибка загрузки ленты');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostText.trim()) return;

    try {
      await addDoc(collection(db, 'posts'), {
        text: newPostText,
        authorId: user.uid,
        authorName: user.displayName || 'Аноним',
        createdAt: serverTimestamp(),
        likes: []
      });
      setNewPostText('');
    } catch (err) {
      console.error("Ошибка создания поста:", err);
      setError('Ошибка при публикации');
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      
      if (post?.likes.includes(user.uid)) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (err) {
      console.error("Ошибка при лайке:", err);
    }
  };

  if (loading) return <div className="loading">Загрузка ленты...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="community-container">
      <h1>Сообщество</h1>
      
      {user && (
        <form onSubmit={handleCreatePost} className="post-form">
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Что нового?"
            required
            maxLength={500}
          />
          <button type="submit" disabled={!newPostText.trim()}>
            Опубликовать
          </button>
        </form>
      )}

      <div className="posts-list">
        {posts.length === 0 ? (
          <p className="empty-feed">Пока нет постов. Будьте первым!</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <span className="author">{post.authorName}</span>
                <span className="date">
                  {post.createdAt?.toDate().toLocaleString() || 'недавно'}
                </span>
              </div>
              <p className="post-text">{post.text}</p>
              <div className="post-actions">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={post.likes.includes(user?.uid || '') ? 'liked' : ''}
                >
                  ❤️ {post.likes.length}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;