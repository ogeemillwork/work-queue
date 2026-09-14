(() => {
  const STORAGE_KEY = 'ogee-pma-v9-local';
  const COLUMNS = ['Queued','In Progress','Blocked','Install','Complete'];
  const $ = (id) => document.getElementById(id);
  let data = load();
  let editingId = null;

  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  function load(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(window.OGEE_DEFAULTS); }
    catch { return clone(window.OGEE_DEFAULTS); }
  }
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  function esc(v=''){ return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function fillSelect(el, values, selected='', blank=''){
    el.innerHTML = blank ? `<option value="">${esc(blank)}</option>` : '';
    values.forEach(v => el.insertAdjacentHTML('beforeend', `<option value="${esc(v)}" ${v===selected?'selected':''}>${esc(v)}</option>`));
  }

  function init(){
    fillSelect($('priorityFilter'), data.priorities, '', 'All priorities');
    fillSelect($('priorityField'), data.priorities);
    fillSelect($('statusField'), data.statuses);
    fillSelect($('leadField'), data.employees);
    fillSelect($('newSubtaskEmployee'), data.employees);
    ['searchInput','priorityFilter','jobFilter','employeeFilter'].forEach(id => $(id).addEventListener('input', render));
    $('addJobBtn').addEventListener('click', () => openJob());
    $('modeBtn').addEventListener('click', toggleMode);
    $('resetBtn').addEventListener('click', resetData);
    $('saveJobBtn').addEventListener('click', saveDialog);
    $('deleteJobBtn').addEventListener('click', deleteDialogJob);
    $('addSubtaskBtn').addEventListener('click', addSubtask);
    document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
    document.querySelectorAll('[data-workflow]').forEach(b => b.addEventListener('click', () => { $('statusField').value=b.dataset.workflow; }));
    $('jobDialog').addEventListener('close', () => { editingId=null; });
    refreshFilters(); render();
  }

  function refreshFilters(){
    const jf=$('jobFilter'), ef=$('employeeFilter'), jv=jf.value, ev=ef.value;
    fillSelect(jf, data.jobs.map(j=>j.name).sort(), jv, 'All jobs');
    fillSelect(ef, data.employees, ev, 'All employees');
  }

  function matches(j){
    const q=$('searchInput').value.trim().toLowerCase();
    const p=$('priorityFilter').value, name=$('jobFilter').value, emp=$('employeeFilter').value;
    const subEmp=(j.subtasks||[]).some(s=>s.employee===emp);
    const text=[j.name,j.client,j.notes,j.lead,...(j.subtasks||[]).map(s=>`${s.title} ${s.employee}`)].join(' ').toLowerCase();
    return (!q||text.includes(q)) && (!p||j.priority===p) && (!name||j.name===name) && (!emp||j.lead===emp||subEmp);
  }

  function render(){
    refreshFilters();
    $('board').innerHTML='';
    COLUMNS.forEach(status => {
      const jobs=data.jobs.filter(j=>j.status===status&&matches(j));
      const col=document.createElement('section'); col.className='column'; col.dataset.status=status;
      col.innerHTML=`<h2>${esc(status)} <span class="count">${jobs.length}</span></h2><div class="cards"></div>`;
      const cards=col.querySelector('.cards'); jobs.forEach(j=>cards.appendChild(jobCard(j)));
      $('board').appendChild(col);
    });
  }

  function jobCard(j){
    const done=(j.subtasks||[]).filter(s=>s.done).length, total=(j.subtasks||[]).length;
    const el=document.createElement('article'); el.className='job-card'; el.dataset.priority=j.priority;
    el.innerHTML=`
      <div class="job-head"><div><div class="job-title">${esc(j.name)}</div><div class="client">${esc(j.client||'')}</div></div><span class="badge">${esc(j.priority)}</span></div>
      <div class="badges"><span class="badge ${String(j.materials).toLowerCase()}">Materials: ${esc(j.materials)}</span>${total?`<span class="badge">${done}/${total} subtasks</span>`:''}</div>
      <div class="card-meta"><span>Lead: ${esc(j.lead||'—')}</span><span>Due: ${esc(j.due||'—')}</span></div>
      <div class="card-actions"><button data-open>Details</button><button data-left>←</button><button data-right>→</button></div>`;
    el.querySelector('[data-open]').onclick=()=>openJob(j.id);
    el.querySelector('[data-left]').onclick=()=>moveJob(j.id,-1);
    el.querySelector('[data-right]').onclick=()=>moveJob(j.id,1);
    el.ondblclick=()=>openJob(j.id);
    return el;
  }

  function moveJob(id,delta){
    const j=data.jobs.find(x=>x.id===id); const i=COLUMNS.indexOf(j.status); const ni=Math.max(0,Math.min(COLUMNS.length-1,i+delta));
    j.status=COLUMNS[ni]; save(); render();
  }

  function openJob(id=null){
    editingId=id;
    const j=id ? data.jobs.find(x=>x.id===id) : {name:'',client:'',priority:'Normal',status:'Queued',lead:data.employees[0],due:'',materials:'Waiting',notes:'',dropbox:'',handoff:'',subtasks:[]};
    $('dialogTitle').textContent=id?'Job Details':'Add Job'; $('dialogMeta').textContent=id?j.name:'New local job';
    $('nameField').value=j.name||''; $('clientField').value=j.client||''; $('priorityField').value=j.priority||'Normal'; $('statusField').value=j.status||'Queued'; $('leadField').value=j.lead||data.employees[0]; $('dueField').value=j.due||''; $('materialsField').value=j.materials||'Waiting'; $('notesField').value=j.notes||''; $('dropboxField').value=j.dropbox||''; $('handoffField').value=j.handoff||'';
    $('deleteJobBtn').style.display=id?'inline-block':'none';
    switchTab('details'); renderSubtasks(j); $('jobDialog').showModal();
  }

  function currentDraft(){
    const base=editingId?data.jobs.find(j=>j.id===editingId):null;
    return {
      id: editingId || ('job-'+Date.now()), name:$('nameField').value.trim(), client:$('clientField').value.trim(), priority:$('priorityField').value, status:$('statusField').value, lead:$('leadField').value, due:$('dueField').value, materials:$('materialsField').value, notes:$('notesField').value.trim(), dropbox:$('dropboxField').value.trim(), handoff:$('handoffField').value.trim(), subtasks: base ? base.subtasks : ($('#subtaskList')._draftSubtasks || [])
    };
  }

  function saveDialog(e){
    e.preventDefault(); const d=currentDraft(); if(!d.name){$('nameField').focus();return;}
    if(editingId){ const idx=data.jobs.findIndex(j=>j.id===editingId); data.jobs[idx]={...data.jobs[idx],...d,subtasks:$('#subtaskList')._draftSubtasks||data.jobs[idx].subtasks}; }
    else { d.subtasks=$('subtaskList')._draftSubtasks||[]; data.jobs.push(d); }
    save(); $('jobDialog').close(); render();
  }

  function deleteDialogJob(){ if(!editingId)return; if(confirm('Delete this job?')){ data.jobs=data.jobs.filter(j=>j.id!==editingId); save(); $('jobDialog').close(); render(); } }

  function renderSubtasks(j){
    const list=$('subtaskList'); list._draftSubtasks=clone(j.subtasks||[]); drawSubtasks();
  }
  function drawSubtasks(){
    const list=$('subtaskList'); list.innerHTML='';
    list._draftSubtasks.forEach((s,i)=>{
      const row=document.createElement('div'); row.className='subtask'+(s.done?' done':'');
      row.innerHTML=`<input type="checkbox" ${s.done?'checked':''}><input class="subtask-title" value="${esc(s.title)}"><select></select><input type="date" value="${esc(s.due||'')}"><button type="button">×</button>`;
      fillSelect(row.querySelector('select'),data.employees,s.employee);
      const [cb,title,sel,due,del]=row.children;
      cb.onchange=()=>{s.done=cb.checked;drawSubtasks();}; title.oninput=()=>s.title=title.value; sel.onchange=()=>s.employee=sel.value; due.onchange=()=>s.due=due.value; del.onclick=()=>{list._draftSubtasks.splice(i,1);drawSubtasks();};
      list.appendChild(row);
    });
  }
  function addSubtask(){
    const title=$('newSubtaskTitle').value.trim(); if(!title)return;
    $('subtaskList')._draftSubtasks.push({id:'st-'+Date.now(),title,employee:$('newSubtaskEmployee').value,due:$('newSubtaskDue').value,done:false});
    $('newSubtaskTitle').value=''; $('newSubtaskDue').value=''; drawSubtasks();
  }
  function switchTab(name){ document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name)); document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===name)); }
  function toggleMode(){ document.body.classList.toggle('shop-tv'); $('modeBtn').textContent=document.body.classList.contains('shop-tv')?'Management Mode':'Shop TV Mode'; }
  function resetData(){ if(confirm('Reset only this browser\'s preview data to the bundled defaults?')){ data=clone(window.OGEE_DEFAULTS); save(); render(); } }
  init();
})();
