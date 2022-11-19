"use strict";(self.webpackChunkjs=self.webpackChunkjs||[]).push([[179],{36:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Biquad=void 0;class s{constructor(t=0,e=0,s=0,o=0,i=0){this.a1=t,this.a2=e,this.b0=s,this.b1=o,this.b2=i,this.xz1=0,this.xz2=0,this.yz1=0,this.yz2=0}static create_bandpass(t,e,o,i){const r=Math.pow(10,e/40),n=2*Math.PI*t/i,a=Math.sin(n),c=Math.cos(n),l=a/(2*o),h=1+l/r;return new s(-2*c/h,(1-l/r)/h,(1+l*r)/h,-2*c/h,(1-l*r)/h)}reset(){this.xz1=0,this.xz2=0,this.yz1=0,this.yz2=0}apply(t){const e=this.a1,s=this.a2,o=this.b0,i=this.b1,r=this.b2;let n=this.xz1,a=this.xz1,c=this.yz1,l=this.yz2;const h=t.length;new Float32Array(h);for(let d=0;d<h;++d){const h=t[d],u=h*o+n*i+a*r-c*e-l*s;t[d]=u,a=n,n=h,l=c,c=u}this.xz1=n,this.xz2=n,this.yz1=c,this.yz2=l}}e.Biquad=s},450:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.ControlsView=void 0;const o=s(629),i=s(803);e.ControlsView=class{constructor(t){this.model=t}bind(t){const e=i.select("aside").selectAll("label.control.q").data([1]).enter().append("label").attr("class","control q");e.append("span").attr("class","control-name q").text("q"),e.append("input").attr("class","slider q").attr("type","range").attr("min","-10").attr("max","10").attr("value",0).on("input",(e=>t.set_q(Math.pow(10,e.currentTarget.value/10)))),e.append("span").attr("class","control-value q").text("");const s=i.select("aside").selectAll("label.control.eq.g").data(o.eq_freq.map(((t,e)=>({x:t,i:e})))).enter().append("label").attr("class","control eq g");s.append("span").attr("class","control-name eq").text((({x:t})=>t<1e3?`${t}`:t/1e3+"k")),s.append("input").attr("class","slider eq").attr("type","range").attr("min","-32").attr("max","32").attr("value",0).on("input",((e,{i:s})=>t.set_gain(s,e.currentTarget.value))),s.append("span").attr("class","control-value eq").text("")}update(){const t=this.model,e=i.select("aside").selectAll("label.control.q").data([t.q]);e.select(".slider.q").attr("value",(e=>Math.round(10*Math.log10(t.q)))),e.select(".control-value.q").text((t=>t.toFixed(1)));const s=i.select("aside").selectAll("label.control.eq").data(t.eq);s.select(".slider.eq").attr("value",(t=>t.g)),s.select(".control-value.eq").text((t=>`${t.g}dB`))}}},609:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.CursorView=void 0;const o=s(803);e.CursorView=class{constructor(t){this.model=t,this.node=o.select(".cursor")}bind(t){this.node.append("span").attr("class","cursor-x"),this.node.append("span").attr("class","cursor-y"),this.node.append("span").attr("class","cursor-v")}update(){var t;const{cursor_f:e,cursor_db:s,value_db:o}=this.model.cursor;this.node.select(".cursor-x").text(`x: ${e.toFixed(0)} Hz`),this.node.select(".cursor-y").text(`y: ${s.toFixed(2)} dB`),this.node.select(".cursor-v").text(`value: ${null!==(t=null==o?void 0:o.toFixed(2))&&void 0!==t?t:"-"} dB`)}}},74:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.DefaultModel=void 0;const o=s(629);e.DefaultModel=class{constructor(t){this.strategy=t,this.q=1,this.eq=o.eq_freq.map(((t,e)=>({i:e,f:t,g:0,q:1}))),this.cursor={cursor_f:0,cursor_db:0,value_db:null},this.spectrum=new Float32Array(0)}interpolate_db(t){const e=this.spectrum;for(let s=0;s<e.length-2;s+=2){const o=e[s],i=e[s+2];if(t>=o&&t<=i&&i>o){const r=(t-o)/(i-o),n=e[s+1];return n+r*(e[s+3]-n)}}return null}update_cursor(){this.cursor.value_db=this.interpolate_db(this.cursor.cursor_f)}update_eq(){this.spectrum=this.strategy.calculate(this.eq),this.update_cursor()}set_q(t){this.q=t;for(const e of this.eq)e.q=t;this.update_eq()}set_gain(t,e){this.eq[t].g=e,this.update_eq()}set_cursor(t,e){this.cursor={cursor_f:t,cursor_db:e,value_db:null},this.update_cursor()}}},522:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Equaliser=void 0;const o=s(36);e.Equaliser=class{constructor(t,e){const{rate:s}=t;this.filters=e.map((({f:t,g:e,q:i})=>o.Biquad.create_bandpass(t,e,i,s)))}apply(t){for(const e of this.filters)e.apply(t)}}},575:function(t,e,s){var o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0}),e.FourierStrategy=void 0;const i=s(805),r=s(250),n=s(522),a=o(s(664));e.FourierStrategy=class{constructor(t){this.config=t,this.fft=new a.default(t.size),this.signal=new r.SignalFactory(t).generate_noise(),this.baseline=this.get_spectrum(this.signal)}get_spectrum(t){const e=new i.Mapping(this.config),{size:s}=this.config,o=new Float32Array(2*s);this.fft.realTransform(o,[...t]);const r=new Float32Array(s);for(let i=0;i<s;i+=2){const s=Math.hypot(o[i],o[i+1])/Math.sqrt(t.length)/128;r[i]=e.i_to_f(i/2),r[i+1]=s}return r}calculate(t){const e=new i.Mapping(this.config),{size:s}=this.config,o=new Float32Array(this.signal);new n.Equaliser(this.config,t).apply(o);const r=this.get_spectrum(o);for(let t=1;t<r.length;t+=2)r[t]=e.level_to_db(r[t]/this.baseline[t]);return r}}},132:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.MainController=void 0,e.MainController=class{constructor(t,e,s){this.config=t,this.model=e,this.views=s;for(const t of this.views)t.bind(this);this.update()}update(){for(const t of this.views)t.update()}set_q(t){this.model.set_q(t),this.update()}set_gain(t,e){this.model.set_gain(t,e),this.update()}set_cursor(t,e){this.model.set_cursor(t,e),this.update()}}},805:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Mapping=void 0;const s=.01,o=.98;e.Mapping=class{constructor(t,e=null,s=-60,o=60){var i,r;this.config=t,this.db_min=s,this.db_max=o,this.fmin=10,this.fmax=Math.min(2e4,t.rate/2),this.width=null!==(i=null==e?void 0:e.width)&&void 0!==i?i:0,this.height=null!==(r=null==e?void 0:e.height)&&void 0!==r?r:0}project(t,e){const{width:i,height:r}=this;return[(t*o+s)*i,(e*o+s)*r]}level_to_db(t){const{db_min:e,db_max:s}=this;return Math.min(s,Math.max(e,20*Math.log10(t)))}i_to_f(t){const{rate:e,size:s}=this.config;return t*e/s}f_to_i(t){const{size:e,rate:s}=this.config;return Math.min(e/2-1,Math.max(0,Math.round(t*e/s)))}project_x(t,e,s){const o=Math.log(t),i=Math.log(e);return(o-i)/(Math.log(s)-i)}project_f(t){return this.project_x(t,this.fmin,this.fmax)}project_db(t){const{db_min:e,db_max:s}=this;return(s-t)/(s-e)}unproject(t,e){const{width:i,height:r}=this;return[(t/i-s)/o,(e/r-s)/o]}unproject_f(t){const{fmin:e,fmax:s}=this,o=Math.log(e),i=Math.log(s);return Math.exp(t*(i-o)+o)}unproject_i(t){const{size:e,rate:s}=this.config,o=this.unproject_f(t);return this.f_to_i(Math.round(o*e/s))}unproject_db(t){const{db_min:e,db_max:s}=this;return s-t*(s-e)}}},781:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.SerialStrategy=void 0;const o=s(805),i=s(522),r=s(250);e.SerialStrategy=class{constructor(t){this.config=t;const{rate:e}=this.config,s=new o.Mapping(this.config),i=0|Math.floor(Math.log10(s.fmin)),n=20*((0|Math.ceil(Math.log10(s.fmax)))-i);this.sines=new Array(n).fill(null).map(((t,s)=>{const o=s/20+i,n=Math.pow(10,o),a=e/n;return{f:n,y:new r.SignalFactory({size:a,rate:e}).generate_sine(n)}}))}calculate(t){const e=new o.Mapping(this.config),s=new Float32Array(2*this.sines.length);let r=0;for(const{f:o,y:n}of this.sines){const a=new Float32Array(n);new i.Equaliser(this.config,t).apply(a);const c=a.reduce(((t,e)=>Math.max(t,Math.abs(e))),0),l=e.level_to_db(c);s[r++]=o,s[r++]=l}return s}}},250:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.SignalFactory=void 0,e.SignalFactory=class{constructor(t){this.config=t}generate_all(){return{noise:this.generate_noise(),pure:this.generate_sine(this.config.rate/4)}}generate_noise(){const{size:t}=this.config,e=new Float32Array(t);for(let s=0;s<t;++s)e[s]+=(2*Math.random()-1)*Math.sqrt(t)*2;return e}generate_sine(t){const{size:e,rate:s}=this.config,o=new Float32Array(e);for(let i=0;i<e;++i)o[i]=Math.sin(2*Math.PI*t*i/s);return o}}},685:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.SpectrumView=void 0;const o=s(805),i=s(59),r=s(803);e.SpectrumView=class{constructor(t,e){this.config=t,this.model=e;const s=r.select(".viewer");this.node=s.node(),this.context=this.node.getContext("2d")}viewer_onclick(t,e){const s=r.select(".viewer").node(),{rate:i,size:n}=this.config,a=new o.Mapping(this.config,s),[c,l]=a.unproject(e.clientX*devicePixelRatio,e.clientY*devicePixelRatio),h=a.unproject_f(c),d=a.unproject_db(l);t.set_cursor(h,d)}on_resize(){const t=this.node.clientWidth,e=this.node.clientHeight,s=window.devicePixelRatio;this.node.width=Math.round(t*s),this.node.height=Math.round(e*s),this.update()}bind(t){new ResizeObserver(i.debounce((()=>this.on_resize()),40,{leading:!0,trailing:!0})).observe(this.node),this.node.addEventListener("click",(e=>this.viewer_onclick(t,e)))}update(){const t=this.config,e=this.model,s=this.node,i=this.context,r=s.width,n=s.height;i.clearRect(0,0,r,n);const a=new o.Mapping(t,s),{db_min:c,db_max:l}=a;i.globalCompositeOperation="lighter";{i.lineWidth=2,i.strokeStyle="red",i.beginPath(),i.moveTo(...a.project(a.project_f(a.fmin),a.project_db(0)));const t=e.spectrum;for(let e=0;e<t.length;e+=2){const s=t[e],o=t[e+1];s>=a.fmin&&s<=a.fmax&&i.lineTo(...a.project(a.project_f(s),a.project_db(o)))}i.stroke()}i.strokeStyle="orange",i.lineWidth=4,i.beginPath(),i.moveTo(...a.project(a.project_f(a.fmin),a.project_db(0)));for(const{f:t,g:s}of e.eq)i.lineTo(...a.project(a.project_f(t),a.project_db(s)));i.lineTo(...a.project(a.project_f(a.fmax),a.project_db(0))),i.stroke(),i.lineWidth=6;for(const{f:t,g:s}of e.eq){const[e,o]=a.project(a.project_f(t),a.project_db(s));i.beginPath(),i.rect(e-1/r,o-1/n,2/r,2/n),i.stroke()}for(let t=a.fmin;t<a.fmax;t*=10)for(let e=1;e<10&&t*e<a.fmax;e++)i.lineWidth=1==e?4:2,i.strokeStyle=1==e?"blue":"green",i.beginPath(),i.moveTo(...a.project(a.project_f(t*e),0)),i.lineTo(...a.project(a.project_f(t*e),1)),i.stroke();for(let t=6*Math.ceil(c/6);t<=l;t+=6)i.lineWidth=0==t?4:2,i.strokeStyle=0==t?"blue":"green",i.beginPath(),i.moveTo(...a.project(0,a.project_db(t))),i.lineTo(...a.project(1,a.project_db(t))),i.stroke();i.lineWidth=4,i.strokeStyle="silver",i.beginPath(),i.moveTo(...a.project(0,0)),i.lineTo(...a.project(1,0)),i.lineTo(...a.project(1,1)),i.lineTo(...a.project(0,1)),i.lineTo(...a.project(0,0)),i.stroke()}}},629:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.eq_freq=void 0,e.eq_freq=[25,31.5,40,50,63,80,100,125,160,200,250,315,400,500,630,800,1e3,1250,1600,2e3,2500,3150,4e3,5e3,6300,8e3,1e4,12500,16e3,2e4]},4:(t,e,s)=>{const o=s(74),i=s(450),r=s(685),n=s(609),a=s(132),c=s(575),l=s(781);!function(){const t=window.location.hash.replace(/^#/,"")||"fourier",e={fourier:{rate:65536,size:32768},sines:{rate:6e4,size:2e4}}[t],s={fourier:()=>new c.FourierStrategy(e),sines:()=>new l.SerialStrategy(e)}[t](),h=new o.DefaultModel(s),d=[new i.ControlsView(h),new n.CursorView(h),new r.SpectrumView(e,h)];new a.MainController(e,h,d)}()}},t=>{t.O(0,[216],(()=>(4,t(t.s=4)))),t.O()}]);
//# sourceMappingURL=main.js.map