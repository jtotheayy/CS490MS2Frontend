//Jay Santamaria CS 490 02/08/2024
//Inidividual Project
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Movies from './Movies';
import Home from './Home';
import useUserData from './useUserData';

function App() {
  const { topMovies, topActors, additionalInfo, additionalInfoType, selectedActorName, top5Movies, clickRes } = useUserData();

  return (
    <Router>
      <div>
        <header className="header">
          <div className="logo">SAKILA</div>
          <nav className="nav">
            <Link to="/" className="button">Home</Link>
            <Link to="/movies" className="button">Movies</Link>       
            <button className="button">Customers</button>
            <button className="button">Report</button>
          </nav>
        </header>

        <Routes>
          <Route path="/movies" element={<Movies />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
