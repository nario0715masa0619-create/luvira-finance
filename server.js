import http from 'node:http';
import { URL } from 'node:url';
import crypto from 'node:crypto';

const port=Number(process.env.PORT||3000);
const clientId=process.env.FREEE_CLIENT_ID;
const clientSecret=process.env.FREEE_CLIENT_SECRET;
const redirectUri=process.env.FREEE_REDIRECT_URI||`http://localhost:${port}/auth/freee/callback`;
const api='https://api.freee.co.jp';
const auth='https://accounts.secure.freee.co.jp/public_api';
const sessions=new Map();
const send=(res,status,body,type='application/json')=>{res.writeHead(status,{'Content-Type':`${type}; charset=utf-8`});res.end(type==='application/json'?JSON.stringify(body):body)};
const redirect=(res,to)=>{res.writeHead(302,{Location:to});res.end()};
const cookie=(req,name)=>{const found=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`));return found?.slice(name.length+1)};
async function freee(path,token,params={}){const u=new URL(api+path);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));const r=await fetch(u,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}});if(!r.ok)throw new Error(`freee API ${r.status}`);return r.json()}
function requireConfig(res){if(!clientId||!clientSecret)return send(res,503,{error:'freee OAuth is not configured',message:'FREEE_CLIENT_ID と FREEE_CLIENT_SECRET を環境変数に設定してください。'})}
const server=http.createServer(async(req,res)=>{try{
 const u=new URL(req.url,`http://localhost:${port}`);
 if(u.pathname==='/health')return send(res,200,{ok:true,freeeConfigured:Boolean(clientId&&clientSecret)});
 if(u.pathname==='/auth/freee'){if(!requireConfig(res)){const state=crypto.randomBytes(24).toString('hex');sessions.set(state,{created:Date.now()});const q=new URLSearchParams({response_type:'code',client_id:clientId,redirect_uri:redirectUri,state,prompt:'select_company'});return redirect(res,`${auth}/authorize?${q}`)}}
 if(u.pathname==='/auth/freee/callback'){const state=u.searchParams.get('state'),code=u.searchParams.get('code');if(!state||!sessions.has(state)||Date.now()-sessions.get(state).created>600000)return send(res,400,{error:'invalid_state'});sessions.delete(state);const body=new URLSearchParams({grant_type:'authorization_code',client_id:clientId,client_secret:clientSecret,redirect_uri:redirectUri,code});const tokenRes=await fetch(`${auth}/token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});if(!tokenRes.ok)return send(res,502,{error:'freee_token_exchange_failed'});const token=await tokenRes.json();const sid=crypto.randomBytes(24).toString('hex');sessions.set(sid,{token,created:Date.now()});res.setHeader('Set-Cookie',`luvira_session=${sid}; HttpOnly; SameSite=Lax; Path=/`);return redirect(res,'/');}
 if(u.pathname==='/api/freee/status'){const sid=cookie(req,'luvira_session');return send(res,200,{connected:Boolean(sid&&sessions.get(sid)?.token),configured:Boolean(clientId&&clientSecret)})}
 if(u.pathname.startsWith('/api/freee/')){const sid=cookie(req,'luvira_session'),token=sessions.get(sid)?.token?.access_token;if(!token)return send(res,401,{error:'freee_not_connected'});if(u.pathname==='/api/freee/companies')return send(res,200,await freee('/api/1/companies',token));if(u.pathname==='/api/freee/wallet-txns')return send(res,200,await freee('/api/1/wallet_txns',token,Object.fromEntries(u.searchParams)));if(u.pathname==='/api/freee/deals')return send(res,200,await freee('/api/1/deals',token,Object.fromEntries(u.searchParams)));return send(res,404,{error:'not_found'})}
 if(u.pathname==='/'||u.pathname==='/index.html'){const html='<!doctype html><meta charset="utf-8"><title>Luvira Finance</title><p>Luvira Finance freee連携サーバー</p><p><a href="/auth/freee">freeeと接続する</a></p><p>API: <code>/api/freee/status</code> / <code>/api/freee/companies</code></p>';return send(res,200,html,'text/html')}
 send(res,404,{error:'not_found'});
}catch(e){send(res,500,{error:'internal_error',message:e.message})}});
server.listen(port,()=>console.log(`Luvira Finance server listening on http://localhost:${port}`));
