import"./index-ihcskjKt.js";import{i as _,t as c}from"./class-map-PuRO4oeR.js";/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const C=t=>t===null||typeof t!="object"&&typeof t!="function",f=t=>t.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o=(t,e)=>{var i;const s=t._$AN;if(s===void 0)return!1;for(const n of s)(i=n._$AO)==null||i.call(n,e,!1),o(n,e);return!0},r=t=>{let e,s;do{if((e=t._$AM)===void 0)break;s=e._$AN,s.delete(t),t=e}while((s==null?void 0:s.size)===0)},$=t=>{for(let e;e=t._$AM;t=e){let s=e._$AN;if(s===void 0)e._$AN=s=new Set;else if(s.has(t))break;s.add(t),d(e)}};function A(t){this._$AN!==void 0?(r(this),this._$AM=t,$(this)):this._$AM=t}function l(t,e=!1,s=0){const i=this._$AH,n=this._$AN;if(n!==void 0&&n.size!==0)if(e)if(Array.isArray(i))for(let h=s;h<i.length;h++)o(i[h],!1),r(i[h]);else i!=null&&(o(i,!1),r(i));else o(this,t)}const d=t=>{t.type==c.CHILD&&(t._$AP??(t._$AP=l),t._$AQ??(t._$AQ=A))};class p extends _{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,s,i){super._$AT(e,s,i),$(this),this.isConnected=e._$AU}_$AO(e,s=!0){var i,n;e!==this.isConnected&&(this.isConnected=e,e?(i=this.reconnected)==null||i.call(this):(n=this.disconnected)==null||n.call(this)),s&&(o(this,e),r(this))}setValue(e){if(f(this._$Ct))this._$Ct._$AI(e,this);else{const s=[...this._$Ct._$AH];s[this._$Ci]=e,this._$Ct._$AI(s,this,0)}}disconnected(){}reconnected(){}}export{p as f,C as i};
//# sourceMappingURL=async-directive-BzSuyHLE.js.map
