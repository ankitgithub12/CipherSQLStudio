import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AssignmentList from './pages/AssignmentList';
import AssignmentAttempt from './pages/AssignmentAttempt';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="page-header">
          <div className="container">
            <h1 className="page-header__title">CipherSQLStudio</h1>
          </div>
        </header>

        <main className="main-content container">
          <Routes>
            <Route path="/" element={<AssignmentList />} />
            <Route path="/assignment/:id" element={<AssignmentAttempt />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
