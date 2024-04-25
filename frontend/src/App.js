import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './Home.js';
import Login from './Login.js';
import Register from './Register.js';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
      </Routes>
    </div>
  );
}

export default App;
