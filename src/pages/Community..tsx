import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import PostForm from '../components/Postform';
import './Community.css';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  imageUrl?: string;
  createdAt: any;
  likes: string[];
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: any;
}

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});

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

  // Загрузка комментариев для поста
  const loadComments = async (postId: string) => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(prev => ({ ...prev, [postId]: commentsData }));
    });
    return unsubscribe;
  };

  // Добавление комментария
  const addComment = async (postId: string) => {
    if (!user || !newComments[postId]?.trim()) return;
    
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        text: newComments[postId],
        authorId: user.uid,
        authorName: user.displayName || 'Аноним',
        createdAt: serverTimestamp(),
      });
      setNewComments(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error("Ошибка добавления комментария:", error);
    }
  };

  // Создание поста
  const handleCreatePost = async (text: string, imageUrl?: string) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'posts'), {
        text,
        imageUrl: imageUrl || null,
        authorId: user.uid,
        authorName: user.displayName || 'Аноним',
        createdAt: serverTimestamp(),
        likes: []
      });
    } catch (err) {
      console.error("Ошибка создания поста:", err);
      throw new Error('Не удалось опубликовать пост');
    }
  };

  // Лайк поста
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

  // Удаление поста
  const handleDeletePost = async (postId: string, imageUrl?: string) => {
    if (!user) return;
    
    try {
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef).catch(err => {
          console.error("Ошибка удаления изображения:", err);
        });
      }
      
      await deleteDoc(doc(db, 'posts', postId));
    } catch (err) {
      console.error("Ошибка удаления поста:", err);
      setError('Не удалось удалить пост');
    }
  };

  if (!user) {
    return (
      <div className="auth-required-message">
        <h2>Требуется авторизация</h2>
        <p>Чтобы просматривать сообщество, пожалуйста <Link to="/login">войдите</Link> или <Link to="/register">зарегистрируйтесь</Link></p>
      </div>
    );
  }

  if (loading) return <div className="loading">Загрузка ленты...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="community-container">
      <h1>Сообщество</h1>
      
      <PostForm onSubmit={handleCreatePost} />

      <div className="posts-list">
        {posts.length === 0 ? (
          <p className="empty-feed">Пока нет постов. Будьте первым!</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <span className="author-name">{post.authorName}</span>
                  <span className="post-date">
                    {post.createdAt?.toDate().toLocaleString() || 'недавно'}
                  </span>
                </div>
                
                {post.authorId === user?.uid && (
                  <button 
                    onClick={() => handleDeletePost(post.id, post.imageUrl)}
                    className="delete-post"
                    title="Удалить пост"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {post.text && <p className="post-text">{post.text}</p>}
              
              {post.imageUrl && (
                <div className="post-image">
                  <img src={post.imageUrl} alt="Пост" />
                </div>
              )}
              
              <div className="post-actions">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`like-button ${post.likes.includes(user?.uid || '') ? 'liked' : ''}`}
                >
                  ❤️ {post.likes.length}
                </button>
              </div>

              {/* Секция комментариев */}
              <div className="comments-section">
                <button 
                  onClick={() => loadComments(post.id)}
                  className="show-comments-btn"
                >
                  {comments[post.id] ? 'Скрыть комментарии' : 'Показать комментарии'}
                </button>

                {comments[post.id] && (
                  <div className="comments-list">
                    {comments[post.id].map(comment => (
                      <div key={comment.id} className="comment">
                        <strong>{comment.authorName}: </strong>
                        <span>{comment.text}</span>
                      </div>
                    ))}

                    <div className="add-comment">
                      <input
                        type="text"
                        value={newComments[post.id] || ''}
                        onChange={(e) => setNewComments(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))}
                        placeholder="Написать комментарий..."
                      />
                      <button onClick={() => addComment(post.id)}>Отправить</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;