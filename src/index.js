import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import JoinPage from './pages/JoinPage/JoinPage';
import RoomPage from './pages/RoomPage/RoomPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/:roomuuid?" element={<JoinPage />} />
      <Route path="/session" element={<RoomPage />} />
    </Routes>
  </Router>,
);

reportWebVitals();
