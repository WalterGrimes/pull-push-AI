import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Leaderboard.css';

interface User {
  id: string;
  nickname: string;
  photoURL?: string;
  pushupRecord: number;
  pullupRecord: number;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'pushup' | 'pullup'>('pushup');
  const [user] = useAuthState(auth);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Загрузка данных пользователей
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy(activeTab + 'Record', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as User));
    });
    
    return () => unsubscribe();
  }, [activeTab]);

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      
      <div className="tabs">
        <button
          className={activeTab === 'pushup' ? 'active' : ''}
          onClick={() => setActiveTab('pushup')}
        >
          Push-Ups
        </button>
        <button
          className={activeTab === 'pullup' ? 'active' : ''}
          onClick={() => setActiveTab('pullup')}
        >
          Pull-Ups
        </button>
      </div>
      
      {user ? (
        <button 
          onClick={() => setShowUploadModal(true)}
          className="add-result-btn"
        >
          + Add Your Result
        </button>
      ) : (
        <p className="auth-notice">
          <a href="/login">Sign in</a> to submit your results
        </p>
      )}
      
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Record</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td className="user-cell">
                <img 
                  src={user.photoURL || '/default-avatar.png'} 
                  alt={user.nickname}
                />
                <span>{user.nickname}</span>
              </td>
              <td>{user[activeTab + 'Record']}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {showUploadModal && (
        <div className="modal">
          <h3>Submit Your {activeTab === 'pushup' ? 'Push-Up' : 'Pull-Up'} Result</h3>
          <p>Record a video of your workout for verification</p>
          <input type="file" accept="video/*" />
          <div className="modal-actions">
            <button onClick={() => setShowUploadModal(false)}>Cancel</button>
            <button>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;