'use client';
import { showError } from '@/lib/showError';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { Star, ChevronDown, AlertCircle, X, CheckCircle2, Shield, ArrowRight, Plus, Minus, Search, ShoppingCart, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Raleway:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
html{scroll-behavior:smooth}
:root{
  --bg:#0E0C0A; --s1:#161310; --s2:#1E1A16;
  --tx:#F5F1EB; --mu:#7A7068;
  --br:rgba(245,241,235,0.08); --br2:rgba(245,241,235,0.15);
  --cp:#C88B6A; --cl:rgba(200,139,106,0.1);
}
body{background:var(--bg);color:var(--tx);font-family:'Raleway',sans-serif}
a{text-decoration:none;color:inherit}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--cp)}
.bn{font-family:'Bebas Neue',sans-serif;letter-spacing:0.05em}

@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes sp{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes sd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fi .3s ease both}
.fu{animation:fu .6s ease both}
.sd{animation:sd .18s ease both}

/* card */
.lx-card-img{width:100%;aspect-ratio:3/4;overflow:hidden;background:var(--s2)}
.lx-card-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
.lx-card:hover .lx-card-img img{transform:scale(1.04)}

/* grid */
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:2px}

/* details */
.det-grid{display:grid;grid-template-columns:1fr 1fr}
.det-sticky{position:sticky;top:60px;height:calc(100vh - 60px);overflow:hidden}

/* cart */
.cart-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}

/* form */
.f2{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* input */
.inp{width:100%;padding:12px 14px;background:var(--s2);border:1px solid var(--br2);color:var(--tx);font-family:'Raleway',sans-serif;font-size:13px;outline:none;transition:border-color .2s;appearance:none}
.inp:focus{border-color:var(--cp)}
.inp::placeholder{color:var(--mu)}
.inp-err{border-color:#c14040!important}

/* btn */
.btn-dark{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 28px;background:var(--tx);color:var(--bg);font-family:'Raleway',sans-serif;font-weight:700;font-size:11px;letter-spacing:.18em;text-transform:uppercase;border:none;cursor:pointer;transition:background .2s}
.btn-dark:hover{background:var(--cp)}
.btn-dark:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 28px;background:transparent;color:var(--mu);font-family:'Raleway',sans-serif;font-weight:600;font-size:11px;letter-spacing:.18em;text-transform:uppercase;border:1px solid var(--br2);cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--cp);color:var(--cp)}

.lbl{font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:var(--mu);display:block;margin-bottom:7px;font-family:'Raleway',sans-serif}
.pag{display:flex;justify-content:center;align-items:center;gap:3px;padding:48px 0}

@media(max-width:900px){.det-grid{grid-template-columns:1fr}.det-sticky{position:static;height:70vw;min-height:300px}.cart-grid{grid-template-columns:1fr}.g3,.g4{grid-template-columns:1fr}}
@media(max-width:600px){.g3,.g4{grid-template-columns:1fr}.f2{grid-template-columns:1fr}}

  .footer-grid { display:grid; grid-template-columns:1fr; gap:2rem; }
  @media(min-width:768px){.footer-grid{grid-template-columns:1fr 1fr 1fr;gap:40px;}}

  .contact-layout{display:grid;grid-template-columns:1fr;gap:32px;}
  @media(min-width:768px){.contact-layout{grid-template-columns:1fr 1.5fr;gap:48px;}}
