import React from 'react';
import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage/HomePage";
import Api from "./pages/Api/Api";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/api" element={<Api />} />
        </Routes>
    );
}

export default App;