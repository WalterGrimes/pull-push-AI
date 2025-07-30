// src/app/index.tsx
import { AuthProvider } from 'app/providers/auth';
import { FirebaseProvider } from 'app/providers/firebase';
import { AppRouter } from 'app/router';
import { StrictMode } from 'react';

function App() {
  return (
    <StrictMode>
      <FirebaseProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </FirebaseProvider>
    </StrictMode>
  );
}

export default App;