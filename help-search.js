(function(host){
'use strict';
const normalize=text=>String(text||'').toLowerCase().replace(/[^a-z0-9가-힣]/g,'');
const isKeyVisibility=text=>{const q=normalize(text);return /(키|버튼)/.test(q)&&/(안보|보이지않|안나|나오지않|없어|사라|숨겨|빈화면)/.test(q)&&!/(아이콘|글자|이름|단축키|f키|키보드|동작목록)/.test(q);};
const groups=[
['mobile',['휴대폰','휴대','핸드폰','핸폰','모바일','안드로이드','android','폰']],['pc',['pc','컴퓨터','컴터','피씨','윈도우','windows']],
['netflix',['넷플릭스','넷플','netflix']],['youtube',['유튜브','youtube']],['disney',['디즈니','disney']],['obs',['obs','오비에스']],['chzzk',['치지직','chzzk']],['twitch',['트위치','twitch']],
['macro',['매크로','메크로','macro']],['preset',['프리셋','프리셑']],['fkey',['f키','f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12','펑션']],['profile',['프로필','프로파일']],['favorites',['즐겨찾기','즐찾']],
['extension',['확장','익스텐션']],['browser',['브라우저','크롬','chrome','엣지','edge']],['update',['업데이트','업뎃','업데트']],['install',['설치','다운로드','압축']],['connect',['연결','연동','페어링','qr']],
['account',['로그인','회원가입','계정','이메일']],['plan',['플랜','요금제','유료','무료','결제']],['record',['녹화','레코딩']],['stop',['중지','종료','끄기','꺼','멈추','멈춰','정지']],['delay',['지연','딜레이','늦','느리']],['longpress',['길게','꾹','롱프레스']],
['fullscreen',['전체화면','풀스크린']],['seek',['앞으로','뒤로','초만큼']],['episode',['이전화','다음화','이전회','다음회','시즌','회차']],['copy',['복사','복붙','가져오기','불러오기']],['order',['순서','끌어서','드래그']],['name',['이름','명칭']],['icon',['아이콘']],['shortcut',['단축키','alt','알트']],['sync',['동기화','충돌']],
['count',['키추가','키수','키늘','키삭제','버튼추가']],['theme',['테마','배경','테두리','빛','색상']],['refresh',['새로고침']],['excel',['엑셀','excel']],['word',['워드','word']],['ppt',['파워포인트','powerpoint','ppt']],['streamer',['streamerbot','스트리머봇']],['iphone',['아이폰','iphone','ios']],['web',['웹리모컨','웹연결','사파리','safari']],['website',['웹사이트','사이트','주소','링크']],['save',['저장']],['test',['테스트','베타','정식']],['sound',['음량','볼륨','마이크','음소거']]
];
const tags=text=>new Set(groups.filter(([,values])=>values.some(v=>normalize(text).includes(normalize(v)))).map(([name])=>name));
const problem=text=>/안돼|안되|안됨|안됩|않|없|오류|실패|느리|늦|다릅|다르/.test(normalize(text));
const generic=new Set(['pc','mobile','connect','stop','name','save','account','order','copy']);
function isBasicKeyUsage(text){
 const q=normalize(text),topics=tags(text);
 return /(키|버튼)/.test(q)&&/(사용법|쓰는법|사용방법|어떻게|모르|뭐|무엇|뭔|처음)/.test(q)
  &&!/(키보드|프로그램|앱실행|안돼|안되|안됨|안열|오류|사라|안보)/.test(q)
  &&[...topics].every(topic=>['pc','mobile','iphone'].includes(topic));
}
function topicOverview(data,query){
 const q=normalize(query);
 // Unknown usage is not an execution failure. Specific tasks still use article retrieval.
 if(/안돼|안되|안됨|안보|안열|실패|오류|사라|느리|없어|작동안|반응없/.test(q))return null;
 const definition=/뭐|무엇|뭔|뜻|어떤기능/.test(q);
 if(!definition&&!/어떻게|사용법|사용방법|쓰는법|모르|처음/.test(q))return null;
 if(!definition&&/복사|복붙|삭제|이름|전환|순서|지연|녹화|중지|끄|꺼|몇초|추가|늘리|길게|꾹|표시|다음화|이전화/.test(q))return null;
 let matches=(data.topics||[]).map(topic=>({topic,aliases:[topic.title,...topic.aliases].map(normalize).filter(alias=>q.includes(alias))})).filter(m=>m.aliases.length);
 if(matches.length>1)matches=matches.filter(m=>m.topic.id!=='nuv');
 matches=matches.filter(m=>!matches.some(other=>other!==m&&m.aliases.every(alias=>other.aliases.some(longer=>longer.length>alias.length&&longer.includes(alias)))));
 if(!matches.length)return null;
 if(matches.length>1)return{status:'clarify',prompt:'어느 기능의 설명을 찾고 있나요?',choices:matches.map(m=>m.topic.title+' 사용법'),results:[]};
 const topic=matches[0].topic,ids=[topic.primary,...topic.sources.filter(id=>id!==topic.primary)];
 return{status:'found',intent:definition?'definition':'usage',topic,results:ids.map((id,i)=>({id,article:data.articles.find(a=>a.id===id),score:100-i})).filter(r=>r.article)};
}
function search(data,raw){
const query=String(raw||'').trim().slice(0,500),q=normalize(query),qt=tags(query);
if(!q)return{status:'empty',results:[]};
if(isBasicKeyUsage(query))return{status:'found',intent:'usage',results:['guide-4-1','guide-5-1','guide-5-7','guide-4-2'].map((id,i)=>({id,article:data.articles.find(a=>a.id===id),score:100-i})).filter(r=>r.article)};
if(isKeyVisibility(query))return{status:'found',results:['guide-4-3','guide-6-1','guide-17-2','guide-17-4','guide-4-2'].map((id,i)=>({id,article:data.articles.find(a=>a.id===id),score:100-i})).filter(r=>r.article)};
// A generic launch failure is not evidence of an F-key problem.
if(/(앱|어플|프로그램|nuv)/.test(q)&&/(실행|열려)/.test(q)&&/(안돼|안되|안됨|안열려|않)/.test(q)&&!/(복사|프로필|매크로|f키)/.test(q)){
 if(/nuv자체|nuv앱/.test(q)&&!/(키로|키에|버튼)/.test(q))return search(data,'PC 설치 방법');
 if(/키로|키에|버튼/.test(q))return search(data,'프로그램 실행');
 return{status:'clarify',prompt:'어느 쪽이 실행되지 않나요?',choices:['NUV 자체가 안 열려요','NUV 키로 프로그램이 안 열려요'],results:[]};
}
// Everyday wording needs an explicit distinction between opening NUV and assigning a launch key.
const launch=/(실행|열기|여는|열어|켜기|켜요|켜나요|키는|켜는)/.test(q);
if(launch&&/(앱|어플|프로그램|nuv)/.test(q)&&!/(복사|프로필|매크로|오류|안돼|안되|안됨)/.test(q)){
 const own=/nuv|노브/.test(q)&&!/(키로|키에|버튼|지정|등록|다른)/.test(q);
 const assigned=/(키로|키에|버튼|지정|등록|다른|프로그램|여러|한번에|동시에)/.test(q);
 if(!own&&!assigned)return{status:'clarify',prompt:'어떤 앱 실행 방법을 찾나요?',choices:['NUV 앱 실행 방법','키로 다른 프로그램 실행'],results:[]};
 if(own)return search(data,qt.has('mobile')?'Android 설치 방법':'PC 설치 방법');
 if(assigned&&!q.includes('프로그램실행'))return search(data,/(여러|한번에|동시에)/.test(q)?'여러 프로그램 실행':'프로그램 실행');
}
if(qt.has('record')&&!qt.has('obs')&&!qt.has('macro'))return{status:'clarify',prompt:'어느 녹화를 말하나요?',choices:['OBS 녹화 제어','매크로 녹화 중지'],results:[]};
if(qt.has('connect')&&qt.size===1)return{status:'clarify',prompt:'무엇을 연결하려고 하나요?',choices:['휴대폰 PC 연결','브라우저 확장 연결','OBS 연결'],results:[]};
if(qt.has('episode')&&!['netflix','youtube','disney'].some(t=>qt.has(t)))return{status:'clarify',prompt:'어느 영상 서비스인가요?',choices:['넷플릭스 이전 화 다음 화','유튜브 다음 영상'],results:[]};
if(qt.size===0&&/^(키|버튼|설정|사용법|방법|도움말)(설정|방법|어떻게|하나요|해요|알려줘)*$/.test(q))return{status:'clarify',prompt:'어떤 설정을 찾고 있나요?',choices:['PC 키 설정 단축키','휴대폰 길게 눌러 키 설정','키 추가 삭제'],results:[]};
const overview=topicOverview(data,query);if(overview)return overview;
const words=query.toLowerCase().split(/[^a-z0-9가-힣]+/).map(w=>w.replace(/(에서는|에서|으로|하려면|하고|하는|하면|하려|하기|인가요|하나요|해요|이랑|랑|을|를|은|는|이|가|도)$/,'')).filter(w=>w.length>=2&&!/^(어떻게|왜|뭐|되|해|돼|안돼|안되|없어|알려|주세요|있어|좋아|방법|싶어|설정|사용|기능|문제|안됨|질문)/.test(w));
if(qt.size===0&&!words.length)return{status:'none',results:[]};
const results=data.articles.map(article=>{
const title=normalize(article.title),chapter=normalize(article.chapterTitle),body=normalize(article.lines.join(' ')),tt=tags(article.title),bt=tags(article.lines.join(' ')),ct=tags(article.chapterTitle);
let score=0,matched=0,specific=0,lexical=0;
qt.forEach(tag=>{const weight=generic.has(tag)?1:2;if(tt.has(tag)){score+=10*weight;matched++;if(!generic.has(tag))specific++;}else if(ct.has(tag)){score+=5*weight;matched++;if(!generic.has(tag))specific++;}else if(bt.has(tag)){score+=2*weight;matched++;if(!generic.has(tag))specific++;}else score-=generic.has(tag)?4:14;});
for(const word of new Set(words)){const term=normalize(word);if(title.includes(term)){score+=9;lexical++;}else if(chapter.includes(term)){score+=4;lexical++;}else if(body.includes(term)){score++;lexical++;}}
if(problem(query)){if(article.kind==='faq')score+=12;}else if(article.kind==='faq')score-=7;
if(qt.has('macro')&&qt.has('record')&&article.chapter===16&&title==='녹화')score+=30;
if(qt.has('mobile')&&qt.has('longpress')&&article.kind==='faq'&&title.includes('길게'))score+=30;
if(qt.has('update')&&tt.has('update'))score+=10;
if(qt.has('chzzk')&&(qt.has('connect')||qt.has('account')||/인증|권한/.test(q))&&article.id==='guide-13-2')score+=40;
if(qt.has('favorites')&&qt.has('order')&&title==='즐겨찾기관리')score+=16;
if(qt.has('preset')&&/몇초|안내|표시|시간/.test(q)&&title==='전환안내시간')score+=24;
if(q.includes('프로그램실행')&&title===(/(여러|한번에|동시에)/.test(q)?'여러프로그램실행':'프로그램실행')){score+=30;lexical+=2;}
const strong=[...qt].filter(t=>!generic.has(t));
const enough=qt.size?matched>=Math.ceil(qt.size*.5)&&(!strong.length||specific>0):lexical>=Math.min(2,words.length);
return{id:article.id,article,score,enough};
}).filter(r=>r.enough&&r.score>=14).sort((a,b)=>b.score-a.score);
return{status:results.length?'found':'none',results};
}
const api={search,normalize,isKeyVisibility};if(typeof module!=='undefined'&&module.exports)module.exports=api;else host.NUVHelpSearch=api;
})(typeof window!=='undefined'?window:globalThis);
