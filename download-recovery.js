'use strict';
const statusNode=document.querySelector('#status');
const buttons=[...document.querySelectorAll('[data-package]')];
async function response(url,accept,signal){
 const r=await fetch(url,{headers:accept?{Accept:accept}:{},cache:'no-store',signal});
 if(!r.ok)throw new Error(r.status===403||r.status===429?'요청이 많아 잠시 후 다시 시도해야 합니다.':`다운로드 서버가 응답하지 않습니다 (${r.status}).`);
 return r;
}
async function recover(kind){
 buttons.forEach(b=>b.disabled=true);
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),600000);
 try{
  statusNode.textContent='최신 공식 파일을 확인하고 있습니다…';
  const feed=await (await response('version.json',null,controller.signal)).json();
  if(feed.channel!=='stable')throw new Error('정식 배포 정보를 확인할 수 없습니다.');
  const names=Object.keys(feed.downloads||{});
  const name=kind==='pc'?'NUV-Windows.zip':names.find(n=>/^NUV-Browser-Extension-\d+\.\d+\.\d+(?:\.\d+)?\.zip$/.test(n));
  const url=feed.recoveryDownloads?.[name],hash=feed.sha256?.[name];
  if(typeof url!=='string'||!/^https:\/\/hyeongom\.github\.io\/nuv-download\/recovery\/NUV-(Windows-[\d.]+|Browser-Extension-[\d.]+)\.zip$/.test(url)||!/^[a-f\d]{64}$/i.test(hash||''))throw new Error('공식 파일 검증 정보가 올바르지 않습니다.');
  const max=kind==='pc'?200*1024*1024:5*1024*1024;
  statusNode.textContent='파일을 다운로드하고 있습니다…';
  const file=await response(url,null,controller.signal);
  const expectedSize=Number(file.headers.get('Content-Length'));
  const reader=file.body.getReader(),parts=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new Error('파일 크기가 올바르지 않습니다.');}parts.push(value);statusNode.textContent=expectedSize>0?`다운로드 중… ${Math.floor(size*100/expectedSize)}%`:`다운로드 중… ${(size/1048576).toFixed(1)} MB`;}
  if(expectedSize>0&&size!==expectedSize)throw new Error('파일을 완전히 받지 못했습니다. 다시 시도하세요.');
  statusNode.textContent='파일이 공식 배포본과 같은지 검증하고 있습니다…';
  const blob=new Blob(parts,{type:'application/zip'});
  const digest=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
  const actual=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  if(actual!==hash.toLowerCase())throw new Error('파일 검증에 실패해 저장하지 않았습니다. 다시 시도하세요.');
  const blobUrl=URL.createObjectURL(blob),link=document.createElement('a');link.href=blobUrl;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(blobUrl),60000);
  statusNode.textContent='검증 완료. 브라우저 다운로드 목록에서 '+name+' 파일을 확인하세요.';
 }catch(error){statusNode.textContent=error.name==='AbortError'?'다운로드 시간이 초과되었습니다. 다시 시도하세요.':(error instanceof TypeError?'서버에 연결할 수 없습니다. 네트워크 상태를 확인하고 잠시 후 다시 시도하세요.':error.message);}
 finally{clearTimeout(timer);buttons.forEach(b=>b.disabled=false);}
}
buttons.forEach(b=>b.addEventListener('click',()=>recover(b.dataset.package)));
