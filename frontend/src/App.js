import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Home from './Home.js';
import Login from './Login.js';
import Register from './Register.js';
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: '/' });

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={cookies.get("JWT_TOKEN") ? <Navigate to="/" replace /> : <Login/>}/>
        <Route path='/register' element={cookies.get("JWT_TOKEN") ? <Navigate to="/" replace /> : <Register/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </div>
  );
}

export default App;
