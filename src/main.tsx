import React from 'react';import ReactDOM from 'react-dom/client';import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './index.css';import Home from './pages/Home';import Detail from './pages/Detail';import Admin from './admin/Admin'
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><Routes>
<Route path="/" element={<Home/>}/><Route path="/projects/:slug" element={<Detail table="projects"/>}/><Route path="/blog/:slug" element={<Detail table="posts"/>}/>
<Route path="/admin/*" element={<Admin/>}/></Routes></BrowserRouter></React.StrictMode>)
