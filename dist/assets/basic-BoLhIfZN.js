import{dl as w,eJ as v,bc as $,eU as _,eD as m,ez as u,b8 as ee,dm as l,eA as S,ex as y,fl as $e,fm as vt,eR as k,fn as nt,fo as ve,b4 as Q,eS as pt,eO as R,eP as A,eQ as J,eV as tt,ey as xe,eM as xt,fp as Ct,fq as Wt,eH as _t,ap as ye,fr as Pt,dk as Rt}from"./index-ihcskjKt.js";import{n as c,r as d,o as h}from"./class-map-PuRO4oeR.js";import{c as f,U as G}from"./index-BNe_rRwc.js";import{b as Lt,e as ot,n as rt}from"./ref-DeETuEz_.js";import"./vendor-CBmAETR3.js";import"./cross-CbhIs7DK.js";import"./dijkstra-D_NXgYpA.js";import"./async-directive-BzSuyHLE.js";var be=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let oe=class extends w{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.count=$.state.count,this.filteredCount=$.state.filteredWallets.length,this.isFetchingRecommendedWallets=$.state.isFetchingRecommendedWallets,this.unsubscribe.push(v.subscribeKey("connectors",e=>this.connectors=e),$.subscribeKey("count",e=>this.count=e),$.subscribeKey("filteredWallets",e=>this.filteredCount=e.length),$.subscribeKey("isFetchingRecommendedWallets",e=>this.isFetchingRecommendedWallets=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=this.connectors.find(O=>O.id==="walletConnect"),{allWallets:n}=_.state;if(!e||n==="HIDE"||n==="ONLY_MOBILE"&&!m.isMobile())return null;const o=$.state.featured.length,r=this.count+o,i=r<10?r:Math.floor(r/10)*10,s=this.filteredCount>0?this.filteredCount:i;let a=`${s}`;this.filteredCount>0?a=`${this.filteredCount}`:s<r&&(a=`${s}+`);const p=u.hasAnyConnection(ee.CONNECTOR_ID.WALLET_CONNECT);return l`
      <wui-list-wallet
        name="Search Wallet"
        walletIcon="search"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${a}
        tagVariant="info"
        data-testid="all-wallets"
        tabIdx=${h(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        ?disabled=${p}
        size="sm"
      ></wui-list-wallet>
    `}onAllWallets(){S.sendEvent({type:"track",event:"CLICK_ALL_WALLETS"}),y.push("AllWallets")}};be([c()],oe.prototype,"tabIdx",void 0);be([d()],oe.prototype,"connectors",void 0);be([d()],oe.prototype,"count",void 0);be([d()],oe.prototype,"filteredCount",void 0);be([d()],oe.prototype,"isFetchingRecommendedWallets",void 0);oe=be([f("w3m-all-wallets-widget")],oe);var Ke=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Ce=class extends w{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.connections=u.state.connections,this.unsubscribe.push(v.subscribeKey("connectors",e=>this.connectors=e),u.subscribeKey("connections",e=>this.connections=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=this.connectors.filter(n=>n.type==="ANNOUNCED");return e!=null&&e.length?l`
      <wui-flex flexDirection="column" gap="2">
        ${e.filter($e.showConnector).map(n=>{const r=(this.connections.get(n.chain)??[]).some(i=>vt.isLowerCaseMatch(i.connectorId,n.id));return l`
            <w3m-list-wallet
              imageSrc=${h(k.getConnectorImage(n))}
              name=${n.name??"Unknown"}
              @click=${()=>this.onConnector(n)}
              tagVariant=${r?"info":"success"}
              tagLabel=${r?"connected":"installed"}
              size="sm"
              data-testid=${`wallet-selector-${n.id}`}
              .installed=${!0}
              tabIdx=${h(this.tabIdx)}
              rdnsId=${n.id}
            >
            </w3m-list-wallet>
          `})}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(e){e.id==="walletConnect"?m.isMobile()?y.push("AllWallets"):y.push("ConnectingWalletConnect"):y.push("ConnectingExternal",{connector:e})}};Ke([c()],Ce.prototype,"tabIdx",void 0);Ke([d()],Ce.prototype,"connectors",void 0);Ke([d()],Ce.prototype,"connections",void 0);Ce=Ke([f("w3m-connect-announced-widget")],Ce);var He=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let We=class extends w{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.loading=!1,this.unsubscribe.push(v.subscribeKey("connectors",e=>this.connectors=e)),m.isTelegram()&&m.isIos()&&(this.loading=!u.state.wcUri,this.unsubscribe.push(u.subscribeKey("wcUri",e=>this.loading=!e)))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{customWallets:e}=_.state;if(!(e!=null&&e.length))return this.style.cssText="display: none",null;const n=this.filterOutDuplicateWallets(e),o=u.hasAnyConnection(ee.CONNECTOR_ID.WALLET_CONNECT);return l`<wui-flex flexDirection="column" gap="2">
      ${n.map(r=>l`
          <w3m-list-wallet
            imageSrc=${h(k.getWalletImage(r))}
            name=${r.name??"Unknown"}
            @click=${()=>this.onConnectWallet(r)}
            size="sm"
            data-testid=${`wallet-selector-${r.id}`}
            tabIdx=${h(this.tabIdx)}
            ?loading=${this.loading}
            ?disabled=${o}
            rdnsId=${r.id}
          >
          </w3m-list-wallet>
        `)}
    </wui-flex>`}filterOutDuplicateWallets(e){const n=nt.getRecentWallets(),o=this.connectors.map(a=>{var p;return(p=a.info)==null?void 0:p.rdns}).filter(Boolean),r=n.map(a=>a.rdns).filter(Boolean),i=o.concat(r);if(i.includes("io.metamask.mobile")&&m.isMobile()){const a=i.indexOf("io.metamask.mobile");i[a]="io.metamask"}return e.filter(a=>!i.includes(String(a==null?void 0:a.rdns)))}onConnectWallet(e){this.loading||y.push("ConnectingWalletConnect",{wallet:e})}};He([c()],We.prototype,"tabIdx",void 0);He([d()],We.prototype,"connectors",void 0);He([d()],We.prototype,"loading",void 0);We=He([f("w3m-connect-custom-widget")],We);var st=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let je=class extends w{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.unsubscribe.push(v.subscribeKey("connectors",e=>this.connectors=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const o=this.connectors.filter(i=>i.type==="EXTERNAL").filter($e.showConnector).filter(i=>i.id!==ee.CONNECTOR_ID.COINBASE_SDK);if(!(o!=null&&o.length))return this.style.cssText="display: none",null;const r=u.hasAnyConnection(ee.CONNECTOR_ID.WALLET_CONNECT);return l`
      <wui-flex flexDirection="column" gap="2">
        ${o.map(i=>l`
            <w3m-list-wallet
              imageSrc=${h(k.getConnectorImage(i))}
              .installed=${!0}
              name=${i.name??"Unknown"}
              data-testid=${`wallet-selector-external-${i.id}`}
              size="sm"
              @click=${()=>this.onConnector(i)}
              tabIdx=${h(this.tabIdx)}
              ?disabled=${r}
              rdnsId=${i.id}
            >
            </w3m-list-wallet>
          `)}
      </wui-flex>
    `}onConnector(e){y.push("ConnectingExternal",{connector:e})}};st([c()],je.prototype,"tabIdx",void 0);st([d()],je.prototype,"connectors",void 0);je=st([f("w3m-connect-external-widget")],je);var at=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Pe=class extends w{constructor(){super(...arguments),this.tabIdx=void 0,this.wallets=[]}render(){if(!this.wallets.length)return this.style.cssText="display: none",null;const e=u.hasAnyConnection(ee.CONNECTOR_ID.WALLET_CONNECT);return l`
      <wui-flex flexDirection="column" gap="2">
        ${this.wallets.map(n=>l`
            <w3m-list-wallet
              data-testid=${`wallet-selector-featured-${n.id}`}
              imageSrc=${h(k.getWalletImage(n))}
              name=${n.name??"Unknown"}
              @click=${()=>this.onConnectWallet(n)}
              tabIdx=${h(this.tabIdx)}
              size="sm"
              ?disabled=${e}
              rdnsId=${n.id}
            >
            </w3m-list-wallet>
          `)}
      </wui-flex>
    `}onConnectWallet(e){v.selectWalletConnector(e)}};at([c()],Pe.prototype,"tabIdx",void 0);at([c()],Pe.prototype,"wallets",void 0);Pe=at([f("w3m-connect-featured-widget")],Pe);var Fe=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let _e=class extends w{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=[],this.connections=u.state.connections,this.unsubscribe.push(u.subscribeKey("connections",e=>this.connections=e))}render(){const e=this.connectors.filter($e.showConnector);return e.length===0?(this.style.cssText="display: none",null):l`
      <wui-flex flexDirection="column" gap="2">
        ${e.map(n=>{const r=(this.connections.get(n.chain)??[]).some(i=>vt.isLowerCaseMatch(i.connectorId,n.id));return l`
            <w3m-list-wallet
              imageSrc=${h(k.getConnectorImage(n))}
              .installed=${!0}
              name=${n.name??"Unknown"}
              tagVariant=${r?"info":"success"}
              tagLabel=${r?"connected":"installed"}
              data-testid=${`wallet-selector-${n.id}`}
              size="sm"
              @click=${()=>this.onConnector(n)}
              tabIdx=${h(this.tabIdx)}
              rdnsId=${n.id}
            >
            </w3m-list-wallet>
          `})}
      </wui-flex>
    `}onConnector(e){v.setActiveConnector(e),y.push("ConnectingExternal",{connector:e})}};Fe([c()],_e.prototype,"tabIdx",void 0);Fe([c()],_e.prototype,"connectors",void 0);Fe([d()],_e.prototype,"connections",void 0);_e=Fe([f("w3m-connect-injected-widget")],_e);var lt=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Le=class extends w{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.unsubscribe.push(v.subscribeKey("connectors",e=>this.connectors=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=this.connectors.filter(n=>n.type==="MULTI_CHAIN"&&n.name!=="WalletConnect");return e!=null&&e.length?l`
      <wui-flex flexDirection="column" gap="2">
        ${e.map(n=>l`
            <w3m-list-wallet
              imageSrc=${h(k.getConnectorImage(n))}
              .installed=${!0}
              name=${n.name??"Unknown"}
              tagVariant="info"
              tagLabel="multichain"
              data-testid=${`wallet-selector-${n.id}`}
              size="sm"
              @click=${()=>this.onConnector(n)}
              tabIdx=${h(this.tabIdx)}
              rdnsId=${n.id}
            >
            </w3m-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(e){v.setActiveConnector(e),y.push("ConnectingMultiChain")}};lt([c()],Le.prototype,"tabIdx",void 0);lt([d()],Le.prototype,"connectors",void 0);Le=lt([f("w3m-connect-multi-chain-widget")],Le);var Qe=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Re=class extends w{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.loading=!1,this.unsubscribe.push(v.subscribeKey("connectors",e=>this.connectors=e)),m.isTelegram()&&m.isIos()&&(this.loading=!u.state.wcUri,this.unsubscribe.push(u.subscribeKey("wcUri",e=>this.loading=!e)))}render(){const n=nt.getRecentWallets().filter(r=>!ve.isExcluded(r)).filter(r=>!this.hasWalletConnector(r)).filter(r=>this.isWalletCompatibleWithCurrentChain(r));if(!n.length)return this.style.cssText="display: none",null;const o=u.hasAnyConnection(ee.CONNECTOR_ID.WALLET_CONNECT);return l`
      <wui-flex flexDirection="column" gap="2">
        ${n.map(r=>l`
            <w3m-list-wallet
              imageSrc=${h(k.getWalletImage(r))}
              name=${r.name??"Unknown"}
              @click=${()=>this.onConnectWallet(r)}
              tagLabel="recent"
              tagVariant="info"
              size="sm"
              tabIdx=${h(this.tabIdx)}
              ?loading=${this.loading}
              ?disabled=${o}
              rdnsId=${r.id}
            >
            </w3m-list-wallet>
          `)}
      </wui-flex>
    `}onConnectWallet(e){this.loading||v.selectWalletConnector(e)}hasWalletConnector(e){return this.connectors.some(n=>n.id===e.id||n.name===e.name)}isWalletCompatibleWithCurrentChain(e){const n=Q.state.activeChain;return n&&e.chains?e.chains.some(o=>{const r=o.split(":")[0];return n===r}):!0}};Qe([c()],Re.prototype,"tabIdx",void 0);Qe([d()],Re.prototype,"connectors",void 0);Qe([d()],Re.prototype,"loading",void 0);Re=Qe([f("w3m-connect-recent-widget")],Re);var Ge=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};const ft=4;let Ie=class extends w{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.wallets=[],this.loading=!1,m.isTelegram()&&m.isIos()&&(this.loading=!u.state.wcUri,this.unsubscribe.push(u.subscribeKey("wcUri",e=>this.loading=!e)))}render(){var W,g,I,C,L,ht;const{connectors:e}=v.state,{customWallets:n,featuredWalletIds:o}=_.state,r=e.find(T=>T.id==="walletConnect"),i=e.filter(T=>T.type==="INJECTED"||T.type==="ANNOUNCED"||T.type==="MULTI_CHAIN");if(!r&&!i.length&&!(n!=null&&n.length))return null;const s=!!((W=_.state.features)!=null&&W.email||(g=_.state.remoteFeatures)!=null&&g.email),a=Array.isArray((I=_.state.features)==null?void 0:I.socials)&&((C=_.state.features)==null?void 0:C.socials.length)>0||Array.isArray((L=_.state.remoteFeatures)==null?void 0:L.socials)&&((ht=_.state.remoteFeatures)==null?void 0:ht.socials.length)>0,p=i.filter(T=>T.name!=="Browser Wallet"),O=(o==null?void 0:o.length)||0,z=(n==null?void 0:n.length)||0,H=p.length||0,ne=s?1:0,pe=a?1:0,q=O+z+H+ne+pe;if(q>=ft)return this.style.cssText="display: none",null;const x=ve.filterOutDuplicateWallets(this.wallets).slice(0,ft-q);if(!x.length)return this.style.cssText="display: none",null;const b=u.hasAnyConnection(ee.CONNECTOR_ID.WALLET_CONNECT);return l`
      <wui-flex flexDirection="column" gap="2">
        ${x.map(T=>l`
            <w3m-list-wallet
              imageSrc=${h(k.getWalletImage(T))}
              name=${(T==null?void 0:T.name)??"Unknown"}
              @click=${()=>this.onConnectWallet(T)}
              size="sm"
              tabIdx=${h(this.tabIdx)}
              ?loading=${this.loading}
              ?disabled=${b}
              rdnsId=${T.id}
            >
            </w3m-list-wallet>
          `)}
      </wui-flex>
    `}onConnectWallet(e){if(this.loading)return;const n=v.getConnector({id:e.id,rdns:e.rdns});n?y.push("ConnectingExternal",{connector:n}):y.push("ConnectingWalletConnect",{wallet:e})}};Ge([c()],Ie.prototype,"tabIdx",void 0);Ge([c()],Ie.prototype,"wallets",void 0);Ge([d()],Ie.prototype,"loading",void 0);Ie=Ge([f("w3m-connect-recommended-widget")],Ie);var Xe=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Ee=class extends w{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.connectorImages=pt.state.connectorImages,this.unsubscribe.push(v.subscribeKey("connectors",e=>this.connectors=e),pt.subscribeKey("connectorImages",e=>this.connectorImages=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(m.isMobile())return this.style.cssText="display: none",null;const e=this.connectors.find(r=>r.id==="walletConnect");if(!e)return this.style.cssText="display: none",null;const n=e.imageUrl||this.connectorImages[(e==null?void 0:e.imageId)??""],o=u.hasAnyConnection(ee.CONNECTOR_ID.WALLET_CONNECT);return l`
      <w3m-list-wallet
        imageSrc=${h(n)}
        name=${e.name??"Unknown"}
        @click=${()=>this.onConnector(e)}
        tagLabel="qr code"
        tagVariant="accent"
        tabIdx=${h(this.tabIdx)}
        data-testid="wallet-selector-walletconnect"
        size="sm"
        ?disabled=${o}
        rdnsId=${e.id}
      >
      </w3m-list-wallet>
    `}onConnector(e){v.setActiveConnector(e),y.push("ConnectingWalletConnect")}};Xe([c()],Ee.prototype,"tabIdx",void 0);Xe([d()],Ee.prototype,"connectors",void 0);Xe([d()],Ee.prototype,"connectorImages",void 0);Ee=Xe([f("w3m-connect-walletconnect-widget")],Ee);const At=R`
  :host {
    margin-top: ${({spacing:t})=>t[1]};
  }
  wui-separator {
    margin: ${({spacing:t})=>t[3]} calc(${({spacing:t})=>t[3]} * -1)
      ${({spacing:t})=>t[2]} calc(${({spacing:t})=>t[3]} * -1);
    width: calc(100% + ${({spacing:t})=>t[3]} * 2);
  }
`;var Oe=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let re=class extends w{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.recommended=$.state.recommended,this.featured=$.state.featured,this.unsubscribe.push(v.subscribeKey("connectors",e=>this.connectors=e),$.subscribeKey("recommended",e=>this.recommended=e),$.subscribeKey("featured",e=>this.featured=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return l`
      <wui-flex flexDirection="column" gap="2"> ${this.connectorListTemplate()} </wui-flex>
    `}connectorListTemplate(){const e=$e.getConnectorsByType(this.connectors,this.recommended,this.featured),{custom:n,recent:o,announced:r,injected:i,multiChain:s,recommended:a,featured:p,external:O}=e;return $e.getConnectorTypeOrder({custom:n,recent:o,announced:r,injected:i,multiChain:s,recommended:a,featured:p,external:O}).map(H=>{switch(H){case"injected":return l`
            ${s.length?l`<w3m-connect-multi-chain-widget
                  tabIdx=${h(this.tabIdx)}
                ></w3m-connect-multi-chain-widget>`:null}
            ${r.length?l`<w3m-connect-announced-widget
                  tabIdx=${h(this.tabIdx)}
                ></w3m-connect-announced-widget>`:null}
            ${i.length?l`<w3m-connect-injected-widget
                  .connectors=${i}
                  tabIdx=${h(this.tabIdx)}
                ></w3m-connect-injected-widget>`:null}
          `;case"walletConnect":return l`<w3m-connect-walletconnect-widget
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-walletconnect-widget>`;case"recent":return l`<w3m-connect-recent-widget
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-recent-widget>`;case"featured":return l`<w3m-connect-featured-widget
            .wallets=${p}
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-featured-widget>`;case"custom":return l`<w3m-connect-custom-widget
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-custom-widget>`;case"external":return l`<w3m-connect-external-widget
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-external-widget>`;case"recommended":return l`<w3m-connect-recommended-widget
            .wallets=${a}
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-recommended-widget>`;default:return console.warn(`Unknown connector type: ${H}`),null}})}};re.styles=At;Oe([c()],re.prototype,"tabIdx",void 0);Oe([d()],re.prototype,"connectors",void 0);Oe([d()],re.prototype,"recommended",void 0);Oe([d()],re.prototype,"featured",void 0);re=Oe([f("w3m-connector-list")],re);const zt=R`
  :host {
    flex: 1;
    height: 100%;
  }

  button {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: ${({spacing:t})=>t[1]} ${({spacing:t})=>t[2]};
    column-gap: ${({spacing:t})=>t[1]};
    color: ${({tokens:t})=>t.theme.textSecondary};
    border-radius: ${({borderRadius:t})=>t[20]};
    background-color: transparent;
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-active='true'] {
    color: ${({tokens:t})=>t.theme.textPrimary};
    background-color: ${({tokens:t})=>t.theme.foregroundTertiary};
  }

  button:hover:enabled:not([data-active='true']),
  button:active:enabled:not([data-active='true']) {
    wui-text,
    wui-icon {
      color: ${({tokens:t})=>t.theme.textPrimary};
    }
  }
`;var Te=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};const Dt={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},Nt={lg:"md",md:"sm",sm:"sm"};let se=class extends w{constructor(){super(...arguments),this.icon="mobile",this.size="md",this.label="",this.active=!1}render(){return l`
      <button data-active=${this.active}>
        ${this.icon?l`<wui-icon size=${Nt[this.size]} name=${this.icon}></wui-icon>`:""}
        <wui-text variant=${Dt[this.size]}> ${this.label} </wui-text>
      </button>
    `}};se.styles=[A,J,zt];Te([c()],se.prototype,"icon",void 0);Te([c()],se.prototype,"size",void 0);Te([c()],se.prototype,"label",void 0);Te([c({type:Boolean})],se.prototype,"active",void 0);se=Te([f("wui-tab-item")],se);const Bt=R`
  :host {
    display: inline-flex;
    align-items: center;
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    border-radius: ${({borderRadius:t})=>t[32]};
    padding: ${({spacing:t})=>t["01"]};
    box-sizing: border-box;
  }

  :host([data-size='sm']) {
    height: 26px;
  }

  :host([data-size='md']) {
    height: 36px;
  }
`;var Se=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let ae=class extends w{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.size="md",this.activeTab=0}render(){return this.dataset.size=this.size,this.tabs.map((e,n)=>{var r;const o=n===this.activeTab;return l`
        <wui-tab-item
          @click=${()=>this.onTabClick(n)}
          icon=${e.icon}
          size=${this.size}
          label=${e.label}
          ?active=${o}
          data-active=${o}
          data-testid="tab-${(r=e.label)==null?void 0:r.toLowerCase()}"
        ></wui-tab-item>
      `})}onTabClick(e){this.activeTab=e,this.onTabChange(e)}};ae.styles=[A,J,Bt];Se([c({type:Array})],ae.prototype,"tabs",void 0);Se([c()],ae.prototype,"onTabChange",void 0);Se([c()],ae.prototype,"size",void 0);Se([d()],ae.prototype,"activeTab",void 0);ae=Se([f("wui-tabs")],ae);var ct=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Ae=class extends w{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=this.generateTabs();return l`
      <wui-flex justifyContent="center" .padding=${["0","0","4","0"]}>
        <wui-tabs .tabs=${e} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){const e=this.platforms.map(n=>n==="browser"?{label:"Browser",icon:"extension",platform:"browser"}:n==="mobile"?{label:"Mobile",icon:"mobile",platform:"mobile"}:n==="qrcode"?{label:"Mobile",icon:"mobile",platform:"qrcode"}:n==="web"?{label:"Webapp",icon:"browser",platform:"web"}:n==="desktop"?{label:"Desktop",icon:"desktop",platform:"desktop"}:{label:"Browser",icon:"extension",platform:"unsupported"});return this.platformTabs=e.map(({platform:n})=>n),e}onTabChange(e){var o;const n=this.platformTabs[e];n&&((o=this.onSelectPlatfrom)==null||o.call(this,n))}};ct([c({type:Array})],Ae.prototype,"platforms",void 0);ct([c()],Ae.prototype,"onSelectPlatfrom",void 0);Ae=ct([f("w3m-connecting-header")],Ae);const Ut=R`
  :host {
    width: var(--local-width);
  }

  button {
    width: var(--local-width);
    white-space: nowrap;
    column-gap: ${({spacing:t})=>t[2]};
    transition:
      scale ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-1"]},
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      border-radius ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-1"]};
    will-change: scale, background-color, border-radius;
    cursor: pointer;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='sm'] {
    border-radius: ${({borderRadius:t})=>t[2]};
    padding: 0 ${({spacing:t})=>t[2]};
    height: 28px;
  }

  button[data-size='md'] {
    border-radius: ${({borderRadius:t})=>t[3]};
    padding: 0 ${({spacing:t})=>t[4]};
    height: 38px;
  }

  button[data-size='lg'] {
    border-radius: ${({borderRadius:t})=>t[4]};
    padding: 0 ${({spacing:t})=>t[5]};
    height: 48px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent-primary'] {
    background-color: ${({tokens:t})=>t.core.backgroundAccentPrimary};
    color: ${({tokens:t})=>t.theme.textInvert};
  }

  button[data-variant='accent-secondary'] {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
    color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  button[data-variant='neutral-primary'] {
    background-color: ${({tokens:t})=>t.theme.backgroundInvert};
    color: ${({tokens:t})=>t.theme.textInvert};
  }

  button[data-variant='neutral-secondary'] {
    background-color: transparent;
    border: 1px solid ${({tokens:t})=>t.theme.borderSecondary};
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  button[data-variant='neutral-tertiary'] {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  button[data-variant='error-primary'] {
    background-color: ${({tokens:t})=>t.core.textError};
    color: ${({tokens:t})=>t.theme.textInvert};
  }

  button[data-variant='error-secondary'] {
    background-color: ${({tokens:t})=>t.core.backgroundError};
    color: ${({tokens:t})=>t.core.textError};
  }

  button[data-variant='shade'] {
    background: var(--wui-color-gray-glass-002);
    color: var(--wui-color-fg-200);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  /* -- Focus states --------------------------------------------------- */
  button[data-size='sm']:focus-visible:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:focus-visible:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:focus-visible:enabled {
    border-radius: 48px;
  }
  button[data-variant='shade']:focus-visible:enabled {
    background: var(--wui-color-gray-glass-005);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-gray-glass-002);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button[data-size='sm']:hover:enabled {
      border-radius: 28px;
    }

    button[data-size='md']:hover:enabled {
      border-radius: 38px;
    }

    button[data-size='lg']:hover:enabled {
      border-radius: 48px;
    }

    button[data-variant='shade']:hover:enabled {
      background: var(--wui-color-gray-glass-002);
    }

    button[data-variant='shade']:active:enabled {
      background: var(--wui-color-gray-glass-005);
    }
  }

  button[data-size='sm']:active:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:active:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:active:enabled {
    border-radius: 48px;
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    opacity: 0.3;
  }
`;var de=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};const Mt={lg:"lg-regular-mono",md:"md-regular-mono",sm:"sm-regular-mono"},qt={lg:"md",md:"md",sm:"sm"};let X=class extends w{constructor(){super(...arguments),this.size="lg",this.disabled=!1,this.fullWidth=!1,this.loading=!1,this.variant="accent-primary"}render(){this.style.cssText=`
    --local-width: ${this.fullWidth?"100%":"auto"};
     `;const e=this.textVariant??Mt[this.size];return l`
      <button data-variant=${this.variant} data-size=${this.size} ?disabled=${this.disabled}>
        ${this.loadingTemplate()}
        <slot name="iconLeft"></slot>
        <wui-text variant=${e} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `}loadingTemplate(){if(this.loading){const e=qt[this.size],n=this.variant==="neutral-primary"||this.variant==="accent-primary"?"invert":"primary";return l`<wui-loading-spinner color=${n} size=${e}></wui-loading-spinner>`}return null}};X.styles=[A,J,Ut];de([c()],X.prototype,"size",void 0);de([c({type:Boolean})],X.prototype,"disabled",void 0);de([c({type:Boolean})],X.prototype,"fullWidth",void 0);de([c({type:Boolean})],X.prototype,"loading",void 0);de([c()],X.prototype,"variant",void 0);de([c()],X.prototype,"textVariant",void 0);X=de([f("wui-button")],X);const Vt=R`
  :host {
    display: block;
    width: 100px;
    height: 100px;
  }

  svg {
    width: 100px;
    height: 100px;
  }

  rect {
    fill: none;
    stroke: ${t=>t.colors.accent100};
    stroke-width: 3px;
    stroke-linecap: round;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`;var It=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let ze=class extends w{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){const e=this.radius>50?50:this.radius,o=36-e,r=116+o,i=245+o,s=360+o*1.75;return l`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${e}
          stroke-dasharray="${r} ${i}"
          stroke-dashoffset=${s}
        />
      </svg>
    `}};ze.styles=[A,Vt];It([c({type:Number})],ze.prototype,"radius",void 0);ze=It([f("wui-loading-thumbnail")],ze);const Kt=R`
  wui-flex {
    width: 100%;
    height: 52px;
    box-sizing: border-box;
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: ${({borderRadius:t})=>t[5]};
    padding-left: ${({spacing:t})=>t[3]};
    padding-right: ${({spacing:t})=>t[3]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:t})=>t[6]};
  }

  wui-text {
    color: ${({tokens:t})=>t.theme.textSecondary};
  }

  wui-icon {
    width: 12px;
    height: 12px;
  }
`;var Ye=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let fe=class extends w{constructor(){super(...arguments),this.disabled=!1,this.label="",this.buttonLabel=""}render(){return l`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="inherit">${this.label}</wui-text>
        <wui-button variant="accent-secondary" size="sm">
          ${this.buttonLabel}
          <wui-icon name="chevronRight" color="inherit" size="inherit" slot="iconRight"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};fe.styles=[A,J,Kt];Ye([c({type:Boolean})],fe.prototype,"disabled",void 0);Ye([c()],fe.prototype,"label",void 0);Ye([c()],fe.prototype,"buttonLabel",void 0);fe=Ye([f("wui-cta-button")],fe);const Ht=R`
  :host {
    display: block;
    padding: 0 ${({spacing:t})=>t[5]} ${({spacing:t})=>t[5]};
  }
`;var Et=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let De=class extends w{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display="none",null;const{name:e,app_store:n,play_store:o,chrome_store:r,homepage:i}=this.wallet,s=m.isMobile(),a=m.isIos(),p=m.isAndroid(),O=[n,o,i,r].filter(Boolean).length>1,z=G.getTruncateString({string:e,charsStart:12,charsEnd:0,truncate:"end"});return O&&!s?l`
        <wui-cta-button
          label=${`Don't have ${z}?`}
          buttonLabel="Get"
          @click=${()=>y.push("Downloads",{wallet:this.wallet})}
        ></wui-cta-button>
      `:!O&&i?l`
        <wui-cta-button
          label=${`Don't have ${z}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:n&&a?l`
        <wui-cta-button
          label=${`Don't have ${z}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:o&&p?l`
        <wui-cta-button
          label=${`Don't have ${z}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display="none",null)}onAppStore(){var e;(e=this.wallet)!=null&&e.app_store&&m.openHref(this.wallet.app_store,"_blank")}onPlayStore(){var e;(e=this.wallet)!=null&&e.play_store&&m.openHref(this.wallet.play_store,"_blank")}onHomePage(){var e;(e=this.wallet)!=null&&e.homepage&&m.openHref(this.wallet.homepage,"_blank")}};De.styles=[Ht];Et([c({type:Object})],De.prototype,"wallet",void 0);De=Et([f("w3m-mobile-download-links")],De);const Ft=R`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-wallet-image {
    width: 56px;
    height: 56px;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:t})=>t[1]} * -1);
    bottom: calc(${({spacing:t})=>t[1]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: ${({durations:t})=>t.lg};
    transition-timing-function: ${({easings:t})=>t["ease-out-power-2"]};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:t})=>t[4]};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:t})=>t["ease-out-power-2"]} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  w3m-mobile-download-links {
    padding: 0px;
    width: 100%;
  }
