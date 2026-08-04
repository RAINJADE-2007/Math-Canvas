"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Point2D } from "@/math-engine/middle-school/geometry/triangle";
import { calcTriangleProps, isValidTriangle } from "@/math-engine/middle-school/geometry/triangle";

const COLORS = ["#2563eb","#dc2626","#10b981"];
const OX=160,OY=170,S=35;
function toSVG(p:Point2D){return{ x:OX+p.x*S, y:OY-p.y*S };}
function fromSVG(sx:number,sy:number,svgW:number,svgH:number,scale:number):Point2D{
  return{x:(sx-OX*svgW/320)/scale, y:(OY*svgH/220-sy)/scale};
}

function SvgDragHandler({ svgRef, points, onPointsChange, isValid }:{
  svgRef:React.RefObject<SVGSVGElement|null>;
  points:Point2D[];
  onPointsChange:(pts:Point2D[])=>void;
  isValid:(pts:Point2D[])=>boolean;
}){
  const [drag,setDrag]=useState<number|null>(null);
  const ptsRef=useRef(points); ptsRef.current=points;
  const [svgSize,setSvgSize]=useState({w:320,h:220});

  useEffect(()=>{
    const svg=svgRef.current; if(!svg)return;
    const onDown=(e:PointerEvent)=>{
      const rect=svg.getBoundingClientRect();
      setSvgSize({w:rect.width,h:rect.height});
      const mx=e.clientX-rect.left,my=e.clientY-rect.top;
      for(let i=0;i<3;i++){
        const p=toSVG(ptsRef.current[i]);
        if(Math.hypot(mx-p.x,my-p.y)<14){ setDrag(i); svg.setPointerCapture(e.pointerId); return; }
      }
    };
    const onMove=(e:PointerEvent)=>{
      if(drag===null)return;
      const rect=svg.getBoundingClientRect();
      const mx=e.clientX-rect.left,my=e.clientY-rect.top;
      const newPts=ptsRef.current.map((p,i)=>{
        if(i!==drag)return p;
        const x0=(mx-OX*rect.width/320)/S;
        const y0=(OY*rect.height/220-my)/S;
        return{x:Math.round(x0*10)/10,y:Math.round(y0*10)/10};
      });
      if((drag===null)||isValid(newPts)) onPointsChange(newPts);
    };
    const onUp=()=>{setDrag(null);svg.releasePointerCapture?.((drag??0)+1);};
    svg.addEventListener("pointerdown",onDown); svg.addEventListener("pointermove",onMove); svg.addEventListener("pointerup",onUp); svg.addEventListener("pointercancel",onUp);
    return()=>{svg.removeEventListener("pointerdown",onDown);svg.removeEventListener("pointermove",onMove);svg.removeEventListener("pointerup",onUp);svg.removeEventListener("pointercancel",onUp);};
  },[drag]);

  return null;
}

