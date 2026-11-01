'use strict';
const data=window.NUV_HELP_DATA,engine=window.NUVHelpSearch;
const nav=[...document.querySelectorAll('nav a')];
const articleMap=new Map(data.articles.map(a=>[a.id,a]));
const index=document.querySelector('#manual-index');
function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
function renderLines(article,target){
 if(article.context)target.append(element('p',article.context,'source-context'));
 let list=null,table=null;
 for(const line of article.lines){
 if(/^Free\s+Standard\s+Pro/.test(line)){table=element('table');const row=element('tr');['항목','Free','Standard','Pro'].forEach(text=>row.append(element('th',text)));table.append(row);target.append(table);continue;}
 if(table){const cells=line.split(/\s{2,}/);if(cells.length===4){const row=element('tr');cells.forEach(text=>row.append(element('td',text)));table.append(row);continue;}table=null;}
 const numbered=/^\d+\)\s*/.test(line),bullet=line.startsWith('•');if(numbered||bullet){const type=numbered?'OL':'UL';if(!list||list.tagName!==type){list=document.createElement(type.toLowerCase());target.append(list);}list.append(element('li',line.replace(/^\d+\)\s*|^•\s*/,'')));}else{list=null;target.append(element('p',line));}}
}
const supportingGuides={
 'guide-20-3':['guide-10-4'], 'guide-21-1':['guide-5-1','guide-3-2'],
 'guide-21-6':['guide-7-1'], 'guide-21-7':['guide-7-5'],
 'guide-21-8':['guide-10-1','guide-20-4'], 'guide-21-9':['guide-10-2'],
 'guide-21-11':['guide-5-7'], 'guide-21-12':['guide-12-1','guide-12-2'],
 'guide-21-13':['guide-5-4'], 'guide-21-14':['guide-20-1','guide-20-2','guide-10-4']
};
function renderGuide(article,target,includeSupport=true){
 const guide=article.walkthrough;
 if(guide){
  target.append(element('p',guide.intro,'walkthrough-intro'));
  if(article.context)target.append(element('p',article.context,'source-context'));
  for(const [key,title,tag] of [['prepare','시작하기 전에','ul'],['steps','따라 해 보세요','ol'],['expected','이렇게 되면 완료예요','p'],['checks','안 될 때 확인하세요','ul']]){
   if(!guide[key]?.length)continue;
   const section=element('section',undefined,'walkthrough-section');section.append(element('h3',title));
   const body=element(tag);if(Array.isArray(guide[key]))guide[key].forEach(text=>body.append(element('li',text)));else body.textContent=guide[key];section.append(body);target.append(section);
  }
  const sources=element('details',undefined,'walkthrough-sources');sources.append(element('summary','이 안내의 근거·관련 사용법'));
  sources.append(element('p','사용설명서의 공통 절차와 기능별 설명을 합쳐 작성한 안내입니다.'));
  for(const id of guide.sources){const source=articleMap.get(id),link=element('a',source.title+' →');link.href='#guide/'+id;sources.append(link);}target.append(sources);
 }else renderLines(article,target);
 if(includeSupport){
  const ids=supportingGuides[article.id]||(!guide&&article.chapter===5&&article.id!=='guide-5-1'?['guide-5-1']:[]);
  for(const id of ids){const source=articleMap.get(id),details=element('details',undefined,'supporting-guide');details.append(element('summary',source.title+' · 자세한 순서 보기'));const body=element('div');renderGuide(source,body,false);details.append(body);target.append(details);}
 }
}
for(const chapter of data.chapters){
 const section=element('section',undefined,'manual-chapter');section.append(element('h2',chapter.title));
 for(const article of data.articles.filter(a=>a.chapter===chapter.number)){const details=element('details',undefined,'guide');details.id=article.id;details.append(element('summary',article.title));const contents=element('div',undefined,'manual-content');renderGuide(article,contents);details.append(contents);section.append(details);}
 index.append(section);
}
const browseTools=element('div',undefined,'manual-filter'),browseLabel=element('label','기능 목록에서 찾기'),browseInput=element('input');
browseInput.id='manual-filter';browseInput.type='search';browseInput.placeholder='기능 이름이나 관련 단어를 입력하세요';browseLabel.htmlFor=browseInput.id;
const browseCount=element('p',undefined,'help-status');browseCount.setAttribute('role','status');
browseTools.append(browseLabel,browseInput,browseCount);index.before(browseTools);
function filterManual(){
 const words=browseInput.value.trim().split(/\s+/).filter(Boolean).map(engine.normalize);let count=0;
 for(const article of data.articles){const details=document.getElementById(article.id),text=engine.normalize([article.chapterTitle,article.title,article.context||'',...article.lines].join(' '));details.hidden=!words.every(word=>text.includes(word));if(!details.hidden)count++;}
 index.querySelectorAll('.manual-chapter').forEach(section=>{section.hidden=![...section.querySelectorAll('.guide')].some(details=>!details.hidden);});
 browseCount.textContent=count?'전체 '+data.articles.length+'개 중 '+count+'개 안내':'해당 단어가 포함된 안내가 없어요. 다른 단어를 입력하거나 검색어를 지워 전체 목록을 보세요.';
}
browseInput.addEventListener('input',filterManual);filterManual();
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#guide/')){browseInput.value='';filterManual();const detail=document.getElementById(location.hash.split('/')[1]);if(detail)detail.scrollIntoView({block:'start'});}});
function showPage(){const [desired,id]=location.hash.slice(1).split('/');const section=['install','guide','notes','help'].includes(desired)?desired:'install';document.querySelectorAll('.view').forEach(view=>{view.hidden=view.id!==section;});nav.forEach(link=>{if(link.hash==='#'+section)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});document.title='NUV '+({install:'설치',guide:'사용법',notes:'패치노트',help:'도움말'})[section];if(section==='guide'&&articleMap.has(id)){const details=document.getElementById(id);details.open=true;details.scrollIntoView({block:'start',behavior:'instant'});}else window.scrollTo({top:0,behavior:'instant'});}
window.addEventListener('hashchange',showPage);showPage();
const input=document.querySelector('#help-question'),panel=document.querySelector('.help-answer');let activeQuestion='';
function addSearchRoutes(target){
 const routes=element('div',undefined,'search-routes');routes.append(element('p','선택지는 추천 안내예요. 원하는 항목이 없으면 직접 질문하거나 전체 목록에서 찾을 수 있어요.'));
 const edit=element('button','질문 직접 입력·수정');edit.type='button';edit.addEventListener('click',()=>{input.focus();input.select();input.scrollIntoView({block:'center',behavior:'smooth'});});
 const browse=element('a','전체 기능 목록 보기 →');browse.href='#guide';browse.addEventListener('click',()=>{browseInput.value='';filterManual();});
 const troubleshoot=element('button','증상별 확인 순서');troubleshoot.type='button';troubleshoot.addEventListener('click',()=>window.NUVTroubleshootingUI.open(input.value));
 routes.append(edit,browse,troubleshoot);target.append(routes);
}

