// ================= BASIC CALCULATOR VARIABLES =================
var left = '';
var operator = '';
var right = '';

// ================= BASIC CALCULATOR FUNCTIONS =================
function appendToResult(value) {
    if (operator.length === 0) left += value.toString();
    else right += value.toString();
    updateResult();
}

function bracketToResult(value) {
    if (operator.length === 0) left += value;
    else right += value;
    updateResult();
}

function backspace() {
    if (right.length > 0) right = right.slice(0, -1);
    else if (operator.length > 0) operator = '';
    else if (left.length > 0) left = left.slice(0, -1);
    updateResult();
}

function operatorToResult(value) {
    if (left.length === 0) return;
    if (right.length > 0) calculateResult();
    operator = value;
    updateResult();
}

function clearResult() {
    left = '';
    right = '';
    operator = '';
    document.getElementById('word-result').innerHTML = '';
    document.getElementById('word-area').style.display = 'none';
    updateResult();
}

function calculateResult() {
    if (!left || !operator || !right) return;

    let result;
    const l = parseFloat(left);
    const r = parseFloat(right);

    switch (operator) {
        case '+': result = l + r; break;
        case '-': result = l - r; break;
        case '*': result = l * r; break;
        case '/': result = r !== 0 ? l / r : 'Error'; break;
        default: return;
    }

    left = result.toString();
    operator = '';
    right = '';
    updateResult();
}