export function TrianglePropertiesLab() {
  const [pts,setPts]=useState<Point2D[]>([{x:0,y:0},{x:4,y:0},{x:1,y:3}]);
  const [showExtra,setShowExtra]=useState(false);
  const svgRef=useRef<SVGSVGElement>(null);
  const isValid=(p:Point2D[])=>isValidTriangle(p[0],p[1],p[2]);
  const props=useMemo(()=>calcTriangleProps(pts[0],pts[1],pts[2]),[pts]);
  const typed=props.isEquilateral?"等边":props.isRight&&props.isIsosceles?"等腰直角":props.isRight?"直角":props.isIsosceles?"等腰":props.isObtuse?"钝角":props.isAcute?"锐角":"一般";

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-700">📐 三角形基本性质</h4>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <svg ref={svgRef} viewBox="0 0 320 220" className="h-52 w-full cursor-crosshair touch-none" aria-label="可拖动三角形">
          <line x1={OX} y1={OY} x2={OX+6*S} y2={OY} stroke="#94a3b8" strokeWidth={1} />
          <line x1={OX} y1={OY} x2={OX} y2={OY-6*S} stroke="#94a3b8" strokeWidth={1} />
          <polygon points={pts.map(p=>{const v=toSVG(p);return`${v.x},${v.y}`;}).join(" ")} fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth={2} />
          {pts.map((p,i)=>{
            const v=toSVG(p);
            return <g key={i}>
              <circle cx={v.x} cy={v.y} r={8} fill={COLORS[i]} stroke="white" strokeWidth={2} style={{cursor:"grab"}} />
              <text x={v.x} y={v.y-12} textAnchor="middle" fill={COLORS[i]} fontSize={12} fontWeight="bold">{String.fromCharCode(65+i)}</text>
            </g>;
          })}
          {pts.map((p,i)=>{
            const j=(i+1)%3; const v1=toSVG(p),v2=toSVG(pts[j]);
            return <text key={`s${i}`} x={(v1.x+v2.x)/2+8} y={(v1.y+v2.y)/2-4} fill="#475569" fontSize={10}>{String.fromCharCode(97+i)}={props.sides[i].toFixed(1)}</text>;
          })}
          {/* Angles */}
          {pts.map((_,i)=>{
            const j=(i+1)%3,k=(i+2)%3;
            const v=toSVG(pts[i]);
            const v1=toSVG(pts[j]),v2=toSVG(pts[k]);
            const a1=Math.atan2(v1.y-v.y,v1.x-v.x),a2=Math.atan2(v2.y-v.y,v2.x-v.x);
            const r=14;
            const arcSx=v.x+r*Math.cos(a1),arcSy=v.y+r*Math.sin(a1);
            return <path key={`a${i}`} d={`M ${arcSx} ${arcSy} A ${r} ${r} 0 0 0 ${v.x+r*Math.cos(a2)} ${v.y+r*Math.sin(a2)}`} fill="none" stroke={COLORS[i]} strokeWidth={1.5} />;
          })}
          {/* Labels */}
          {pts.map((p,i)=>{
            const v=toSVG(p);
            return <text key={`al${i}`} x={v.x+18} y={v.y+6} fill={COLORS[i]} fontSize={10}>{props.angles[i].toFixed(0)}°</text>;
          })}
        </svg>
        <SvgDragHandler svgRef={svgRef} points={pts} onPointsChange={setPts} isValid={isValid} />
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <button onClick={()=>setPts([{x:0,y:0},{x:4,y:0},{x:1,y:3}])} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">重置</button>
        <button onClick={()=>{let ok=false;let p:Point2D[]=[];for(let i=0;i<100;i++){p=[{x:Math.round(Math.random()*6),y:Math.round(Math.random()*5)},{x:Math.round(Math.random()*6),y:Math.round(Math.random()*5)},{x:Math.round(Math.random()*6),y:Math.round(Math.random()*5)}];if(isValidTriangle(p[0],p[1],p[2])){ok=true;break;}}if(ok)setPts(p);}} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">随机</button>
        <label className="flex cursor-pointer items-center gap-1"><input type="checkbox" checked={showExtra} onChange={e=>setShowExtra(e.target.checked)} className="accent-primary-600"/>辅助线</label>
        {[{n:"直角",f:(p:Point2D[])=>{p[2]={x:p[0].x,y:p[1].y};return[...p];}},{n:"等腰",f:(p:Point2D[])=>{const d=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y);const a=Math.atan2(p[2].y-p[0].y,p[2].x-p[0].x);p[2]={x:p[0].x+d*Math.cos(a),y:p[0].y+d*Math.sin(a)};return[...p];}}].map(({n,f})=><button key={n} onClick={()=>setPts(f([...pts]))} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">{n}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-3">
        {props.sides.map((s,i)=><div key={i} className="rounded bg-slate-50 p-1.5"><span className="text-slate-400">{String.fromCharCode(97+i)}=</span><span className="font-mono text-slate-700">{s.toFixed(2)}</span></div>)}
        {props.angles.map((a,i)=><div key={i} className="rounded bg-slate-50 p-1.5"><span className="text-slate-400">∠{String.fromCharCode(65+i)}=</span><span className="font-mono text-slate-700">{a.toFixed(1)}°</span></div>)}
        <div className="rounded bg-blue-50 p-1.5"><span className="text-slate-500">面积=</span><span className="font-mono text-blue-700">{props.area.toFixed(2)}</span></div>
        <div className="rounded bg-slate-50 p-1.5"><span className="text-slate-500">类型: </span><span className="font-medium text-slate-700">{typed}</span></div>
        <div className="rounded bg-slate-50 p-1.5"><span className="text-slate-500">内角和=</span><span className="font-mono text-green-700">{(props.angles[0]+props.angles[1]+props.angles[2]).toFixed(0)}°</span></div>
      </div>
      {!isValidTriangle(pts[0],pts[1],pts[2])&&<p className="rounded bg-red-50 p-2 text-xs text-red-600">⚠ 退化三角形（点重合或共线），请调整顶点位置。</p>}
    </div>
  );
}

