"use strict";(self.webpackChunkjs=self.webpackChunkjs||[]).push([[179],{142:(t,e,n)=>{const o=[25,31.5,40,50,63,80,100,125,160,200,250,315,400,500,630,800,1e3,1250,1600,2e3,2500,3150,4e3,5e3,6300,8e3,1e4,12500,16e3,2e4];var i=function(t,e,n,o){return new(n||(n=Promise))((function(i,s){function r(t){try{a(o.next(t))}catch(t){s(t)}}function c(t){try{a(o.throw(t))}catch(t){s(t)}}function a(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(r,c)}a((o=o.apply(t,e||[])).next())}))};class s{constructor(t){this.strategy=t,this.q=1,this.eq=o.map(((t,e)=>({i:e,f:t,g:0,q:1}))),this.cursor={cursor_f:0,cursor_db:0,value_db:null},this.spectrum=new Float32Array(0),this.init=this.update_eq()}interpolate_db(t){const e=this.spectrum;for(let n=0;n<e.length-2;n+=2){const o=e[n],i=e[n+2];if(t>=o&&t<=i&&i>o){const s=(t-o)/(i-o),r=e[n+1];return r+s*(e[n+3]-r)}}return null}update_cursor(){this.cursor.value_db=this.interpolate_db(this.cursor.cursor_f)}update_eq(){return i(this,void 0,void 0,(function*(){const t=+new Date;this.spectrum=yield this.strategy.calculate(this.eq),this.update_cursor();const e=+new Date;console.log(`Calculation took ${e-t} ms`)}))}set_q(t){return i(this,void 0,void 0,(function*(){yield this.init,this.q=t;for(const e of this.eq)e.q=t;yield this.update_eq()}))}set_gain(t,e){return i(this,void 0,void 0,(function*(){yield this.init,this.eq[t].g=e,yield this.update_eq()}))}set_cursor(t,e){return i(this,void 0,void 0,(function*(){yield this.init,this.cursor={cursor_f:t,cursor_db:e,value_db:null},this.update_cursor()}))}}const r=n(59),c=n(803);function a(t){return r.debounce(t,50,{leading:!1,trailing:!0})}class h{constructor(t){this.model=t,this.debounced_set_q=a(this.set_q),this.debounced_set_gain=a(this.set_gain)}set_q(t,e){t.set_q(Math.pow(10,e/10)).catch(console.error)}set_gain(t,e,n){t.set_gain(e,n).catch(console.error)}bind(t){const e=c.select("aside").selectAll("label.control.q").data([1]).enter().append("label").attr("class","control q");e.append("span").attr("class","control-name q").text("q"),e.append("input").attr("class","slider q").attr("type","range").attr("min","-10").attr("max","10").attr("value",0).on("input",(e=>this.debounced_set_q(t,e.currentTarget.value))),e.append("span").attr("class","control-value q").text("");const n=c.select("aside").selectAll("label.control.eq.g").data(o.map(((t,e)=>({x:t,i:e})))).enter().append("label").attr("class","control eq g");n.append("span").attr("class","control-name eq").text((({x:t})=>t<1e3?`${t}`:t/1e3+"k")),n.append("input").attr("class","slider eq").attr("type","range").attr("min","-32").attr("max","32").attr("value",0).on("input",((e,{i:n})=>this.debounced_set_gain(t,n,e.currentTarget.value))),n.append("span").attr("class","control-value eq").text("")}update(){return t=this,e=void 0,o=function*(){const t=this.model,e=c.select("aside").selectAll("label.control.q").data([t.q]);e.select(".slider.q").attr("value",(e=>Math.round(10*Math.log10(t.q)))),e.select(".control-value.q").text((t=>t.toFixed(1)));const n=c.select("aside").selectAll("label.control.eq").data(t.eq);n.select(".slider.eq").attr("value",(t=>t.g)),n.select(".control-value.eq").text((t=>`${t.g}dB`))},new((n=void 0)||(n=Promise))((function(i,s){function r(t){try{a(o.next(t))}catch(t){s(t)}}function c(t){try{a(o.throw(t))}catch(t){s(t)}}function a(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(r,c)}a((o=o.apply(t,e||[])).next())}));var t,e,n,o}}const l=.01,u=.98;class d{constructor(t,e=null,n=-60,o=60){var i,s;this.config=t,this.db_min=n,this.db_max=o,this.fmin=10,this.fmax=Math.min(2e4,t.rate/2),this.width=null!==(i=null==e?void 0:e.width)&&void 0!==i?i:0,this.height=null!==(s=null==e?void 0:e.height)&&void 0!==s?s:0}project(t,e){const{width:n,height:o}=this;return[(t*u+l)*n,(e*u+l)*o]}level_to_db(t){const{db_min:e,db_max:n}=this;return Math.min(n,Math.max(e,20*Math.log10(t)))}i_to_f(t){const{rate:e,size:n}=this.config;return t*e/n}f_to_i(t){const{size:e,rate:n}=this.config;return Math.min(e/2-1,Math.max(0,Math.round(t*e/n)))}project_x(t,e,n){const o=Math.log(t),i=Math.log(e);return(o-i)/(Math.log(n)-i)}project_f(t){return this.project_x(t,this.fmin,this.fmax)}project_db(t){const{db_min:e,db_max:n}=this;return(n-t)/(n-e)}unproject(t,e){const{width:n,height:o}=this;return[(t/n-l)/u,(e/o-l)/u]}unproject_f(t){const{fmin:e,fmax:n}=this,o=Math.log(e),i=Math.log(n);return Math.exp(t*(i-o)+o)}unproject_i(t){const{size:e,rate:n}=this.config,o=this.unproject_f(t);return this.f_to_i(Math.round(o*e/n))}unproject_db(t){const{db_min:e,db_max:n}=this;return n-t*(n-e)}}const f=n(59),p=n(803);class _{constructor(t,e){this.config=t,this.model=e;const n=p.select(".viewer");this.node=n.node(),this.context=this.node.getContext("2d")}onresize(){const t=this.node.clientWidth,e=this.node.clientHeight,n=window.devicePixelRatio;this.node.width=Math.round(t*n),this.node.height=Math.round(e*n),this.update()}onmovecursor(t,e,n){const o=p.select(".viewer").node(),{rate:i,size:s}=this.config,r=new d(this.config,o),[c,a]=r.unproject(e*devicePixelRatio,n*devicePixelRatio),h=r.unproject_f(c),l=r.unproject_db(a);t.set_cursor(h,l)}onmousemove(t,e){1&e.buttons&&this.onmovecursor(t,e.clientX,e.clientY)}ontouchmove(t,e){const n=e.touches.item(0);null!==n&&this.onmovecursor(t,n.clientX,n.clientY)}bind(t){new ResizeObserver(f.debounce((()=>this.onresize()),40,{leading:!0,trailing:!0})).observe(this.node),this.node.addEventListener("mousedown",(e=>this.onmousemove(t,e))),this.node.addEventListener("mousemove",(e=>this.onmousemove(t,e))),this.node.addEventListener("touchstart",(e=>this.ontouchmove(t,e))),this.node.addEventListener("touchmove",(e=>this.ontouchmove(t,e)))}update(){return t=this,e=void 0,o=function*(){const t=this.config,e=this.model,n=this.node,o=this.context,i=n.width,s=n.height;o.clearRect(0,0,i,s);const r=new d(t,n),{db_min:c,db_max:a}=r;o.globalCompositeOperation="lighter";{o.lineWidth=2,o.strokeStyle="red",o.beginPath(),o.moveTo(...r.project(r.project_f(r.fmin),r.project_db(0)));const t=e.spectrum;for(let e=0;e<t.length;e+=2){const n=t[e],i=t[e+1];n>=r.fmin&&n<=r.fmax&&o.lineTo(...r.project(r.project_f(n),r.project_db(i)))}o.stroke()}o.strokeStyle="orange",o.lineWidth=4,o.beginPath(),o.moveTo(...r.project(r.project_f(r.fmin),r.project_db(0)));for(const{f:t,g:n}of e.eq)o.lineTo(...r.project(r.project_f(t),r.project_db(n)));o.lineTo(...r.project(r.project_f(r.fmax),r.project_db(0))),o.stroke(),o.lineWidth=6;for(const{f:t,g:n}of e.eq){const[e,c]=r.project(r.project_f(t),r.project_db(n));o.beginPath(),o.rect(e-1/i,c-1/s,2/i,2/s),o.stroke()}for(let t=r.fmin;t<r.fmax;t*=10)for(let e=1;e<10&&t*e<r.fmax;e++)o.lineWidth=1==e?4:2,o.strokeStyle=1==e?"blue":"green",o.beginPath(),o.moveTo(...r.project(r.project_f(t*e),0)),o.lineTo(...r.project(r.project_f(t*e),1)),o.stroke();for(let t=6*Math.ceil(c/6);t<=a;t+=6)o.lineWidth=0==t?4:2,o.strokeStyle=0==t?"blue":"green",o.beginPath(),o.moveTo(...r.project(0,r.project_db(t))),o.lineTo(...r.project(1,r.project_db(t))),o.stroke();o.lineWidth=4,o.strokeStyle="silver",o.beginPath(),o.moveTo(...r.project(0,0)),o.lineTo(...r.project(1,0)),o.lineTo(...r.project(1,1)),o.lineTo(...r.project(0,1)),o.lineTo(...r.project(0,0)),o.stroke();{const t=e.cursor;o.lineWidth=8,o.strokeStyle="cyan";const n=t.cursor_f,c=t.cursor_db,a=t.value_db,[h,l]=r.project(r.project_f(n),r.project_db(c));if(o.beginPath(),o.rect(h-1/i,l-1/s,2/i,2/s),o.stroke(),null!==a){o.setLineDash([4,4]);const[t,e]=r.project(r.project_f(n),r.project_db(a));o.beginPath(),o.rect(t-1/i,e-1/s,2/i,2/s),o.stroke(),o.lineWidth=2,o.beginPath(),o.moveTo(h,l),o.lineTo(t,e),o.stroke(),o.setLineDash([])}}},new((n=void 0)||(n=Promise))((function(i,s){function r(t){try{a(o.next(t))}catch(t){s(t)}}function c(t){try{a(o.throw(t))}catch(t){s(t)}}function a(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(r,c)}a((o=o.apply(t,e||[])).next())}));var t,e,n,o}}const v=n(803);class g{constructor(t){this.model=t,this.node=v.select(".cursor")}bind(t){this.node.append("span").attr("class","cursor-x"),this.node.append("span").attr("class","cursor-y"),this.node.append("span").attr("class","cursor-v")}update(){var t,e,n,o,i;return e=this,n=void 0,i=function*(){const{cursor_f:e,cursor_db:n,value_db:o}=this.model.cursor;this.node.select(".cursor-x").text(`x: ${e.toFixed(0)} Hz`),this.node.select(".cursor-y").text(`y: ${n.toFixed(2)} dB`),this.node.select(".cursor-v").text(`value: ${null!==(t=null==o?void 0:o.toFixed(2))&&void 0!==t?t:"-"} dB`)},new((o=void 0)||(o=Promise))((function(t,s){function r(t){try{a(i.next(t))}catch(t){s(t)}}function c(t){try{a(i.throw(t))}catch(t){s(t)}}function a(e){var n;e.done?t(e.value):(n=e.value,n instanceof o?n:new o((function(t){t(n)}))).then(r,c)}a((i=i.apply(e,n||[])).next())}))}}var m=function(t,e,n,o){return new(n||(n=Promise))((function(i,s){function r(t){try{a(o.next(t))}catch(t){s(t)}}function c(t){try{a(o.throw(t))}catch(t){s(t)}}function a(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(r,c)}a((o=o.apply(t,e||[])).next())}))};class b{constructor(t,e,n){this.config=t,this.model=e,this.views=n,this.next_view_update=null;for(const t of this.views)t.bind(this);this.update()}update(){return m(this,void 0,void 0,(function*(){const t=+new Date;yield new Promise(((t,e)=>{null!==this.next_view_update&&cancelAnimationFrame(this.next_view_update),this.next_view_update=requestAnimationFrame((()=>{this.next_view_update=null,Promise.all(this.views.map((t=>t.update()))).then(t,e)}))}));const e=+new Date;console.log(`UI update took ${e-t} ms`)}))}set_q(t){return m(this,void 0,void 0,(function*(){yield this.model.set_q(t),yield this.update()}))}set_gain(t,e){return m(this,void 0,void 0,(function*(){yield this.model.set_gain(t,e),yield this.update()}))}set_cursor(t,e){return m(this,void 0,void 0,(function*(){yield this.model.set_cursor(t,e),yield this.update()}))}}class w{constructor(t){this.config=t}generate_all(){return{noise:this.generate_noise(),pure:this.generate_sine(this.config.rate/4)}}generate_noise(){const{size:t}=this.config,e=new Float32Array(t);for(let n=0;n<t;++n)e[n]+=(2*Math.random()-1)*Math.sqrt(t)*2;return e}generate_sinusoid(t,e=0){const{size:n,rate:o}=this.config,i=new Float32Array(n);for(let s=0;s<n;++s)i[s]=Math.sin(2*Math.PI*t*s/o+e);return i}generate_sine(t){return this.generate_sinusoid(t,0)}generate_cosine(t){return this.generate_sinusoid(t,Math.PI/2)}}class y{constructor(t=0,e=0,n=0,o=0,i=0){this.a1=t,this.a2=e,this.b0=n,this.b1=o,this.b2=i,this.xz1=0,this.xz2=0,this.yz1=0,this.yz2=0}static create_bandpass(t,e,n,o){const i=Math.pow(10,e/40),s=2*Math.PI*t/o,r=Math.sin(s),c=Math.cos(s),a=r/(2*n),h=1+a/i;return new y(-2*c/h,(1-a/i)/h,(1+a*i)/h,-2*c/h,(1-a*i)/h)}reset(){this.xz1=0,this.xz2=0,this.yz1=0,this.yz2=0}apply(t){const e=this.a1,n=this.a2,o=this.b0,i=this.b1,s=this.b2;let r=this.xz1,c=this.xz1,a=this.yz1,h=this.yz2;const l=t.length;new Float32Array(l);for(let u=0;u<l;++u){const l=t[u],d=l*o+r*i+c*s-a*e-h*n;t[u]=d,c=r,r=l,h=a,a=d}this.xz1=r,this.xz2=r,this.yz1=a,this.yz2=h}}class x{constructor(t,e){const{rate:n}=t;this.filters=e.map((({f:t,g:e,q:o})=>y.create_bandpass(t,e,o,n)))}apply(t){for(const e of this.filters)e.apply(t)}}var j=n(664),q=n.n(j);class M{constructor(t){this.config=t,this.fft=new(q())(t.size),this.signal=new w(t).generate_noise(),this.baseline=this.get_spectrum(this.signal)}get_spectrum(t){const e=new d(this.config),{size:n}=this.config,o=new Float32Array(2*n);this.fft.realTransform(o,[...t]);const i=new Float32Array(n);for(let s=0;s<n;s+=2){const n=Math.hypot(o[s],o[s+1])/Math.sqrt(t.length)/128;i[s]=e.i_to_f(s/2),i[s+1]=n}return i}calculate(t){return e=this,n=void 0,i=function*(){const e=new d(this.config),{size:n}=this.config,o=new Float32Array(this.signal);new x(this.config,t).apply(o);const i=this.get_spectrum(o);for(let t=1;t<i.length;t+=2)i[t]=e.level_to_db(i[t]/this.baseline[t]);return i},new((o=void 0)||(o=Promise))((function(t,s){function r(t){try{a(i.next(t))}catch(t){s(t)}}function c(t){try{a(i.throw(t))}catch(t){s(t)}}function a(e){var n;e.done?t(e.value):(n=e.value,n instanceof o?n:new o((function(t){t(n)}))).then(r,c)}a((i=i.apply(e,n||[])).next())}));var e,n,o,i}}class k{constructor(t){this.config=t,this.job_serial=1,this.callbacks=new Map;const{rate:e}=this.config,o=new d(this.config),i=Math.log10(o.fmin),s=20*(Math.log10(o.fmax)-i);this.workers=new Array(Math.ceil(s)+1).fill(0).map(((e,o)=>{const s=o/20+i,r=Math.pow(10,s),c=new Worker(new URL(n.p+n.u(145),n.b));return c.onmessage=({data:t})=>{var e;const n=t.id;null===(e=this.callbacks.get(n))||void 0===e||e(t)},c.postMessage({type:"init",config:t,freq:r}),c}))}submit_job(t,e){return new Promise(((n,o)=>{const i=this.job_serial++,s=setTimeout((()=>{this.callbacks.delete(i),o(new Error("Worker timed out"))}),1e4);this.callbacks.set(i,(t=>{this.callbacks.delete(i),clearTimeout(s),n(t)})),t.postMessage({type:"job",id:i,bands:e})}))}calculate(t){return e=this,n=void 0,i=function*(){const e=yield Promise.all(this.workers.map((e=>this.submit_job(e,t)))),n=(new d(this.config),new Float32Array(2*e.length));let o=0;for(const{freq:t,db:i}of e)n[o++]=t,n[o++]=i;return n},new((o=void 0)||(o=Promise))((function(t,s){function r(t){try{a(i.next(t))}catch(t){s(t)}}function c(t){try{a(i.throw(t))}catch(t){s(t)}}function a(e){var n;e.done?t(e.value):(n=e.value,n instanceof o?n:new o((function(t){t(n)}))).then(r,c)}a((i=i.apply(e,n||[])).next())}));var e,n,o,i}}!function(){const t=window.location.hash.replace(/^#/,"")||"fourier",e={fourier:{rate:65536,size:32768},sines:{rate:6e4,size:2e4}}[t],n={fourier:()=>new M(e),sines:()=>new k(e)}[t](),o=new s(n),i=new h(o),r=new g(o),c=new _(e,o);new b(e,o,[i,r,c])}()}},t=>{t.O(0,[216],(()=>(142,t(t.s=142)))),t.O()}]);
//# sourceMappingURL=main.js.map