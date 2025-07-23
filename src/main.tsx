import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router,Routes,Route, Navigate } from 'react-router-dom'
import Register from './Form/Register.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<App/>}/>
        <Route path='/register' element={<Register />} /> 
      </Routes>
    </Router>
  </StrictMode>,
)
