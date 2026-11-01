(function(){
'use strict';
const scenarios=window.NUVTroubleshooting.scenarios,articles=window.NUV_HELP_DATA.articles;
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
const box=el('details');box.id='troubleshooting';box.className='troubleshooting';
box.append(el('summary','문제 해결 · 먼저 해볼 방법'));
const content=el('div');box.append(content);
const first=el('section');first.className='first-aid';content.append(first);
const advanced=el('section');advanced.hidden=true;advanced.className='advanced-checks';content.append(advanced);
advanced.append(el('h3','그럼 상황을 조금 더 확인해 볼게요'),el('p','아는 항목만 골라 주세요. 기기나 버전을 몰라도 괜찮아요. 입력한 내용은 이 화면에서만 사용합니다.'));
const fields=el('div');fields.className='trouble-fields';advanced.append(fields);
function field(parent,title,node,id){node.id=id;const label=el('label',title);label.htmlFor=id;const group=el('div');group.append(label,node);parent.append(group);return node;}
function option(select,value,title){const node=el('option',title);node.value=value;select.append(node);}
const device=field(fields,'문제가 생긴 곳',el('select'),'trouble-device');
option(device,'unknown','기기 종류를 잘 모르겠어요');option(device,'pc','Windows 컴퓨터');option(device,'mac','Mac · 맥북 · 아이맥');option(device,'android','Android · 갤럭시 등');option(device,'ios','아이폰 · 아이패드');option(device,'browser','Chrome·Edge 확장 프로그램');option(device,'other','그 밖의 기기 · Linux 등');
option(device,'chzzk','치지직 계정 연결');option(device,'key-screen','NUV 키 화면');
const identify=el('details');identify.className='device-help';identify.append(el('summary','내 기기 종류를 확인하는 방법'));
identify.append(el('p','이 도움말을 보고 있는 기기가 아니라, NUV가 안 되는 기기를 확인해 주세요. 컴퓨터나 휴대폰이라는 것만 알아도 괜찮아요.'));
const identifyList=el('ul');['컴퓨터의 설정에서 Windows라는 이름이 보이면 Windows 컴퓨터를 선택하세요.', '화면 왼쪽 위 사과 메뉴의 ‘이 Mac에 관하여’에서 macOS를 확인할 수 있으면 Mac을 선택하세요.', '휴대폰 설정의 ‘휴대전화 정보’ 또는 ‘소프트웨어 정보’에서 Android라는 이름이 보이면 Android를 선택하세요.', '아이폰·아이패드는 설정 → 일반 → 정보에서 기기 이름과 iOS·iPadOS 버전을 확인할 수 있어요.', '여전히 모르겠다면 선택을 그대로 두세요. ‘삼성 노트북’, ‘애플 휴대폰’처럼 아는 말로 적어도 됩니다. 브랜드만으로 운영체제를 단정하지 않습니다.'].forEach(text=>identifyList.append(el('li',text)));identify.append(identifyList);fields.append(identify);
const symptom=field(fields,'현재 증상',el('select'),'trouble-symptom');
const result=el('div');result.className='trouble-result';result.setAttribute('aria-live','polite');advanced.append(result);
const report=el('details');report.className='inquiry-summary';report.append(el('summary','해결되지 않았나요? 문의용 정보 정리'));
report.append(el('p','아래 정보는 자동 전송하거나 저장하지 않습니다. 비밀번호·인증키·개인정보는 입력하지 마세요.'));
const reportFields=el('div');reportFields.className='trouble-fields';report.append(reportFields);
const environment=field(reportFields,'기기에 대해 아는 것만 적어 주세요 (선택)',el('input'),'trouble-environment');environment.placeholder='예: 삼성 노트북, 아이폰, 잘 모르겠어요';environment.maxLength=200;
const version=field(reportFields,'NUV·확장 버전 (모르면 비워 두세요)',el('input'),'trouble-version');version.maxLength=120;
const error=field(reportFields,'오류 문구와 발생 순서',el('textarea'),'trouble-error');error.rows=4;error.maxLength=1500;
const summary=field(report,'문의용 요약',el('textarea'),'trouble-summary');summary.rows=10;summary.readOnly=true;
const copy=el('button','요약 복사');copy.type='button';const copyStatus=el('p');copyStatus.setAttribute('role','status');report.append(copy,copyStatus);advanced.append(report);
let current=null,answers=new Map(),question='',resolved=false;
function renderFirstAid(){
 first.replaceChildren();advanced.hidden=true;const aid=window.NUVTroubleshooting.firstAid(question);
 first.append(el('h3',aid.title));const list=el('ol');aid.steps.forEach(step=>list.append(el('li',step)));first.append(list);
 const related=el('details');related.append(el('summary','관련 사용법 보기'));aid.sources.forEach(id=>{const article=articles.find(a=>a.id===id),link=el('a',article.title+' →');link.href='#guide/'+id;related.append(link);});first.append(related);
 const controls=el('div');controls.className='help-feedback';const yes=el('button','해결됐어요'),no=el('button','해봤는데 안 돼요');yes.type=no.type='button';const outcome=el('p');outcome.setAttribute('role','status');controls.append(yes,no);first.append(controls,outcome);
 yes.addEventListener('click',()=>{resolved=true;advanced.hidden=true;outcome.textContent='다행이에요. 추가 정보를 입력하지 않아도 됩니다.';updateReport();});
 no.addEventListener('click',()=>{resolved=false;outcome.textContent='아래에서 기기와 증상에 맞는 다음 방법을 확인해 주세요.';advanced.hidden=false;updateReport();advanced.scrollIntoView({block:'start',behavior:'smooth'});device.focus();});
}
function updateReport(){
 const lines=['NUV 문제 확인','문제가 생긴 곳: '+device.selectedOptions[0].textContent,'증상: '+symptom.selectedOptions[0].textContent];
 if(question)lines.push('검색한 질문: '+question);
 lines.push('환경: '+(environment.value.trim()||'미확인'),'버전: '+(version.value.trim()||'미확인'),'오류 문구·발생 순서: '+(error.value.trim()||'미입력'),'확인 결과:');
 if(current)current.checks.forEach((check,i)=>{const answer=answers.get(i);lines.push('- '+check.title+' → '+(answer===undefined?'미확인':check.options[answer].label));});
 else lines.push('- 기기 또는 증상에 대한 추가 확인 필요. 운영체제와 원인은 추정하지 않음.');
 lines.push('해결 상태: '+(resolved?'사용자가 해결됨으로 표시':'해결 여부 미확인'),'안내 기준: NUV 사용설명서 '+window.NUV_HELP_DATA.version+' · 원인 확정 아님');summary.value=lines.join('\n');copyStatus.textContent='';
}
function render(){
 answers.clear();resolved=false;report.open=false;result.replaceChildren();current=scenarios.find(s=>s.id===symptom.value)||null;
 if(!current){
  const title=device.value==='unknown'?'잘 몰라도 괜찮아요. 화면에 보이는 것부터 확인해요.':device.value==='mac'?'Mac에서 무엇을 열려고 했나요?':device.value==='ios'?'아이폰·아이패드는 웹 리모컨 안내를 확인해요.':'이 기기에 맞는 방법을 먼저 확인해요.';result.append(el('h3',title));
  if(device.value==='mac'||device.value==='other')result.append(el('p','현재 자료에서 확인되는 설치 안내는 Windows용 NUV.exe와 Android용 앱입니다. Mac·다른 운영체제용 설치 앱의 제공 여부는 이 자료로 확인되지 않습니다. Windows용 파일의 실행 절차를 그대로 적용하지 않고, 받은 파일 이름과 사용하려는 방식을 먼저 확인해야 합니다.'));
  else if(device.value==='ios'){result.append(el('p','현재 설명서의 아이폰 사용법은 실행 중인 PC NUV에 웹 브라우저로 연결하는 방식입니다. Android 설치 파일을 아이폰에 설치하는 안내가 아닙니다.'));const link=el('a','아이폰·웹 리모컨 연결 순서 보기 →');link.href='#guide/guide-18-1';result.append(link);}
  else result.append(el('p','Windows나 Android라고 가정하지 않을게요. 기기 종류를 모르더라도 어떤 것을 눌렀고 화면이 어떻게 변했는지 알려 주면 확인을 시작할 수 있어요.'));
  const steps=el('ol');['열려고 한 것이 NUV 아이콘인지, 다운로드한 파일인지, 인터넷 주소인지 확인해 주세요. 이름을 모르겠으면 보이는 글자만 적어도 됩니다.', '아무 반응 없음 / 잠깐 켜졌다 꺼짐 / 안내창이 뜸 중 어떤 모습인지 ‘현재 증상’에서 골라 주세요.', '안내창이 있다면 문구를 그대로 적어 주세요. 없으면 ‘아무 문구 없음’이라고 적어 주세요. 모르는 버전이나 설정은 비워 둬도 됩니다.'].forEach(text=>steps.append(el('li',text)));result.append(steps);
  const note=el('button','화면에 보이는 상황 적기');note.type='button';note.addEventListener('click',()=>{report.open=true;error.focus();});result.append(note);updateReport();return;
 }
 result.append(el('h3',current.title));const possible=el('p',current.possible);possible.className='source-context';result.append(possible);
 const progress=el('p');progress.className='help-status';result.append(progress);
 const updateProgress=()=>{progress.textContent=current.checks.length+'개 확인 항목 중 '+answers.size+'개 응답 · ‘모름’은 원인 확인 완료를 뜻하지 않습니다.';};
 current.checks.forEach((check,i)=>{
  const card=el('section');card.className='trouble-check';card.append(el('h4',(i+1)+'. '+check.title),el('p',check.action));
  const select=field(card,(i+1)+'번 확인 결과',el('select'),'trouble-check-'+i);option(select,'','확인 결과를 선택하세요');check.options.forEach((answer,j)=>option(select,String(j),answer.label));
  const advice=el('p');advice.className='trouble-advice';advice.hidden=true;card.append(advice);
  select.addEventListener('change',()=>{if(select.value===''){answers.delete(i);advice.hidden=true;}else{answers.set(i,Number(select.value));advice.textContent=check.options[Number(select.value)].advice;advice.hidden=false;}resolved=false;outcome.textContent='';updateProgress();updateReport();});result.append(card);
 });
 const sources=el('details');sources.append(el('summary','관련 설정 방법 펼쳐보기'));current.sources.forEach(id=>{const article=articles.find(a=>a.id===id),link=el('a',article.title+' →');link.href='#guide/'+id;sources.append(link);});result.append(sources);
 const feedback=el('div');feedback.className='help-feedback';const yes=el('button','이제 해결됐어요'),no=el('button','확인해도 안 돼요');yes.type=no.type='button';feedback.append(yes,no);const outcome=el('p');outcome.setAttribute('role','status');result.append(feedback,outcome);
 yes.addEventListener('click',()=>{resolved=true;outcome.textContent='해결된 상태로 요약에 표시했어요. 실제 원인을 확정한 것은 아닙니다.';updateReport();});
 no.addEventListener('click',()=>{resolved=false;outcome.textContent='아래에 환경·버전·오류 문구를 더하면 문의용 요약에 함께 정리됩니다.';report.open=true;updateReport();report.scrollIntoView({block:'start',behavior:'smooth'});});
 updateProgress();updateReport();
}
function fillSymptoms(selected){symptom.replaceChildren();const available=scenarios.filter(s=>s.device===device.value);available.forEach(s=>option(symptom,s.id,s.title));if(!available.length){option(symptom,'silent','눌러도 아무 반응이 없어요');option(symptom,'closes','잠깐 켜졌다가 꺼져요');option(symptom,'message','안내창이나 오류 문구가 떠요');option(symptom,'connection','다른 기기와 연결이 안 돼요');}option(symptom,'other','다른 문제 / 어떻게 설명할지 모르겠어요');if(selected&&[...symptom.options].some(o=>o.value===selected))symptom.value=selected;else symptom.value='other';render();}
device.addEventListener('change',()=>{question='';environment.value='';version.value='';error.value='';fillSymptoms();});symptom.addEventListener('change',render);
[environment,version,error].forEach(node=>node.addEventListener('input',updateReport));
copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(summary.value);copyStatus.textContent='복사했어요. 내용을 확인한 뒤 원하는 문의 창에 붙여넣으세요.';}catch{summary.focus();summary.select();copyStatus.textContent='자동 복사를 사용할 수 없어 요약을 선택했어요. 직접 복사해 주세요.';}});
document.querySelector('.example-note').after(box);fillSymptoms();report.open=false;renderFirstAid();
window.NUVTroubleshootingUI={close(){box.open=false;},open(query=''){
 question=String(query).slice(0,500);const q=question.toLowerCase().replace(/\s/g,'');let id='other';
 if(/obs|오비에스/.test(q))id='pc-obs';
 else if(/확장/.test(q))id=/업데이트/.test(q)?'browser-update':/연결/.test(q)?'browser-connect':'browser-video';
 else if(/넷플|유튜브|영상|회차|이전화|다음화/.test(q))id='browser-video';
 else if(/휴대폰|폰|모바일|안드로이드|android/.test(q))id=/업데이트|설치|차단/.test(q)?'android-update':/길게|꾹/.test(q)?'android-edit':/연결/.test(q)?'android-connect':'android-key';
 else if(/업데이트/.test(q))id='pc-update';
 else if(/f키|f[0-9]/.test(q))id='pc-fkey';
 else if(/꺼져|꺼짐|종료/.test(q))id='pc-close';
 else if(/보안|경고|차단|오류창/.test(q))id='pc-error';
 else if(/키로|프로그램/.test(q))id='pc-key';
 else if(/nuv|실행|무반응/.test(q))id='pc-launch';
 // Do not infer Windows from “PC” or Android from “phone”. Explicit identification only.
 device.value=window.NUVTroubleshooting.inferDevice(query);
 if(device.value==='unknown'||['mac','ios','other'].includes(device.value))id=/꺼져|꺼짐/.test(q)?'closes':/오류|경고|문구/.test(q)?'message':/연결/.test(q)?'connection':/안열|실행|무반응/.test(q)?'silent':'other';
 if(window.NUVHelpSearch.isKeyVisibility(query)){device.value='key-screen';id='key-screen';}
 if(window.NUVTroubleshooting.isChzzkConnection(query)){device.value='chzzk';id='chzzk-connect';}
 if(!scenarios.some(s=>s.id===id&&s.device===device.value)&&scenarios.some(s=>s.id===id))id='other';
 fillSymptoms(id);renderFirstAid();box.open=true;box.scrollIntoView({block:'start',behavior:'smooth'});
}};
})();
