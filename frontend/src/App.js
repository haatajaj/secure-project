import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Home from './Home.js';
import Login from './Login.js';
import Register from './Register.js';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={sessionStorage.getItem("JWT_token") ? <Navigate to="/" replace /> : <Login/>}/>
        <Route path='/register' element={sessionStorage.getItem("JWT_token") ? <Navigate to="/" replace /> : <Register/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </div>
  );
}

export default App;
