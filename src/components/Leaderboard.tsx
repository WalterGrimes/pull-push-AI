// src/pages/Leaderboard.tsx
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './Leaderboard.css';

interface Leader {
  uid: string;
  nickname: string;
  photoURL: string;
  record: number;
  date: string;
}

const Leaderboard = () => {
  const [pushupLeaders, setPushupLeaders] = useState<Leader[]>([]);
  const [pullupLeaders, setPullupLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        // Запрос для отжиманий
        const pushupQuery = query(collection(db, 'users'), orderBy('pushupRecord', 'desc'), limit(100));
        const pushupSnapshot = await getDocs(pushupQuery);
        const pushupData = pushupSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            nickname: data.nickname,
            photoURL: data.photoURL,
            record: data.pushupRecord,
            date: data.pushupRecordDate ? new Date(data.pushupRecordDate.seconds * 1000).toLocaleDateString() : '-'
          };
        }).filter(d => d.record > 0);
        setPushupLeaders(pushupData);

        // Запрос для подтягиваний
        const pullupQuery = query(collection(db, 'users'), orderBy('pullupRecord', 'desc'), limit(100));
        const pullupSnapshot = await getDocs(pullupQuery);
        const pullupData = pullupSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            nickname: data.nickname,
            photoURL: data.photoURL,
            record: data.pullupRecord,
            date: data.pullupRecordDate ? new Date(data.pullupRecordDate.seconds * 1000).toLocaleDateString() : '-'
          };
        }).filter(d => d.record > 0);
        setPullupLeaders(pullupData);

      } catch (error) {
        console.error("Ошибка загрузки списка лидеров:", error);
      }
      setLoading(false);
    };

    fetchLeaders();
  }, []);

  const renderLeaderboard = (title: string, leaders: Leader[]) => (
    <div className="leaderboard-section">
      <h2>{title}</h2>
      {leaders.length === 0 ? <p>Здесь пока пусто.</p> :
        <table>
          <thead>
            <tr>
              <th>Место</th>
              <th>Пользователь</th>
              <th>Результат</th>
              <th>Дата рекорда</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((leader, index) => (
              <tr key={leader.uid}>
                <td>{index + 1}</td>
                <td className="user-cell">
                  <img src={leader.photoURL || '/default-avatar.png'} alt={leader.nickname} />
                  <span>{leader.nickname}</span>
                </td>
                <td>{leader.record}</td>
                <td>{leader.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  );

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="leaderboard-container">
      <h1>🏆 Списки Лидеров 🏆</h1>
      <div className="leaderboards">
        {renderLeaderboard("Отжимания", pushupLeaders)}
        {renderLeaderboard("Подтягивания", pullupLeaders)}
      </div>
    </div>
  );
};

export default Leaderboard;