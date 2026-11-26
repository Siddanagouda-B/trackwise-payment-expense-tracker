import { useEffect, useMemo, useState } from 'react'
import { LayoutDashboard, ArrowLeftRight, ChartNoAxesCombined, Wallet, Settings, CircleHelp, Bell, Plus, Search, ArrowUpRight, ArrowDownLeft, MoreHorizontal, X, Trash2, Pencil, CalendarDays, CreditCard, TrendingUp, PiggyBank, Menu } from 'lucide-react'

const API = 'http://localhost:8081/api'
const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(n||0))
const today = new Date().toISOString().slice(0,10)
const blank = {title:'',category:'Food & dining',type:'EXPENSE',amount:'',transactionDate:today,note:'',paymentMethod:'UPI'}
const categories = ['Food & dining','Housing','Transport','Groceries','Shopping','Entertainment','Health','Salary','Freelance','Other']

export default function App(){
  const [rows,setRows]=useState([]), [overview,setOverview]=useState({income:0,expenses:0,balance:0,transactionCount:0,categoryBreakdown:[]})
  const [loading,setLoading]=useState(true), [error,setError]=useState(''), [modal,setModal]=useState(false), [form,setForm]=useState(blank), [editing,setEditing]=useState(null)
  const [query,setQuery]=useState(''), [filter,setFilter]=useState('ALL'), [active,setActive]=useState('Overview'), [mobile,setMobile]=useState(false)
  const [toast,setToast]=useState('')
  async function load(){
    setLoading(true); setError('')
    try{
      const [a,b]=await Promise.all([fetch(`${API}/transactions`),fetch(`${API}/overview`)])
      if(!a.ok||!b.ok) throw new Error('The API returned an error. Check that the backend is running.')
      setRows(await a.json()); setOverview(await b.json())
    }catch(e){setError('Could not connect to TrackWise API. Start the backend in a separate terminal.');}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[])
  const filtered=useMemo(()=>rows.filter(r=>(filter==='ALL'||r.type===filter)&&`${r.title} ${r.category} ${r.paymentMethod||''}`.toLowerCase().includes(query.toLowerCase())),[rows,filter,query])
  const maxCategory=Math.max(1,...(overview.categoryBreakdown||[]).map(x=>Number(x.amount)))
  function notify(msg){setToast(msg);setTimeout(()=>setToast(''),2600)}
  function openNew(type='EXPENSE'){setEditing(null);setForm({...blank,type});setModal(true)}
  function openEdit(r){setEditing(r.id);setForm({...r,amount:String(r.amount)});setModal(true)}
  async function save(e){
    e.preventDefault()
    const payload={...form,amount:Number(form.amount)}
    try{
      const res=await fetch(editing?`${API}/transactions/${editing}`:`${API}/transactions`,{method:editing?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      if(!res.ok){const data=await res.json().catch(()=>({}));throw new Error(data.message||'Unable to save transaction')}
      setModal(false); await load(); notify(editing?'Transaction updated':'Transaction added')
    }catch(err){notify(err.message)}
  }
  async function remove(id){
    if(!confirm('Delete this transaction?'))return
    try{const res=await fetch(`${API}/transactions/${id}`,{method:'DELETE'});if(!res.ok)throw new Error();await load();notify('Transaction deleted')}
    catch{notify('Could not delete transaction')}
  }
  const nav=[['Overview',LayoutDashboard],['Transactions',ArrowLeftRight],['Insights',ChartNoAxesCombined]]
  return <div className="app-shell">
    <aside className={`sidebar ${mobile?'show':''}`}>
      <div className="brand"><div className="brand-mark"><Wallet size={24}/></div><div><b>trackwise</b><small>PERSONAL FINANCE</small></div></div>
      <div className="nav-label">WORKSPACE</div>
      {nav.map(([name,Icon])=><button key={name} className={`nav-item ${active===name?'selected':''}`} onClick={()=>{setActive(name);setMobile(false)}}><Icon size={19}/>{name}{name==='Transactions'&&<span className="nav-count">{rows.length}</span>}</button>)}
      <div className="side-tip"><div className="tip-icon"><PiggyBank size={20}/></div><b>Make every rupee count.</b><p>Small spending insights can make a big difference over time.</p><span>Build better habits ↗</span></div>
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={19}/>Settings</button><button className="nav-item"><CircleHelp size={19}/>Help & support</button><div className="profile"><div className="avatar">SB</div><div><b>Siddanagouda</b><small>Personal workspace</small></div><MoreHorizontal size={20}/></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(!mobile)}><Menu/></button><div className="crumb">Workspace <span>/</span> <b>{active}</b></div><div className="top-right"><span className="live-dot"></span><span>Local workspace</span><Bell size={19}/><div className="avatar pale">SB</div></div></header>
      <div className="content">
        <div className="page-head"><div><div className="eyebrow">✦ YOUR MONEY, IN FOCUS</div><h1>{active==='Overview'?'Good evening.':active==='Transactions'?'Your transactions':'Spending insights'}</h1><p>Understand your cash flow and stay in control of your finances.</p></div><div className="head-actions"><span className="date-chip"><CalendarDays size={15}/>{new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span><button className="primary" onClick={()=>openNew()}><Plus size={17}/> Add transaction</button></div></div>
        {error&&<div className="error-banner">{error} <button onClick={load}>Retry</button></div>}
        {active!=='Transactions'&&<section className="stats-grid">
          <div className="balance-card"><div className="card-overline">AVAILABLE BALANCE <span className="card-icon"><Wallet size={19}/></span></div><div className="big-number">{money(overview.balance)}</div><div className="balance-foot"><span><i></i> Net cash flow</span><span>Income minus expenses</span></div></div>
          <Stat icon={ArrowDownLeft} label="Total income" value={money(overview.income)} sub="Money received" kind="income"/>
          <Stat icon={ArrowUpRight} label="Total expenses" value={money(overview.expenses)} sub="Money spent" kind="expense"/>
        </section>}
        {active==='Insights'?<section className="panel insight-panel"><div className="panel-head"><div><h2>Spending by category</h2><p>Where your money is going</p></div></div>{(overview.categoryBreakdown||[]).length===0?<Empty/>:overview.categoryBreakdown.map(c=><div className="bar-row" key={c.category}><div><b>{c.category}</b><strong>{money(c.amount)}</strong></div><div className="bar-track"><div className="bar-fill" style={{width:`${Number(c.amount)/maxCategory*100}%`}}/></div></div>)}</section>:<div className="lower-grid">
          <section className="panel transactions-panel"><div className="panel-head"><div><h2>{active==='Overview'?'Recent activity':'All transactions'}</h2><p>Your latest income and spending records</p></div><button className="text-btn" onClick={()=>setActive('Transactions')}>View all ↗</button></div>
            <div className="toolbar"><div className="search"><Search size={16}/><input placeholder="Search transactions..." value={query} onChange={e=>setQuery(e.target.value)}/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">All types</option><option value="INCOME">Income</option><option value="EXPENSE">Expenses</option></select></div>
            {loading?<div className="empty-state">Loading your transactions…</div>:filtered.length===0?<Empty/>:<div className="table-wrap"><table><thead><tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th></th></tr></thead><tbody>{(active==='Overview'?filtered.slice(0,6):filtered).map(r=><tr key={r.id}><td><div className="transaction-name"><div className={`transaction-icon ${r.type.toLowerCase()}`}>{r.type==='INCOME'?<ArrowDownLeft size={17}/>:<ArrowUpRight size={17}/>}</div><div><b>{r.title}</b><small>{r.paymentMethod||'Payment'}</small></div></div></td><td><span className="category-pill">{r.category}</span></td><td>{r.transactionDate}</td><td className={r.type==='INCOME'?'positive':'negative'}>{r.type==='INCOME'?'+':'−'}{money(r.amount)}</td><td><div className="row-actions"><button title="Edit" onClick={()=>openEdit(r)}><Pencil size={15}/></button><button title="Delete" onClick={()=>remove(r.id)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>}
          </section>
          <section className="panel side-panel"><div className="panel-head"><div><h2>Quick actions</h2><p>Keep your records up to date</p></div></div><button className="action-tile" onClick={()=>openNew('INCOME')}><span className="action-icon green"><ArrowDownLeft/></span><span><b>Record income</b><small>Add salary or other money received</small></span><Plus size={17}/></button><button className="action-tile" onClick={()=>openNew('EXPENSE')}><span className="action-icon orange"><ArrowUpRight/></span><span><b>Add an expense</b><small>Track a purchase or payment</small></span><Plus size={17}/></button><div className="mini-summary"><div className="mini-title"><TrendingUp size={17}/> Monthly snapshot</div><div className="mini-line"><span>Transactions recorded</span><b>{overview.transactionCount}</b></div><div className="mini-line"><span>Average expense</span><b>{money(overview.expenses/Math.max(1,rows.filter(r=>r.type==='EXPENSE').length))}</b></div><div className="mini-line"><span>Categories used</span><b>{overview.categoryBreakdown?.length||0}</b></div></div><div className="privacy-note"><CreditCard size={17}/><span><b>Your data stays local</b><small>Demo data is stored in your local H2 database.</small></span></div></section>
        </div>}
        <footer>TRACKWISE FINANCE · PERSONAL DEMO WORKSPACE <span>Built with React + Spring Boot</span></footer>
      </div>
    </main>
    {modal&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setModal(false)}><form className="modal" onSubmit={save}><div className="modal-head"><div><div className="eyebrow">TRANSACTION DETAILS</div><h2>{editing?'Edit transaction':'Add transaction'}</h2></div><button type="button" className="close" onClick={()=>setModal(false)}><X/></button></div><div className="type-switch"><button type="button" className={form.type==='EXPENSE'?'on expense-on':''} onClick={()=>setForm({...form,type:'EXPENSE'})}>Expense</button><button type="button" className={form.type==='INCOME'?'on income-on':''} onClick={()=>setForm({...form,type:'INCOME'})}>Income</button></div><label>Description<input required maxLength="100" placeholder="e.g. Grocery shopping" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><div className="form-grid"><label>Amount (₹)<input required type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label>Date<input required type="date" value={form.transactionDate} onChange={e=>setForm({...form,transactionDate:e.target.value})}/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Payment method<select value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})}>{['UPI','Card','Cash','Bank transfer','Net banking','Other'].map(c=><option key={c}>{c}</option>)}</select></label></div><label>Note <textarea rows="2" placeholder="Optional details..." value={form.note||''} onChange={e=>setForm({...form,note:e.target.value})}/></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setModal(false)}>Cancel</button><button className="primary" type="submit">{editing?'Save changes':'Save transaction'}</button></div></form></div>}
    {toast&&<div className="toast">{toast}</div>}
  </div>
}
function Stat({icon:Icon,label,value,sub,kind}){return <div className="stat-card"><div className={`stat-icon ${kind}`}><Icon size={20}/></div><span>{label}</span><b>{value}</b><small>{sub}</small></div>}
function Empty(){return <div className="empty-state">No transactions match this view yet.</div>}
