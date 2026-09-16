-- Replace the demo seed jobs with the real OGEE project list
-- (Current Project List handoff, 2026-09-15). Jobs added through the UI
-- (ids like 'job-<timestamp>') are left untouched.

-- Ensure the newer columns exist (no-ops when 0007/0010 already ran).
alter table public.jobs add column if not exists client_phone text not null default '';
alter table public.jobs add column if not exists client_email text not null default '';
alter table public.jobs add column if not exists state text not null default 'Discovery';

-- Remove the demo seed jobs by their known ids.
delete from public.jobs where id in (
  'frances-howell', '3015-pacific', 'lake-st', 'montgomery', 'sacramento',
  'noe', 'filbert', 'marina', 'atherton', 'piedmont', 'berkeley',
  'russian-hill', 'pac-heights', 'oakland'
);

insert into public.jobs
  (id, name, client, client_phone, client_email, priority, status, state, lead, due, materials, notes)
values
  ('156-liberty', '156 Liberty Street', 'Tyler Dikman', '', 'tyler.dikman@gmail.com',
   'High', 'In Progress', 'Production', '', '', 'Partial',
   E'San Francisco. Large residential millwork package (~11 areas): wall bed, wellness bath/tambour work, entry bench, coat closet, fireplace bookshelves, banquette, guest wardrobe, office bath/linen, TV console, and bar. Most approval-ready items signed off. LED channel ordered; moving from engineering into production.\n\nAdditional contacts: Taylor Lightfoot — taylorlightfoot@gmail.com; Niklas Schenck — niklasschenck@gmail.com'),

  ('62-highgate', '62 Highgate Road', 'Jim Fisher', '510-334-6684', 'jimericfisher@gmail.com',
   'High', 'Queued', 'Production', '', '', 'Ready',
   E'Kensington, CA 94707. Estimate #1661 — $47,975. Complete custom kitchen cabinetry package: painted flat-panel doors, appliance cabinetry, applied panels, specialty storage, shelving, and under-cabinet lighting details. Field measurements and revised shop drawings complete — shop ready to begin cutting; lighting/valance coordination remaining.\n\nDesigner: Tetyana Pokotylo — tetyana_p@yahoo.com. Builder: Keene Builders — Jamie Tipton / Craig Ericksen.'),

  ('495-goodman', '495 Goodman Road', 'Highland Build', '', 'alan@highland-build.com',
   'High', 'Queued', 'Design', '', '', 'Waiting',
   E'Residential cabinetry and millwork package. Updated kitchen elevations and first-floor drawings received September 14. Coordinating cabinet inserts, HVAC grilles, electrical, and final design details before release to production.\n\nGC: Highland Build — Alan Hyland (alan@highland-build.com), Morgan Cambron (office@highland-build.com), Pat Creedon (pat@highland-build.com). Designers: Erin O''Brien (erin@lexizavad.com), Lexi Zavad (lexi@lexizavad.com). Electrical: Paul White (paulwhite7629@att.net).'),

  ('3015-pacific', '3015 Pacific Avenue', 'Farallon Construction', '216-789-5809', 'mike@farallonconstruction.com',
   'Medium', 'Install', 'Adjustment', '', '', 'Ready',
   E'San Francisco. Large residential millwork: mudroom, laundry cabinetry, bathroom work, shelving, replacement doors/drawers, and miscellaneous finish items. Primary-bath mirror drawing approved September 14. Remaining work is installation, punch, and closeout.\n\nGC: Farallon Construction — Mike Krutsch (mike@farallonconstruction.com | 216-789-5809), Anthony Byrne (anthony@farallonconstruction.com), Erik Mattson (erik@farallonconstruction.com).'),

  ('20-conifer', '20 Conifer Lane', 'Andrew Song', '', 'andrew@ordinaryradical.ca',
   'Medium', 'Install', 'Adjustment', '', '', 'Ready',
   E'Residential millwork: mahogany wall/baseboard work, closets, window-related work, and appliance-garage cabinetry. Appliance garage held until stone installation is complete. Remaining work is installation and finish coordination.\n\nPainting: Ulises Lara / Lara''s Custom Painting — laracustompainting@gmail.com | 510-677-7893.'),

  ('cws-158-159', 'CWS 158/159 — SC/CHP & Clerk''s Office', 'CWS Construction Group', '831-428-9916', 'Davids@cwsconstructiongroup.com',
   'High', 'In Progress', 'FAB', '', '', 'Partial',
   E'Custom commercial wood-door package with glazing, electrified mortise hardware, transfer hardware, and card-reader/security coordination. Door design/submittals approved; proceeding into procurement/fabrication.\n\nGC: CWS Construction Group — David Scott (Davids@cwsconstructiongroup.com | 831-428-9916), Charlie Slack Jr. (charliejr@cwsconstructiongroup.com), Chris Slack (chriss@cwsconstructiongroup.com). Security: Juan Gonzalez / Empower Security — juan@empowersecure.com | 408-669-9038. Glass: Cassie Harker / Alliance Glass — cassieh@allianceglasscompany.com | 650-625-9108 / 510-207-9569.'),

  ('1525-shotwell', '1525 Shotwell Street', 'Natalia Borecka', '857-288-8557', 'natalia.borecka@gmail.com',
   'High', 'Queued', 'Design', '', '', 'Waiting',
   E'San Francisco, CA 94110. Estimate #1664 — $31,780. Custom residential built-in wardrobe/cabinetry package. Design revisions and field measurements underway, including revised window treatment and transition toward maple/calibrated plywood construction with custom doors.\n\nSecondary contact: Marek — 206-855-6262.'),

  ('ehsan-doors', 'Ehsan Karimian — Door Package', 'Ehsan Karimian', '', 'ehsan_karimian@yahoo.com',
   'Medium', 'In Progress', 'Production', '', '', 'Partial',
   E'Custom/pre-hung residential door package being procured through Truitt & White. Main package signed off; specialty oversized paint-grade pocket door still being sourced/quoted. Project address needs to be added to the PM file.'),

  ('frances-howell', 'Frances Howell — White Oak Countertop', 'Frances Howell', '', 'franceskhowell@mac.com',
   'Low', 'In Progress', 'FAB', '', '', 'Ready',
   E'Estimate #1665 — $705.93. Small custom white-oak countertop/panel with mitered front edge for an existing tiled counter/sink condition. Contractor is handling pickup and installation. Final dimensions requested before fabrication.\n\nAlt email: franceskhowell@me.com.'),

  ('720-waller', '720 Waller', '', '', '',
   'Low', 'Install', 'Adjustment', '', '', 'Ready',
   E'San Francisco. Custom shelving/inserts and related residential millwork. Punch/closeout — confirm whether still open: verify whether any fabrication, installation, punch, or billing remains before keeping it on the active board.')

on conflict (id) do update set
  name = excluded.name,
  client = excluded.client,
  client_phone = excluded.client_phone,
  client_email = excluded.client_email,
  priority = excluded.priority,
  status = excluded.status,
  state = excluded.state,
  materials = excluded.materials,
  notes = excluded.notes,
  updated_at = now();

-- Refresh the shared client list, when the clients table exists (0008).
do $$
begin
  if to_regclass('public.clients') is not null then
    delete from public.clients where name in (
      'Frances Howell', '3015 Pacific Ave', 'Reed Residence', 'Park Design',
      'Wells Residence', 'Chen Residence', 'Mason Residence', 'Stone Residence',
      'Oak Studio', 'Kline Residence', 'Northline Design', 'Grant Residence',
      'Hale Residence', 'Studio 44'
    );
    insert into public.clients (name)
    select distinct client from public.jobs where client <> ''
    on conflict (name) do nothing;
  end if;
end $$;
