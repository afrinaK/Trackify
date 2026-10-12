import {motion} from 'framer-motion';
import {statusKind} from '../shared.js';
export const Badge=({s})=><span className={`badge ${statusKind(s)}`}>{s}</span>;
export const Days=({n})=>n==null?<span className="muted">—</span>:<span className={`days ${n<0?'past':n<=7?'hot':'ok'}`}>{n<0?'Passed':n===0?'Today':n+'d'}</span>;
export const Card=({title,children,className=''})=><motion.section initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`card ${className}`}>{title&&<h3>{title}</h3>}{children}</motion.section>;
export const Modal=({title,onClose,children})=>(
 <div className="back" onClick={onClose}><motion.div initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} className="modal" onClick={e=>e.stopPropagation()}>
  <div className="between"><h2>{title}</h2><button className="icon" onClick={onClose} aria-label="Close">×</button></div>{children}</motion.div></div>);
