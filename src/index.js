import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import JoinPage from './pages/JoinPage/JoinPage';
import RoomPage from './pages/RoomPage/RoomPage';

const theme = { token: { colorPrimary: '#4f46e5', borderRadius: 8 } };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider theme={theme}>
    <Router>
      <Routes>
        <Route path="/:roomuuid?" element={<JoinPage />} />
        <Route path="/session" element={<RoomPage />} />
      </Routes>
    </Router>
  </ConfigProvider>,
);

reportWebVitals();
