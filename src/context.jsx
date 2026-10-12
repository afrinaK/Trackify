import {createContext,useCallback,useContext,useEffect,useState} from 'react';
import {api,supabase} from './api.js';
const AuthCtx=createContext(),DataCtx=createContext();
export const useAuth=()=>useContext(AuthCtx);
export const useData=()=>useContext(DataCtx);
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[ready,setReady]=useState(false),[theme,setTheme]=useState(localStorage.getItem('ct_theme')||'light');
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('ct_theme',theme)},[theme]);
 const loadMe=async()=>{const u=await api('/me');setUser(u);if(u.theme)setTheme(u.theme)};
 useEffect(()=>{supabase.auth.getSession().then(({data})=>data.session?loadMe():null).catch(()=>{}).finally(()=>setReady(true));
  const {data}=supabase.auth.onAuthStateChange(e=>{if(e==='SIGNED_OUT')setUser(null)});return()=>data.subscription.unsubscribe()},[]);
 const login=async f=>{localStorage.setItem('ct_remember',f.remember?'1':'0');
  const {error}=await supabase.auth.signInWithPassword({email:f.email.trim().toLowerCase(),password:f.password});if(error)throw new Error(error.message);await loadMe()};
 const signup=async f=>{localStorage.setItem('ct_remember',f.remember?'1':'0');
  const {data,error}=await supabase.auth.signUp({email:f.email.trim().toLowerCase(),password:f.password,options:{data:{name:f.name}}});if(error)throw new Error(error.message);
  if(!data.session)throw new Error('Account created. Check your email to confirm it, then log in.');await loadMe()};
 const logout=async()=>{await supabase.auth.signOut();setUser(null)};
 const toggleTheme=()=>{const t=theme==='dark'?'light':'dark';setTheme(t);if(user)api('/me',{method:'PUT',body:{theme:t}}).catch(()=>{})};
 return <AuthCtx.Provider value={{user,setUser,ready,login,signup,logout,theme,toggleTheme}}>{children}</AuthCtx.Provider>;
}
export function DataProvider({children}){
 const [d,setD]=useState({apps:[],profs:[],acts:[]}),[loading,setLoading]=useState(true);
 const reload=useCallback(async()=>{const [apps,profs,acts]=await Promise.all([api('/applications'),api('/professors'),api('/activities')]);setD({apps,profs,acts});setLoading(false)},[]);
 useEffect(()=>{reload().catch(()=>setLoading(false))},[reload]);
 return <DataCtx.Provider value={{...d,loading,reload}}>{children}</DataCtx.Provider>;
}
