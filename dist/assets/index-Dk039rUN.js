const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/add-BlVi3acV.js","assets/index-BWTvg8vj.js","assets/vendor-CL3dImV2.js","assets/cross-C2Ax2KRq.js","assets/index-D7kpl-Qp.css","assets/all-wallets-C8vjefF6.js","assets/arrow-bottom-circle-BXfSkXbo.js","assets/app-store-C03L6mhi.js","assets/apple-BR-WylYK.js","assets/arrow-bottom-Ct6U4Jao.js","assets/arrow-left-p1AKyBjv.js","assets/arrow-right-Dqj3k5Iv.js","assets/arrow-top-B-ZQNuO_.js","assets/bank-CL1_KHpC.js","assets/browser-PM3VjhvC.js","assets/card-JcRd5LmZ.js","assets/checkmark-CgD6bZAU.js","assets/checkmark-bold-tDQqyt4T.js","assets/chevron-bottom-CqKcOHk-.js","assets/chevron-left-BN97NJZW.js","assets/chevron-right-PXiSwzKn.js","assets/chevron-top-DFyIZwmF.js","assets/chrome-store-BIZ2YehV.js","assets/clock-HkJ6mYGt.js","assets/close-BxhfxgTR.js","assets/compass-C5B0zlrF.js","assets/coinPlaceholder-CggHp2NW.js","assets/copy-DvNK52n6.js","assets/cursor-ZFIqRHcl.js","assets/cursor-transparent-Cxb6k9a0.js","assets/desktop-DdN49Ojx.js","assets/disconnect-CsUMQuC3.js","assets/discord-BRpaON9I.js","assets/etherscan-D91hOLqa.js","assets/extension-CEBRV5-f.js","assets/external-link-Bu1cIKOP.js","assets/facebook-DbWtqAMd.js","assets/farcaster-CmZatR_S.js","assets/filters-CfRtajEa.js","assets/github-Oe0ELLA4.js","assets/google-BYnams_4.js","assets/help-circle-CzWgTHuK.js","assets/image-CjLpXP8q.js","assets/id-DIfwgSZE.js","assets/info-circle-S7BSOK-Z.js","assets/lightbulb-D0Q3b05A.js","assets/mail-qgTJDXcP.js","assets/mobile-XXvBABBT.js","assets/more-DWPhIZiU.js","assets/network-placeholder-7QfyNeQ0.js","assets/nftPlaceholder-C59gyE2q.js","assets/off-CLlKmOOR.js","assets/play-store-DDb4e_ps.js","assets/plus-DxSec9I9.js","assets/qr-code-D-c1hnTC.js","assets/recycle-horizontal-CJhyQrWI.js","assets/refresh-CYTzTvK1.js","assets/search-BehinUar.js","assets/send-Cgc9Xnrj.js","assets/swapHorizontal-CV0LQKHa.js","assets/swapHorizontalMedium-MWC9VNoC.js","assets/swapHorizontalBold-BSs_a9Ny.js","assets/swapHorizontalRoundedBold-Cx5tKk8z.js","assets/swapVertical-Dr2Uv_-J.js","assets/telegram-P9KC5lVh.js","assets/three-dots-DwFIbYq2.js","assets/twitch-Dcm2-D2H.js","assets/x-Ct7RhBPj.js","assets/twitterIcon-II_DnUl6.js","assets/verify-Dln15vFd.js","assets/verify-filled-VS7pU6Us.js","assets/wallet-D876plzX.js","assets/walletconnect-O48npE9F.js","assets/wallet-placeholder-DyICxPfm.js","assets/warning-circle-Z5yai77e.js","assets/info-DNihwOP7.js","assets/exclamation-triangle-8asOH7jL.js","assets/reown-logo-CBM7hpOl.js"])))=>i.map(i=>d[i]);
import{d8 as z,eK as S,eL as E,eM as f}from"./index-BWTvg8vj.js";import{e as W,n as l,a as H}from"./class-map-DenEczoU.js";import{r as b,c as B,e as F}from"./core-B6mV9-d5.js";import{_ as i}from"./cross-C2Ax2KRq.js";import{f as G,n as M}from"./async-directive-B0zp2A6T.js";/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class U{constructor(e){this.G=e}disconnect(){this.G=void 0}reconnect(e){this.G=e}deref(){return this.G}}class N{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??(this.Y=new Promise(e=>this.Z=e))}resume(){var e;(e=this.Z)==null||e.call(this),this.Y=this.Z=void 0}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const A=t=>!M(t)&&typeof t.then=="function",k=1073741823;class Y extends G{constructor(){super(...arguments),this._$Cwt=k,this._$Cbt=[],this._$CK=new U(this),this._$CX=new N}render(...e){return e.find(r=>!A(r))??z}update(e,r){const a=this._$Cbt;let n=a.length;this._$Cbt=r;const o=this._$CK,s=this._$CX;this.isConnected||this.disconnected();for(let c=0;c<r.length&&!(c>this._$Cwt);c++){const u=r[c];if(!A(u))return this._$Cwt=c,u;c<n&&u===a[c]||(this._$Cwt=k,n=0,Promise.resolve(u).then(async p=>{for(;s.get();)await s.get();const v=o.deref();if(v!==void 0){const I=v._$Cbt.indexOf(u);I>-1&&I<v._$Cwt&&(v._$Cwt=I,v.setValue(p))}}))}return z}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}}const q=W(Y),h={getSpacingStyles(t,e){if(Array.isArray(t))return t[e]?`var(--wui-spacing-${t[e]})`:void 0;if(typeof t=="string")return`var(--wui-spacing-${t})`},getFormattedDate(t){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)},getHostName(t){try{return new URL(t).hostname}catch{return""}},getTruncateString({string:t,charsStart:e,charsEnd:r,truncate:a}){return t.length<=e+r?t:a==="end"?`${t.substring(0,e)}...`:a==="start"?`...${t.substring(t.length-r)}`:`${t.substring(0,Math.floor(e))}...${t.substring(t.length-Math.floor(r))}`},generateAvatarColors(t){const r=t.toLowerCase().replace(/^0x/iu,"").replace(/[^a-f0-9]/gu,"").substring(0,6).padEnd(6,"0"),a=this.hexToRgb(r),n=getComputedStyle(document.documentElement).getPropertyValue("--w3m-border-radius-master"),s=100-3*Number(n==null?void 0:n.replace("px","")),c=`${s}% ${s}% at 65% 40%`,u=[];for(let p=0;p<5;p+=1){const v=this.tintColor(a,.15*p);u.push(`rgb(${v[0]}, ${v[1]}, ${v[2]})`)}return`
    --local-color-1: ${u[0]};
    --local-color-2: ${u[1]};
    --local-color-3: ${u[2]};
    --local-color-4: ${u[3]};
    --local-color-5: ${u[4]};
    --local-radial-circle: ${c}
   `},hexToRgb(t){const e=parseInt(t,16),r=e>>16&255,a=e>>8&255,n=e&255;return[r,a,n]},tintColor(t,e){const[r,a,n]=t,o=Math.round(r+(255-r)*e),s=Math.round(a+(255-a)*e),c=Math.round(n+(255-n)*e);return[o,s,c]},isNumber(t){return{number:/^[0-9]+$/u}.number.test(t)},getColorTheme(t){var e;return t||(typeof window<"u"&&window.matchMedia?(e=window.matchMedia("(prefers-color-scheme: dark)"))!=null&&e.matches?"dark":"light":"dark")},splitBalance(t){const e=t.split(".");return e.length===2?[e[0],e[1]]:["0","00"]},roundNumber(t,e,r){return t.toString().length>=e?Number(t).toFixed(r):t},formatNumberToLocalString(t,e=2){return t===void 0?"0.00":typeof t=="number"?t.toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:e}):parseFloat(t).toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:e})}};function K(t,e){const{kind:r,elements:a}=e;return{kind:r,elements:a,finisher(n){customElements.get(t)||customElements.define(t,n)}}}function X(t,e){return customElements.get(t)||customElements.define(t,e),e}function x(t){return function(r){return typeof r=="function"?X(t,r):K(t,r)}}const Z=S`
  :host {
    display: flex;
    width: inherit;
    height: inherit;
  }
`;var g=function(t,e,r,a){var n=arguments.length,o=n<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,r):a,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,r,a);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(o=(n<3?s(o):n>3?s(e,r,o):s(e,r))||o);return n>3&&o&&Object.defineProperty(e,r,o),o};let d=class extends E{render(){return this.style.cssText=`
      flex-direction: ${this.flexDirection};
      flex-wrap: ${this.flexWrap};
      flex-basis: ${this.flexBasis};
      flex-grow: ${this.flexGrow};
      flex-shrink: ${this.flexShrink};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};
      padding-top: ${this.padding&&h.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&h.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&h.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&h.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&h.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&h.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&h.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&h.getSpacingStyles(this.margin,3)};
    `,f`<slot></slot>`}};d.styles=[b,Z];g([l()],d.prototype,"flexDirection",void 0);g([l()],d.prototype,"flexWrap",void 0);g([l()],d.prototype,"flexBasis",void 0);g([l()],d.prototype,"flexGrow",void 0);g([l()],d.prototype,"flexShrink",void 0);g([l()],d.prototype,"alignItems",void 0);g([l()],d.prototype,"justifyContent",void 0);g([l()],d.prototype,"columnGap",void 0);g([l()],d.prototype,"rowGap",void 0);g([l()],d.prototype,"gap",void 0);g([l()],d.prototype,"padding",void 0);g([l()],d.prototype,"margin",void 0);d=g([x("wui-flex")],d);class J{constructor(){this.cache=new Map}set(e,r){this.cache.set(e,r)}get(e){return this.cache.get(e)}has(e){return this.cache.has(e)}delete(e){this.cache.delete(e)}clear(){this.cache.clear()}}const D=new J,Q=S`
  :host {
    display: flex;
    aspect-ratio: var(--local-aspect-ratio);
    color: var(--local-color);
    width: var(--local-width);
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }

  .fallback {
    width: var(--local-width);
    height: var(--local-height);
  }
`;var T=function(t,e,r,a){var n=arguments.length,o=n<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,r):a,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,r,a);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(o=(n<3?s(o):n>3?s(e,r,o):s(e,r))||o);return n>3&&o&&Object.defineProperty(e,r,o),o};const j={add:async()=>(await i(async()=>{const{addSvg:t}=await import("./add-BlVi3acV.js");return{addSvg:t}},__vite__mapDeps([0,1,2,3,4]))).addSvg,allWallets:async()=>(await i(async()=>{const{allWalletsSvg:t}=await import("./all-wallets-C8vjefF6.js");return{allWalletsSvg:t}},__vite__mapDeps([5,1,2,3,4]))).allWalletsSvg,arrowBottomCircle:async()=>(await i(async()=>{const{arrowBottomCircleSvg:t}=await import("./arrow-bottom-circle-BXfSkXbo.js");return{arrowBottomCircleSvg:t}},__vite__mapDeps([6,1,2,3,4]))).arrowBottomCircleSvg,appStore:async()=>(await i(async()=>{const{appStoreSvg:t}=await import("./app-store-C03L6mhi.js");return{appStoreSvg:t}},__vite__mapDeps([7,1,2,3,4]))).appStoreSvg,apple:async()=>(await i(async()=>{const{appleSvg:t}=await import("./apple-BR-WylYK.js");return{appleSvg:t}},__vite__mapDeps([8,1,2,3,4]))).appleSvg,arrowBottom:async()=>(await i(async()=>{const{arrowBottomSvg:t}=await import("./arrow-bottom-Ct6U4Jao.js");return{arrowBottomSvg:t}},__vite__mapDeps([9,1,2,3,4]))).arrowBottomSvg,arrowLeft:async()=>(await i(async()=>{const{arrowLeftSvg:t}=await import("./arrow-left-p1AKyBjv.js");return{arrowLeftSvg:t}},__vite__mapDeps([10,1,2,3,4]))).arrowLeftSvg,arrowRight:async()=>(await i(async()=>{const{arrowRightSvg:t}=await import("./arrow-right-Dqj3k5Iv.js");return{arrowRightSvg:t}},__vite__mapDeps([11,1,2,3,4]))).arrowRightSvg,arrowTop:async()=>(await i(async()=>{const{arrowTopSvg:t}=await import("./arrow-top-B-ZQNuO_.js");return{arrowTopSvg:t}},__vite__mapDeps([12,1,2,3,4]))).arrowTopSvg,bank:async()=>(await i(async()=>{const{bankSvg:t}=await import("./bank-CL1_KHpC.js");return{bankSvg:t}},__vite__mapDeps([13,1,2,3,4]))).bankSvg,browser:async()=>(await i(async()=>{const{browserSvg:t}=await import("./browser-PM3VjhvC.js");return{browserSvg:t}},__vite__mapDeps([14,1,2,3,4]))).browserSvg,card:async()=>(await i(async()=>{const{cardSvg:t}=await import("./card-JcRd5LmZ.js");return{cardSvg:t}},__vite__mapDeps([15,1,2,3,4]))).cardSvg,checkmark:async()=>(await i(async()=>{const{checkmarkSvg:t}=await import("./checkmark-CgD6bZAU.js");return{checkmarkSvg:t}},__vite__mapDeps([16,1,2,3,4]))).checkmarkSvg,checkmarkBold:async()=>(await i(async()=>{const{checkmarkBoldSvg:t}=await import("./checkmark-bold-tDQqyt4T.js");return{checkmarkBoldSvg:t}},__vite__mapDeps([17,1,2,3,4]))).checkmarkBoldSvg,chevronBottom:async()=>(await i(async()=>{const{chevronBottomSvg:t}=await import("./chevron-bottom-CqKcOHk-.js");return{chevronBottomSvg:t}},__vite__mapDeps([18,1,2,3,4]))).chevronBottomSvg,chevronLeft:async()=>(await i(async()=>{const{chevronLeftSvg:t}=await import("./chevron-left-BN97NJZW.js");return{chevronLeftSvg:t}},__vite__mapDeps([19,1,2,3,4]))).chevronLeftSvg,chevronRight:async()=>(await i(async()=>{const{chevronRightSvg:t}=await import("./chevron-right-PXiSwzKn.js");return{chevronRightSvg:t}},__vite__mapDeps([20,1,2,3,4]))).chevronRightSvg,chevronTop:async()=>(await i(async()=>{const{chevronTopSvg:t}=await import("./chevron-top-DFyIZwmF.js");return{chevronTopSvg:t}},__vite__mapDeps([21,1,2,3,4]))).chevronTopSvg,chromeStore:async()=>(await i(async()=>{const{chromeStoreSvg:t}=await import("./chrome-store-BIZ2YehV.js");return{chromeStoreSvg:t}},__vite__mapDeps([22,1,2,3,4]))).chromeStoreSvg,clock:async()=>(await i(async()=>{const{clockSvg:t}=await import("./clock-HkJ6mYGt.js");return{clockSvg:t}},__vite__mapDeps([23,1,2,3,4]))).clockSvg,close:async()=>(await i(async()=>{const{closeSvg:t}=await import("./close-BxhfxgTR.js");return{closeSvg:t}},__vite__mapDeps([24,1,2,3,4]))).closeSvg,compass:async()=>(await i(async()=>{const{compassSvg:t}=await import("./compass-C5B0zlrF.js");return{compassSvg:t}},__vite__mapDeps([25,1,2,3,4]))).compassSvg,coinPlaceholder:async()=>(await i(async()=>{const{coinPlaceholderSvg:t}=await import("./coinPlaceholder-CggHp2NW.js");return{coinPlaceholderSvg:t}},__vite__mapDeps([26,1,2,3,4]))).coinPlaceholderSvg,copy:async()=>(await i(async()=>{const{copySvg:t}=await import("./copy-DvNK52n6.js");return{copySvg:t}},__vite__mapDeps([27,1,2,3,4]))).copySvg,cursor:async()=>(await i(async()=>{const{cursorSvg:t}=await import("./cursor-ZFIqRHcl.js");return{cursorSvg:t}},__vite__mapDeps([28,1,2,3,4]))).cursorSvg,cursorTransparent:async()=>(await i(async()=>{const{cursorTransparentSvg:t}=await import("./cursor-transparent-Cxb6k9a0.js");return{cursorTransparentSvg:t}},__vite__mapDeps([29,1,2,3,4]))).cursorTransparentSvg,desktop:async()=>(await i(async()=>{const{desktopSvg:t}=await import("./desktop-DdN49Ojx.js");return{desktopSvg:t}},__vite__mapDeps([30,1,2,3,4]))).desktopSvg,disconnect:async()=>(await i(async()=>{const{disconnectSvg:t}=await import("./disconnect-CsUMQuC3.js");return{disconnectSvg:t}},__vite__mapDeps([31,1,2,3,4]))).disconnectSvg,discord:async()=>(await i(async()=>{const{discordSvg:t}=await import("./discord-BRpaON9I.js");return{discordSvg:t}},__vite__mapDeps([32,1,2,3,4]))).discordSvg,etherscan:async()=>(await i(async()=>{const{etherscanSvg:t}=await import("./etherscan-D91hOLqa.js");return{etherscanSvg:t}},__vite__mapDeps([33,1,2,3,4]))).etherscanSvg,extension:async()=>(await i(async()=>{const{extensionSvg:t}=await import("./extension-CEBRV5-f.js");return{extensionSvg:t}},__vite__mapDeps([34,1,2,3,4]))).extensionSvg,externalLink:async()=>(await i(async()=>{const{externalLinkSvg:t}=await import("./external-link-Bu1cIKOP.js");return{externalLinkSvg:t}},__vite__mapDeps([35,1,2,3,4]))).externalLinkSvg,facebook:async()=>(await i(async()=>{const{facebookSvg:t}=await import("./facebook-DbWtqAMd.js");return{facebookSvg:t}},__vite__mapDeps([36,1,2,3,4]))).facebookSvg,farcaster:async()=>(await i(async()=>{const{farcasterSvg:t}=await import("./farcaster-CmZatR_S.js");return{farcasterSvg:t}},__vite__mapDeps([37,1,2,3,4]))).farcasterSvg,filters:async()=>(await i(async()=>{const{filtersSvg:t}=await import("./filters-CfRtajEa.js");return{filtersSvg:t}},__vite__mapDeps([38,1,2,3,4]))).filtersSvg,github:async()=>(await i(async()=>{const{githubSvg:t}=await import("./github-Oe0ELLA4.js");return{githubSvg:t}},__vite__mapDeps([39,1,2,3,4]))).githubSvg,google:async()=>(await i(async()=>{const{googleSvg:t}=await import("./google-BYnams_4.js");return{googleSvg:t}},__vite__mapDeps([40,1,2,3,4]))).googleSvg,helpCircle:async()=>(await i(async()=>{const{helpCircleSvg:t}=await import("./help-circle-CzWgTHuK.js");return{helpCircleSvg:t}},__vite__mapDeps([41,1,2,3,4]))).helpCircleSvg,image:async()=>(await i(async()=>{const{imageSvg:t}=await import("./image-CjLpXP8q.js");return{imageSvg:t}},__vite__mapDeps([42,1,2,3,4]))).imageSvg,id:async()=>(await i(async()=>{const{idSvg:t}=await import("./id-DIfwgSZE.js");return{idSvg:t}},__vite__mapDeps([43,1,2,3,4]))).idSvg,infoCircle:async()=>(await i(async()=>{const{infoCircleSvg:t}=await import("./info-circle-S7BSOK-Z.js");return{infoCircleSvg:t}},__vite__mapDeps([44,1,2,3,4]))).infoCircleSvg,lightbulb:async()=>(await i(async()=>{const{lightbulbSvg:t}=await import("./lightbulb-D0Q3b05A.js");return{lightbulbSvg:t}},__vite__mapDeps([45,1,2,3,4]))).lightbulbSvg,mail:async()=>(await i(async()=>{const{mailSvg:t}=await import("./mail-qgTJDXcP.js");return{mailSvg:t}},__vite__mapDeps([46,1,2,3,4]))).mailSvg,mobile:async()=>(await i(async()=>{const{mobileSvg:t}=await import("./mobile-XXvBABBT.js");return{mobileSvg:t}},__vite__mapDeps([47,1,2,3,4]))).mobileSvg,more:async()=>(await i(async()=>{const{moreSvg:t}=await import("./more-DWPhIZiU.js");return{moreSvg:t}},__vite__mapDeps([48,1,2,3,4]))).moreSvg,networkPlaceholder:async()=>(await i(async()=>{const{networkPlaceholderSvg:t}=await import("./network-placeholder-7QfyNeQ0.js");return{networkPlaceholderSvg:t}},__vite__mapDeps([49,1,2,3,4]))).networkPlaceholderSvg,nftPlaceholder:async()=>(await i(async()=>{const{nftPlaceholderSvg:t}=await import("./nftPlaceholder-C59gyE2q.js");return{nftPlaceholderSvg:t}},__vite__mapDeps([50,1,2,3,4]))).nftPlaceholderSvg,off:async()=>(await i(async()=>{const{offSvg:t}=await import("./off-CLlKmOOR.js");return{offSvg:t}},__vite__mapDeps([51,1,2,3,4]))).offSvg,playStore:async()=>(await i(async()=>{const{playStoreSvg:t}=await import("./play-store-DDb4e_ps.js");return{playStoreSvg:t}},__vite__mapDeps([52,1,2,3,4]))).playStoreSvg,plus:async()=>(await i(async()=>{const{plusSvg:t}=await import("./plus-DxSec9I9.js");return{plusSvg:t}},__vite__mapDeps([53,1,2,3,4]))).plusSvg,qrCode:async()=>(await i(async()=>{const{qrCodeIcon:t}=await import("./qr-code-D-c1hnTC.js");return{qrCodeIcon:t}},__vite__mapDeps([54,1,2,3,4]))).qrCodeIcon,recycleHorizontal:async()=>(await i(async()=>{const{recycleHorizontalSvg:t}=await import("./recycle-horizontal-CJhyQrWI.js");return{recycleHorizontalSvg:t}},__vite__mapDeps([55,1,2,3,4]))).recycleHorizontalSvg,refresh:async()=>(await i(async()=>{const{refreshSvg:t}=await import("./refresh-CYTzTvK1.js");return{refreshSvg:t}},__vite__mapDeps([56,1,2,3,4]))).refreshSvg,search:async()=>(await i(async()=>{const{searchSvg:t}=await import("./search-BehinUar.js");return{searchSvg:t}},__vite__mapDeps([57,1,2,3,4]))).searchSvg,send:async()=>(await i(async()=>{const{sendSvg:t}=await import("./send-Cgc9Xnrj.js");return{sendSvg:t}},__vite__mapDeps([58,1,2,3,4]))).sendSvg,swapHorizontal:async()=>(await i(async()=>{const{swapHorizontalSvg:t}=await import("./swapHorizontal-CV0LQKHa.js");return{swapHorizontalSvg:t}},__vite__mapDeps([59,1,2,3,4]))).swapHorizontalSvg,swapHorizontalMedium:async()=>(await i(async()=>{const{swapHorizontalMediumSvg:t}=await import("./swapHorizontalMedium-MWC9VNoC.js");return{swapHorizontalMediumSvg:t}},__vite__mapDeps([60,1,2,3,4]))).swapHorizontalMediumSvg,swapHorizontalBold:async()=>(await i(async()=>{const{swapHorizontalBoldSvg:t}=await import("./swapHorizontalBold-BSs_a9Ny.js");return{swapHorizontalBoldSvg:t}},__vite__mapDeps([61,1,2,3,4]))).swapHorizontalBoldSvg,swapHorizontalRoundedBold:async()=>(await i(async()=>{const{swapHorizontalRoundedBoldSvg:t}=await import("./swapHorizontalRoundedBold-Cx5tKk8z.js");return{swapHorizontalRoundedBoldSvg:t}},__vite__mapDeps([62,1,2,3,4]))).swapHorizontalRoundedBoldSvg,swapVertical:async()=>(await i(async()=>{const{swapVerticalSvg:t}=await import("./swapVertical-Dr2Uv_-J.js");return{swapVerticalSvg:t}},__vite__mapDeps([63,1,2,3,4]))).swapVerticalSvg,telegram:async()=>(await i(async()=>{const{telegramSvg:t}=await import("./telegram-P9KC5lVh.js");return{telegramSvg:t}},__vite__mapDeps([64,1,2,3,4]))).telegramSvg,threeDots:async()=>(await i(async()=>{const{threeDotsSvg:t}=await import("./three-dots-DwFIbYq2.js");return{threeDotsSvg:t}},__vite__mapDeps([65,1,2,3,4]))).threeDotsSvg,twitch:async()=>(await i(async()=>{const{twitchSvg:t}=await import("./twitch-Dcm2-D2H.js");return{twitchSvg:t}},__vite__mapDeps([66,1,2,3,4]))).twitchSvg,twitter:async()=>(await i(async()=>{const{xSvg:t}=await import("./x-Ct7RhBPj.js");return{xSvg:t}},__vite__mapDeps([67,1,2,3,4]))).xSvg,twitterIcon:async()=>(await i(async()=>{const{twitterIconSvg:t}=await import("./twitterIcon-II_DnUl6.js");return{twitterIconSvg:t}},__vite__mapDeps([68,1,2,3,4]))).twitterIconSvg,verify:async()=>(await i(async()=>{const{verifySvg:t}=await import("./verify-Dln15vFd.js");return{verifySvg:t}},__vite__mapDeps([69,1,2,3,4]))).verifySvg,verifyFilled:async()=>(await i(async()=>{const{verifyFilledSvg:t}=await import("./verify-filled-VS7pU6Us.js");return{verifyFilledSvg:t}},__vite__mapDeps([70,1,2,3,4]))).verifyFilledSvg,wallet:async()=>(await i(async()=>{const{walletSvg:t}=await import("./wallet-D876plzX.js");return{walletSvg:t}},__vite__mapDeps([71,1,2,3,4]))).walletSvg,walletConnect:async()=>(await i(async()=>{const{walletConnectSvg:t}=await import("./walletconnect-O48npE9F.js");return{walletConnectSvg:t}},__vite__mapDeps([72,1,2,3,4]))).walletConnectSvg,walletConnectLightBrown:async()=>(await i(async()=>{const{walletConnectLightBrownSvg:t}=await import("./walletconnect-O48npE9F.js");return{walletConnectLightBrownSvg:t}},__vite__mapDeps([72,1,2,3,4]))).walletConnectLightBrownSvg,walletConnectBrown:async()=>(await i(async()=>{const{walletConnectBrownSvg:t}=await import("./walletconnect-O48npE9F.js");return{walletConnectBrownSvg:t}},__vite__mapDeps([72,1,2,3,4]))).walletConnectBrownSvg,walletPlaceholder:async()=>(await i(async()=>{const{walletPlaceholderSvg:t}=await import("./wallet-placeholder-DyICxPfm.js");return{walletPlaceholderSvg:t}},__vite__mapDeps([73,1,2,3,4]))).walletPlaceholderSvg,warningCircle:async()=>(await i(async()=>{const{warningCircleSvg:t}=await import("./warning-circle-Z5yai77e.js");return{warningCircleSvg:t}},__vite__mapDeps([74,1,2,3,4]))).warningCircleSvg,x:async()=>(await i(async()=>{const{xSvg:t}=await import("./x-Ct7RhBPj.js");return{xSvg:t}},__vite__mapDeps([67,1,2,3,4]))).xSvg,info:async()=>(await i(async()=>{const{infoSvg:t}=await import("./info-DNihwOP7.js");return{infoSvg:t}},__vite__mapDeps([75,1,2,3,4]))).infoSvg,exclamationTriangle:async()=>(await i(async()=>{const{exclamationTriangleSvg:t}=await import("./exclamation-triangle-8asOH7jL.js");return{exclamationTriangleSvg:t}},__vite__mapDeps([76,1,2,3,4]))).exclamationTriangleSvg,reown:async()=>(await i(async()=>{const{reownSvg:t}=await import("./reown-logo-CBM7hpOl.js");return{reownSvg:t}},__vite__mapDeps([77,1,2,3,4]))).reownSvg};async function tt(t){if(D.has(t))return D.get(t);const r=(j[t]??j.copy)();return D.set(t,r),r}let m=class extends E{constructor(){super(...arguments),this.size="md",this.name="copy",this.color="fg-300",this.aspectRatio="1 / 1"}render(){return this.style.cssText=`
      --local-color: ${`var(--wui-color-${this.color});`}
      --local-width: ${`var(--wui-icon-size-${this.size});`}
      --local-aspect-ratio: ${this.aspectRatio}
    `,f`${q(tt(this.name),f`<div class="fallback"></div>`)}`}};m.styles=[b,B,Q];T([l()],m.prototype,"size",void 0);T([l()],m.prototype,"name",void 0);T([l()],m.prototype,"color",void 0);T([l()],m.prototype,"aspectRatio",void 0);m=T([x("wui-icon")],m);const et=S`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .wui-font-medium-400 {
    font-size: var(--wui-font-size-medium);
    font-weight: var(--wui-font-weight-light);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-medium-600 {
    font-size: var(--wui-font-size-medium);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-title-600 {
    font-size: var(--wui-font-size-title);
    letter-spacing: var(--wui-letter-spacing-title);
  }

  .wui-font-title-6-600 {
    font-size: var(--wui-font-size-title-6);
    letter-spacing: var(--wui-letter-spacing-title-6);
  }

  .wui-font-mini-700 {
    font-size: var(--wui-font-size-mini);
    letter-spacing: var(--wui-letter-spacing-mini);
    text-transform: uppercase;
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
    letter-spacing: var(--wui-letter-spacing-large);
  }

  .wui-font-2xl-500,
  .wui-font-2xl-600,
  .wui-font-2xl-700 {
    font-size: var(--wui-font-size-2xl);
    letter-spacing: var(--wui-letter-spacing-2xl);
  }

  .wui-font-paragraph-400,
  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
  }

  .wui-font-small-400,
  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
    letter-spacing: var(--wui-letter-spacing-small);
  }

  .wui-font-tiny-400,
  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
    letter-spacing: var(--wui-letter-spacing-tiny);
  }

  .wui-font-micro-700,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-micro);
    text-transform: uppercase;
  }

  .wui-font-tiny-400,
  .wui-font-small-400,
  .wui-font-medium-400,
  .wui-font-paragraph-400 {
    font-weight: var(--wui-font-weight-light);
  }

  .wui-font-large-700,
  .wui-font-paragraph-700,
  .wui-font-micro-700,
  .wui-font-mini-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-medium-600,
  .wui-font-medium-title-600,
  .wui-font-title-6-600,
  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }

  :host([disabled]) {
    opacity: 0.4;
  }
`;var L=function(t,e,r,a){var n=arguments.length,o=n<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,r):a,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,r,a);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(o=(n<3?s(o):n>3?s(e,r,o):s(e,r))||o);return n>3&&o&&Object.defineProperty(e,r,o),o};let y=class extends E{constructor(){super(...arguments),this.variant="paragraph-500",this.color="fg-300",this.align="left",this.lineClamp=void 0}render(){const e={[`wui-font-${this.variant}`]:!0,[`wui-color-${this.color}`]:!0,[`wui-line-clamp-${this.lineClamp}`]:!!this.lineClamp};return this.style.cssText=`
      --local-align: ${this.align};
      --local-color: var(--wui-color-${this.color});
    `,f`<slot class=${H(e)}></slot>`}};y.styles=[b,et];L([l()],y.prototype,"variant",void 0);L([l()],y.prototype,"color",void 0);L([l()],y.prototype,"align",void 0);L([l()],y.prototype,"lineClamp",void 0);y=L([x("wui-text")],y);const it=S`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background-color: var(--wui-color-gray-glass-020);
    border-radius: var(--local-border-radius);
    border: var(--local-border);
    box-sizing: content-box;
    width: var(--local-size);
    height: var(--local-size);
    min-height: var(--local-size);
    min-width: var(--local-size);
  }

  @supports (background: color-mix(in srgb, white 50%, black)) {
    :host {
      background-color: color-mix(in srgb, var(--local-bg-value) var(--local-bg-mix), transparent);
    }
  }
`;var w=function(t,e,r,a){var n=arguments.length,o=n<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,r):a,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,r,a);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(o=(n<3?s(o):n>3?s(e,r,o):s(e,r))||o);return n>3&&o&&Object.defineProperty(e,r,o),o};let _=class extends E{constructor(){super(...arguments),this.size="md",this.backgroundColor="accent-100",this.iconColor="accent-100",this.background="transparent",this.border=!1,this.borderColor="wui-color-bg-125",this.icon="copy"}render(){const e=this.iconSize||this.size,r=this.size==="lg",a=this.size==="xl",n=r?"12%":"16%",o=r?"xxs":a?"s":"3xl",s=this.background==="gray",c=this.background==="opaque",u=this.backgroundColor==="accent-100"&&c||this.backgroundColor==="success-100"&&c||this.backgroundColor==="error-100"&&c||this.backgroundColor==="inverse-100"&&c;let p=`var(--wui-color-${this.backgroundColor})`;return u?p=`var(--wui-icon-box-bg-${this.backgroundColor})`:s&&(p=`var(--wui-color-gray-${this.backgroundColor})`),this.style.cssText=`
       --local-bg-value: ${p};
       --local-bg-mix: ${u||s?"100%":n};
       --local-border-radius: var(--wui-border-radius-${o});
       --local-size: var(--wui-icon-box-size-${this.size});
       --local-border: ${this.borderColor==="wui-color-bg-125"?"2px":"1px"} solid ${this.border?`var(--${this.borderColor})`:"transparent"}
   `,f` <wui-icon color=${this.iconColor} size=${e} name=${this.icon}></wui-icon> `}};_.styles=[b,F,it];w([l()],_.prototype,"size",void 0);w([l()],_.prototype,"backgroundColor",void 0);w([l()],_.prototype,"iconColor",void 0);w([l()],_.prototype,"iconSize",void 0);w([l()],_.prototype,"background",void 0);w([l({type:Boolean})],_.prototype,"border",void 0);w([l()],_.prototype,"borderColor",void 0);w([l()],_.prototype,"icon",void 0);_=w([x("wui-icon-box")],_);const rt=S`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
  }
`;var O=function(t,e,r,a){var n=arguments.length,o=n<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,r):a,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,r,a);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(o=(n<3?s(o):n>3?s(e,r,o):s(e,r))||o);return n>3&&o&&Object.defineProperty(e,r,o),o};let R=class extends E{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0}render(){return this.style.cssText=`
      --local-width: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      --local-height: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      `,f`<img src=${this.src} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};R.styles=[b,B,rt];O([l()],R.prototype,"src",void 0);O([l()],R.prototype,"alt",void 0);O([l()],R.prototype,"size",void 0);R=O([x("wui-image")],R);const ot=S`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--wui-spacing-m);
    padding: 0 var(--wui-spacing-3xs) !important;
    border-radius: var(--wui-border-radius-5xs);
    transition:
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius, background-color;
  }

  :host > wui-text {
    transform: translateY(5%);
  }

  :host([data-variant='main']) {
    background-color: var(--wui-color-accent-glass-015);
    color: var(--wui-color-accent-100);
  }

  :host([data-variant='shade']) {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-200);
  }

  :host([data-variant='success']) {
    background-color: var(--wui-icon-box-bg-success-100);
    color: var(--wui-color-success-100);
  }

  :host([data-variant='error']) {
    background-color: var(--wui-icon-box-bg-error-100);
    color: var(--wui-color-error-100);
  }

  :host([data-size='lg']) {
    padding: 11px 5px !important;
  }

  :host([data-size='lg']) > wui-text {
    transform: translateY(2%);
  }
