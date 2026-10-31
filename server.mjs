import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+'/')){res.writeHead(403);res.end();return;}
    try{if(!(await stat(file)).isFile())throw Error();}catch{if(extname(pathname)){res.writeHead(404);res.end();return;}file=resolve(root,'index.html');}
    let data=await readFile(file);
    if(extname(file)==='.html'){
      const host=String(req.headers.host||'localhost').replace(/[^a-zA-Z0-9.:\[\]-]/g,'');
      const protocol=req.headers['x-forwarded-proto']==='https'?'https':'http';
      data=Buffer.from(data.toString().replaceAll('__SITE_ORIGIN__',`${protocol}://${host}`));
    }
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':file.includes('/assets/')?'public, max-age=31536000, immutable':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(500);res.end('Unable to load the site.');}
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Rep Yuh Place preview server ready'));
