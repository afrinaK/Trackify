import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter,Navigate,Outlet,Route,Routes} from 'react-router-dom';
import './styles.css';
import {AuthProvider,DataProvider,useAuth} from './context.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Category from './pages/Category.jsx';
import Professors from './pages/Professors.jsx';
import EmailTemplates from "./pages/EmailTemplates";
import Settings from './pages/Settings.jsx';
import Admin from './pages/Admin.jsx';
function Protected(){const {user,ready}=useAuth();
 if(!ready)return <div className="center">Loading…</div>;
 return user?<DataProvider><Layout/></DataProvider>:<Navigate to="/login" replace/>}
function AdminRoute(){const {user}=useAuth();return user.role==='admin'?<Admin/>:<Navigate to="/" replace/>}
ReactDOM.createRoot(document.getElementById('root')).render(
 <React.StrictMode><AuthProvider><BrowserRouter><Routes>
  <Route path="/login" element={<Login/>}/>
  <Route element={<Protected/>}>
   <Route index element={<Dashboard/>}/><Route path="c/:cat" element={<Category/>}/><Route path="professors" element={<Professors/>}/>
   <Route path="/email-templates" element={<EmailTemplates />} />
   <Route path="settings" element={<Settings/>}/><Route path="admin" element={<AdminRoute/>}/><Route path="*" element={<Navigate to="/" replace/>}/>
  </Route></Routes></BrowserRouter></AuthProvider></React.StrictMode>);