// ================= NUMBER TO WORDS =================
function numberToWords(num) {
    if (num === 'Error') return 'Error';
    if (num === '') return '';

    const n = parseFloat(num);
    if (isNaN(n)) return '';
    if (n === 0) return 'Zero';

    const ones = ['', 'One','Two','Three','Four','Five','Six','Seven','Eight','Nine'];
    const tens = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const teens = ['Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const scales = ['', 'Thousand','Million','Billion','Trillion'];

    function convertGroup(val) {
        let res='';
        if(val>=100){ res+=ones[Math.floor(val/100)]+' Hundred '; val%=100;}
        if(val>=10&&val<=19) res+=teens[val-10]+' ';
        else if(val>=20) res+=tens[Math.floor(val/10)]+(val%10?'-'+ones[val%10]:'')+' ';
        else if(val>0) res+=ones[val]+' ';
        return res.trim();
    }

    let sign=n<0?'Negative ':'';
    let absN=Math.abs(n);
    let parts=absN.toString().split('.');
    let integerPart=parseInt(parts[0]);
    let decimalPart=parts[1];

    let wordArr=[];
    if(integerPart===0) wordArr.push('Zero');
    else{
        let scaleIdx=0;
        while(integerPart>0){
            let chunk=integerPart%1000;
            if(chunk>0){
                let chunkWords=convertGroup(chunk);
                wordArr.unshift(chunkWords+(scales[scaleIdx]?' '+scales[scaleIdx]:''));
            }
            integerPart=Math.floor(integerPart/1000);
            scaleIdx++;
        }
    }

    let result=sign+wordArr.join(', ').trim();

    if(decimalPart){
        result+=' Point';
        for(let digit of decimalPart)
            result+=' '+(digit==='0'?'Zero':ones[parseInt(digit)]);
    }
    return result.trim();
}

// ================= UPDATE DISPLAY =================
function updateResult() {
    const display = left + (operator ? ' ' + operator + ' ' : '') + right;
    document.getElementById('result').value = display || '0';

    const wordResult = document.getElementById('word-result');
    const wordArea = document.getElementById('word-area');

    if (left && !operator && !right) {
        wordResult.innerHTML =
          '<span class="small-label">Result in words</span><strong>' +
          numberToWords(left) +
          '</strong>';
        wordArea.style.display = 'flex';
    } else {
        wordResult.innerHTML = '';
        wordArea.style.display = 'none';
    }
    enableSpeakButton();
}

// ================= SPEECH =================
function speakResult() {
    const speakBtn=document.getElementById('speak-btn');
    const words=document.querySelector('#word-result strong')?.innerText||'';
    if(!words) return;

    if(window.speechSynthesis.speaking){
        window.speechSynthesis.cancel();
        speakBtn.classList.remove('speaking');
        return;
    }

    const utterance=new SpeechSynthesisUtterance(words);
    utterance.rate=0.9;
    utterance.onstart=()=>speakBtn.classList.add('speaking');
    utterance.onend=()=>speakBtn.classList.remove('speaking');
    window.speechSynthesis.speak(utterance);
}

function enableSpeakButton() {
    const btn=document.getElementById('speak-btn');
    if(!btn) return;
    btn.disabled=!document.getElementById('word-result').innerHTML.trim();
}

// ================= COPY RESULT =================
function copyResult() {
    const text=document.getElementById('result').value;
    if(!text) return;
    navigator.clipboard.writeText(text)
    .then(()=>alert('Result copied!'))
    .catch(()=>alert('Failed to copy'));
}

// ================= PERCENT =================
function percentToResult(){
    if(!left) return;
    if(!operator){
        left=(parseFloat(left)/100).toString();
        updateResult();
        return;
    }
    if(!right) return;

    let result=(parseFloat(right)/100)*parseFloat(left);
    left=result.toString();
    operator='';
    right='';
    updateResult();
}

// ========================================================
// ================= FORMULA CALCULATOR ===================
// ========================================================

const formulas={
  geometry:{
    circleArea:{name:"Area of Circle",inputs:["Radius"],calc:v=>Math.PI*v[0]*v[0]},
    circleCircumference:{name:"Circumference of Circle",inputs:["Radius"],calc:v=>2*Math.PI*v[0]},
    triangleArea:{name:"Area of Triangle",inputs:["Base","Height"],calc:v=>0.5*v[0]*v[1]},
    rectangleArea:{name:"Area of Rectangle",inputs:["Length","Width"],calc:v=>v[0]*v[1]},
    squareArea:{name:"Area of Square",inputs:["Side"],calc:v=>v[0]*v[0]},
    cubeVolume:{name:"Volume of Cube",inputs:["Side"],calc:v=>v[0]**3},
    sphereVolume:{name:"Volume of Sphere",inputs:["Radius"],calc:v=>(4/3)*Math.PI*v[0]**3},
    cylinderVolume:{name:"Volume of Cylinder",inputs:["Radius","Height"],calc:v=>Math.PI*v[0]**2*v[1]},
    pythagoras:{name:"Pythagorean Theorem",inputs:["a","b"],calc:v=>Math.sqrt(v[0]**2+v[1]**2)},
    sphereSurface:{name:"Surface Area of Sphere",inputs:["Radius"],calc:v=>4*Math.PI*v[0]**2}
  },
  finance:{
    simpleInterest:{name:"Simple Interest",inputs:["Principal","Rate","Time"],calc:v=>(v[0]*v[1]*v[2])/100},
    compoundInterest:{name:"Compound Interest",inputs:["Principal","Rate","Time","n"],calc:v=>v[0]*(1+v[1]/100/v[3])**(v[3]*v[2])},
    percentage:{name:"Percentage",inputs:["Value","Total"],calc:v=>(v[0]/v[1])*100},
    discount:{name:"Discount Price",inputs:["Original Price","Discount %"],calc:v=>v[0]-(v[1]/100)*v[0]},
    profit:{name:"Profit/Loss",inputs:["Selling Price","Cost Price"],calc:v=>v[0]-v[1]}
  },
  algebra:{
    slope:{name:"Slope of Line",inputs:["x1","y1","x2","y2"],calc:v=>(v[3]-v[1])/(v[2]-v[0])},
    distance:{name:"Distance Between Points",inputs:["x1","y1","x2","y2"],calc:v=>Math.sqrt((v[2]-v[0])**2+(v[3]-v[1])**2)},
    average:{name:"Average",inputs:["Sum","Count"],calc:v=>v[0]/v[1]},
    speed:{name:"Speed",inputs:["Distance","Time"],calc:v=>v[0]/v[1]},
    quadratic:{name:"Quadratic Formula",inputs:["a","b","c"],calc:v=>(-v[1]+Math.sqrt(v[1]**2-4*v[0]*v[2]))/(2*v[0])}
  }
};

// Populate formulas
document.addEventListener("DOMContentLoaded",()=>{

  const category=document.getElementById("formulaCategory");
  const select=document.getElementById("formulaSelect");
  const container=document.getElementById("formulaInputs");

  if(!category) return;

  category.addEventListener("change",()=>{
    select.innerHTML='<option value="">Select Formula</option>';
    container.innerHTML='';
    if(!category.value) return;

    Object.entries(formulas[category.value]).forEach(([key,f])=>{
      select.innerHTML+=`<option value="${key}">${f.name}</option>`;
    });
  });

  select.addEventListener("change",()=>{
    container.innerHTML='';
    const f=formulas[category.value]?.[select.value];
    if(!f) return;

    f.inputs.forEach((label,i)=>{
      container.innerHTML+=`
        <input type="number" class="form-control mb-2"
        placeholder="${label}" id="f${i}">
      `;
    });
  });

});

// Calculate formula
function calculateFormula(){
  const category=document.getElementById("formulaCategory").value;
  const key=document.getElementById("formulaSelect").value;
  if(!category||!key) return;

  const formula=formulas[category][key];
  let values=[];

  for(let i=0;i<formula.inputs.length;i++)
    values.push(parseFloat(document.getElementById("f"+i).value)||0);

  const result=formula.calc(values);

  left=result.toString();
  operator="";
  right="";
  updateResult();
}