function showArticle(article,related=[],topic=null){
 panel.replaceChildren();panel.hidden=false;panel.append(element('span','사용설명서에서 찾은 안내','answer-label'),element('h2',topic?topic.title:article.title));
 if(topic)panel.append(element('p',topic.description,'walkthrough-intro'));
 const content=element('div',undefined,'answer-content');renderGuide(article,content);panel.append(content);
 const source=element('div',undefined,'answer-links'),anchor=element('a',article.chapterTitle+' · 원문 보기 →');anchor.href='#guide/'+article.id;source.append(anchor);source.append(element('p','자료 기준: '+data.version+' · PC '+data.versions.pc+' / Android '+data.versions.android+' / 확장 '+data.versions.extension,'source-version'));panel.append(source);
 if(related.length){const items=element('div',undefined,'related-articles');items.append(element('h3','다른 검색 결과 ('+related.length+'개)'));let shown=0;const more=element('button');more.type='button';const list=element('div');
 const reveal=()=>{related.slice(shown,shown+3).forEach(result=>{const button=element('button',result.article.title+' · '+result.article.chapterTitle);button.type='button';button.addEventListener('click',()=>showArticle(result.article,[{id:article.id,article},...related.filter(r=>r.id!==result.id)]));list.append(button);});shown=Math.min(shown+3,related.length);more.hidden=shown===related.length;more.textContent='검색 결과 더 보기 ('+(related.length-shown)+'개 남음)';};
 more.addEventListener('click',reveal);reveal();items.append(list,more);panel.append(items);}
 addSearchRoutes(panel);
 const feedback=element('div',undefined,'help-feedback');feedback.append(element('span','이 안내로 해결되었나요?'));const yes=element('button','해결됐어요'),no=element('button','아직 안 돼요');yes.type=no.type='button';const outcome=element('p');outcome.hidden=true;
 const summary=element('details',undefined,'inquiry-summary');summary.hidden=true;summary.append(element('summary','문의용 요약 보기'));const text=element('textarea');text.readOnly=true;text.setAttribute('aria-label','문의용 요약');text.rows=7;text.value='질문: '+activeQuestion+'\n확인한 안내: '+article.title+'\n자료 기준: '+data.version+'\n사용 기기: \n설치 버전: \n표시된 오류: \n시도한 방법: ';summary.append(text);
 yes.addEventListener('click',()=>{outcome.textContent='다른 궁금한 점이 있으면 질문해 주세요.';outcome.hidden=false;summary.hidden=true;});no.addEventListener('click',()=>{outcome.textContent='사용 기기, NUV 버전, 누른 동작과 오류 문구를 함께 확인해 주세요. 아래 요약을 선택해 복사하면 문의할 때 사용할 수 있습니다. 자동으로 전송되지는 않습니다.';outcome.hidden=false;summary.hidden=false;});feedback.append(yes,no);panel.append(feedback,outcome,summary);
}
function search(query){activeQuestion=query.trim();const result=engine.search(data,query);if(result.status==='empty'){input.focus();return;}window.NUVTroubleshootingUI?.close();if(engine.isKeyVisibility(query)&&window.NUVTroubleshootingUI){panel.hidden=true;window.NUVTroubleshootingUI.open(query);return;}const normalized=engine.normalize(query);if(result.status!=='clarify'&&!['usage','definition'].includes(result.intent)&&window.NUVTroubleshootingUI&&(['guide-2-1','guide-5-4','guide-7-1','guide-10-1','guide-10-2','guide-10-4','guide-12-1','guide-12-2','guide-13-2','guide-17-1','guide-17-2','guide-17-3','guide-20-1','guide-20-2','guide-20-3','guide-21-2','guide-21-3','guide-21-4','guide-21-6','guide-21-8','guide-21-9','guide-21-12','guide-21-14'].includes(result.results[0]?.id))&&/(안돼|안되|안됨|안열|않|오류|실패|느리|늦|무반응|차단|꺼져|꺼짐)/.test(normalized)&&/(nuv|앱|키|실행|연결|폰|모바일|넷플|유튜브|치지직|chzzk|obs|확장|업데이트)/.test(normalized)){panel.hidden=true;window.NUVTroubleshootingUI.open(query);return;}if(result.status==='found'){showArticle(result.results[0].article,result.results.slice(1),result.topic);return;}panel.replaceChildren();panel.hidden=false;panel.append(element('h2',result.status==='clarify'?result.prompt:'관련 안내를 찾지 못했어요.'));panel.append(element('p',result.status==='clarify'?'해당하는 항목이 있으면 선택해 주세요. 아래 항목만 질문할 수 있는 것은 아니에요.':'사용 중인 앱이나 기능 이름과 증상을 함께 적어 주세요. 자료에 없는 해결 방법은 확인되지 않은 상태입니다.'));(result.choices||[]).forEach(choice=>{const button=element('button',choice,'followup-choice');button.type='button';button.addEventListener('click',()=>{input.value=choice;search(choice);});panel.append(button);});addSearchRoutes(panel);}
document.querySelector('.help-form').addEventListener('submit',event=>{event.preventDefault();search(input.value);});
const recommended={install:'PC 설치 방법',connect:'휴대폰 PC 연결이 안 돼요',keys:'PC 키 설정 단축키',update:'업데이트 확인이 안 돼요'};
document.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>{input.value=recommended[button.dataset.question];search(input.value);}));
