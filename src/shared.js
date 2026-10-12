export const CATS={
 masters:{label:'Higher Studies (Masters)',short:'Masters',icon:'🎓',c1:'#2563eb',c2:'#7c3aed',blurb:'Universities, professors and admissions',
  statuses:['Researching Universities','Shortlisted','Preparing Documents','Application Ready','Application Submitted','Under Review','Interview Scheduled','Offer Received','Funding Offered','Admission Confirmed','Visa Processing','Enrolled','Rejected'],
  extra:[['country','Country'],['program','Masters Program'],['department','Department'],['website','University Website'],['portal','Application Portal Link']]},
 private:{label:'Private Jobs',short:'Private',icon:'💼',c1:'#059669',c2:'#0f766e',blurb:'Companies, recruiters and offers',
  statuses:['Not Applied','Planning To Apply','Applied','Assessment Scheduled','Interview Scheduled','Final Interview','Offer Received','Joined','Rejected'],
  extra:[['expected_salary','Expected Salary'],['offered_salary','Offered Salary'],['recruiter','Recruiter Name'],['recruiter_contact','Recruiter Contact'],['interview_notes','Interview Notes','area']]},
 govt:{label:'Government Jobs',short:'Govt',icon:'🏛️',c1:'#9f1239',c2:'#dc2626',blurb:'Circulars, exams and merit lists',
  statuses:['Not Applied','Applied','Admit Released','Exam Prepping','Exam Completed','Viva Scheduled','Merit List Published','Selected','Joined','Rejected'],
  extra:[['circular_no','Circular Number'],['admit_link','Admit Card Link'],['seat_link','Seat Plan Link'],['result_link','Result Link']]}};
export const PROF_STATUSES=['Not Contacted','Preparing Email','Email Sent','Follow-up Sent','Waiting For Reply','Replied','Discussion Ongoing','Meeting Scheduled','Interview Scheduled','Accepted For Supervision','Rejected','No Response'];
export const DOC_KINDS=['Circular PDF','CV / Resume','Cover Letter','SOP','Transcript','Certificate','Recommendation Letter','Additional'];
const NOT_STARTED=['Not Applied','Planning To Apply','Researching Universities','Shortlisted','Preparing Documents','Application Ready'];
export const isSubmitted=a=>!NOT_STARTED.includes(a.status);
export const isAccepted=a=>['Offer Received','Funding Offered','Admission Confirmed','Enrolled','Selected','Joined'].includes(a.status);
export const isRejected=a=>a.status==='Rejected';
export const isPending=a=>isSubmitted(a)&&!isAccepted(a)&&!isRejected(a);
export const statusKind=s=>/reject|no response/i.test(s)?'red':/offer|selected|joined|enrolled|confirmed|funding|accepted/i.test(s)?'green':/interview|viva|meeting/i.test(s)?'purple':/^applied|submitted|under review|admit|replied|discussion|merit/i.test(s)?'blue':'yellow';
export const KIND_COLOR={green:'#10b981',red:'#ef4444',yellow:'#f59e0b',blue:'#3b82f6',purple:'#8b5cf6'};
export const P_POSITIVE=['Replied','Discussion Ongoing','Meeting Scheduled','Interview Scheduled','Accepted For Supervision'];
export const P_WAITING=['Email Sent','Follow-up Sent','Waiting For Reply'];
export const P_EMAILED=PROF_STATUSES.filter(s=>!['Not Contacted','Preparing Email'].includes(s));