`;var M=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};class E extends w{constructor(){var e,n,o,r,i;super(),this.wallet=(e=y.state.data)==null?void 0:e.wallet,this.connector=(n=y.state.data)==null?void 0:n.connector,this.timeout=void 0,this.secondaryBtnIcon="refresh",this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=k.getWalletImage(this.wallet)??k.getConnectorImage(this.connector),this.name=((o=this.wallet)==null?void 0:o.name)??((r=this.connector)==null?void 0:r.name)??"Wallet",this.isRetrying=!1,this.uri=u.state.wcUri,this.error=u.state.wcError,this.ready=!1,this.showRetry=!1,this.label=void 0,this.secondaryBtnLabel="Try again",this.secondaryLabel="Accept connection request in the wallet",this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(u.subscribeKey("wcUri",s=>{var a;this.uri=s,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,(a=this.onConnect)==null||a.call(this))}),u.subscribeKey("wcError",s=>this.error=s)),(m.isTelegram()||m.isSafari())&&m.isIos()&&u.state.wcUri&&((i=this.onConnect)==null||i.call(this))}firstUpdated(){var e;(e=this.onAutoConnect)==null||e.call(this),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),u.setWcError(!1),clearTimeout(this.timeout)}render(){var o;(o=this.onRender)==null||o.call(this),this.onShowRetry();const e=this.error?"Connection can be declined if a previous request is still active":this.secondaryLabel;let n="";return this.label?n=this.label:(n=`Continue in ${this.name}`,this.error&&(n="Connection declined")),l`
      <wui-flex
        data-error=${h(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="6"
      >
        <wui-flex gap="2" justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${h(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="6"> <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["2","0","0","0"]}
        >
          <wui-text align="center" variant="lg-medium" color=${this.error?"error":"primary"}>
            ${n}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">${e}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?l`
                <wui-button
                  variant="neutral-secondary"
                  size="md"
                  ?disabled=${this.isRetrying||this.isLoading}
                  @click=${this.onTryAgain.bind(this)}
                  data-testid="w3m-connecting-widget-secondary-button"
                >
                  <wui-icon
                    color="inherit"
                    slot="iconLeft"
                    name=${this.secondaryBtnIcon}
                  ></wui-icon>
                  ${this.secondaryBtnLabel}
                </wui-button>
              `:null}
      </wui-flex>

      ${this.isWalletConnect?l`
              <wui-flex .padding=${["0","5","5","5"]} justifyContent="center">
                <wui-link
                  @click=${this.onCopyUri}
                  variant="secondary"
                  icon="copy"
                  data-testid="wui-link-copy"
                >
                  Copy link
                </wui-link>
              </wui-flex>
            `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links></wui-flex>
      </wui-flex>
    `}onShowRetry(){var e;if(this.error&&!this.showRetry){this.showRetry=!0;const n=(e=this.shadowRoot)==null?void 0:e.querySelector("wui-button");n==null||n.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"})}}onTryAgain(){var e,n;u.setWcError(!1),this.onRetry?(this.isRetrying=!0,(e=this.onRetry)==null||e.call(this)):(n=this.onConnect)==null||n.call(this)}loaderTemplate(){const e=tt.state.themeVariables["--w3m-border-radius-master"],n=e?parseInt(e.replace("px",""),10):4;return l`<wui-loading-thumbnail radius=${n*9}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(m.copyToClopboard(this.uri),xe.showSuccess("Link copied"))}catch{xe.showError("Failed to copy")}}}E.styles=Ft;M([d()],E.prototype,"isRetrying",void 0);M([d()],E.prototype,"uri",void 0);M([d()],E.prototype,"error",void 0);M([d()],E.prototype,"ready",void 0);M([d()],E.prototype,"showRetry",void 0);M([d()],E.prototype,"label",void 0);M([d()],E.prototype,"secondaryBtnLabel",void 0);M([d()],E.prototype,"secondaryLabel",void 0);M([d()],E.prototype,"isLoading",void 0);M([c({type:Boolean})],E.prototype,"isMobile",void 0);M([c()],E.prototype,"onRetry",void 0);var Qt=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let mt=class extends E{constructor(){var e;if(super(),!this.wallet)throw new Error("w3m-connecting-wc-browser: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),S.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:(e=this.wallet)==null?void 0:e.display_index,walletRank:this.wallet.order,view:y.state.view}})}async onConnectProxy(){var e,n;try{this.error=!1;const{connectors:o}=v.state,r=o.find(i=>{var s,a,p;return i.type==="ANNOUNCED"&&((s=i.info)==null?void 0:s.rdns)===((a=this.wallet)==null?void 0:a.rdns)||i.type==="INJECTED"||i.name===((p=this.wallet)==null?void 0:p.name)});if(r)await u.connectExternal(r,r.chain);else throw new Error("w3m-connecting-wc-browser: No connector found");xt.close(),S.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:"browser",name:((e=this.wallet)==null?void 0:e.name)||"Unknown",view:y.state.view,walletRank:(n=this.wallet)==null?void 0:n.order}})}catch(o){o instanceof Ct&&o.originalName===Wt.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?S.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:o.message}}):S.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:(o==null?void 0:o.message)??"Unknown"}}),this.error=!0}}};mt=Qt([f("w3m-connecting-wc-browser")],mt);var Gt=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let wt=class extends E{constructor(){var e;if(super(),!this.wallet)throw new Error("w3m-connecting-wc-desktop: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),S.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"desktop",displayIndex:(e=this.wallet)==null?void 0:e.display_index,walletRank:this.wallet.order,view:y.state.view}})}onRenderProxy(){var e;!this.ready&&this.uri&&(this.ready=!0,(e=this.onConnect)==null||e.call(this))}onConnectProxy(){var e;if((e=this.wallet)!=null&&e.desktop_link&&this.uri)try{this.error=!1;const{desktop_link:n,name:o}=this.wallet,{redirect:r,href:i}=m.formatNativeUrl(n,this.uri);u.setWcLinking({name:o,href:i}),u.setRecentWallet(this.wallet),m.openHref(r,"_blank")}catch{this.error=!0}}};wt=Gt([f("w3m-connecting-wc-desktop")],wt);var ge=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let le=class extends E{constructor(){var e;if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=_.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{var n;if((n=this.wallet)!=null&&n.mobile_link&&this.uri)try{this.error=!1;const{mobile_link:o,link_mode:r,name:i}=this.wallet,{redirect:s,redirectUniversalLink:a,href:p}=m.formatNativeUrl(o,this.uri,r);this.redirectDeeplink=s,this.redirectUniversalLink=a,this.target=m.isIframe()?"_top":"_self",u.setWcLinking({name:i,href:p}),u.setRecentWallet(this.wallet),this.preferUniversalLinks&&this.redirectUniversalLink?m.openHref(this.redirectUniversalLink,this.target):m.openHref(this.redirectDeeplink,this.target)}catch(o){S.sendEvent({type:"track",event:"CONNECT_PROXY_ERROR",properties:{message:o instanceof Error?o.message:"Error parsing the deeplink",uri:this.uri,mobile_link:this.wallet.mobile_link,name:this.wallet.name}}),this.error=!0}},!this.wallet)throw new Error("w3m-connecting-wc-mobile: No wallet provided");this.secondaryBtnLabel="Open",this.secondaryLabel=_t.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.onHandleURI(),this.unsubscribe.push(u.subscribeKey("wcUri",()=>{this.onHandleURI()})),S.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"mobile",displayIndex:(e=this.wallet)==null?void 0:e.display_index,walletRank:this.wallet.order,view:y.state.view}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){var e;this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,(e=this.onConnect)==null||e.call(this))}onTryAgain(){var e;u.setWcError(!1),(e=this.onConnect)==null||e.call(this)}};ge([d()],le.prototype,"redirectDeeplink",void 0);ge([d()],le.prototype,"redirectUniversalLink",void 0);ge([d()],le.prototype,"target",void 0);ge([d()],le.prototype,"preferUniversalLinks",void 0);ge([d()],le.prototype,"isLoading",void 0);le=ge([f("w3m-connecting-wc-mobile")],le);const Xt=.1,bt=2.5,F=7;function et(t,e,n){return t===e?!1:(t-e<0?e-t:t-e)<=n+Xt}function Yt(t,e){const n=Array.prototype.slice.call(Lt.create(t,{errorCorrectionLevel:e}).modules.data,0),o=Math.sqrt(n.length);return n.reduce((r,i,s)=>(s%o===0?r.push([i]):r[r.length-1].push(i))&&r,[])}const Jt={generate({uri:t,size:e,logoSize:n,padding:o=8,dotColor:r="var(--apkt-tokens-theme-textInvert)"}){const s=[],a=Yt(t,"Q"),p=(e-2*o)/a.length,O=[{x:0,y:0},{x:1,y:0},{x:0,y:1}];O.forEach(({x,y:b})=>{const W=(a.length-F)*p*x+o,g=(a.length-F)*p*b+o,I=.45;for(let C=0;C<O.length;C+=1){const L=p*(F-C*2);s.push(ye`
            <rect
              fill=${C===2?"var(--apkt-tokens-theme-textInvert)":"var(--apkt-tokens-theme-textPrimary)"}
              width=${C===0?L-10:L}
              rx= ${C===0?(L-10)*I:L*I}
              ry= ${C===0?(L-10)*I:L*I}
              stroke=${r}
              stroke-width=${C===0?10:0}
              height=${C===0?L-10:L}
              x= ${C===0?g+p*C+10/2:g+p*C}
              y= ${C===0?W+p*C+10/2:W+p*C}
            />
          `)}});const z=Math.floor((n+25)/p),H=a.length/2-z/2,ne=a.length/2+z/2-1,pe=[];a.forEach((x,b)=>{x.forEach((W,g)=>{if(a[b][g]&&!(b<F&&g<F||b>a.length-(F+1)&&g<F||b<F&&g>a.length-(F+1))&&!(b>H&&b<ne&&g>H&&g<ne)){const I=b*p+p/2+o,C=g*p+p/2+o;pe.push([I,C])}})});const q={};return pe.forEach(([x,b])=>{var W;q[x]?(W=q[x])==null||W.push(b):q[x]=[b]}),Object.entries(q).map(([x,b])=>{const W=b.filter(g=>b.every(I=>!et(g,I,p)));return[Number(x),W]}).forEach(([x,b])=>{b.forEach(W=>{s.push(ye`<circle cx=${x} cy=${W} fill=${r} r=${p/bt} />`)})}),Object.entries(q).filter(([x,b])=>b.length>1).map(([x,b])=>{const W=b.filter(g=>b.some(I=>et(g,I,p)));return[Number(x),W]}).map(([x,b])=>{b.sort((g,I)=>g<I?-1:1);const W=[];for(const g of b){const I=W.find(C=>C.some(L=>et(g,L,p)));I?I.push(g):W.push([g])}return[x,W.map(g=>[g[0],g[g.length-1]])]}).forEach(([x,b])=>{b.forEach(([W,g])=>{s.push(ye`
              <line
                x1=${x}
                x2=${x}
                y1=${W}
                y2=${g}
                stroke=${r}
                stroke-width=${p/(bt/2)}
                stroke-linecap="round"
              />
            `)})}),s}},Zt=R`
  :host {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    width: 100%;
    height: 100%;
    background-color: ${({tokens:t})=>t.theme.backgroundInvert};
    color: ${({tokens:t})=>t.theme.textInvert};
  }

  :host {
    border-radius: ${({borderRadius:t})=>t[4]};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host([data-clear='true']) > wui-icon {
    display: none;
  }

  svg:first-child,
  wui-image,
  wui-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    box-shadow: inset 0 0 0 4px ${({tokens:t})=>t.theme.backgroundPrimary};
    border-radius: ${({borderRadius:t})=>t[6]};
  }

  wui-image {
    width: 25%;
    height: 25%;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  wui-icon {
    width: 100%;
    height: 100%;
    color: #3396ff !important;
    transform: translateY(-50%) translateX(-50%) scale(0.25);
  }

  wui-icon > svg {
    width: inherit;
    height: inherit;
  }
`;var ie=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let V=class extends w{constructor(){super(...arguments),this.uri="",this.size=0,this.theme="dark",this.imageSrc=void 0,this.alt=void 0,this.arenaClear=void 0,this.farcaster=void 0}render(){return this.dataset.theme=this.theme,this.dataset.clear=String(this.arenaClear),this.style.cssText=`--local-size: ${this.size}px`,l`<wui-flex
      alignItems="center"
      justifyContent="center"
      class="wui-qr-code"
      direction="column"
      gap="4"
      width="100%"
      style="height: 100%"
    >
      ${this.templateVisual()} ${this.templateSvg()}
    </wui-flex>`}templateSvg(){return ye`
      <svg height=${this.size} width=${this.size}>
        ${Jt.generate({uri:this.uri,size:this.size,logoSize:this.arenaClear?0:this.size/4})}
      </svg>
    `}templateVisual(){return this.imageSrc?l`<wui-image src=${this.imageSrc} alt=${this.alt??"logo"}></wui-image>`:this.farcaster?l`<wui-icon
        class="farcaster"
        size="inherit"
        color="inherit"
        name="farcaster"
      ></wui-icon>`:l`<wui-icon size="inherit" color="inherit" name="walletConnect"></wui-icon>`}};V.styles=[A,Zt];ie([c()],V.prototype,"uri",void 0);ie([c({type:Number})],V.prototype,"size",void 0);ie([c()],V.prototype,"theme",void 0);ie([c()],V.prototype,"imageSrc",void 0);ie([c()],V.prototype,"alt",void 0);ie([c({type:Boolean})],V.prototype,"arenaClear",void 0);ie([c({type:Boolean})],V.prototype,"farcaster",void 0);V=ie([f("wui-qr-code")],V);const ei=R`
  :host {
    display: block;
    background: linear-gradient(
      90deg,
      ${({tokens:t})=>t.theme.foregroundSecondary} 0%,
      ${({tokens:t})=>t.theme.foregroundTertiary} 50%,
      ${({tokens:t})=>t.theme.foregroundSecondary} 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1s ease-in-out infinite;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:t})=>t[16]};
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;var ke=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let ce=class extends w{constructor(){super(...arguments),this.width="",this.height="",this.variant="default",this.rounded=!1}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
    `,this.dataset.rounded=this.rounded?"true":"false",l`<slot></slot>`}};ce.styles=[ei];ke([c()],ce.prototype,"width",void 0);ke([c()],ce.prototype,"height",void 0);ke([c()],ce.prototype,"variant",void 0);ke([c({type:Boolean})],ce.prototype,"rounded",void 0);ce=ke([f("wui-shimmer")],ce);const ti=R`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({borderRadius:t})=>t[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: ${({durations:t})=>t.xl};
    animation-timing-function: ${({easings:t})=>t["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var Ot=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Ne=class extends E{constructor(){super(),this.basic=!1,this.forceUpdate=()=>{this.requestUpdate()},window.addEventListener("resize",this.forceUpdate)}firstUpdated(){var e,n,o;this.basic||S.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:((e=this.wallet)==null?void 0:e.name)??"WalletConnect",platform:"qrcode",displayIndex:(n=this.wallet)==null?void 0:n.display_index,walletRank:(o=this.wallet)==null?void 0:o.order,view:y.state.view}})}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this.unsubscribe)==null||e.forEach(n=>n()),window.removeEventListener("resize",this.forceUpdate)}render(){return this.onRenderProxy(),l`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["0","5","5","5"]}
        gap="5"
      >
        <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>
        <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.timeout=setTimeout(()=>{this.ready=!0},200))}qrCodeTemplate(){if(!this.uri||!this.ready)return null;const e=this.getBoundingClientRect().width-40,n=this.wallet?this.wallet.name:void 0;return u.setWcLinking(void 0),u.setRecentWallet(this.wallet),l` <wui-qr-code
      size=${e}
      theme=${tt.state.themeMode}
      uri=${this.uri}
      imageSrc=${h(k.getWalletImage(this.wallet))}
      color=${h(tt.state.themeVariables["--w3m-qr-color"])}
      alt=${h(n)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){const e=!this.uri||!this.ready;return l`<wui-button
      .disabled=${e}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      Copy link
      <wui-icon size="sm" color="inherit" name="copy" slot="iconRight"></wui-icon>
    </wui-button>`}};Ne.styles=ti;Ot([c({type:Boolean})],Ne.prototype,"basic",void 0);Ne=Ot([f("w3m-connecting-wc-qrcode")],Ne);var ii=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let gt=class extends w{constructor(){var e,n,o;if(super(),this.wallet=(e=y.state.data)==null?void 0:e.wallet,!this.wallet)throw new Error("w3m-connecting-wc-unsupported: No wallet provided");S.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:(n=this.wallet)==null?void 0:n.display_index,walletRank:(o=this.wallet)==null?void 0:o.order,view:y.state.view}})}render(){return l`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="5"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${h(k.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="md-regular" color="primary">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};gt=ii([f("w3m-connecting-wc-unsupported")],gt);var Tt=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let it=class extends E{constructor(){var e,n;if(super(),this.isLoading=!0,!this.wallet)throw new Error("w3m-connecting-wc-web: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel="Open",this.secondaryLabel=_t.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.updateLoadingState(),this.unsubscribe.push(u.subscribeKey("wcUri",()=>{this.updateLoadingState()})),S.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"web",displayIndex:(e=this.wallet)==null?void 0:e.display_index,walletRank:(n=this.wallet)==null?void 0:n.order,view:y.state.view}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){var e;if((e=this.wallet)!=null&&e.webapp_link&&this.uri)try{this.error=!1;const{webapp_link:n,name:o}=this.wallet,{redirect:r,href:i}=m.formatUniversalUrl(n,this.uri);u.setWcLinking({name:o,href:i}),u.setRecentWallet(this.wallet),m.openHref(r,"_blank")}catch{this.error=!0}}};Tt([d()],it.prototype,"isLoading",void 0);it=Tt([f("w3m-connecting-wc-web")],it);var ue=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let te=class extends w{constructor(){var e;super(),this.wallet=(e=y.state.data)==null?void 0:e.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!_.state.siwx,this.remoteFeatures=_.state.remoteFeatures,this.displayBranding=!0,this.basic=!1,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(_.subscribeKey("remoteFeatures",n=>this.remoteFeatures=n))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return l`
      ${this.headerTemplate()}
      <div>${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){var e;return!((e=this.remoteFeatures)!=null&&e.reownBranding)||!this.displayBranding?null:l`<wui-ux-by-reown></wui-ux-by-reown>`}async initializeConnection(e=!1){var n,o;if(!(this.platform==="browser"||_.state.manualWCControl&&!e))try{const{wcPairingExpiry:r,status:i}=u.state;if(e||_.state.enableEmbedded||m.isPairingExpired(r)||i==="connecting"){const s=u.getConnections(Q.state.activeChain),a=(n=this.remoteFeatures)==null?void 0:n.multiWallet,p=s.length>0;await u.connectWalletConnect({cache:"never"}),this.isSiwxEnabled||(p&&a?(y.replace("ProfileWallets"),xe.showSuccess("New Wallet Added")):xt.close())}}catch(r){if(r instanceof Error&&r.message.includes("An error occurred when attempting to switch chain")&&!_.state.enableNetworkSwitch&&Q.state.activeChain){Q.setActiveCaipNetwork(Pt.getUnsupportedNetwork(`${Q.state.activeChain}:${(o=Q.state.activeCaipNetwork)==null?void 0:o.id}`)),Q.showUnsupportedChainUI();return}r instanceof Ct&&r.originalName===Wt.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?S.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:r.message}}):S.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:(r==null?void 0:r.message)??"Unknown"}}),u.setWcError(!0),xe.showError(r.message??"Connection error"),u.resetWcConnection(),y.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push("qrcode"),this.platform="qrcode";return}if(this.platform)return;const{mobile_link:e,desktop_link:n,webapp_link:o,injected:r,rdns:i}=this.wallet,s=r==null?void 0:r.map(({injected_id:q})=>q).filter(Boolean),a=[...i?[i]:s??[]],p=_.state.isUniversalProvider?!1:a.length,O=e,z=o,H=u.checkInstalled(a),ne=p&&H,pe=n&&!m.isMobile();ne&&!Q.state.noAdapters&&this.platforms.push("browser"),O&&this.platforms.push(m.isMobile()?"mobile":"qrcode"),z&&this.platforms.push("web"),pe&&this.platforms.push("desktop"),!ne&&p&&!Q.state.noAdapters&&this.platforms.push("unsupported"),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case"browser":return l`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case"web":return l`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case"desktop":return l`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case"mobile":return l`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case"qrcode":return l`<w3m-connecting-wc-qrcode ?basic=${this.basic}></w3m-connecting-wc-qrcode>`;default:return l`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?l`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(e){var o;const n=(o=this.shadowRoot)==null?void 0:o.querySelector("div");n&&(await n.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.platform=e,n.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}};ue([d()],te.prototype,"platform",void 0);ue([d()],te.prototype,"platforms",void 0);ue([d()],te.prototype,"isSiwxEnabled",void 0);ue([d()],te.prototype,"remoteFeatures",void 0);ue([c({type:Boolean})],te.prototype,"displayBranding",void 0);ue([c({type:Boolean})],te.prototype,"basic",void 0);te=ue([f("w3m-connecting-wc-view")],te);var dt=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Be=class extends w{constructor(){super(),this.unsubscribe=[],this.isMobile=m.isMobile(),this.remoteFeatures=_.state.remoteFeatures,this.unsubscribe.push(_.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(this.isMobile){const{featured:e,recommended:n}=$.state,{customWallets:o}=_.state,r=nt.getRecentWallets(),i=e.length||n.length||(o==null?void 0:o.length)||r.length;return l`<wui-flex flexDirection="column" gap="2" .margin=${["1","3","3","3"]}>
        ${i?l`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return l`<wui-flex flexDirection="column" .padding=${["0","0","4","0"]}>
        <w3m-connecting-wc-view ?basic=${!0} .displayBranding=${!1}></w3m-connecting-wc-view>
        <wui-flex flexDirection="column" .padding=${["0","3","0","3"]}>
          <w3m-all-wallets-widget></w3m-all-wallets-widget>
        </wui-flex>
      </wui-flex>
      ${this.reownBrandingTemplate()} `}reownBrandingTemplate(){var e;return(e=this.remoteFeatures)!=null&&e.reownBranding?l` <wui-flex flexDirection="column" .padding=${["1","0","1","0"]}>
      <wui-ux-by-reown></wui-ux-by-reown>
    </wui-flex>`:null}};dt([d()],Be.prototype,"isMobile",void 0);dt([d()],Be.prototype,"remoteFeatures",void 0);Be=dt([f("w3m-connecting-wc-basic-view")],Be);const ni=R`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    user-select: none;
    transition:
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      color ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      border ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      box-shadow ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      width ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      height ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      transform ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      opacity ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({colors:t})=>t.neutrals300};
    border-radius: ${({borderRadius:t})=>t.round};
    border: 1px solid transparent;
    will-change: border;
    transition:
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      color ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      border ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      box-shadow ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      width ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      height ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      transform ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      opacity ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  span:before {
    content: '';
    position: absolute;
    background-color: ${({colors:t})=>t.white};
    border-radius: 50%;
  }

  /* -- Sizes --------------------------------------------------------- */
  label[data-size='lg'] {
    width: 48px;
    height: 32px;
  }

  label[data-size='md'] {
    width: 40px;
    height: 28px;
  }

  label[data-size='sm'] {
    width: 32px;
    height: 22px;
  }

  label[data-size='lg'] > span:before {
    height: 24px;
    width: 24px;
    left: 4px;
    top: 3px;
  }

  label[data-size='md'] > span:before {
    height: 20px;
    width: 20px;
    left: 4px;
    top: 3px;
  }

  label[data-size='sm'] > span:before {
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
  }

  /* -- Focus states --------------------------------------------------- */
  input:focus-visible:not(:checked) + span,
  input:focus:not(:checked) + span {
    border: 1px solid ${({tokens:t})=>t.core.iconAccentPrimary};
    background-color: ${({tokens:t})=>t.theme.textTertiary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  input:focus-visible:checked + span,
  input:focus:checked + span {
    border: 1px solid ${({tokens:t})=>t.core.iconAccentPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Checked states --------------------------------------------------- */
  input:checked + span {
    background-color: ${({tokens:t})=>t.core.iconAccentPrimary};
  }

  label[data-size='lg'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='md'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='sm'] > input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }

  /* -- Hover states ------------------------------------------------------- */
  label:hover > input:not(:checked):not(:disabled) + span {
    background-color: ${({colors:t})=>t.neutrals400};
  }

  label:hover > input:checked:not(:disabled) + span {
    background-color: ${({colors:t})=>t.accent080};
  }

  /* -- Disabled state --------------------------------------------------- */
  label:has(input:disabled) {
    pointer-events: none;
    user-select: none;
  }

  input:not(:checked):disabled + span {
    background-color: ${({colors:t})=>t.neutrals700};
  }

  input:checked:disabled + span {
    background-color: ${({colors:t})=>t.neutrals700};
  }

  input:not(:checked):disabled + span::before {
    background-color: ${({colors:t})=>t.neutrals400};
  }

  input:checked:disabled + span::before {
    background-color: ${({tokens:t})=>t.theme.textTertiary};
  }
`;var Je=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let me=class extends w{constructor(){super(...arguments),this.inputElementRef=ot(),this.checked=!1,this.disabled=!1,this.size="md"}render(){return l`
      <label data-size=${this.size}>
        <input
          ${rt(this.inputElementRef)}
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){var e;this.dispatchEvent(new CustomEvent("switchChange",{detail:(e=this.inputElementRef.value)==null?void 0:e.checked,bubbles:!0,composed:!0}))}};me.styles=[A,J,ni];Je([c({type:Boolean})],me.prototype,"checked",void 0);Je([c({type:Boolean})],me.prototype,"disabled",void 0);Je([c()],me.prototype,"size",void 0);me=Je([f("wui-toggle")],me);const oi=R`
  :host {
    height: auto;
  }

  :host > wui-flex {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: ${({spacing:t})=>t[2]};
    padding: ${({spacing:t})=>t[2]} ${({spacing:t})=>t[3]};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: ${({borderRadius:t})=>t[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:t})=>t.theme.foregroundPrimary};
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`;var St=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Ue=class extends w{constructor(){super(...arguments),this.checked=!1}render(){return l`
      <wui-flex>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle
          ?checked=${this.checked}
          size="sm"
          @switchChange=${this.handleToggleChange.bind(this)}
        ></wui-toggle>
      </wui-flex>
    `}handleToggleChange(e){e.stopPropagation(),this.checked=e.detail,this.dispatchSwitchEvent()}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent("certifiedSwitchChange",{detail:this.checked,bubbles:!0,composed:!0}))}};Ue.styles=[A,J,oi];St([c({type:Boolean})],Ue.prototype,"checked",void 0);Ue=St([f("wui-certified-switch")],Ue);const ri=R`
  :host {
    position: relative;
    width: 100%;
    display: inline-flex;
    flex-direction: column;
    gap: ${({spacing:t})=>t[3]};
    color: ${({tokens:t})=>t.theme.textPrimary};
    caret-color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  .wui-input-text-container {
    position: relative;
    display: flex;
  }

  input {
    width: 100%;
    border-radius: ${({borderRadius:t})=>t[4]};
    color: inherit;
    background: transparent;
    border: 1px solid ${({tokens:t})=>t.theme.borderPrimary};
    caret-color: ${({tokens:t})=>t.core.textAccentPrimary};
    padding: ${({spacing:t})=>t[3]} ${({spacing:t})=>t[3]}
      ${({spacing:t})=>t[3]} ${({spacing:t})=>t[10]};
    font-size: ${({textSize:t})=>t.large};
    line-height: ${({typography:t})=>t["lg-regular"].lineHeight};
    letter-spacing: ${({typography:t})=>t["lg-regular"].letterSpacing};
    font-weight: ${({fontWeight:t})=>t.regular};
    font-family: ${({fontFamily:t})=>t.regular};
  }

  input[data-size='lg'] {
    padding: ${({spacing:t})=>t[4]} ${({spacing:t})=>t[3]}
      ${({spacing:t})=>t[4]} ${({spacing:t})=>t[10]};
  }

  @media (hover: hover) and (pointer: fine) {
    input:hover:enabled {
      border: 1px solid ${({tokens:t})=>t.theme.borderSecondary};
    }
  }

  input:disabled {
    cursor: unset;
    border: 1px solid ${({tokens:t})=>t.theme.borderPrimary};
  }

  input::placeholder {
    color: ${({tokens:t})=>t.theme.textSecondary};
  }

  input:focus:enabled {
    border: 1px solid ${({tokens:t})=>t.theme.borderSecondary};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:t})=>t.core.foregroundAccent040};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:t})=>t.core.foregroundAccent040};
    box-shadow: 0px 0px 0px 4px ${({tokens:t})=>t.core.foregroundAccent040};
  }

  div.wui-input-text-container:has(input:disabled) {
    opacity: 0.5;
  }

  wui-icon.wui-input-text-left-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    left: ${({spacing:t})=>t[4]};
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  button.wui-input-text-submit-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:t})=>t[3]};
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: ${({borderRadius:t})=>t[2]};
    color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  button.wui-input-text-submit-button:disabled {
    opacity: 1;
  }

  button.wui-input-text-submit-button.loading wui-icon {
    animation: spin 1s linear infinite;
  }

  button.wui-input-text-submit-button:hover {
    background: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  input:has(+ .wui-input-text-submit-button) {
    padding-right: ${({spacing:t})=>t[12]};
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  /* -- Keyframes --------------------------------------------------- */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;var N=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let j=class extends w{constructor(){super(...arguments),this.inputElementRef=ot(),this.disabled=!1,this.loading=!1,this.placeholder="",this.type="text",this.value="",this.size="md"}render(){return l` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${rt(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${h(this.enterKeyHint)}
          ?disabled=${this.disabled}
          placeholder=${this.placeholder}
          @input=${this.dispatchInputChangeEvent.bind(this)}
          @keydown=${this.onKeyDown}
          .value=${this.value||""}
        />
        ${this.templateSubmitButton()}
        <slot class="wui-input-text-slot"></slot>
      </div>
      ${this.templateError()} ${this.templateWarning()}`}templateLeftIcon(){return this.icon?l`<wui-icon
        class="wui-input-text-left-icon"
        size="md"
        data-size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}templateSubmitButton(){var e;return this.onSubmit?l`<button
        class="wui-input-text-submit-button ${this.loading?"loading":""}"
        @click=${(e=this.onSubmit)==null?void 0:e.bind(this)}
        ?disabled=${this.disabled||this.loading}
      >
        ${this.loading?l`<wui-icon name="spinner" size="md"></wui-icon>`:l`<wui-icon name="chevronRight" size="md"></wui-icon>`}
      </button>`:null}templateError(){return this.errorText?l`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`:null}templateWarning(){return this.warningText?l`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`:null}dispatchInputChangeEvent(){var e;this.dispatchEvent(new CustomEvent("inputChange",{detail:(e=this.inputElementRef.value)==null?void 0:e.value,bubbles:!0,composed:!0}))}};j.styles=[A,J,ri];N([c()],j.prototype,"icon",void 0);N([c({type:Boolean})],j.prototype,"disabled",void 0);N([c({type:Boolean})],j.prototype,"loading",void 0);N([c()],j.prototype,"placeholder",void 0);N([c()],j.prototype,"type",void 0);N([c()],j.prototype,"value",void 0);N([c()],j.prototype,"errorText",void 0);N([c()],j.prototype,"warningText",void 0);N([c()],j.prototype,"onSubmit",void 0);N([c()],j.prototype,"size",void 0);N([c({attribute:!1})],j.prototype,"onKeyDown",void 0);j=N([f("wui-input-text")],j);const si=R`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:t})=>t[3]};
    color: ${({tokens:t})=>t.theme.iconDefault};
    cursor: pointer;
    padding: ${({spacing:t})=>t[2]};
    background-color: transparent;
    border-radius: ${({borderRadius:t})=>t[4]};
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t["ease-out-power-2"]};
  }

  @media (hover: hover) {
    wui-icon:hover {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }
  }
