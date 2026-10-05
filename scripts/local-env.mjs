import { spawnSync } from 'node:child_process';
import { writeFileSync,existsSync } from 'node:fs';
if(existsSync('.env.local')){console.error('.env.local already exists; refusing to overwrite credentials.');process.exit(1);}
const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',['supabase','status','-o','json'],{encoding:'utf8',shell:process.platform==='win32'});
if(result.status!==0){process.stderr.write(result.stderr);process.exit(1);}
const data=JSON.parse(result.stdout);writeFileSync('.env.local',`NEXT_PUBLIC_APP_URL=http://localhost:3000\nNEXT_PUBLIC_SUPABASE_URL=${data.API_URL}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${data.ANON_KEY}\nLOCAL_DEMO_AUTH=true\n`);console.log('Created local-only environment from the running local stack. No server secret was copied.');
