import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BrandConsultant from './pages/BrandConsultant';
import ContentGenerator from './pages/ContentGenerator';
import NamingTool from './pages/NamingTool';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/consultant" element={<BrandConsultant />} />
      <Route path="/generator" element={<ContentGenerator />} />
      <Route path="/naming" element={<NamingTool />} />
    </Routes>
  );
}

export default App;
