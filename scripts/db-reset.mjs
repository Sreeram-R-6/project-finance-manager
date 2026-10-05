import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
const cli=(args)=>spawnSync(process.platform==='win32'?'npx.cmd':'npx',['supabase',...args],{encoding:'utf8',shell:process.platform==='win32'});
const reset=cli(['db','reset','--local']);
process.stdout.write(reset.stdout||'');process.stderr.write(reset.stderr||'');
if(reset.status!==0){
  const output=reset.stdout+reset.stderr;
  // CLI 2.75 can return a gateway error while restarting Storage after a successful reset.
  // Only this exact restart failure is eligible for recovery; SQL errors always fail.
  if(!output.includes('Restarting containers...')||!output.includes('Error status 502'))process.exit(reset.status||1);
  const expected=readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).length;
  const probe=spawnSync('docker',['exec','supabase_db_projman','psql','-U','postgres','-d','postgres','-Atc',`select (select count(*) from supabase_migrations.schema_migrations)=${expected} and exists(select 1 from public.projects where id='20000000-0000-0000-0000-000000000001') and (select count(*) from public.ledger_entries)>0`],{encoding:'utf8'});
  if(probe.status!==0||probe.stdout.trim()!=='t')process.exit(1);
  const gateway=spawnSync('docker',['restart','supabase_kong_projman'],{encoding:'utf8'});if(gateway.status!==0)process.exit(1);
  console.log('Migrations and seed verified after the CLI restart gateway error; checking service health.');
}
const status=cli(['status','-o','json']);if(status.status!==0)process.exit(1);
const {API_URL,ANON_KEY}=JSON.parse(status.stdout);
let healthy=false;
for(let attempt=0;attempt<60;attempt++){
  try{const results=await Promise.all(['/storage/v1/status','/auth/v1/health','/rest/v1/'].map(p=>fetch(API_URL+p,{headers:{apikey:ANON_KEY}})));if(results.every(r=>r.ok)){healthy=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,1000));
}
if(!healthy){console.error('Database reset applied, but local Auth/Storage/API health did not recover.');process.exit(1);}
console.log('Local migrations, seed, Auth, Storage and API are ready.');
