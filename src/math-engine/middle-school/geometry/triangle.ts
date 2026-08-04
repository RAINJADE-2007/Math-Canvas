const EPS = 1e-9;

export interface Point2D { x: number; y: number; }
export interface Point3D { x: number; y: number; z: number; }
export interface Triangle { A: Point2D; B: Point2D; C: Point2D; }
export interface Triangle3D { A: Point3D; B: Point3D; C: Point3D; }

export function dist2D(a: Point2D, b: Point2D): number { return Math.hypot(a.x - b.x, a.y - b.y); }
export function dist3D(a: Point3D, b: Point3D): number { return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2); }
export function midpoint2D(a: Point2D, b: Point2D): Point2D { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
export function midpoint3D(a: Point3D, b: Point3D): Point3D { return { x: (a.x+b.x)/2, y: (a.y+b.y)/2, z: (a.z+b.z)/2 }; }
export function vector2D(a: Point2D, b: Point2D): Point2D { return { x: b.x - a.x, y: b.y - a.y }; }
export function cross2D(a: Point2D, b: Point2D): number { return a.x * b.y - a.y * b.x; }
export function dot2D(a: Point2D, b: Point2D): number { return a.x * b.x + a.y * b.y; }
export function dot3D(a: Point3D, b: Point3D): number { return a.x*b.x+a.y*b.y+a.z*b.z; }
export function cross3D(a: Point3D, b: Point3D): Point3D { return {x:a.y*b.z-a.z*b.y, y:a.z*b.x-a.x*b.z, z:a.x*b.y-a.y*b.x}; }
export function norm3D(v: Point3D): number { return Math.sqrt(v.x**2+v.y**2+v.z**2); }
export function normalize3D(v: Point3D): Point3D { const n=norm3D(v); if(n<EPS)return{x:0,y:0,z:0}; return{x:v.x/n,y:v.y/n,z:v.z/n}; }

export function isDegenerateTriangle(A: Point2D, B: Point2D, C: Point2D): boolean {
  const a=dist2D(B,C), b=dist2D(A,C), c=dist2D(A,B);
  if (a<EPS||b<EPS||c<EPS) return true;
  const cross=Math.abs(cross2D(vector2D(A,B), vector2D(A,C)));
  if (cross<EPS) return true;
  if (!(a+b>c+EPS&&a+c>b+EPS&&b+c>a+EPS)) return true;
  return false;
}

export function isValidTriangle(A: Point2D, B: Point2D, C: Point2D): boolean { return !isDegenerateTriangle(A,B,C); }

export function areaTriangle(A: Point2D, B: Point2D, C: Point2D): number {
  if (isDegenerateTriangle(A,B,C)) return 0;
  return Math.abs(cross2D(vector2D(A,B), vector2D(A,C)))/2;
}

export function angleAt(A: Point2D, B: Point2D, C: Point2D): number {
  const BA=vector2D(B,A), BC=vector2D(B,C);
  const d=dot2D(BA,BC);
  const n1=Math.sqrt(dot2D(BA,BA)), n2=Math.sqrt(dot2D(BC,BC));
  if (n1<EPS||n2<EPS) return 0;
  const cosVal=Math.max(-1,Math.min(1,d/(n1*n2)));
  return Math.acos(cosVal);
}
export function angleAtDeg(A: Point2D, B: Point2D, C: Point2D): number { return angleAt(A,B,C)*180/Math.PI; }

export interface TriangleProps {
  sides: [number,number,number];
  angles: [number,number,number];
  area: number;
  perimeter: number;
  isRight: boolean;
  isIsosceles: boolean;
  isEquilateral: boolean;
  isObtuse: boolean;
  isAcute: boolean;
  pythagoreanCheck: { holds: boolean; a2b2: number; c2: number; };
}

export function calcTriangleProps(A: Point2D, B: Point2D, C: Point2D): TriangleProps {
  const sides: [number,number,number]=[dist2D(B,C),dist2D(A,C),dist2D(A,B)];
  const angles: [number,number,number]=[angleAtDeg(C,A,B),angleAtDeg(A,B,C),angleAtDeg(B,C,A)];
  const area=areaTriangle(A,B,C);
  const perimeter=sides[0]+sides[1]+sides[2];
  const sorted=[...sides].sort((a,b)=>b-a);
  const diff=Math.abs(sorted[0]**2-(sorted[1]**2+sorted[2]**2));
  const isRight=diff<0.01&&sorted[0]>EPS;
  const isIsosceles=Math.abs(sides[0]-sides[1])<0.05||Math.abs(sides[1]-sides[2])<0.05||Math.abs(sides[2]-sides[0])<0.05;
  const isEquilateral=Math.abs(sides[0]-sides[1])<0.05&&Math.abs(sides[1]-sides[2])<0.05;
  const isObtuse=sorted[0]**2>sorted[1]**2+sorted[2]**2+EPS;
  const isAcute=sorted[0]**2<sorted[1]**2+sorted[2]**2-EPS;
  const pCheck={holds:isRight,c2:sorted[0]**2,a2b2:sorted[1]**2+sorted[2]**2};
  return {sides,angles,area,perimeter,isRight,isIsosceles,isEquilateral,isObtuse,isAcute,pythagoreanCheck:pCheck};
}

export function similarTriangle(A: Point2D, B: Point2D, C: Point2D, k: number): Triangle {
  const cx=(A.x+B.x+C.x)/3, cy=(A.y+B.y+C.y)/3;
  const scale=(p:Point2D):Point2D=>({x:cx+(p.x-cx)*k,y:cy+(p.y-cy)*k});
  return {A:scale(A),B:scale(B),C:scale(C)};
}

export interface CircleProps {
  center: Point2D; radius: number;
  circumference: number; area: number;
}
export function calcCircle(center: Point2D, radius: number): CircleProps {
  return {center,radius,circumference:2*Math.PI*radius,area:Math.PI*radius*radius};
}
export function centralAngle(p1: Point2D, center: Point2D, p2: Point2D): number {
  return angleAt(p1,center,p2);
}

export interface SolidShape {
  type: "cube"|"cuboid"|"cylinder"|"cone"|"sphere"|"prism"|"pyramid";
  params: Record<string,number>;
  surfaceArea: number; volume: number;
  formulaSA: string; formulaV: string;
}
export function calcCube(a:number):SolidShape{return{type:"cube",params:{a},surfaceArea:6*a*a,volume:a**3,formulaSA:"6a²",formulaV:"a³"};}
export function calcCuboid(a:number,b:number,c:number):SolidShape{return{type:"cuboid",params:{a,b,c},surfaceArea:2*(a*b+b*c+a*c),volume:a*b*c,formulaSA:"2(ab+bc+ac)",formulaV:"abc"};}
export function calcCylinder(r:number,h:number):SolidShape{return{type:"cylinder",params:{r,h},surfaceArea:2*Math.PI*r*(r+h),volume:Math.PI*r*r*h,formulaSA:"2πr(r+h)",formulaV:"πr²h"};}
export function calcCone(r:number,h:number):SolidShape{const l=Math.sqrt(r*r+h*h);return{type:"cone",params:{r,h},surfaceArea:Math.PI*r*(r+l),volume:Math.PI*r*r*h/3,formulaSA:"πr(r+l)",formulaV:"πr²h/3"};}
export function calcSphere(r:number):SolidShape{return{type:"sphere",params:{r},surfaceArea:4*Math.PI*r*r,volume:4*Math.PI*r**3/3,formulaSA:"4πr²",formulaV:"4πr³/3"};}

export function vec3ToScreen(p:Point3D,ox:number,oy:number,scale:number,iso:number):{sx:number;sy:number}{
  return {sx:ox+(p.x-p.y*Math.cos(iso))*scale, sy:oy-(p.z-p.y*Math.sin(iso)*0.7)*scale};
}

export function rotateY(p: Point3D, angle: number): Point3D {
  const c=Math.cos(angle),s=Math.sin(angle);
  return {x:p.x*c+p.z*s,y:p.y,z:-p.x*s+p.z*c};
}
export function rotateX(p: Point3D, angle: number): Point3D {
  const c=Math.cos(angle),s=Math.sin(angle);
  return {x:p.x,y:p.y*c-p.z*s,z:p.y*s+p.z*c};
}
