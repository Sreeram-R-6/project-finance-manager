import { readdir,readFile,writeFile } from 'node:fs/promises';
import { format } from 'prettier';
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+entry.name;if(entry.isDirectory())await walk(path);else if(/\.(ts|tsx|css)$/.test(path)){await writeFile(path,await format(await readFile(path,'utf8'),{filepath:path}));}}}
try{await walk('src');await walk('tests');}catch(error){console.error(error.message);process.exit(1);}
