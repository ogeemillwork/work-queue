window.OGEE_DEFAULTS = {
  employees: ['Jack','Mike','Alex','Jose','Sam','Taylor'],
  priorities: ['Urgent','High','Normal','Low'],
  statuses: ['Queued','In Progress','Blocked','Install','Complete'],
  jobs: [
    {id:'frances-howell',name:'Frances Howell',client:'Frances Howell',priority:'High',status:'In Progress',lead:'Jack',due:'2026-09-22',materials:'Partial',notes:'Custom millwork package. Confirm field dimensions before final fabrication.',dropbox:'',handoff:'Review dimensions, open items, material status, and install sequencing.',subtasks:[
      ['Verify field dimensions','Jack','2026-09-15'],['Confirm door profiles','Mike','2026-09-16'],['Finalize shop drawings','Jack','2026-09-17'],['Order remaining hardware','Taylor','2026-09-17'],['Cut casework panels','Jose','2026-09-18'],['Mill face-frame stock','Alex','2026-09-18'],['Dry-fit assemblies','Mike','2026-09-19'],['Sand and prep','Sam','2026-09-20'],['Finish touch-up','Sam','2026-09-21'],['Stage for install','Jose','2026-09-22']
    ].map((x,i)=>({id:'fh-'+i,title:x[0],employee:x[1],due:x[2],done:false}))},
    {id:'3015-pacific',name:'3015 Pacific',client:'3015 Pacific Ave',priority:'Urgent',status:'Install',lead:'Mike',due:'2026-09-16',materials:'Ready',notes:'Punch-list focus.',dropbox:'',handoff:'Close punch list and document completion.',subtasks:[
      ['Adjust pantry door reveal','Mike','2026-09-14'],['Touch up island end panel','Sam','2026-09-14'],['Install missing shelf pins','Jose','2026-09-14'],['Align mudroom drawers','Alex','2026-09-15'],['Replace nicked toe kick','Jose','2026-09-15'],['Final hardware check','Mike','2026-09-15']
    ].map((x,i)=>({id:'pp-'+i,title:x[0],employee:x[1],due:x[2],done:i<1}))},
    {id:'lake-st',name:'Lake Street Kitchen',client:'Reed Residence',priority:'High',status:'Queued',lead:'Jack',due:'2026-09-28',materials:'Waiting',notes:'Awaiting veneer release.',subtasks:[]},
    {id:'montgomery',name:'Montgomery Library',client:'Park Design',priority:'Normal',status:'In Progress',lead:'Alex',due:'2026-09-25',materials:'Ready',notes:'Walnut library wall.',subtasks:[]},
    {id:'sacramento',name:'Sacramento Built-ins',client:'Wells Residence',priority:'Normal',status:'Queued',lead:'Jose',due:'2026-10-02',materials:'Partial',notes:'Living room built-ins.',subtasks:[]},
    {id:'noe',name:'Noe Valley Closets',client:'Chen Residence',priority:'Low',status:'In Progress',lead:'Taylor',due:'2026-10-05',materials:'Ready',notes:'Closet package.',subtasks:[]},
    {id:'filbert',name:'Filbert Vanity',client:'Mason Residence',priority:'High',status:'Blocked',lead:'Sam',due:'2026-09-20',materials:'Waiting',notes:'Blocked on stone sink dimensions.',subtasks:[]},
    {id:'marina',name:'Marina Media Wall',client:'Stone Residence',priority:'Normal',status:'Queued',lead:'Jack',due:'2026-10-08',materials:'Partial',notes:'Integrated media and display wall.',subtasks:[]},
    {id:'atherton',name:'Atherton Pantry',client:'Oak Studio',priority:'High',status:'In Progress',lead:'Mike',due:'2026-09-30',materials:'Ready',notes:'Paint-grade pantry cabinetry.',subtasks:[]},
    {id:'piedmont',name:'Piedmont Office',client:'Kline Residence',priority:'Normal',status:'Install',lead:'Alex',due:'2026-09-18',materials:'Ready',notes:'Final install.',subtasks:[]},
    {id:'berkeley',name:'Berkeley Banquette',client:'Northline Design',priority:'Low',status:'Queued',lead:'Jose',due:'2026-10-12',materials:'Waiting',notes:'Curved banquette.',subtasks:[]},
    {id:'russian-hill',name:'Russian Hill Bar',client:'Grant Residence',priority:'High',status:'Blocked',lead:'Taylor',due:'2026-09-26',materials:'Partial',notes:'Awaiting appliance cut sheets.',subtasks:[]},
    {id:'pac-heights',name:'Pacific Heights Wardrobe',client:'Hale Residence',priority:'Normal',status:'In Progress',lead:'Sam',due:'2026-10-01',materials:'Ready',notes:'Wardrobe and dresser wall.',subtasks:[]},
    {id:'oakland',name:'Oakland Reception Desk',client:'Studio 44',priority:'Low',status:'Complete',lead:'Jack',due:'2026-09-12',materials:'Ready',notes:'Completed.',subtasks:[]}
  ]
};
