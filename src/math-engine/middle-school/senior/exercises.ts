import type { SeniorExercise } from "./types";

function randInt(m:number,M:number):number{return Math.floor(Math.random()*(M-m+1))+m}
function nz(m:number,M:number):number{let v=0;while(v===0)v=randInt(m,M);return v}

export function generateSeniorExercise(chapterId:string,difficulty:SeniorExercise["difficulty"]):SeniorExercise|null{
  if(chapterId==="sn-sets"){
    const A=randInt(1,5),B=randInt(1,5),C=randInt(1,5),D=A+B<8?randInt(A+B+1,9):randInt(1,5);
    return{id:`sen_${Date.now()}`,chapterId,difficulty,targetConcepts:["集合运算"],question:`A=${"{"}${[...Array(A)].map((_,i)=>i+1).join(",")}${"}"},B=${"{"}${[...Array(B)].map((_,i)=>i+A+1).join(",")}${"}"},求A∪B。`,
      questionLatex:`A=\\{${[...Array(A)].map((_,i)=>i+1).join(",")}\\},B=\\{${[...Array(B)].map((_,i)=>i+A+1).join(",")}\\}`,
      answer:`${"{"}1${Array.from({length:A+B-1},(_,i)=>","+(i+2)).join("")}${"}"}`,answerLatex:`\\{1,2,\\ldots,${A+B}\\}`,
      solution:[{description:"并集=所有元素合起来",latex:`A\\cup B=\\{1,2,\\ldots,${A+B}\\}`}],hints:["A∪B包含所有属于A或属于B的元素"],errorAnalysis:{}};
  }
  if(chapterId==="sn-quadratic"){
    const a=nz(1,3),b=randInt(-5,5),c=randInt(-5,5);const D=b*b-4*a*c;
    if(D<=0)return generateSeniorExercise(chapterId,difficulty);
    const r1=(-b+Math.sqrt(D))/(2*a),r2=(-b-Math.sqrt(D))/(2*a);
    return{id:`sen_${Date.now()}`,chapterId,difficulty,targetConcepts:["二次不等式"],
      question:`解不等式${a===1?"":" "+a}x²${b>=0?"+":""}${b}x${c>=0?"+":""}${c}>0`,questionLatex:`${a===1?"":a+"\\\\cdot"}x^2${b>=0?"+":""}${b}x${c>=0?"+":""}${c}>0`,
      answer:`x<${r2.toFixed(1)}或x>${r1.toFixed(1)}`,answerLatex:`x<${r2.toFixed(1)}\\text{ 或 }x>${r1.toFixed(1)}`,
      solution:[{description:`Δ=${D.toFixed(0)}>0,两根为${r2.toFixed(1)}和${r1.toFixed(1)}`,latex:`x_1=${r2.toFixed(1)},x_2=${r1.toFixed(1)}`},{description:"a>0开口向上，>号取两边",latex:`x<${r2.toFixed(1)}\\text{或}x>${r1.toFixed(1)}`}],hints:["先解方程求根","a>0时开口向上"],errorAnalysis:{}};
  }
  if(chapterId==="sn-func-props"){
    return{id:`sen_${Date.now()}`,chapterId,difficulty,targetConcepts:["奇偶性"],
      question:`判断f(x)=x³+2x的奇偶性。`,questionLatex:`f(x)=x^3+2x`,
      answer:"奇函数",answerLatex:`\\text{奇函数}`,
      solution:[{description:"f(-x)=(-x)³+2(-x)",latex:"-x^3-2x"},{description:"=-(x³+2x)=-f(x)",latex:"=-f(x)"},{description:"所以是奇函数",latex:"\\text{奇函数}"}],hints:["检查f(-x)是否等于-f(x)或f(x)"],errorAnalysis:{}};
  }
  if(chapterId==="sn-sequences"){
    const a1=nz(1,5),d=nz(-3,5),n=randInt(3,8);const an=a1+(n-1)*d,Sn=n*(a1+an)/2;
    return{id:`sen_${Date.now()}`,chapterId,difficulty,targetConcepts:["等差数列"],
      question:`等差数列a₁=${a1},d=${d},求S${n}。`,questionLatex:`a_1=${a1},d=${d},S_{${n}}=?`,
      answer:`${Sn}`,answerLatex:`S_{${n}}=${Sn}`,
      solution:[{description:`a${n}=${a1}+${n-1}×${d}=${an}`,latex:`a_{${n}}=${an}`},{description:`S${n}=${n}×(${a1}+${an})/2=${Sn}`,latex:`S_{${n}}=${Sn}`}],hints:["先用aₙ=a₁+(n-1)d求末项","再用Sₙ=n(a₁+aₙ)/2求和"],errorAnalysis:{}};
  }
  if(chapterId==="sn-derivatives"){
    const a=nz(1,3),b=nz(-6,6),c=Math.floor((b*b)/(4*a))+1;
    return{id:`sen_${Date.now()}`,chapterId,difficulty,targetConcepts:["极值"],
      question:`求f(x)=${a===1?"":a}x²${b>=0?"+":""}${b}x+${c}的极值。`,questionLatex:`f(x)=${a}x^2${b>=0?"+":""}${b}x+${c}`,
      answer:`极小值${c-(b*b)/(4*a)}`,answerLatex:`f_{\\min}=${(c-(b*b)/(4*a)).toFixed(1)}`,
      solution:[{description:`f'(x)=${2*a}x${b>=0?"+":""}${b}`,latex:`f'(x)=${2*a}x${b>=0?"+":""}${b}`},{description:`令f'(x)=0,得x=${-b/(2*a)}`,latex:`x=${-b/(2*a)}`},{description:`f''(x)=${2*a}>0,极小值`,latex:`f_{\\min}=${(c-(b*b)/(4*a)).toFixed(1)}`}],hints:["求导","令导数为零得驻点","二阶导数判断极小/极大"],errorAnalysis:{}};
  }
  return null;
}