export function PythagoreanLab() {
  const [ax,setAx]=useState(0);const[ay,setAy]=useState(0);
  const [bx,setBx]=useState(3);const[by,setBy]=useState(0);
  const [cx,setCx]=useState(0);const[cy,setCy]=useState(4);
  const a=Math.hypot(bx-cx,by-cy),b=Math.hypot(cx-ax,cy-ay),c=Math.hypot(ax-bx,ay-by);
  const sides=[a,b,c].sort((x,y)=>y-x);
  const isRight=Math.abs(sides[0]**2-sides[1]**2-sides[2]**2)<0.02;
  const S2=30; const ox=280; const oy=180;
  const toS=(px:number,py:number)=>({sx:ox+px*S2,sy:oy-py*S2});

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-700">🔺 勾股定理实验</h4>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <svg viewBox="0 0 500 300" className="h-64 w-full" aria-label="勾股定理面积演示">
          {/* Triangle */}
          {[[ax,ay],[bx,by],[cx,cy],[ax,ay]].map((_,i)=>{
            if(i>=3)return null;
            const p1=[ax,ay,bx,by,cx,cy][i*2],p2=[ax,ay,bx,by,cx,cy][i*2+1];
            const q1=[ax,ay,bx,by,cx,cy][((i+1)%3)*2],q2=[ax,ay,bx,by,cx,cy][((i+1)%3)*2+1];
            return <line key={`t${i}`} x1={ox+p1*S2} y1={oy-p2*S2} x2={ox+q1*S2} y2={oy-q2*S2} stroke="#2563eb" strokeWidth={2}/>;
          })}
          {/* Squares on each side */}
          {[0,1,2].map(i=>{
            const j=(i+1)%3;
            const p=toS([ax,bx,cx][i],[ay,by,cy][i]),q=toS([ax,bx,cx][j],[ay,by,cy][j]);
            const dx=q.sx-p.sx,dy=q.sy-p.sy;
            const nx=-dy,ny=dx;
            const len=Math.hypot(dx,dy);
            if(len<2)return null;
            const ux=dx/len,uy=dy/len;
            const r=toS([ax,bx,cx][(i+2)%3],[ay,by,cy][(i+2)%3]);
            return <g key={`sq${i}`}>
              <rect x={p.sx} y={p.sy} width={dx} height={dy} fill={["rgba(37,99,235,0.12)","rgba(220,38,38,0.1)","rgba(16,185,129,0.1)"][i]} stroke={["#2563eb","#dc2626","#10b981"][i]} strokeWidth={1.5} transform={dx<0?`matrix(-1,0,0,-1,${p.sx+q.sx},${p.sy+q.sy})`:""} />
              <text x={p.sx+dx/2} y={p.sy+dy/2} textAnchor="middle" fill={["#1d4ed8","#b91c1c","#047857"][i]} fontSize={11} fontWeight="bold">{["a²","b²","c²"][i]}={[a*a,b*b,c*c][i].toFixed(0)}</text>
            </g>;
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {[{n:"3-4-5",v:[{x:0,y:0},{x:3,y:0},{x:0,y:4}]},{n:"5-12-13",v:[{x:0,y:0},{x:5,y:0},{x:0,y:12}]},{n:"6-8-10",v:[{x:0,y:0},{x:6,y:0},{x:0,y:8}]}].map(({n,v})=><button key={n} onClick={()=>{setAx(v[0].x);setAy(v[0].y);setBx(v[1].x);setBy(v[1].y);setCx(v[2].x);setCy(v[2].y);}} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">{n}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="rounded bg-blue-50 p-1.5"><span className="text-blue-700">a²+b² = </span><span className="font-mono text-blue-800">{sides[2].toFixed(0)}²+{sides[1].toFixed(0)}²={(sides[2]**2+sides[1]**2).toFixed(0)}</span></div>
        <div className="rounded bg-emerald-50 p-1.5"><span className="text-emerald-700">c² = </span><span className="font-mono text-emerald-800">{sides[0].toFixed(0)}²={(sides[0]**2).toFixed(0)}</span></div>
        <div className="col-span-2 rounded bg-slate-50 p-1.5 text-center">
          {isRight?<span className="font-bold text-green-700">✓ 勾股定理成立：a²+b²=c²</span>:<span className="text-red-600">✗ 当前不是直角三角形，请调整顶点使∠C=90°</span>}
        </div>
      </div>
    </div>
  );
}

export function RightTriangleTrigLab() {
  const [angle,setAngle]=useState(30);
  const [scale,setScale]=useState(4);
  const rad=angle*Math.PI/180;
  const h=scale;
  const adj=scale*Math.cos(rad);
  const opp=scale*Math.sin(rad);
  const sinA=Math.sin(rad),cosA=Math.cos(rad),tanA=Math.tan(rad);
  const S3=28;const ox=60,oy=200;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-700">📐 锐角三角函数实验</h4>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <svg viewBox="0 0 260 240" className="h-52 w-full" aria-label="锐角三角函数">
          <polygon points={`${ox},${oy} ${ox+adj*S3},${oy} ${ox},${oy-opp*S3}`} fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth={2} />
          <text x={ox-10} y={oy+15} fill="#dc2626" fontSize={11}>A</text>
          <text x={ox+adj*S3+5} y={oy+15} fill="#2563eb" fontSize={11}>B</text>
          <text x={ox-10} y={oy-opp*S3-5} fill="#10b981" fontSize={11}>C</text>
          <rect x={ox+8} y={oy-20} width={20} height={20} fill="none" />
          <line x1={ox+14} y1={oy-18} x2={ox+14+adj*S3/4} y2={oy-18} stroke="none" strokeWidth={0} />
          {/* Labels on sides */}
          <text x={ox+adj*S3/2} y={oy+20} textAnchor="middle" fill="#dc2626" fontSize={10}>邻边 b = {adj.toFixed(1)}</text>
          <text x={ox-22} y={oy-opp*S3/2} textAnchor="middle" fill="#10b981" fontSize={10} transform={`rotate(-90,${ox-22},${oy-opp*S3/2})`}>对边 a = {opp.toFixed(1)}</text>
          <text x={ox+adj*S3/2} y={oy-opp*S3/2-8} textAnchor="middle" fill="#2563eb" fontSize={10} fontWeight="bold">斜边 c = {h.toFixed(1)}</text>
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1"><span>∠A:</span><input type="range" min={5} max={85} value={angle} onChange={e=>setAngle(parseInt(e.target.value))} className="h-1 w-24"/><span className="font-mono w-8">{angle}°</span></div>
        <div className="flex items-center gap-1"><span>大小:</span><input type="range" min={2} max={8} value={scale} onChange={e=>setScale(parseInt(e.target.value))} className="h-1 w-24"/><span className="font-mono w-6">{scale}</span></div>
        {[{l:"30°",v:30},{l:"45°",v:45},{l:"60°",v:60}].map(({l,v})=><button key={l} onClick={()=>setAngle(v)} className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50">{l}</button>)}
        <button onClick={()=>{setAngle(30);setScale(4);}} className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50">重置</button>
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-xs">
        <div className="rounded bg-blue-50 p-1.5 text-center"><div className="text-slate-500">sinA=对/斜</div><div className="font-mono text-lg text-blue-700">{sinA.toFixed(3)}</div></div>
        <div className="rounded bg-red-50 p-1.5 text-center"><div className="text-slate-500">cosA=邻/斜</div><div className="font-mono text-lg text-red-600">{cosA.toFixed(3)}</div></div>
        <div className="rounded bg-green-50 p-1.5 text-center"><div className="text-slate-500">tanA=对/邻</div><div className="font-mono text-lg text-green-700">{tanA.toFixed(3)}</div></div>
      </div>
      <p className="rounded bg-slate-50 p-2 text-xs text-slate-600">sin²A+cos²A = {sinA.toFixed(3)}²+{cosA.toFixed(3)}² = <span className="font-bold text-green-700">{(sinA**2+cosA**2).toFixed(3)}</span> ≈ 1 ✓</p>
    </div>
  );
}

export function CircleTheoremLab() {
  const [radius,setRadius]=useState(3);
  const [angleDeg,setAngleDeg]=useState(60);
  const [lineDist,setLineDist]=useState(2);
  const cx=150,cy=150,S4=30;
  const arcAngle=angleDeg*Math.PI/180;
  const px=cx+radius*S4*Math.cos(arcAngle), py=cy-radius*S4*Math.sin(arcAngle);
  const qx=cx+radius*S4, qy=cy;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-700">⭕ 圆的性质实验</h4>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <svg viewBox="0 0 300 300" className="h-64 w-full" aria-label="圆的性质">
          <circle cx={cx} cy={cy} r={radius*S4} fill="none" stroke="#94a3b8" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={3} fill="#2563eb" />
          <text x={cx} y={cy+14} textAnchor="middle" fill="#2563eb" fontSize={11}>O</text>
          {/* Radius */}
          <line x1={cx} y1={cy} x2={qx} y2={qy} stroke="#2563eb" strokeWidth={1.5} strokeDasharray="4,2" />
          {/* Points A and B on circle */}
          <circle cx={px} cy={py} r={5} fill="#dc2626" />
          <text x={px+8} y={py-8} fill="#dc2626" fontSize={11}>A</text>
          <circle cx={qx} cy={qy} r={5} fill="#10b981" />
          <text x={qx+8} y={qy-4} fill="#10b981" fontSize={11}>B</text>
          {/* Central angle */}
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="#dc2626" strokeWidth={1} />
          <line x1={cx} y1={cy} x2={qx} y2={qy} stroke="#10b981" strokeWidth={1} />
          <text x={cx+20} y={cy-16} fill="#dc2626" fontSize={10}>圆心角={angleDeg}°</text>
          {/* Point C on circle for inscribed angle */}
          <circle cx={cx-radius*S4*0.6} cy={cy+radius*S4*0.8} r={5} fill="#7c3aed" />
          <text x={cx-radius*S4*0.6+8} y={cy+radius*S4*0.8+4} fill="#7c3aed" fontSize={11}>C</text>
          <line x1={cx-radius*S4*0.6} y1={cy+radius*S4*0.8} x2={px} y2={py} stroke="#7c3aed" strokeWidth={1} strokeDasharray="3,3" />
          <line x1={cx-radius*S4*0.6} y1={cy+radius*S4*0.8} x2={qx} y2={qy} stroke="#7c3aed" strokeWidth={1} strokeDasharray="3,3" />
          <text x={cx-30} y={cy+radius*S4*0.8+16} fill="#7c3aed" fontSize={10}>圆周角={angleDeg/2}°</text>
          {/* Line to circle */}
          {lineDist!==radius&&<line x1={cx-S4*6} y1={cy-lineDist*S4} x2={cx+S4*6} y2={cy-lineDist*S4} stroke={lineDist>radius?"#dc2626":lineDist<radius?"#2563eb":"#10b981"} strokeWidth={1.5} />}
          <text x={cx-S4*6+4} y={cy-lineDist*S4-4} fill={lineDist>radius?"#dc2626":lineDist<radius?"#2563eb":"#10b981"} fontSize={10}>{lineDist>radius?"相离":lineDist<radius?"相交":"相切"}</text>
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1"><span>r:</span><input type="range" min={1.5} max={5} step={0.5} value={radius} onChange={e=>setRadius(parseFloat(e.target.value))} className="h-1 w-20"/><span className="font-mono w-6">{radius}</span></div>
        <div className="flex items-center gap-1"><span>弧AB:</span><input type="range" min={10} max={180} value={angleDeg} onChange={e=>setAngleDeg(parseInt(e.target.value))} className="h-1 w-20"/><span className="font-mono w-12">{angleDeg}°</span></div>
        <div className="flex items-center gap-1"><span>d:</span><input type="range" min={0} max={6} step={0.5} value={lineDist} onChange={e=>setLineDist(parseFloat(e.target.value))} className="h-1 w-20"/><span className="font-mono w-6">{lineDist}</span></div>
        <button onClick={()=>{setRadius(3);setAngleDeg(60);setLineDist(2);}} className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50">重置</button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="rounded bg-slate-50 p-1.5"><span className="text-slate-500">C=</span><span className="font-mono">{(2*Math.PI*radius).toFixed(2)}</span></div>
        <div className="rounded bg-slate-50 p-1.5"><span className="text-slate-500">S=</span><span className="font-mono">{(Math.PI*radius*radius).toFixed(2)}</span></div>
        <div className="col-span-2 rounded bg-violet-50 p-1.5 text-center"><span className="text-violet-700">圆周角 = 圆心角 / 2 = </span><span className="font-bold">{angleDeg/2}°</span></div>
      </div>
    </div>
  );
}

export function SolidGeometryLab() {
  const [shape,setShape]=useState<"cube"|"cylinder"|"cone"|"sphere">("cube");
  const [a,setA]=useState(2);
  const [r,setR]=useState(2);
  const [h,setH]=useState(3);
  const [rotY,setRotY]=useState(30);
  const [rotX,setRotX]=useState(20);
  const cx=160,cy=180,S5=22;

  const toScreen=(x:number,y:number,z:number)=>{
    const radY=rotY*Math.PI/180,radX=rotX*Math.PI/180;
    const x1=x*Math.cos(radY)+z*Math.sin(radY);
    const z1=-x*Math.sin(radY)+z*Math.cos(radY);
    const y1=y*Math.cos(radX)-z1*Math.sin(radX);
    return{sx:cx+x1*S5,sy:cy-y1*S5};
  };

  const calc=()=>{
    if(shape==="cube"){const V=a**3,SA=6*a**2;return{V,SA,fSA:"6a²",fV:"a³"};}
    if(shape==="cylinder"){const V=Math.PI*r*r*h,SA=2*Math.PI*r*(r+h);return{V,SA,fSA:"2πr(r+h)",fV:"πr²h"};}
    if(shape==="cone"){const l=Math.sqrt(r*r+h*h);const V=Math.PI*r*r*h/3,SA=Math.PI*r*(r+l);return{V,SA,fSA:"πr(r+l)",fV:"πr²h/3"};}
    const V=4*Math.PI*r**3/3,SA=4*Math.PI*r*r;
    return{V,SA,fSA:"4πr²",fV:"4πr³/3"};
  };
  const {V,SA,fSA,fV}=calc();

  const drawCube=():React.ReactNode=>{
    const verts=[
      toScreen(-a/2,-a/2,-a/2),toScreen(a/2,-a/2,-a/2),toScreen(a/2,-a/2,a/2),toScreen(-a/2,-a/2,a/2),
      toScreen(-a/2,a/2,-a/2),toScreen(a/2,a/2,-a/2),toScreen(a/2,a/2,a/2),toScreen(-a/2,a/2,a/2),
    ];
    const faces=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]];
    return faces.map((f,i)=><polygon key={i} points={f.map(j=>`${verts[j].sx},${verts[j].sy}`).join(" ")} fill={i<2?"rgba(37,99,235,0.06)":"rgba(37,99,235,0.12)"} stroke="#2563eb" strokeWidth={1} />);
  };

  const drawCylinder=():React.ReactNode=>{
    const verts=[],topVerts=[];
    const n=24;
    for(let i=0;i<=n;i++){
      const a2=i*2*Math.PI/n;
      verts.push(toScreen(r*Math.cos(a2),-h/2,r*Math.sin(a2)));
      topVerts.push(toScreen(r*Math.cos(a2),h/2,r*Math.sin(a2)));
    }
    const els:React.ReactNode[]=[];
    const botPts=verts.map(v=>`${v.sx},${v.sy}`).join(" ");
    els.push(<polygon key="bot" points={botPts} fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth={1} />);
    const topPts=topVerts.map(v=>`${v.sx},${v.sy}`).join(" ");
    els.push(<polygon key="top" points={topPts} fill="rgba(37,99,235,0.15)" stroke="#2563eb" strokeWidth={1} />);
    for(let i=0;i<n;i++) els.push(<line key={`s${i}`} x1={verts[i].sx} y1={verts[i].sy} x2={topVerts[i].sx} y2={topVerts[i].sy} stroke="#93c5fd" strokeWidth={0.5} />);
    return els;
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-700">📦 立体几何 — 空间几何体</h4>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <svg viewBox="0 0 320 300" className="h-64 w-full" aria-label="3D几何体">
          {shape==="cube"&&drawCube()}
          {shape==="cylinder"&&drawCylinder()}
          {shape==="sphere"&&<circle cx={cx} cy={cy} r={r*S5} fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth={1.5} />}
          {shape==="cone"&&(()=>{const b=toScreen(0,-h/2,r);const t=toScreen(0,h/2,0);return<><line x1={b.sx} y1={b.sy} x2={t.sx} y2={t.sy} stroke="#2563eb" strokeWidth={1.5}/><ellipse cx={cx} cy={cy+h*S5/2} rx={r*S5} ry={r*S5/3} fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth={1}/></>;})()}
        </svg>
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        {(["cube","cylinder","cone","sphere"]as const).map(s=><button key={s} onClick={()=>setShape(s)} className={`rounded border px-2 py-0.5 ${shape===s?"border-primary-400 bg-primary-50 text-primary-700":"border-slate-300 hover:bg-slate-50"}`}>{s==="cube"?"正方体":s==="cylinder"?"圆柱":s==="cone"?"圆锥":"球体"}</button>)}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {shape!=="sphere"&&<div className="flex items-center gap-1"><span>h:</span><input type="range" min={1} max={6} step={0.5} value={h} onChange={e=>setH(parseFloat(e.target.value))} className="h-1 w-20"/><span className="font-mono w-6">{h}</span></div>}
        {(shape==="cube"||shape==="sphere")&&<div className="flex items-center gap-1"><span>{shape==="cube"?"a:":"r:"}</span><input type="range" min={1} max={5} step={0.5} value={a} onChange={e=>setA(parseFloat(e.target.value))} className="h-1 w-20"/><span className="font-mono w-6">{a}</span></div>}
        {(shape==="cylinder"||shape==="cone")&&<div className="flex items-center gap-1"><span>r:</span><input type="range" min={1} max={4} step={0.5} value={r} onChange={e=>setR(parseFloat(e.target.value))} className="h-1 w-20"/><span className="font-mono w-6">{r}</span></div>}
        <div className="flex items-center gap-1"><span>↻:</span><input type="range" min={0} max={360} value={rotY} onChange={e=>setRotY(parseInt(e.target.value))} className="h-1 w-24"/></div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="rounded bg-blue-50 p-1.5"><span className="text-slate-500">V = </span><span className="font-mono font-bold">{V.toFixed(1)}</span></div>
        <div className="rounded bg-blue-50 p-1.5"><span className="text-slate-500">SA = </span><span className="font-mono font-bold">{SA.toFixed(1)}</span></div>
        <div className="col-span-2 rounded bg-slate-50 p-1.5 text-center"><span className="font-mono text-slate-600">{fV} = {V.toFixed(1)}</span><span className="mx-2 text-slate-300">|</span><span className="font-mono text-slate-600">{fSA} = {SA.toFixed(1)}</span></div>
      </div>
      {shape==="cone"&&<p className="text-xs text-amber-600">⚠ 圆锥体积 = 同底等高圆柱的 1/3</p>}
    </div>
  );
}
