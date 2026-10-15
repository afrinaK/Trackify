import {useEffect,useState} from 'react';
import {NavLink,Outlet,useLocation} from 'react-router-dom';
import {motion} from 'framer-motion';
import {api} from '../api.js';
import {useAuth} from '../context.jsx';
export default function Layout(){
 const {user,logout,theme,toggleTheme}=useAuth(),loc=useLocation();
 const [open,setOpen]=useState(false),[n,setN]=useState({alerts:[],updates:[]});
 useEffect(()=>{api('/notifications').then(setN).catch(()=>{});setOpen(false)},[loc.pathname]);
 const count=n.alerts.length+n.updates.length;
 const links=[['/c/masters','🎓 Masters'],['/c/private','💼 Private'],['/c/govt','🏛️ Govt'],['/professors','Professors'],['/email-templates','✉️ Email templates'],...(user.role==='admin'?[['/admin','Admin']]:[])];
 return(<>
  <header className="top">
   <NavLink to="/" className="logo">🎯 Career Tracker</NavLink>
   <nav>{links.map(([to,t])=><NavLink key={to} to={to} end={to==='/'}>{t}</NavLink>)}</nav>
   <div className="right">
    <div className="pop-wrap"><button className="icon" aria-label="Notifications" onClick={()=>setOpen(!open)}>🔔{count>0&&<b className="dot">{count}</b>}</button>
     {open&&<div className="pop">
      {n.alerts.map((a,i)=><p key={i}>⚠️ {a.text} <b className={a.days<=3?'hotText':''}>{a.days===0?'today':`in ${a.days}d`}</b></p>)}
      {n.updates.map(u=><p key={u.id}>🔄 {u.text}</p>)}
      {!count&&<p className="muted">Nothing needs attention.</p>}
      {n.updates.length>0&&<button className="btn" onClick={async()=>{await api('/notifications/read',{method:'PUT'});setN({...n,updates:[]})}}>Mark updates read</button>}</div>}</div>
    <button className="icon" onClick={toggleTheme} aria-label="Toggle theme">{theme==='dark'?'☀️':'🌙'}</button>
    <NavLink to="/settings" className="avatar" title={user.name}>{user.avatar?<img src={user.avatar} alt=""/>:user.name[0]}</NavLink>
    <button className="btn" onClick={logout}>Log out</button></div>
  </header>
  <motion.main key={loc.pathname} className="page" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.2}}><Outlet/></motion.main></>);
}
