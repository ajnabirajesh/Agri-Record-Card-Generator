import React, { useEffect } from 'react';

const App: React.FC = () => {
  useEffect(() => {
    window.location.replace('https://agri-record.vercel.app/');
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Redirecting to Agri Record...</p>
    </div>
  );
};

export default App;