`;var V=function(t,e,r,a){var n=arguments.length,o=n<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,r):a,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,r,a);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(o=(n<3?s(o):n>3?s(e,r,o):s(e,r))||o);return n>3&&o&&Object.defineProperty(e,r,o),o};let $=class extends E{constructor(){super(...arguments),this.variant="main",this.size="lg"}render(){this.dataset.variant=this.variant,this.dataset.size=this.size;const e=this.size==="md"?"mini-700":"micro-700";return f`
      <wui-text data-variant=${this.variant} variant=${e} color="inherit">
        <slot></slot>
      </wui-text>
    `}};$.styles=[b,ot];V([l()],$.prototype,"variant",void 0);V([l()],$.prototype,"size",void 0);$=V([x("wui-tag")],$);const at=S`
  :host {
    display: flex;
  }

  :host([data-size='sm']) > svg {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) > svg {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) > svg {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) > svg {
    width: 32px;
    height: 32px;
  }

  svg {
    animation: rotate 2s linear infinite;
  }

  circle {
    fill: none;
    stroke: var(--local-color);
    stroke-width: 4px;
    stroke-dasharray: 1, 124;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  :host([data-size='md']) > svg > circle {
    stroke-width: 6px;
  }

  :host([data-size='sm']) > svg > circle {
    stroke-width: 8px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 124;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 90, 124;
      stroke-dashoffset: -35;
    }

    100% {
      stroke-dashoffset: -125;
    }
  }
`;var C=function(t,e,r,a){var n=arguments.length,o=n<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,r):a,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,r,a);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(o=(n<3?s(o):n>3?s(e,r,o):s(e,r))||o);return n>3&&o&&Object.defineProperty(e,r,o),o};let P=class extends E{constructor(){super(...arguments),this.color="accent-100",this.size="lg"}render(){return this.style.cssText=`--local-color: ${this.color==="inherit"?"inherit":`var(--wui-color-${this.color})`}`,this.dataset.size=this.size,f`<svg viewBox="25 25 50 50">
      <circle r="20" cy="50" cx="50"></circle>
    </svg>`}};P.styles=[b,at];C([l()],P.prototype,"color",void 0);C([l()],P.prototype,"size",void 0);P=C([x("wui-loading-spinner")],P);export{h as U,x as c};
