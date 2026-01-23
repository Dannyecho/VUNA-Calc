var left='', operator='', right='';
var ttsLang='fr-FR'; // default French
var history=[];

function appendToResult(value){ operator===''?left+=value:right+=value; updateResult();}
function bracketToResult(value){ operator===''?left+=value:right+=value; updateResult();}
function backspace(){ if(right.length>0) right=right.slice(0,-1); else if(operator.length>0) operator=''; else if(left.length>0) left=left.slice(0,-1); updateResult();}
function operatorToResult(value){ if(left==='') return; if(right!=='') calculateResult(); operator=value; updateResult();}
function clearResult(){ left=right=operator=''; document.getElementById('word-result').innerHTML=''; document.getElementById('word-area').style.display='none'; updateResult(); }

function calculateResult(){ 
  if(left===''||(operator!=='' && right==='')) return;
  let l=parseFloat(left), r=parseFloat(right), res;
  switch(operator){
    case '+': res=l+r; break;
    case '-': res=l-r; break;
    case '*': res=l*r; break;
    case '/': res=r!==0?l/r:'Erreur'; break;
    case '^': res=Math.pow(l,r); break;
    default: res=parseFloat(left);
  }
  // Add to history
  if(left && operator){ history.push(left+' '+operator+' '+right+' = '+res); updateHistory();}
  left=res.toString(); operator=''; right=''; updateResult();
}

// Scientific
function calculateSqrt(){ 
  if(left){ 
    
    left=Math.sqrt(parseFloat(left)); updateResult();
  } 
}
function calculateSquare(){ if(left){ left=Math.pow(parseFloat(left),2); updateResult();} }
function calculateSin(){ if(left){ left=Math.sin(parseFloat(left)*Math.PI/180); updateResult();} }
function calculateCos(){ if(left){ left=Math.cos(parseFloat(left)*Math.PI/180); updateResult();} }
function calculateTan(){ if(left){ left=Math.tan(parseFloat(left)*Math.PI/180); updateResult();} }

function numberToWords(num){
  if(num==='Erreur') return 'Erreur';
  if(num==='') return '';
  const n=parseFloat(num);
  if(isNaN(n)) return '';
  return new Intl.NumberFormat(ttsLang==='fr-FR'?'fr-FR':'en-US', {style:'decimal'}).format(n);
}

function updateResult(){
  document.getElementById('result').value = left + (operator? ' '+operator+' ' : '') + right || '0';
  const wordEl=document.getElementById('word-result');
  const area=document.getElementById('word-area');
  if(left && operator==='' && right===''){
    wordEl.innerHTML='<span class="small-label">Résultat en mots</span><strong>'+numberToWords(left)+'</strong>';
    area.style.display='flex';
  }else{ wordEl.innerHTML=''; area.style.display='none'; }
  enableSpeakButton();
}

function speakResult(){
  const words=document.querySelector('#word-result strong')?.innerText || '';
  if(!words) return;
  const btn=document.getElementById('speak-btn');
  if(window.speechSynthesis.speaking){ window.speechSynthesis.cancel(); btn.classList.remove('speaking'); return; }
  const u=new SpeechSynthesisUtterance(words);
  u.lang=ttsLang;
  u.rate=0.9;
  u.onstart=()=>btn.classList.add('speaking'); u.onend=()=>btn.classList.remove('speaking');
  window.speechSynthesis.speak(u);
}

function enableSpeakButton(){ document.getElementById('speak-btn').disabled=document.getElementById('word-result').innerHTML.trim().length===0; }

function toggleLang(){ ttsLang=ttsLang==='fr-FR'?'en-US':'fr-FR'; }

function updateHistory(){
  const panel=document.getElementById('history-panel');
  panel.innerHTML='';
  history.slice(-10).reverse().forEach(item=>{
    const div=document.createElement('div'); div.className='history-item'; div.innerText=item;
    panel.appendChild(div);
  });
}
