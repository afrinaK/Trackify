import {useState} from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../context.jsx';
export default function Login(){
 const {user,login,signup}=useAuth();
 const [mode,setMode]=useState('login'),[f,setF]=useState({name:'',email:'',password:'',remember:true}),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
 if(user)return <Navigate to="/" replace/>;
 const submit=async e=>{e.preventDefault();setErr('');
  if(mode==='signup'&&!(f.password.length>=8&&/[A-Za-z]/.test(f.password)&&/\d/.test(f.password)))return setErr('Password needs 8+ characters with a letter and a number.');
  setBusy(true);try{await(mode==='login'?login:signup)(f)}catch(x){setErr(x.message)}setBusy(false)};
 const on=k=>e=>setF({...f,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value});
 return(<div className="center"><form className="card login" onSubmit={submit}>
  <h1>🎯 Career Tracker</h1><p className="muted">Masters, government and private applications in one place.</p>
  {mode==='signup'&&<input required placeholder="Full name" value={f.name} onChange={on('name')}/>}
  <input required type="email" placeholder="Email" value={f.email} onChange={on('email')}/>
  <input required type="password" placeholder="Password" value={f.password} onChange={on('password')}/>
  <label className="check"><input type="checkbox" checked={f.remember} onChange={on('remember')}/> Remember me</label>
  {err&&<p className="err">{err}</p>}
  <button className="btn primary" disabled={busy}>{mode==='login'?'Log in':'Create account'}</button>
  <button type="button" className="link" onClick={()=>{setMode(mode==='login'?'signup':'login');setErr('')}}>{mode==='login'?'New here? Create an account':'Have an account? Log in'}</button>
 </form></div>);
}