`;

/* types */
interface Offer{id:string;name:string;quantity:number;price:number}
interface Variant{id:string;name:string;value:string}
interface Attribute{id:string;type:string;name:string;displayMode?:'color'|'image'|'text'|null;variants:Variant[]}
interface ProductImage{id:string;imageUrl:string}
interface VariantAttributeEntry{attrId:string;attrName:string;displayMode:'color'|'image'|'text';value:string}
interface VariantDetail{id:string|number;name:VariantAttributeEntry[];price:number;stock:number;autoGenerate:boolean}
interface Wilaya{id:string;name:string;ar_name:string;livraisonHome:number;livraisonOfice:number;livraisonReturn:number}
interface Commune{id:string;name:string;ar_name:string;wilayaId:string}
export interface Product{id:string;name:string;price:string|number;priceOriginal?:string|number;desc?:string;productImage?:string;imagesProduct?:ProductImage[];offers?:Offer[];attributes?:Attribute[];variantDetails?:VariantDetail[];stock?:number;isActive?:boolean;store:{id:string;name:string;subdomain:string;userId:string;cart?:boolean}}
export interface ProductFormProps{product:Product;userId:string;domain:string;selectedOffer:string|null;setSelectedOffer:(id:string|null)=>void;selectedVariants:Record<string,string>;platform?:string;priceLoss?:number}

const vm=(d:VariantDetail,s:Record<string,string>)=>Object.entries(s).every(([n,v])=>d.name.some(e=>e.attrName===n&&e.value===v));
const fw=async(uid:string):Promise<Wilaya[]>=>{try{const{data}=await axios.get(`${API}/shipping/public/get-shipping/${uid}`);return data||[]}catch{return[]}};
const fc=async(wid:string):Promise<Commune[]>=>{try{const{data}=await axios.get(`${API}/shipping/get-communes/${wid}`);return data||[]}catch{return[]}};

const IS=(err?:boolean):React.CSSProperties=>({width:'100%',padding:'12px 14px',background:'var(--s2)',border:`1px solid ${err?'#c14040':'var(--br2)'}`,color:'var(--tx)',fontFamily:"'Raleway',sans-serif",fontSize:'13px',outline:'none',transition:'border-color .2s',appearance:'none'});
const onF=(e:React.FocusEvent<any>)=>e.target.style.borderColor='var(--cp)';
const onBl=(e:React.FocusEvent<any>,err?:boolean)=>e.target.style.borderColor=err?'#c14040':'var(--br2)';

const FR=({error,label,children}:{error?:string;label?:string;children:React.ReactNode})=>(
  <div style={{marginBottom:14}}>
    {label&&<span className="lbl">{label}</span>}
    {children}
    {error&&<p style={{fontSize:'10px',color:'#c14040',marginTop:4,display:'flex',alignItems:'center',gap:4}}><AlertCircle style={{width:10,height:10}}/>{error}</p>}
  </div>
);

/* ══ MAIN ══ */
export default function Main({store,children,domain}:any){
  return(
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--tx)',fontFamily:"'Raleway',sans-serif"}}>
      <style>{CSS}</style>
      {store?.topBar?.enabled&&store?.topBar?.text&&(
        <div style={{background:'#C88B6A',color:'#0E0C0A',textAlign:'center',padding:'7px 16px',fontSize:'11px',letterSpacing:'0.16em',fontWeight:600,fontFamily:"'Raleway',sans-serif",textTransform:'uppercase'}}>{store.topBar.text}</div>
      )}
      <Navbar store={store} domain={domain}/>
      <main>{children}</main>
      <Footer store={store}/>
    </div>
  );
}

/* ══ NAVBAR ══ */
export function Navbar({store,domain}:{store:any;domain:string}){
  const [sq,setSq]=useState('');
  const [ls,setLs]=useState<any[]>([]);
  const [ld,setLd]=useState(false);
  const [showS,setShowS]=useState(false);
  const [mOpen,setMOpen]=useState(false);
  const router=useRouter();
  const count=useCartStore(s=>s.count);
  const initCount=useCartStore(s=>s.initCount);

  useEffect(()=>{
    if(typeof window!=='undefined'&&domain)
      try{initCount(JSON.parse(localStorage.getItem(domain)||'[]').length)}catch{initCount(0)}
  },[domain,initCount]);

  useEffect(()=>{
    if(sq.length<2){setLs([]);return}
    const t=setTimeout(async()=>{
      setLd(true);
      try{const{data}=await axios.get(`${API}/products/public/${domain}`,{params:{search:sq}});setLs(data.products||[])}
      catch{}finally{setLd(false)}
    },350);
    return()=>clearTimeout(t);
  },[sq,domain]);

  const go=(e?:React.FormEvent)=>{if(e)e.preventDefault();if(sq.trim()){router.push(`/?search=${encodeURIComponent(sq)}`);setSq('');setShowS(false)}};

  return(
    <>
      <header dir="ltr" style={{position:'sticky',top:0,zIndex:50,background:'#161310',borderBottom:'1px solid var(--br)'}}>
        <div style={{height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px'}}>

        {/* Logo */}
        <Link href="/" style={{flexShrink:0}}>
          {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png'
            ?<img src={store.design.logoUrl} alt={store.name} style={{height:'28px',objectFit:'contain'}}/>
            :<span className="bn" style={{fontSize:'1.5rem',color:'var(--tx)',letterSpacing:'0.08em'}}>{store?.name}</span>
          }
        </Link>

        {/* Icons */}
        <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
          {/* Search */}
          <div style={{position:'relative'}}>
            <button onClick={()=>setShowS(p=>!p)} style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'none',cursor:'pointer',color:showS?'var(--cp)':'var(--mu)',transition:'color .18s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--tx)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=showS?'var(--cp)':'var(--mu)'}}>
              <Search style={{width:16,height:16}}/>
            </button>
            {showS&&(
              <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,width:'300px',zIndex:200,background:'var(--s1)',border:'1px solid var(--br2)'}} className="sd">
                <form onSubmit={go} style={{display:'flex',alignItems:'center',borderBottom:'1px solid var(--br)'}}>
                  <input autoFocus type="text" value={sq} onChange={e=>setSq(e.target.value)} placeholder="Rechercher un produit..." style={{flex:1,padding:'11px 14px',background:'transparent',border:'none',color:'var(--tx)',fontSize:'13px',fontFamily:"'Raleway',sans-serif",outline:'none'}}/>
                  {sq&&<button type="button" onClick={()=>setSq('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--mu)',padding:'0 10px',display:'flex',alignItems:'center'}}><X size={13}/></button>}
                </form>
                {sq.length>=2&&(
                  <div style={{maxHeight:'55vh',overflowY:'auto'}} className="fi">
                    {ld?<p style={{padding:'14px',fontSize:'11px',color:'var(--mu)',letterSpacing:'0.1em',textAlign:'center'}}>Recherche en cours...</p>
                    :ls.length>0?(
                      <>
                        {ls.map((p:any)=>(
                          <Link href={`/product/${p.id}`} key={p.id} onClick={()=>setSq('')}
                            style={{display:'flex',gap:'10px',padding:'10px 14px',borderBottom:'1px solid var(--br)',transition:'background .15s'}}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--s2)'}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent'}}>
                            <div style={{width:36,height:48,flexShrink:0,overflow:'hidden',background:'var(--s2)'}}>
                              <img src={p.productImage||p.imagesProduct?.[0]?.imageUrl} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt=""/>
                            </div>
                            <div>
                              <p style={{fontSize:'12px',fontWeight:600,color:'var(--tx)',lineHeight:1.3,marginBottom:3}}>{p.name}</p>
                              <p style={{fontSize:'12px',color:'var(--cp)',fontWeight:700}}>{p.price} DA</p>
                            </div>
                          </Link>
                        ))}
                        <button onClick={go} style={{width:'100%',padding:'11px',background:'none',border:'none',borderTop:'1px solid var(--br)',color:'var(--cp)',fontWeight:700,fontSize:'10px',letterSpacing:'0.18em',textTransform:'uppercase',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontFamily:"'Raleway',sans-serif"}}>
                          Voir tous les résultats <ArrowRight size={11}/>
                        </button>
                      </>
                    ):<p style={{padding:'14px',fontSize:'11px',color:'var(--mu)',textAlign:'center',letterSpacing:'0.1em'}}>Aucun résultat</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link href="/cart" style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',color:'var(--mu)',transition:'color .18s'}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--tx)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mu)'}}>
            <ShoppingCart style={{width:16,height:16}}/>
            {count>0&&<span style={{position:'absolute',top:6,right:4,background:'var(--cp)',color:'var(--bg)',fontSize:'9px',fontWeight:800,minWidth:15,height:15,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>{count}</span>}
          </Link>

          {/* Hamburger */}
          <button onClick={()=>setMOpen(p=>!p)} style={{width:40,height:40,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'5px',background:'none',border:'none',cursor:'pointer'}}>
            <span style={{display:'block',width:18,height:'1px',background:'var(--tx)',transition:'all .2s',transform:mOpen?'rotate(45deg) translate(3px,3px)':'none'}}/>
            <span style={{display:'block',width:mOpen?'0':'12px',height:'1px',background:'var(--tx)',transition:'all .2s',marginRight:'auto'}}/>
            <span style={{display:'block',width:18,height:'1px',background:'var(--tx)',transition:'all .2s',transform:mOpen?'rotate(-45deg) translate(3px,-3px)':'none'}}/>
          </button>
        </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mOpen&&(
        <div dir="ltr" style={{position:'fixed',inset:0,zIndex:200,background:'var(--bg)',paddingTop:'60px',display:'flex',flexDirection:'column'}} className="fi">
          <button onClick={()=>setMOpen(false)} style={{position:'absolute',top:12,left:20,width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'none',cursor:'pointer',color:'var(--mu)'}}>
            <X style={{width:20,height:20}}/>
          </button>
          <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 32px'}}>
            {[{h:'/',l:'Accueil'},{h:'/cart',l:'Panier'},{h:'/contact',l:'Contact'},{h:'/Privacy',l:'Confidentialité'},{h:'/Terms',l:'Conditions'}].map(lnk=>(
              <Link key={lnk.h} href={lnk.h} onClick={()=>setMOpen(false)}
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 0',borderBottom:'1px solid var(--br)'}}>
                <span className="bn" style={{fontSize:'clamp(2rem,7vw,4rem)',color:'var(--tx)',letterSpacing:'0.05em'}}>{lnk.l}</span>
                <ArrowRight style={{width:14,height:14,color:'var(--cp)'}}/>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ══ FOOTER ══ */
export function Footer({store}:any){
  return(
    <footer dir="ltr" style={{background:'var(--s1)',borderTop:'1px solid var(--br)',padding:'48px 24px 24px',fontFamily:"'Raleway',sans-serif"}}>
      <div className="footer-grid" style={{maxWidth:1200,margin:'0 auto',paddingBottom:32,borderBottom:'1px solid var(--br)'}}>
        <div>
          <span className="bn" style={{fontSize:'1.8rem',color:'var(--tx)',letterSpacing:'0.06em',display:'block',marginBottom:12}}>{store?.name}</span>
          <p style={{fontSize:'12px',lineHeight:1.8,color:'var(--mu)',letterSpacing:'0.04em'}}>{store?.hero?.subtitle?.slice(0,80)||'Mode raffinée. Livraison dans toutes les wilayas.'}</p>
        </div>
        <div>
          <p className="lbl" style={{marginBottom:14,color:'var(--cp)'}}>Navigation</p>
          {[{h:'/',l:'Accueil'},{h:'/cart',l:'Panier'},{h:'/contact',l:'Contactez-nous'},{h:'/Privacy',l:'Confidentialité'},{h:'/Terms',l:'Conditions'}].map(lnk=>(
            <a key={lnk.h} href={lnk.h} style={{display:'block',fontSize:'12px',color:'var(--mu)',marginBottom:9,letterSpacing:'0.06em',transition:'color .18s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--tx)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mu)'}}>
              {lnk.l}
            </a>
          ))}
        </div>
        <div>
          <p className="lbl" style={{marginBottom:14,color:'var(--cp)'}}>informations</p>
          {[store?.contact?.phone&&`📞 ${store.contact.phone}`,[store?.contact?.wilaya,store?.contact?.address].filter(Boolean).join(' / ')&&`📍 ${[store.contact?.wilaya,store.contact?.address].filter(Boolean).join(' / ')}`,store?.contact?.email&&`✉️ ${store.contact.email}`].filter(Boolean).map((v,i)=>(
            <p key={i} style={{fontSize:'12px',color:'var(--mu)',marginBottom:9,letterSpacing:'0.04em'}}>{v as string}</p>
          ))}
        </div>
      </div>
      <p style={{fontSize:'10px',color:'rgba(245,241,235,0.15)',textAlign:'center',paddingTop:20,letterSpacing:'0.12em'}}>© {new Date().getFullYear()} {store?.name}</p>
    </footer>
  );
}

/* ══ CARD ══ */
export function Card({product,displayImage,discount,store}:any){
  if(!product||!store)return null;
  const price=parseFloat(product.price as string);
  const orig=product.priceOriginal?parseFloat(product.priceOriginal as string):0;
  return(
    <div className="lx-card">
      <Link href={`/product/${product.slug||product.id}`} style={{display:'block'}}>
        <div className="lx-card-img" style={{position:'relative'}}>
          {displayImage?<img src={displayImage} alt={product.name}/>
            :<div style={{width:'100%',aspectRatio:'3/4',background:'var(--s2)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:'2rem',color:'var(--br2)'}}>?</span></div>}
          {discount>0&&<span style={{position:'absolute',top:10,right:10,background:'var(--cp)',color:'var(--bg)',fontSize:'9px',fontWeight:800,padding:'3px 8px',letterSpacing:'0.1em',fontFamily:"'Raleway',sans-serif"}}>-{discount}%</span>}
        </div>
        <div style={{padding:'12px 2px 0'}}>
          <p style={{fontSize:'13px',fontWeight:500,color:'var(--tx)',lineHeight:1.35,marginBottom:6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{product.name}</p>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:'14px',fontWeight:700,color:'var(--cp)'}}>{price.toLocaleString()} DA</span>
            {orig>price&&<span style={{fontSize:'11px',textDecoration:'line-through',color:'var(--mu)'}}>{orig.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ══ HOME ══ */
export function Home({store,page}:any){
  const products:any[]=store.products||[];
  const cats:any[]=store.categories||[];
  if(!page)page=1;
  const total=Math.ceil((store.count||products.length)/48);

  return(
    <div dir="ltr">

      {/* HERO */}
      <section style={{position:'relative',height:'90vh',overflow:'hidden',display:'flex',alignItems:'flex-end'}}>
        {store.hero?.imageUrl?(
          <>
            <img src={store.hero.imageUrl} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(14,12,10,.85) 0%,rgba(14,12,10,.2) 60%,transparent 100%)'}}/>
          </>
        ):<div style={{position:'absolute',inset:0,background:'var(--s1)'}}/>}

        <div style={{position:'relative',zIndex:2,padding:'0 32px 48px',width:'100%'}}>
          <div className='fu' style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:24,flexWrap:'wrap'}}>
            <div>
              <h1 className="bn" style={{fontSize:'clamp(4rem,12vw,10rem)',color:'var(--tx)',lineHeight:.88,letterSpacing:'0.03em',marginBottom:16}}>
                {store.hero?.title||<><span>LUXE</span><br/><span style={{color:'var(--cp)'}}>FASHION</span></>}
              </h1>
              <p style={{fontSize:'13px',color:'rgba(245,241,235,0.55)',letterSpacing:'0.06em',maxWidth:340,lineHeight:1.8}}>
                {store.hero?.subtitle||'Mode raffinée. Livraison rapide dans toutes les wilayas.'}
              </p>
            </div>
            <a href='#products' className="btn-dark" style={{textDecoration:'none',flexShrink:0}}>Acheter maintenant</a>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {cats.length>0&&(
        <div style={{padding:'20px 32px',borderBottom:'1px solid var(--br)',display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <Link href="/" style={{padding:'7px 18px',background:'var(--cp)',color:'var(--bg)',fontSize:'10px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',fontFamily:"'Raleway',sans-serif"}}>Tout</Link>
          {cats.map((cat:any)=>(
            <Link key={cat.id} href={`?category=${cat.id}`} style={{padding:'7px 18px',background:'transparent',border:'1px solid var(--br2)',color:'var(--mu)',fontSize:'10px',fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase',fontFamily:"'Raleway',sans-serif",transition:'all .18s'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--cp)';el.style.color='var(--cp)'}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--br2)';el.style.color='var(--mu)'}}>
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* PRODUCTS */}
      <section id="products" style={{padding:'32px 32px 64px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <h2 style={{fontSize:'14px',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--tx)'}}>Total</h2>
          <span style={{fontSize:'11px',color:'var(--mu)',letterSpacing:'0.06em'}}>{products.length} Produit</span>
        </div>

        {products.length===0?(
          <div style={{minHeight:300,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--s2)'}}>
            <span className="bn" style={{fontSize:'2.5rem',color:'var(--mu)',letterSpacing:'0.08em'}}>Aucun produit</span>
          </div>
        ):(
          <div className="g4" style={{gap:24}}>
            {products.map((p:any)=>{
              const img=p.productImage||p.imagesProduct?.[0]?.imageUrl;
              const disc=p.priceOriginal?Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100):0;
              return <div key={p.id}><Card product={p} displayImage={img} discount={disc} store={store}/></div>;
            })}
          </div>
        )}

        {total>1&&(
          <div className="pag">
            <Link href={{query:{page:Math.max(1,page-1)}}} scroll={false} style={{width:36,height:36,border:'1px solid var(--br2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--mu)',opacity:page<=1?0.3:1,transition:'all .18s'}}><ChevronRight size={13}/></Link>
            {Array.from({length:total}).map((_,i)=>{const pn=i+1;const isA=Number(page)===pn;return(
              <Link key={pn} href={{query:{page:pn}}} scroll={false} style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',background:isA?'var(--cp)':'transparent',border:`1px solid ${isA?'var(--cp)':'var(--br2)'}`,color:isA?'var(--bg)':'var(--mu)',fontWeight:700,transition:'all .2s',fontFamily:"'Raleway',sans-serif"}}>{pn}</Link>
            )})}
            <Link href={{query:{page:Math.min(total,Number(page)+1)}}} scroll={false} style={{width:36,height:36,border:'1px solid var(--br2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--mu)',opacity:page>=total?0.3:1,transition:'all .18s'}}><ChevronLeft size={13}/></Link>
          </div>
        )}
      </section>
    </div>
  );
}

/* ══ DETAILS ══ */
export function Details({product,discount,allImages,allAttrs,finalPrice,inStock,autoGen,selectedVariants,setSelectedOffer,selectedOffer,handleVariantSelection,domain}:any){
  const [sel,setSel]=useState(0);
  if(!product)return null;
  return(
    <div dir="ltr" style={{background:'var(--bg)',fontFamily:"'Raleway',sans-serif"}}>
      <div className="det-grid">

        {/* Gallery */}
        <div className="det-sticky">
          <div style={{position:'relative',width:'100%',height:'100%'}}>
            {allImages.length>0?<img src={allImages[sel]} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
              :<div style={{width:'100%',height:'100%',background:'var(--s2)',display:'flex',alignItems:'center',justifyContent:'center'}}><ShoppingCart style={{width:32,height:32,color:'var(--mu)'}}/></div>}
            {discount>0&&<span style={{position:'absolute',top:16,right:16,background:'var(--cp)',color:'var(--bg)',fontSize:'9px',fontWeight:800,padding:'5px 10px',letterSpacing:'0.12em',fontFamily:"'Raleway',sans-serif"}}>-{discount}%</span>}
            {!inStock&&!autoGen&&<div style={{position:'absolute',inset:0,background:'rgba(14,12,10,.65)',display:'flex',alignItems:'center',justifyContent:'center'}}><span className="bn" style={{fontSize:'2.5rem',color:'var(--mu)',letterSpacing:'0.06em'}}>Stock épuisé</span></div>}
            {allImages.length>1&&(
              <>
                <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',width:34,height:34,background:'rgba(14,12,10,.6)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--tx)'}}><ChevronRight size={14}/></button>
                <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',width:34,height:34,background:'rgba(14,12,10,.6)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--tx)'}}><ChevronLeft size={14}/></button>
                <div style={{position:'absolute',bottom:12,left:0,right:0,display:'flex',justifyContent:'center',gap:4}}>
                  {allImages.map((_:string,i:number)=><button key={i} onClick={()=>setSel(i)} style={{width:i===sel?20:6,height:6,background:i===sel?'var(--cp)':'rgba(245,241,235,0.3)',border:'none',cursor:'pointer',borderRadius:3,transition:'all .25s'}}/>)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{padding:'40px 36px',overflowY:'auto',borderRight:'1px solid var(--br)'}}>
          <div style={{display:'flex',gap:2,marginBottom:14}}>
            {[...Array(5)].map((_,i)=><Star key={i} style={{width:12,height:12,fill:i<4?'var(--cp)':'none',color:'var(--cp)'}}/>)}
          </div>
          <h1 style={{fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:700,color:'var(--tx)',lineHeight:1.2,marginBottom:8,letterSpacing:'0.02em'}}>{product.name}</h1>
          <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:28,paddingBottom:24,borderBottom:'1px solid var(--br)'}}>
            <span style={{fontSize:'1.8rem',fontWeight:800,color:'var(--cp)'}}>{finalPrice.toLocaleString()} DA</span>
            {product.priceOriginal&&parseFloat(product.priceOriginal)>finalPrice&&<span style={{fontSize:'13px',textDecoration:'line-through',color:'var(--mu)'}}>{parseFloat(product.priceOriginal).toLocaleString()} DA</span>}
          </div>

          {product.offers?.length>0&&(
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:'1px solid var(--br)'}}>
              <span className="lbl">Choisir la vue</span>
              {product.offers.map((o:any)=>(
                <label key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',border:`1px solid ${selectedOffer===o.id?'var(--cp)':'var(--br2)'}`,background:selectedOffer===o.id?'var(--cl)':'transparent',cursor:'pointer',marginBottom:6,transition:'all .18s'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:13,height:13,border:`1px solid ${selectedOffer===o.id?'var(--cp)':'var(--br2)'}`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {selectedOffer===o.id&&<div style={{width:7,height:7,background:'var(--cp)',borderRadius:'50%'}}/>}
                    </div>
                    <input type="radio" name="offer" checked={selectedOffer===o.id} onChange={()=>setSelectedOffer(o.id)} style={{display:'none'}}/>
                    <span style={{fontSize:'13px',fontWeight:600,color:'var(--tx)'}}>{o.name}</span>
                  </div>
                  <span style={{fontWeight:700,color:selectedOffer===o.id?'var(--cp)':'var(--tx)',fontSize:'14px'}}>{o.price.toLocaleString()} DA</span>
                </label>
              ))}
            </div>
          )}

          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{marginBottom:20,paddingBottom:20,borderBottom:'1px solid var(--br)'}}>
              <span className="lbl">{attr.name}</span>
              {attr.displayMode==='color'?(
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value;return<button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{width:26,height:26,backgroundColor:v.value,border:`2px solid ${s?'var(--cp)':'transparent'}`,cursor:'pointer',outline:s?'2px solid var(--cp)':'none',outlineOffset:2,borderRadius:'50%',transition:'outline .15s'}}/>;})}</div>
              ):attr.displayMode==='image'?(
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value;return<button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{width:46,height:60,overflow:'hidden',border:`2px solid ${s?'var(--cp)':'var(--br2)'}`,cursor:'pointer',padding:0,transition:'border-color .18s'}}><img src={v.value} alt={v.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/></button>;})}
                </div>
              ):(
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value;return<button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{padding:'7px 16px',border:`1px solid ${s?'var(--cp)':'var(--br2)'}`,background:s?'var(--cl)':'transparent',color:s?'var(--cp)':'var(--mu)',fontSize:'11px',letterSpacing:'0.12em',cursor:'pointer',transition:'all .18s',fontFamily:"'Raleway',sans-serif",fontWeight:600,textTransform:'uppercase'}}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc&&(
            <div style={{marginTop:32,paddingTop:24,borderTop:'1px solid var(--br)'}}>
              <span className="lbl">Description du produit</span>
              <div style={{fontSize:'13px',lineHeight:1.85,color:'var(--mu)',letterSpacing:'0.03em'}}
                dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(product.desc,{ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','span'],ALLOWED_ATTR:['class','style']})}}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══ PRODUCT FORM ══ */
export function ProductForm({product,userId,domain,selectedOffer,setSelectedOffer,selectedVariants,platform,priceLoss=0}:ProductFormProps){
  const router=useRouter();
  const [wilayas,setW]=useState<Wilaya[]>([]);
  const [communes,setC]=useState<Commune[]>([]);
  const [lcC,setLC]=useState(false);
  const [fd,setFd]=useState({customerId:'',customerName:'',customerPhone:'',customerWelaya:'',customerCommune:'',quantity:1,priceLoss:0,typeLivraison:'home' as 'home'|'office'});
  const [errors,setE]=useState<Record<string,string>>({});
  const [sub,setSub]=useState(false);
  const [orderNow,setON]=useState(false);
  const [added,setAdded]=useState(false);
  const initCount=useCartStore(s=>s.initCount);

  useEffect(()=>{if(userId)fw(userId).then(setW)},[userId]);
  useEffect(()=>{if(typeof window!=='undefined'){const id=localStorage.getItem('customerId');if(id)setFd(p=>({...p,customerId:id}))}},[]);
  useEffect(()=>{if(!fd.customerWelaya){setC([]);return}setLC(true);fc(fd.customerWelaya).then(d=>{setC(d);setLC(false)})},[fd.customerWelaya]);

  const selW=useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const getFP=useCallback(():number=>{
    const base=typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const off=product.offers?.find((o:any)=>o.id===selectedOffer);if(off)return off.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){const m=product.variantDetails.find((v:any)=>vm(v,selectedVariants));if(m&&m.price!==-1)return m.price}
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getLiv=useCallback(():number=>{if(!selW)return 0;return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice},[selW,fd.typeLivraison]);
  const fp=getFP();const total=()=>fp*fd.quantity+getLiv();
  const getVarId=useCallback(()=>{if(!product.variantDetails?.length||!Object.keys(selectedVariants).length)return undefined;return product.variantDetails.find((v:any)=>vm(v,selectedVariants))?.id},[product.variantDetails,selectedVariants]);
  const validate=()=>{const e:Record<string,string>={};if(!fd.customerName.trim())e.name='Nom requis';if(!fd.customerPhone.trim()||!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim()))e.phone="Numéro invalide";if(!fd.customerWelaya)e.w='Wilaya requis';if(!fd.customerCommune)e.c="Commune requis";return e};

  const addCart=()=>{
    setAdded(true);
    const cart=JSON.parse(localStorage.getItem(domain)||'[]');
    cart.push({...fd,product,variantDetailId:getVarId(),productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv(),addedAt:Date.now()});
    localStorage.setItem(domain,JSON.stringify(cart));initCount(cart.length);
    setTimeout(()=>setAdded(false),2200);
  };
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();const er=validate();if(Object.keys(er).length){setE(er);return}
    setE({});setSub(true);
    try{await axios.post(`${API}/orders/create`,{...fd,productId:product.id,storeId:product.store.id,userId,selectedOffer,variantDetailId:getVarId(),platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()});if(fd.customerId)localStorage.setItem('customerId',fd.customerId);router.push(`/lp/${domain}/successfully`)}
    catch{}finally{setSub(false)}
  };

  return(
    <div dir="ltr" style={{marginTop:20}}>
      {product.store?.cart&&(
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          <button onClick={addCart} disabled={added} className="btn-ghost" style={{flex:1,padding:'12px',opacity:added?1:undefined,borderColor:added?'#22c55e':undefined,color:added?'#22c55e':undefined}}>
            {added?<><CheckCircle2 size={13}/>Ajouté au panier</>:<><ShoppingCart size={13}/>Ajouter au panier</>}
          </button>
          <button onClick={()=>setON(true)} className="btn-dark" style={{flex:1,padding:'12px'}}>Commander maintenant</button>
        </div>
      )}
      {(orderNow||!product.store?.cart)&&(
        <div style={{borderTop:'1px solid var(--br)',paddingTop:20,marginTop:8}}>
          {product.store?.cart&&(
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <span className="lbl" style={{margin:0}}>Formulaire de commande</span>
              <button onClick={()=>setON(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--mu)',display:'flex',alignItems:'center',gap:4,fontSize:'10px',fontFamily:"'Raleway',sans-serif",letterSpacing:'0.14em'}}><X style={{width:10,height:10}}/>Annuler</button>
            </div>
          )}
          <form onSubmit={submit}>
            <div className="f2">
              <FR label="Nom" error={errors.name}><input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="Nom complet" style={IS(!!errors.name)} onFocus={onF} onBlur={e=>onBl(e,!!errors.name)}/></FR>
              <FR label="Téléphone" error={errors.phone}><input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" style={IS(!!errors.phone)} onFocus={onF} onBlur={e=>onBl(e,!!errors.phone)}/></FR>
            </div>
            <div className="f2">
              <FR label="Wilaya" error={errors.w}>
                <div style={{position:'relative'}}>
                  <ChevronDown style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:12,height:12,color:'var(--mu)',pointerEvents:'none'}}/>
                  <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} style={{...IS(!!errors.w),paddingLeft:30}} onFocus={onF} onBlur={e=>onBl(e,!!errors.w)}>
                    <option value="">Choisir Wilaya</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR label="Commune" error={errors.c}>
                <div style={{position:'relative'}}>
                  <ChevronDown style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:12,height:12,color:'var(--mu)',pointerEvents:'none'}}/>
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya||lcC} onChange={e=>setFd({...fd,customerCommune:e.target.value})} style={{...IS(!!errors.c),paddingLeft:30,opacity:!fd.customerWelaya?0.5:1}} onFocus={onF} onBlur={e=>onBl(e,!!errors.c)}>
                    <option value="">{lcC?'...':'Choisir Commune'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <FR label="Mode de livraison">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {(['home','office'] as const).map(type=>(
                  <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))}
                    style={{padding:'11px',border:`1px solid ${fd.typeLivraison===type?'var(--cp)':'var(--br2)'}`,background:fd.typeLivraison===type?'var(--cl)':'transparent',cursor:'pointer',textAlign:'center',transition:'all .18s',fontFamily:"'Raleway',sans-serif"}}>
                    <p style={{fontSize:'10px',color:fd.typeLivraison===type?'var(--cp)':'var(--mu)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:4}}>{type==='home'?'Pour la maison':'Au bureau'}</p>
                    {selW&&<p style={{fontSize:'13px',fontWeight:700,color:fd.typeLivraison===type?'var(--cp)':'var(--tx)',fontFamily:"'Raleway',sans-serif"}}>{(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} DA</p>}
                  </button>
                ))}
              </div>
            </FR>
            <FR label="Quantité">
              <div style={{display:'inline-flex',alignItems:'center',border:'1px solid var(--br2)'}}>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',borderLeft:'1px solid var(--br2)',cursor:'pointer',color:'var(--mu)',transition:'color .15s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--tx)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mu)'}}>
                  <Minus style={{width:12,height:12}}/>
                </button>
                <span style={{width:40,textAlign:'center',fontWeight:700,fontSize:'1rem',lineHeight:'36px',display:'inline-block',fontFamily:"'Raleway',sans-serif"}}>{fd.quantity}</span>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))} style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',borderRight:'1px solid var(--br2)',cursor:'pointer',color:'var(--mu)',transition:'color .15s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--tx)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mu)'}}>
                  <Plus style={{width:12,height:12}}/>
                </button>
              </div>
            </FR>

            <div style={{background:'var(--s1)',padding:'14px',marginBottom:14}}>
              {[{l:'Prix',v:`${fp.toLocaleString()} DA`},{l:'Quantité',v:`× ${fd.quantity}`},{l:'Livraison',v:selW?`${getLiv().toLocaleString()} DA`:'—'}].map(r=>(
                <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--br)'}}>
                  <span style={{fontSize:'11px',color:'var(--mu)',letterSpacing:'0.08em'}}>{r.l}</span>
                  <span style={{fontSize:'12px',fontWeight:600,color:'var(--tx)',fontFamily:"'Raleway',sans-serif"}}>{r.v}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:10}}>
                <span style={{fontSize:'11px',fontWeight:700,color:'var(--tx)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Total</span>
                <span style={{fontSize:'1.4rem',fontWeight:800,color:'var(--cp)',fontFamily:"'Raleway',sans-serif"}}>{total().toLocaleString()} DA</span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-dark" style={{width:'100%',opacity:sub?0.6:1,cursor:sub?'not-allowed':'pointer'}}>
              {sub?<><Loader2 style={{width:13,height:13,animation:'sp 1s linear infinite'}}/>En cours...</>:<>Confirmer la commande <ArrowRight style={{width:13,height:13}}/></>}
            </button>
            <p style={{fontSize:'10px',color:'var(--mu)',textAlign:'center',marginTop:10,display:'flex',alignItems:'center',justifyContent:'center',gap:5,letterSpacing:'0.1em'}}>
              <Shield style={{width:10,height:10}}/> Paiement À la livraison
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

/* ══ CART ══ */
export function Cart({domain,store}:{domain:string;store:any}){
  const [items,setItems]=useState<any[]>([]);
  const [wilayas,setW]=useState<Wilaya[]>([]);
  const [communes,setC]=useState<Commune[]>([]);
  const [lcC,setLC]=useState(false);
  const [sub,setSub]=useState(false);
  const [done,setDone]=useState(false);
  const [fd,setFd]=useState({customerName:'',customerPhone:'',customerWelaya:'',customerCommune:'',typeLivraison:'home' as 'home'|'office'});
  const [errors,setE]=useState<Record<string,string>>({});
  const initCount=useCartStore(s=>s.initCount);
  const userId=store?.user?.id||store?.userId;

  useEffect(()=>{setItems(JSON.parse(localStorage.getItem(domain)||'[]'));if(userId)fw(userId).then(setW)},[domain,store]);
  useEffect(()=>{if(!fd.customerWelaya){setC([]);return}setLC(true);fc(fd.customerWelaya).then(d=>{setC(d);setLC(false)})},[fd.customerWelaya]);

  const selW=useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const getLiv=()=>{if(!selW)return 0;return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice};
  const sub2=items.reduce((a,i)=>a+(i.finalPrice*i.quantity),0);
  const grand=sub2+getLiv();
  const upd=(n:any[])=>{setItems(n);localStorage.setItem(domain,JSON.stringify(n));initCount(n.length)};

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    const er:Record<string,string>={};
    if(!fd.customerName.trim())er.name='Nom requis';
    if(!fd.customerPhone.trim()||!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim()))er.phone="Numéro invalide";
    if(!fd.customerWelaya)er.w='Wilaya requis';
    if(!fd.customerCommune)er.c="Commune requis";
    if(Object.keys(er).length){setE(er);return}
    setE({});setSub(true);
    try{await axios.post(`${API}/orders/create`,items.map(i=>({...fd,productId:i.productId,storeId:i.storeId,userId:i.userId,selectedOffer:i.selectedOffer,variantDetailId:i.variantDetailId,selectedVariants:i.selectedVariants,platform:i.platform||'store',finalPrice:i.finalPrice,totalPrice:grand,priceLivraison:getLiv(),quantity:i.quantity,customerId:i.customerId||'',priceLoss:selW?.livraisonReturn??0})));
    setDone(true);localStorage.removeItem(domain);setItems([]);initCount(0)}catch{}finally{setSub(false)}
  };

  const Center=({children}:{children:React.ReactNode})=>(
    <div dir="ltr" style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',background:'var(--bg)',fontFamily:"'Raleway',sans-serif"}}>
      <div style={{textAlign:'center'}}>{children}</div>
    </div>
  );

  if(done)return<Center><CheckCircle2 style={{width:40,height:40,color:'var(--cp)',display:'block',margin:'0 auto 16px'}}/><h2 className="bn" style={{fontSize:'2.5rem',color:'var(--tx)',letterSpacing:'0.06em',marginBottom:8}}>Commande confirmée</h2><p style={{fontSize:'12px',color:'var(--mu)',marginBottom:20,letterSpacing:'0.08em'}}>Nous vous contacterons bientôt.</p><Link href="/" className="btn-dark" style={{display:'inline-flex',textDecoration:'none'}}>Continuer les achats</Link></Center>;
  if(!items.length)return<Center><ShoppingCart style={{width:32,height:32,color:'var(--mu)',display:'block',margin:'0 auto 14px'}}/><h2 className="bn" style={{fontSize:'2rem',color:'var(--mu)',letterSpacing:'0.06em',marginBottom:16}}>Panier vide</h2><Link href="/" className="btn-dark" style={{display:'inline-flex',textDecoration:'none'}}>Acheter maintenant</Link></Center>;

  return(
    <div dir="ltr" style={{minHeight:'100vh',background:'var(--bg)',fontFamily:"'Raleway',sans-serif",padding:'32px'}}>
      <h1 style={{fontSize:'clamp(1.8rem,4vw,2.5rem)',fontWeight:800,color:'var(--tx)',letterSpacing:'0.04em',marginBottom:28}}>Panier</h1>
      <div className="cart-grid">
        {/* Items */}
        <div>
          {items.map((item,i)=>(
            <div key={i} style={{display:'flex',gap:14,padding:'14px 0',borderBottom:'1px solid var(--br)'}}>
              <div style={{width:72,height:96,flexShrink:0,overflow:'hidden',background:'var(--s2)'}}>
                <img src={item.product?.productImage||item.product?.imagesProduct?.[0]?.imageUrl} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt=""/>
              </div>
              <div style={{flex:1}}>
                <p style={{fontWeight:600,fontSize:'13px',color:'var(--tx)',marginBottom:4,letterSpacing:'0.03em'}}>{item.product?.name?.slice(0,40)}</p>
                <p style={{fontSize:'14px',fontWeight:800,color:'var(--cp)',marginBottom:10}}>{item.finalPrice?.toLocaleString()} DA</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'inline-flex',alignItems:'center',border:'1px solid var(--br2)'}}>
                    <button onClick={()=>{const n=[...items];n[i].quantity=Math.max(1,n[i].quantity-1);upd(n)}} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',color:'var(--mu)'}}>-</button>
                    <span style={{width:28,textAlign:'center',fontSize:'13px',fontWeight:700,lineHeight:'28px'}}>{item.quantity}</span>
                    <button onClick={()=>{const n=[...items];n[i].quantity+=1;upd(n)}} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',color:'var(--mu)'}}>+</button>
                  </div>
                  <button onClick={()=>upd(items.filter((_,idx)=>idx!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--mu)',display:'flex',alignItems:'center',gap:4,fontSize:'10px',letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:"'Raleway',sans-serif",transition:'color .15s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#c14040'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mu)'}}>
                    <Trash2 size={11}/> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:16}}>
            <span style={{fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--mu)'}}>Sous-total</span>
            <span style={{fontSize:'16px',fontWeight:800,color:'var(--tx)'}}>{sub2.toLocaleString()} DA</span>
          </div>
        </div>

        {/* Checkout */}
        <div style={{background:'var(--s1)',padding:'24px'}}>
          <p style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--cp)',marginBottom:20}}>Finaliser l'achat</p>
          <form onSubmit={submit}>
            <div className="f2">
              <FR label="Nom" error={errors.name}><input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} style={IS(!!errors.name)} onFocus={onF} onBlur={e=>onBl(e,!!errors.name)}/></FR>
              <FR label="Téléphone" error={errors.phone}><input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} style={IS(!!errors.phone)} onFocus={onF} onBlur={e=>onBl(e,!!errors.phone)}/></FR>
            </div>
            <div className="f2">
              <FR label="Wilaya" error={errors.w}>
                <div style={{position:'relative'}}><ChevronDown style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:12,height:12,color:'var(--mu)',pointerEvents:'none'}}/><select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} style={{...IS(!!errors.w),paddingLeft:30}} onFocus={onF} onBlur={e=>onBl(e,!!errors.w)}><option value="">Choisir</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}</select></div>
              </FR>
              <FR label="Commune" error={errors.c}>
                <div style={{position:'relative'}}><ChevronDown style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:12,height:12,color:'var(--mu)',pointerEvents:'none'}}/><select value={fd.customerCommune} disabled={lcC||!fd.customerWelaya} onChange={e=>setFd({...fd,customerCommune:e.target.value})} style={{...IS(!!errors.c),paddingLeft:30,opacity:!fd.customerWelaya?0.5:1}} onFocus={onF} onBlur={e=>onBl(e,!!errors.c)}><option value="">{lcC?'...':'Choisir'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}</select></div>
              </FR>
            </div>
            {[{l:'Produits',v:`${sub2.toLocaleString()} DA`},{l:'Livraison',v:getLiv()?`${getLiv().toLocaleString()} DA`:'—'}].map(r=>(
              <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--br)'}}>
                <span style={{fontSize:'11px',color:'var(--mu)',letterSpacing:'0.08em'}}>{r.l}</span>
                <span style={{fontSize:'12px',fontWeight:600,color:'var(--tx)'}}>{r.v}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0 16px'}}>
              <span style={{fontSize:'11px',fontWeight:700,color:'var(--tx)',letterSpacing:'0.12em',textTransform:'uppercase'}}>Total</span>
              <span style={{fontSize:'1.4rem',fontWeight:800,color:'var(--cp)'}}>{grand.toLocaleString()} DA</span>
            </div>
            <button type="submit" disabled={sub} className="btn-dark" style={{width:'100%',opacity:sub?0.6:1,cursor:sub?'not-allowed':'pointer'}}>
              {sub?<><Loader2 style={{width:13,height:13,animation:'sp 1s linear infinite'}}/>En cours...</>:<>Confirmer la commande <ArrowRight style={{width:13,height:13}}/></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ══ STATIC PAGES ══ */
export function StaticPage({staticPage,page,store}:any){
  const p=(staticPage||page||'').toLowerCase();
  return<>{p==='privacy'&&<Privacy/>}{p==='terms'&&<Terms/>}{p==='cookies'&&<Cookies/>}{p==='contact'&&<Contact store={store}/>}</>;
}

const PageWrap=({title,children}:{title:string;children:React.ReactNode})=>(
  <div dir="ltr" style={{background:'var(--bg)',fontFamily:"'Raleway',sans-serif",minHeight:'100vh',padding:'40px 32px 80px'}}>
    <h1 style={{fontSize:'clamp(1.8rem,4vw,2.5rem)',fontWeight:800,color:'var(--tx)',letterSpacing:'0.03em',marginBottom:32,paddingBottom:16,borderBottom:'1px solid var(--br)'}}>{title}</h1>
    {children}
  </div>
);
const Row=({title,body,tag}:{title:string;body:string;tag?:string})=>(
  <div style={{borderBottom:'1px solid var(--br)',padding:'18px 0',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16}}>
    <div style={{flex:1}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
        <p style={{fontSize:'12px',fontWeight:700,color:'var(--tx)',letterSpacing:'0.12em',textTransform:'uppercase'}}>{title}</p>
        {tag&&<span style={{fontSize:'9px',padding:'2px 7px',border:'1px solid var(--cp)',color:'var(--cp)',letterSpacing:'0.14em',textTransform:'uppercase'}}>{tag}</span>}
      </div>
      <p style={{fontSize:'13px',lineHeight:1.8,color:'var(--mu)',letterSpacing:'0.04em'}}>{body}</p>
    </div>
  </div>
);

export function Privacy(){return<PageWrap title="Politique de confidentialité"><Row title="Les données que nous collectons" body="Nom, numéro de téléphone et adresse de livraison uniquement — le minimum pour traiter votre commande."/><Row title="Utilisation des données" body="Utilisées exclusivement pour traiter et livrer votre commande. Pas de marketing ni de vente à des tiers."/><Row title="Sécurité" body="Nous utilisons le chiffrement pour protéger vos données en tout temps."/><Row title="Partage des données" body="Nous ne vendons pas vos données. Partagées avec les partenaires de livraison." tag="Garanti"/></PageWrap>}
export function Terms(){return<PageWrap title="Conditions d'utilisation"><Row title="Commandes et prix" body="Aucuns frais cachés. Le prix affiché est le prix final."/><Row title="Qualité des produits" body="Nous garantissons la qualité de tous nos produits." tag="Garanti"/><Row title="Livraison" body="Livraison sous 24-72 heures. Paiement à la livraison."/><Row title="Loi" body="Ces conditions sont soumises aux lois de la République Algérienne."/></PageWrap>}
export function Cookies(){return<PageWrap title="Politique de cookies"><Row title="Fichiers essentiels" body="Requis pour faire fonctionner les sessions et le panier." tag="toujours"/><Row title="Fichiers préférences" body="Sauvegarde vos préférences pour une meilleure expérience." tag="Facultatif"/><Row title="Fichiers analytiques" body="Données agrégées pour l'amélioration de l'expérience." tag="Facultatif"/></PageWrap>}

export function Contact({store}:{store?:any}){
  const [form,setForm]=useState({name:'',email:'',phone:'',message:''});
  const [sent,setSent]=useState(false);
  const [loading,setL]=useState(false);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setL(true);try{await axios.post(`${API}/user/contact-user/message`,{...form,storeId:store?.id});setSent(true)}catch{showError('Une Erreur est survenue')}finally{setL(false)}};
  return(
    <div dir="ltr" style={{background:'var(--bg)',fontFamily:"'Raleway',sans-serif",minHeight:'100vh',padding:'40px 32px 80px'}}>
      <h1 style={{fontSize:'clamp(1.8rem,4vw,2.5rem)',fontWeight:800,color:'var(--tx)',letterSpacing:'0.03em',marginBottom:32,paddingBottom:16,borderBottom:'1px solid var(--br)'}}>Contactez-nous</h1>
      <div className="contact-layout">
        <div>
          {[{e:'📞',l:'Téléphone',v:store?.contact?.phone},{e:'📍',l:'adresse',v:[store?.contact?.wilaya,store?.contact?.address].filter(Boolean).join(' / ')},{e:'✉️',l:'Email',v:store?.contact?.email}].filter(r=>r.v).map(item=>(
            <div key={item.l} style={{padding:'14px 0',borderBottom:'1px solid var(--br)'}}>
              <span className="lbl">{item.l}</span>
              <p style={{fontSize:'13px',color:'var(--tx)',letterSpacing:'0.04em',display:'flex',alignItems:'center',gap:8}}><span>{item.e}</span>{item.v}</p>
            </div>
          ))}
        </div>
        {sent?(<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:240,textAlign:'center'}}><CheckCircle2 style={{width:36,height:36,color:'var(--cp)',marginBottom:12}}/><h2 style={{fontWeight:800,fontSize:'1.2rem',color:'var(--tx)',marginBottom:6}}>Envoyé</h2><p style={{fontSize:'12px',color:'var(--mu)'}}>Nous vous contacterons Bient't</p></div>):(
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:4}}>
            <div className="f2">
              <FR label='Nom'><input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required style={IS()} onFocus={onF} onBlur={e=>onBl(e)}/></FR>
              <FR label="Téléphone"><input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required style={IS()} onFocus={onF} onBlur={e=>onBl(e)}/></FR>
            </div>
            <FR label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required style={IS()} onFocus={onF} onBlur={e=>onBl(e)}/></FR>
            <FR label="Votre message"><textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={5} required style={{...IS(),resize:'none'}} onFocus={onF} onBlur={e=>onBl(e)}/></FR>
            <button type="submit" disabled={loading} className="btn-dark" style={{justifyContent:'center',marginTop:8,opacity:loading?0.65:1,cursor:loading?'not-allowed':'pointer'}}>
              {loading?<><Loader2 style={{width:13,height:13,animation:'sp 1s linear infinite'}}/>En cours...</>:'Envoyer le message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