`;var kt=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Me=class extends w{constructor(){super(...arguments),this.inputComponentRef=ot(),this.inputValue=""}render(){return l`
      <wui-input-text
        ${rt(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
        @inputChange=${this.onInputChange}
      >
        ${this.inputValue?l`<wui-icon
              @click=${this.clearValue}
              color="inherit"
              size="sm"
              name="close"
            ></wui-icon>`:null}
      </wui-input-text>
    `}onInputChange(e){this.inputValue=e.detail||""}clearValue(){const e=this.inputComponentRef.value,n=e==null?void 0:e.inputElementRef.value;n&&(n.value="",this.inputValue="",n.focus(),n.dispatchEvent(new Event("input")))}};Me.styles=[A,si];kt([c()],Me.prototype,"inputValue",void 0);Me=kt([f("wui-search-bar")],Me);const ai=ye`<svg  viewBox="0 0 48 54" fill="none">
  <path
    d="M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z"
  />
</svg>`,li=R`
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 104px;
    width: 104px;
    row-gap: ${({spacing:t})=>t[2]};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: ${({borderRadius:t})=>t[5]};
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--apkt-path-network);
    clip-path: var(--apkt-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: ${({tokens:t})=>t.theme.foregroundSecondary};
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`;var jt=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let qe=class extends w{constructor(){super(...arguments),this.type="wallet"}render(){return l`
      ${this.shimmerTemplate()}
      <wui-shimmer width="80px" height="20px"></wui-shimmer>
    `}shimmerTemplate(){return this.type==="network"?l` <wui-shimmer data-type=${this.type} width="48px" height="54px"></wui-shimmer>
        ${ai}`:l`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}};qe.styles=[A,J,li];jt([c()],qe.prototype,"type",void 0);qe=jt([f("wui-card-select-loader")],qe);const ci=Rt`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`;var B=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let P=class extends w{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--apkt-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--apkt-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--apkt-spacing-${this.gap})`};
      padding-top: ${this.padding&&G.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&G.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&G.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&G.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&G.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&G.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&G.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&G.getSpacingStyles(this.margin,3)};
    `,l`<slot></slot>`}};P.styles=[A,ci];B([c()],P.prototype,"gridTemplateRows",void 0);B([c()],P.prototype,"gridTemplateColumns",void 0);B([c()],P.prototype,"justifyItems",void 0);B([c()],P.prototype,"alignItems",void 0);B([c()],P.prototype,"justifyContent",void 0);B([c()],P.prototype,"alignContent",void 0);B([c()],P.prototype,"columnGap",void 0);B([c()],P.prototype,"rowGap",void 0);B([c()],P.prototype,"gap",void 0);B([c()],P.prototype,"padding",void 0);B([c()],P.prototype,"margin",void 0);P=B([f("wui-grid")],P);const di=R`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: ${({spacing:t})=>t[2]};
    padding: ${({spacing:t})=>t[3]} ${({spacing:t})=>t[0]};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: clamp(0px, ${({borderRadius:t})=>t[4]}, 20px);
    transition:
      color ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-1"]},
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-1"]},
      border-radius ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-1"]};
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: ${({tokens:t})=>t.theme.textPrimary};
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }
  }

  button:disabled > wui-flex > wui-text {
    color: ${({tokens:t})=>t.core.glass010};
  }

  [data-selected='true'] {
    background-color: ${({colors:t})=>t.accent020};
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: ${({colors:t})=>t.accent010};
    }
  }

  [data-selected='true']:active:enabled {
    background-color: ${({colors:t})=>t.accent010};
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`;var Z=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let U=class extends w{constructor(){super(),this.observer=new IntersectionObserver(()=>{}),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.isImpressed=!1,this.explorerId="",this.walletQuery="",this.certified=!1,this.wallet=void 0,this.observer=new IntersectionObserver(e=>{e.forEach(n=>{n.isIntersecting?(this.visible=!0,this.fetchImageSrc(),this.sendImpressionEvent()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){var n,o;const e=((n=this.wallet)==null?void 0:n.badge_type)==="certified";return l`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="1">
          <wui-text
            variant="md-regular"
            color="inherit"
            class=${h(e?"certified":void 0)}
            >${(o=this.wallet)==null?void 0:o.name}</wui-text
          >
          ${e?l`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){var e,n;return!this.visible&&!this.imageSrc||this.imageLoading?this.shimmerTemplate():l`
      <wui-wallet-image
        size="lg"
        imageSrc=${h(this.imageSrc)}
        name=${h((e=this.wallet)==null?void 0:e.name)}
        .installed=${((n=this.wallet)==null?void 0:n.installed)??!1}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `}shimmerTemplate(){return l`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}async fetchImageSrc(){this.wallet&&(this.imageSrc=k.getWalletImage(this.wallet),!this.imageSrc&&(this.imageLoading=!0,this.imageSrc=await k.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}sendImpressionEvent(){!this.wallet||this.isImpressed||(this.isImpressed=!0,S.sendEvent({type:"track",event:"WALLET_IMPRESSION",properties:{name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.explorerId,view:y.state.view,query:this.walletQuery,certified:this.certified}}))}};U.styles=di;Z([d()],U.prototype,"visible",void 0);Z([d()],U.prototype,"imageSrc",void 0);Z([d()],U.prototype,"imageLoading",void 0);Z([d()],U.prototype,"isImpressed",void 0);Z([c()],U.prototype,"explorerId",void 0);Z([c()],U.prototype,"walletQuery",void 0);Z([c()],U.prototype,"certified",void 0);Z([c({type:Object})],U.prototype,"wallet",void 0);U=Z([f("w3m-all-wallets-list-item")],U);const ui=R`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  w3m-all-wallets-list-item {
    opacity: 0;
    animation-duration: ${({durations:t})=>t.xl};
    animation-timing-function: ${({easings:t})=>t["ease-inout-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-loading-spinner {
    padding-top: ${({spacing:t})=>t[4]};
    padding-bottom: ${({spacing:t})=>t[4]};
    justify-content: center;
    grid-column: 1 / span 4;
  }
`;var he=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};const yt="local-paginator";let Y=class extends w{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!$.state.wallets.length,this.wallets=$.state.wallets,this.recommended=$.state.recommended,this.featured=$.state.featured,this.filteredWallets=$.state.filteredWallets,this.unsubscribe.push($.subscribeKey("wallets",e=>this.wallets=e),$.subscribeKey("recommended",e=>this.recommended=e),$.subscribeKey("featured",e=>this.featured=e),$.subscribeKey("filteredWallets",e=>this.filteredWallets=e))}firstUpdated(){this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){var e;this.unsubscribe.forEach(n=>n()),(e=this.paginationObserver)==null||e.disconnect()}render(){return l`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${["0","3","3","3"]}
        gap="2"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){var n;this.loading=!0;const e=(n=this.shadowRoot)==null?void 0:n.querySelector("wui-grid");e&&(await $.fetchWalletsByPage({page:1}),await e.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.loading=!1,e.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}shimmerTemplate(e,n){return[...Array(e)].map(()=>l`
        <wui-card-select-loader type="wallet" id=${h(n)}></wui-card-select-loader>
      `)}getWallets(){var r;const e=[...this.featured,...this.recommended];((r=this.filteredWallets)==null?void 0:r.length)>0?e.push(...this.filteredWallets):e.push(...this.wallets);const n=m.uniqueBy(e,"id"),o=ve.markWalletsAsInstalled(n);return ve.markWalletsWithDisplayIndex(o)}walletsTemplate(){return this.getWallets().map(n=>l`
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${n.id}"
          @click=${()=>this.onConnectWallet(n)}
          .wallet=${n}
          explorerId=${n.id}
          certified=${this.badge==="certified"}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){const{wallets:e,recommended:n,featured:o,count:r,mobileFilteredOutWalletsLength:i}=$.state,s=window.innerWidth<352?3:4,a=e.length+n.length;let O=Math.ceil(a/s)*s-a+s;return O-=e.length?o.length%s:0,r===0&&o.length>0?null:r===0||[...o,...e,...n].length<r-(i??0)?this.shimmerTemplate(O,yt):null}createPaginationObserver(){var n;const e=(n=this.shadowRoot)==null?void 0:n.querySelector(`#${yt}`);e&&(this.paginationObserver=new IntersectionObserver(([o])=>{if(o!=null&&o.isIntersecting&&!this.loading){const{page:r,count:i,wallets:s}=$.state;s.length<i&&$.fetchWalletsByPage({page:r+1})}}),this.paginationObserver.observe(e))}onConnectWallet(e){v.selectWalletConnector(e)}};Y.styles=ui;he([d()],Y.prototype,"loading",void 0);he([d()],Y.prototype,"wallets",void 0);he([d()],Y.prototype,"recommended",void 0);he([d()],Y.prototype,"featured",void 0);he([d()],Y.prototype,"filteredWallets",void 0);he([d()],Y.prototype,"badge",void 0);Y=he([f("w3m-all-wallets-list")],Y);const hi=Rt`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;var Ze=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let we=class extends w{constructor(){super(...arguments),this.prevQuery="",this.prevBadge=void 0,this.loading=!0,this.query=""}render(){return this.onSearch(),this.loading?l`<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await $.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){const{search:e}=$.state,n=ve.markWalletsAsInstalled(e);return e.length?l`
      <wui-grid
        data-testid="wallet-list"
        .padding=${["0","3","3","3"]}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${n.map(o=>l`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(o)}
              .wallet=${o}
              data-testid="wallet-search-item-${o.id}"
              explorerId=${o.id}
              certified=${this.badge==="certified"}
              walletQuery=${this.query}
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:l`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="3"
          flexDirection="column"
        >
          <wui-icon-box size="lg" color="default" icon="wallet"></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="secondary" variant="md-medium">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(e){v.selectWalletConnector(e)}};we.styles=hi;Ze([d()],we.prototype,"loading",void 0);Ze([c()],we.prototype,"query",void 0);Ze([c()],we.prototype,"badge",void 0);we=Ze([f("w3m-all-wallets-search")],we);var ut=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let Ve=class extends w{constructor(){super(...arguments),this.search="",this.badge=void 0,this.onDebouncedSearch=m.debounce(e=>{this.search=e})}render(){const e=this.search.length>=2;return l`
      <wui-flex .padding=${["1","3","3","3"]} gap="2" alignItems="center">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${this.badge==="certified"}
          @certifiedSwitchChange=${this.onCertifiedSwitchChange.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${e||this.badge?l`<w3m-all-wallets-search
            query=${this.search}
            .badge=${this.badge}
          ></w3m-all-wallets-search>`:l`<w3m-all-wallets-list .badge=${this.badge}></w3m-all-wallets-list>`}
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}onCertifiedSwitchChange(e){e.detail?(this.badge="certified",xe.showSvg("Only WalletConnect certified",{icon:"walletConnectBrown",iconColor:"accent-100"})):this.badge=void 0}qrButtonTemplate(){return m.isMobile()?l`
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){y.push("ConnectingWalletConnect")}};ut([d()],Ve.prototype,"search",void 0);ut([d()],Ve.prototype,"badge",void 0);Ve=ut([f("w3m-all-wallets-view")],Ve);const pi=R`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:t})=>t[3]};
    width: 100%;
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    border-radius: ${({borderRadius:t})=>t[4]};
    transition:
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      scale ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color, scale;
  }

  wui-text {
    text-transform: capitalize;
  }

  wui-image {
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var K=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let D=class extends w{constructor(){super(...arguments),this.imageSrc="google",this.loading=!1,this.disabled=!1,this.rightIcon=!0,this.rounded=!1,this.fullSize=!1}render(){return this.dataset.rounded=this.rounded?"true":"false",l`
      <button
        ?disabled=${this.loading?!0:!!this.disabled}
        data-loading=${this.loading}
        tabindex=${h(this.tabIdx)}
      >
        <wui-flex gap="2" alignItems="center">
          ${this.templateLeftIcon()}
          <wui-flex gap="1">
            <slot></slot>
          </wui-flex>
        </wui-flex>
        ${this.templateRightIcon()}
      </button>
    `}templateLeftIcon(){return this.icon?l`<wui-image
        icon=${this.icon}
        iconColor=${h(this.iconColor)}
        ?boxed=${!0}
        ?rounded=${this.rounded}
      ></wui-image>`:l`<wui-image
      ?boxed=${!0}
      ?rounded=${this.rounded}
      ?fullSize=${this.fullSize}
      src=${this.imageSrc}
    ></wui-image>`}templateRightIcon(){return this.rightIcon?this.loading?l`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:l`<wui-icon name="chevronRight" size="lg" color="default"></wui-icon>`:null}};D.styles=[A,J,pi];K([c()],D.prototype,"imageSrc",void 0);K([c()],D.prototype,"icon",void 0);K([c()],D.prototype,"iconColor",void 0);K([c({type:Boolean})],D.prototype,"loading",void 0);K([c()],D.prototype,"tabIdx",void 0);K([c({type:Boolean})],D.prototype,"disabled",void 0);K([c({type:Boolean})],D.prototype,"rightIcon",void 0);K([c({type:Boolean})],D.prototype,"rounded",void 0);K([c({type:Boolean})],D.prototype,"fullSize",void 0);D=K([f("wui-list-item")],D);var fi=function(t,e,n,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(r<3?s(i):r>3?s(e,n,i):s(e,n))||i);return r>3&&i&&Object.defineProperty(e,n,i),i};let $t=class extends w{constructor(){var e;super(...arguments),this.wallet=(e=y.state.data)==null?void 0:e.wallet}render(){if(!this.wallet)throw new Error("w3m-downloads-view");return l`
      <wui-flex gap="2" flexDirection="column" .padding=${["3","3","4","3"]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){var e;return(e=this.wallet)!=null&&e.chrome_store?l`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){var e;return(e=this.wallet)!=null&&e.app_store?l`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){var e;return(e=this.wallet)!=null&&e.play_store?l`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){var e;return(e=this.wallet)!=null&&e.homepage?l`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="md-medium" color="primary">Website</wui-text>
      </wui-list-item>
    `:null}onChromeStore(){var e;(e=this.wallet)!=null&&e.chrome_store&&m.openHref(this.wallet.chrome_store,"_blank")}onAppStore(){var e;(e=this.wallet)!=null&&e.app_store&&m.openHref(this.wallet.app_store,"_blank")}onPlayStore(){var e;(e=this.wallet)!=null&&e.play_store&&m.openHref(this.wallet.play_store,"_blank")}onHomePage(){var e;(e=this.wallet)!=null&&e.homepage&&m.openHref(this.wallet.homepage,"_blank")}};$t=fi([f("w3m-downloads-view")],$t);export{Ve as W3mAllWalletsView,Be as W3mConnectingWcBasicView,$t as W3mDownloadsView};
//# sourceMappingURL=basic-BoLhIfZN.js.map
