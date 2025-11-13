import{dh as v,eI as P,bi as g,eU as T,eC as b,ey as w,bf as be,di as l,ez as O,ew as f,eN as W,eS as Ve,fa as re,eR as te,fb as ct,eO as z,eP as ie,eV as Re,ex as ye,eL as Ye,fc as Je,fd as Ze,eG as et,av as ge,bb as ee,fe as dt,ff as ut,dg as tt,fg as ze}from"./index-CRHdVoNQ.js";import{n as c,r as d,o as C}from"./class-map-BLSfXoSG.js";import{c as y,U as X}from"./index-STuXhlkI.js";import{b as ht,e as De,n as Ne}from"./ref-C3u848rL.js";import"./vendor-_HhPRkxb.js";import"./cross-DhhtLpDI.js";import"./dijkstra-D_NXgYpA.js";import"./async-directive-CHD3GnHu.js";var me=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let se=class extends v{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=P.state.connectors,this.count=g.state.count,this.filteredCount=g.state.filteredWallets.length,this.isFetchingRecommendedWallets=g.state.isFetchingRecommendedWallets,this.unsubscribe.push(P.subscribeKey("connectors",e=>this.connectors=e),g.subscribeKey("count",e=>this.count=e),g.subscribeKey("filteredWallets",e=>this.filteredCount=e.length),g.subscribeKey("isFetchingRecommendedWallets",e=>this.isFetchingRecommendedWallets=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=this.connectors.find(m=>m.id==="walletConnect"),{allWallets:i}=T.state;if(!e||i==="HIDE"||i==="ONLY_MOBILE"&&!b.isMobile())return null;const o=g.state.featured.length,r=this.count+o,n=r<10?r:Math.floor(r/10)*10,s=this.filteredCount>0?this.filteredCount:n;let a=`${s}`;this.filteredCount>0?a=`${this.filteredCount}`:s<r&&(a=`${s}+`);const u=w.hasAnyConnection(be.CONNECTOR_ID.WALLET_CONNECT);return l`
      <wui-list-wallet
        name="Search Wallet"
        walletIcon="search"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${a}
        tagVariant="info"
        data-testid="all-wallets"
        tabIdx=${C(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        ?disabled=${u}
        size="sm"
      ></wui-list-wallet>
    `}onAllWallets(){var e;O.sendEvent({type:"track",event:"CLICK_ALL_WALLETS"}),f.push("AllWallets",{redirectView:(e=f.state.data)==null?void 0:e.redirectView})}};me([c()],se.prototype,"tabIdx",void 0);me([d()],se.prototype,"connectors",void 0);me([d()],se.prototype,"count",void 0);me([d()],se.prototype,"filteredCount",void 0);me([d()],se.prototype,"isFetchingRecommendedWallets",void 0);se=me([y("w3m-all-wallets-widget")],se);const pt=W`
  :host {
    margin-top: ${({spacing:t})=>t[1]};
  }
  wui-separator {
    margin: ${({spacing:t})=>t[3]} calc(${({spacing:t})=>t[3]} * -1)
      ${({spacing:t})=>t[2]} calc(${({spacing:t})=>t[3]} * -1);
    width: calc(100% + ${({spacing:t})=>t[3]} * 2);
  }
`;var J=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let U=class extends v{constructor(){super(),this.unsubscribe=[],this.connectors=P.state.connectors,this.recommended=g.state.recommended,this.featured=g.state.featured,this.explorerWallets=g.state.explorerWallets,this.connections=w.state.connections,this.connectorImages=Ve.state.connectorImages,this.loadingTelegram=!1,this.unsubscribe.push(P.subscribeKey("connectors",e=>this.connectors=e),w.subscribeKey("connections",e=>this.connections=e),Ve.subscribeKey("connectorImages",e=>this.connectorImages=e),g.subscribeKey("recommended",e=>this.recommended=e),g.subscribeKey("featured",e=>this.featured=e),g.subscribeKey("explorerFilteredWallets",e=>{this.explorerWallets=e!=null&&e.length?e:g.state.explorerWallets}),g.subscribeKey("explorerWallets",e=>{var i;(i=this.explorerWallets)!=null&&i.length||(this.explorerWallets=e)})),b.isTelegram()&&b.isIos()&&(this.loadingTelegram=!w.state.wcUri,this.unsubscribe.push(w.subscribeKey("wcUri",e=>this.loadingTelegram=!e)))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return l`
      <wui-flex flexDirection="column" gap="2"> ${this.connectorListTemplate()} </wui-flex>
    `}mapConnectorsToExplorerWallets(e,i){return e.map(o=>{if(o.type==="MULTI_CHAIN"&&o.connectors){const n=o.connectors.map(m=>m.id),s=o.connectors.map(m=>m.name),a=o.connectors.map(m=>{var E;return(E=m.info)==null?void 0:E.rdns}),u=i==null?void 0:i.find(m=>n.includes(m.id)||s.includes(m.name)||m.rdns&&(a.includes(m.rdns)||n.includes(m.rdns)));return o.explorerWallet=u??o.explorerWallet,o}const r=i==null?void 0:i.find(n=>{var s;return n.id===o.id||n.rdns===((s=o.info)==null?void 0:s.rdns)||n.name===o.name});return o.explorerWallet=r??o.explorerWallet,o})}processConnectorsByType(e,i=!0){const o=re.sortConnectorsByExplorerWallet([...e]);return i?o.filter(re.showConnector):o}connectorListTemplate(){const e=this.mapConnectorsToExplorerWallets(this.connectors,this.explorerWallets??[]),i=re.getConnectorsByType(e,this.recommended,this.featured),o=this.processConnectorsByType(i.announced.filter(p=>p.id!=="walletConnect")),r=this.processConnectorsByType(i.injected),n=this.processConnectorsByType(i.multiChain.filter(p=>p.name!=="WalletConnect"),!1),s=i.custom,a=i.recent,u=this.processConnectorsByType(i.external.filter(p=>p.id!==be.CONNECTOR_ID.COINBASE_SDK&&p.id!==be.CONNECTOR_ID.BASE_ACCOUNT)),m=i.recommended,E=i.featured,G=re.getConnectorTypeOrder({custom:s,recent:a,announced:o,injected:r,multiChain:n,recommended:m,featured:E,external:u}),N=this.connectors.find(p=>p.id==="walletConnect"),Z=b.isMobile(),_=[];for(const p of G)switch(p){case"walletConnect":{!Z&&N&&_.push({kind:"connector",subtype:"walletConnect",connector:N});break}case"recent":{re.getFilteredRecentWallets().forEach(x=>_.push({kind:"wallet",subtype:"recent",wallet:x}));break}case"injected":{n.forEach(h=>_.push({kind:"connector",subtype:"multiChain",connector:h})),o.forEach(h=>_.push({kind:"connector",subtype:"announced",connector:h})),r.forEach(h=>_.push({kind:"connector",subtype:"injected",connector:h}));break}case"featured":{E.forEach(h=>_.push({kind:"wallet",subtype:"featured",wallet:h}));break}case"custom":{re.getFilteredCustomWallets(s??[]).forEach(x=>_.push({kind:"wallet",subtype:"custom",wallet:x}));break}case"external":{u.forEach(h=>_.push({kind:"connector",subtype:"external",connector:h}));break}case"recommended":{re.getCappedRecommendedWallets(m).forEach(x=>_.push({kind:"wallet",subtype:"recommended",wallet:x}));break}default:console.warn(`Unknown connector type: ${p}`)}return _.map((p,h)=>p.kind==="connector"?this.renderConnector(p,h):this.renderWallet(p,h))}getConnectorNamespaces(e){var i;return e.subtype==="walletConnect"?[]:e.subtype==="multiChain"?((i=e.connector.connectors)==null?void 0:i.map(o=>o.chain))||[]:[e.connector.chain]}renderConnector(e,i){var G,N;const o=e.connector,r=te.getConnectorImage(o)||this.connectorImages[(o==null?void 0:o.imageId)??""],s=(this.connections.get(o.chain)??[]).some(Z=>ct.isLowerCaseMatch(Z.connectorId,o.id));let a,u;e.subtype==="walletConnect"?(a="qr code",u="accent"):e.subtype==="injected"||e.subtype==="announced"?(a=s?"connected":"installed",u=s?"info":"success"):(a=void 0,u=void 0);const m=w.hasAnyConnection(be.CONNECTOR_ID.WALLET_CONNECT),E=e.subtype==="walletConnect"||e.subtype==="external"?m:!1;return l`
      <w3m-list-wallet
        displayIndex=${i}
        imageSrc=${C(r)}
        .installed=${!0}
        name=${o.name??"Unknown"}
        .tagVariant=${u}
        tagLabel=${C(a)}
        data-testid=${`wallet-selector-${o.id.toLowerCase()}`}
        size="sm"
        @click=${()=>this.onClickConnector(e)}
        tabIdx=${C(this.tabIdx)}
        ?disabled=${E}
        rdnsId=${C(((G=o.explorerWallet)==null?void 0:G.rdns)||void 0)}
        walletRank=${C((N=o.explorerWallet)==null?void 0:N.order)}
        .namespaces=${this.getConnectorNamespaces(e)}
      >
      </w3m-list-wallet>
    `}onClickConnector(e){var o;const i=(o=f.state.data)==null?void 0:o.redirectView;if(e.subtype==="walletConnect"){P.setActiveConnector(e.connector),b.isMobile()?f.push("AllWallets"):f.push("ConnectingWalletConnect",{redirectView:i});return}if(e.subtype==="multiChain"){P.setActiveConnector(e.connector),f.push("ConnectingMultiChain",{redirectView:i});return}if(e.subtype==="injected"){P.setActiveConnector(e.connector),f.push("ConnectingExternal",{connector:e.connector,redirectView:i,wallet:e.connector.explorerWallet});return}if(e.subtype==="announced"){if(e.connector.id==="walletConnect"){b.isMobile()?f.push("AllWallets"):f.push("ConnectingWalletConnect",{redirectView:i});return}f.push("ConnectingExternal",{connector:e.connector,redirectView:i,wallet:e.connector.explorerWallet});return}f.push("ConnectingExternal",{connector:e.connector,redirectView:i})}renderWallet(e,i){const o=e.wallet,r=te.getWalletImage(o),s=w.hasAnyConnection(be.CONNECTOR_ID.WALLET_CONNECT),a=this.loadingTelegram,u=e.subtype==="recent"?"recent":void 0,m=e.subtype==="recent"?"info":void 0;return l`
      <w3m-list-wallet
        displayIndex=${i}
        imageSrc=${C(r)}
        name=${o.name??"Unknown"}
        @click=${()=>this.onClickWallet(e)}
        size="sm"
        data-testid=${`wallet-selector-${o.id}`}
        tabIdx=${C(this.tabIdx)}
        ?loading=${a}
        ?disabled=${s}
        rdnsId=${C(o.rdns||void 0)}
        walletRank=${C(o.order)}
        tagLabel=${C(u)}
        .tagVariant=${m}
      >
      </w3m-list-wallet>
    `}onClickWallet(e){var r;const i=(r=f.state.data)==null?void 0:r.redirectView;if(e.subtype==="featured"){P.selectWalletConnector(e.wallet);return}if(e.subtype==="recent"){if(this.loadingTelegram)return;P.selectWalletConnector(e.wallet);return}if(e.subtype==="custom"){if(this.loadingTelegram)return;f.push("ConnectingWalletConnect",{wallet:e.wallet,redirectView:i});return}if(this.loadingTelegram)return;const o=P.getConnector({id:e.wallet.id,rdns:e.wallet.rdns});o?f.push("ConnectingExternal",{connector:o,redirectView:i}):f.push("ConnectingWalletConnect",{wallet:e.wallet,redirectView:i})}};U.styles=pt;J([c({type:Number})],U.prototype,"tabIdx",void 0);J([d()],U.prototype,"connectors",void 0);J([d()],U.prototype,"recommended",void 0);J([d()],U.prototype,"featured",void 0);J([d()],U.prototype,"explorerWallets",void 0);J([d()],U.prototype,"connections",void 0);J([d()],U.prototype,"connectorImages",void 0);J([d()],U.prototype,"loadingTelegram",void 0);U=J([y("w3m-connector-list")],U);const ft=W`
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
`;var $e=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};const mt={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},wt={lg:"md",md:"sm",sm:"sm"};let ae=class extends v{constructor(){super(...arguments),this.icon="mobile",this.size="md",this.label="",this.active=!1}render(){return l`
      <button data-active=${this.active}>
        ${this.icon?l`<wui-icon size=${wt[this.size]} name=${this.icon}></wui-icon>`:""}
        <wui-text variant=${mt[this.size]}> ${this.label} </wui-text>
      </button>
    `}};ae.styles=[z,ie,ft];$e([c()],ae.prototype,"icon",void 0);$e([c()],ae.prototype,"size",void 0);$e([c()],ae.prototype,"label",void 0);$e([c({type:Boolean})],ae.prototype,"active",void 0);ae=$e([y("wui-tab-item")],ae);const bt=W`
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
`;var ve=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let le=class extends v{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.size="md",this.activeTab=0}render(){return this.dataset.size=this.size,this.tabs.map((e,i)=>{var r;const o=i===this.activeTab;return l`
        <wui-tab-item
          @click=${()=>this.onTabClick(i)}
          icon=${e.icon}
          size=${this.size}
          label=${e.label}
          ?active=${o}
          data-active=${o}
          data-testid="tab-${(r=e.label)==null?void 0:r.toLowerCase()}"
        ></wui-tab-item>
      `})}onTabClick(e){this.activeTab=e,this.onTabChange(e)}};le.styles=[z,ie,bt];ve([c({type:Array})],le.prototype,"tabs",void 0);ve([c()],le.prototype,"onTabChange",void 0);ve([c()],le.prototype,"size",void 0);ve([d()],le.prototype,"activeTab",void 0);le=ve([y("wui-tabs")],le);var Ue=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let We=class extends v{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=this.generateTabs();return l`
      <wui-flex justifyContent="center" .padding=${["0","0","4","0"]}>
        <wui-tabs .tabs=${e} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){const e=this.platforms.map(i=>i==="browser"?{label:"Browser",icon:"extension",platform:"browser"}:i==="mobile"?{label:"Mobile",icon:"mobile",platform:"mobile"}:i==="qrcode"?{label:"Mobile",icon:"mobile",platform:"qrcode"}:i==="web"?{label:"Webapp",icon:"browser",platform:"web"}:i==="desktop"?{label:"Desktop",icon:"desktop",platform:"desktop"}:{label:"Browser",icon:"extension",platform:"unsupported"});return this.platformTabs=e.map(({platform:i})=>i),e}onTabChange(e){var o;const i=this.platformTabs[e];i&&((o=this.onSelectPlatfrom)==null||o.call(this,i))}};Ue([c({type:Array})],We.prototype,"platforms",void 0);Ue([c()],We.prototype,"onSelectPlatfrom",void 0);We=Ue([y("w3m-connecting-header")],We);const gt=W`
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
`;var it=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let _e=class extends v{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){const e=this.radius>50?50:this.radius,o=36-e,r=116+o,n=245+o,s=360+o*1.75;return l`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${e}
          stroke-dasharray="${r} ${n}"
          stroke-dashoffset=${s}
        />
      </svg>
    `}};_e.styles=[z,gt];it([c({type:Number})],_e.prototype,"radius",void 0);_e=it([y("wui-loading-thumbnail")],_e);const yt=W`
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
`;var Pe=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let pe=class extends v{constructor(){super(...arguments),this.disabled=!1,this.label="",this.buttonLabel=""}render(){return l`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="inherit">${this.label}</wui-text>
        <wui-button variant="accent-secondary" size="sm">
          ${this.buttonLabel}
          <wui-icon name="chevronRight" color="inherit" size="inherit" slot="iconRight"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};pe.styles=[z,ie,yt];Pe([c({type:Boolean})],pe.prototype,"disabled",void 0);Pe([c()],pe.prototype,"label",void 0);Pe([c()],pe.prototype,"buttonLabel",void 0);pe=Pe([y("wui-cta-button")],pe);const $t=W`
  :host {
    display: block;
    padding: 0 ${({spacing:t})=>t[5]} ${({spacing:t})=>t[5]};
  }
`;var nt=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Ee=class extends v{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display="none",null;const{name:e,app_store:i,play_store:o,chrome_store:r,homepage:n}=this.wallet,s=b.isMobile(),a=b.isIos(),u=b.isAndroid(),m=[i,o,n,r].filter(Boolean).length>1,E=X.getTruncateString({string:e,charsStart:12,charsEnd:0,truncate:"end"});return m&&!s?l`
        <wui-cta-button
          label=${`Don't have ${E}?`}
          buttonLabel="Get"
          @click=${()=>f.push("Downloads",{wallet:this.wallet})}
        ></wui-cta-button>
      `:!m&&n?l`
        <wui-cta-button
          label=${`Don't have ${E}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:i&&a?l`
        <wui-cta-button
          label=${`Don't have ${E}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:o&&u?l`
        <wui-cta-button
          label=${`Don't have ${E}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display="none",null)}onAppStore(){var e;(e=this.wallet)!=null&&e.app_store&&b.openHref(this.wallet.app_store,"_blank")}onPlayStore(){var e;(e=this.wallet)!=null&&e.play_store&&b.openHref(this.wallet.play_store,"_blank")}onHomePage(){var e;(e=this.wallet)!=null&&e.homepage&&b.openHref(this.wallet.homepage,"_blank")}};Ee.styles=[$t];nt([c({type:Object})],Ee.prototype,"wallet",void 0);Ee=nt([y("w3m-mobile-download-links")],Ee);const vt=W`
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
`;var q=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};class k extends v{constructor(){var e,i,o,r,n;super(),this.wallet=(e=f.state.data)==null?void 0:e.wallet,this.connector=(i=f.state.data)==null?void 0:i.connector,this.timeout=void 0,this.secondaryBtnIcon="refresh",this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=te.getConnectorImage(this.connector)??te.getWalletImage(this.wallet),this.name=((o=this.wallet)==null?void 0:o.name)??((r=this.connector)==null?void 0:r.name)??"Wallet",this.isRetrying=!1,this.uri=w.state.wcUri,this.error=w.state.wcError,this.ready=!1,this.showRetry=!1,this.label=void 0,this.secondaryBtnLabel="Try again",this.secondaryLabel="Accept connection request in the wallet",this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(w.subscribeKey("wcUri",s=>{var a;this.uri=s,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,(a=this.onConnect)==null||a.call(this))}),w.subscribeKey("wcError",s=>this.error=s)),(b.isTelegram()||b.isSafari())&&b.isIos()&&w.state.wcUri&&((n=this.onConnect)==null||n.call(this))}firstUpdated(){var e;(e=this.onAutoConnect)==null||e.call(this),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),w.setWcError(!1),clearTimeout(this.timeout)}render(){var o;(o=this.onRender)==null||o.call(this),this.onShowRetry();const e=this.error?"Connection can be declined if a previous request is still active":this.secondaryLabel;let i="";return this.label?i=this.label:(i=`Continue in ${this.name}`,this.error&&(i="Connection declined")),l`
      <wui-flex
        data-error=${C(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="6"
      >
        <wui-flex gap="2" justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${C(this.imageSrc)}></wui-wallet-image>

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
            ${i}
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
    `}onShowRetry(){var e;if(this.error&&!this.showRetry){this.showRetry=!0;const i=(e=this.shadowRoot)==null?void 0:e.querySelector("wui-button");i==null||i.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"})}}onTryAgain(){var e,i;w.setWcError(!1),this.onRetry?(this.isRetrying=!0,(e=this.onRetry)==null||e.call(this)):(i=this.onConnect)==null||i.call(this)}loaderTemplate(){const e=Re.state.themeVariables["--w3m-border-radius-master"],i=e?parseInt(e.replace("px",""),10):4;return l`<wui-loading-thumbnail radius=${i*9}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(b.copyToClopboard(this.uri),ye.showSuccess("Link copied"))}catch{ye.showError("Failed to copy")}}}k.styles=vt;q([d()],k.prototype,"isRetrying",void 0);q([d()],k.prototype,"uri",void 0);q([d()],k.prototype,"error",void 0);q([d()],k.prototype,"ready",void 0);q([d()],k.prototype,"showRetry",void 0);q([d()],k.prototype,"label",void 0);q([d()],k.prototype,"secondaryBtnLabel",void 0);q([d()],k.prototype,"secondaryLabel",void 0);q([d()],k.prototype,"isLoading",void 0);q([c({type:Boolean})],k.prototype,"isMobile",void 0);q([c()],k.prototype,"onRetry",void 0);var xt=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Fe=class extends k{constructor(){var e;if(super(),!this.wallet)throw new Error("w3m-connecting-wc-browser: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),O.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:(e=this.wallet)==null?void 0:e.display_index,walletRank:this.wallet.order,view:f.state.view}})}async onConnectProxy(){var e,i;try{this.error=!1;const{connectors:o}=P.state,r=o.find(n=>{var s,a,u;return n.type==="ANNOUNCED"&&((s=n.info)==null?void 0:s.rdns)===((a=this.wallet)==null?void 0:a.rdns)||n.type==="INJECTED"||n.name===((u=this.wallet)==null?void 0:u.name)});if(r)await w.connectExternal(r,r.chain);else throw new Error("w3m-connecting-wc-browser: No connector found");Ye.close(),O.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:"browser",name:((e=this.wallet)==null?void 0:e.name)||"Unknown",view:f.state.view,walletRank:(i=this.wallet)==null?void 0:i.order}})}catch(o){o instanceof Je&&o.originalName===Ze.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?O.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:o.message}}):O.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:(o==null?void 0:o.message)??"Unknown"}}),this.error=!0}}};Fe=xt([y("w3m-connecting-wc-browser")],Fe);var Ct=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Ke=class extends k{constructor(){var e;if(super(),!this.wallet)throw new Error("w3m-connecting-wc-desktop: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),O.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"desktop",displayIndex:(e=this.wallet)==null?void 0:e.display_index,walletRank:this.wallet.order,view:f.state.view}})}onRenderProxy(){var e;!this.ready&&this.uri&&(this.ready=!0,(e=this.onConnect)==null||e.call(this))}onConnectProxy(){var e;if((e=this.wallet)!=null&&e.desktop_link&&this.uri)try{this.error=!1;const{desktop_link:i,name:o}=this.wallet,{redirect:r,href:n}=b.formatNativeUrl(i,this.uri);w.setWcLinking({name:o,href:n}),w.setRecentWallet(this.wallet),b.openHref(r,"_blank")}catch{this.error=!0}}};Ke=Ct([y("w3m-connecting-wc-desktop")],Ke);var we=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let ce=class extends k{constructor(){var e;if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=T.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{var i;if((i=this.wallet)!=null&&i.mobile_link&&this.uri)try{this.error=!1;const{mobile_link:o,link_mode:r,name:n}=this.wallet,{redirect:s,redirectUniversalLink:a,href:u}=b.formatNativeUrl(o,this.uri,r);this.redirectDeeplink=s,this.redirectUniversalLink=a,this.target=b.isIframe()?"_top":"_self",w.setWcLinking({name:n,href:u}),w.setRecentWallet(this.wallet),this.preferUniversalLinks&&this.redirectUniversalLink?b.openHref(this.redirectUniversalLink,this.target):b.openHref(this.redirectDeeplink,this.target)}catch(o){O.sendEvent({type:"track",event:"CONNECT_PROXY_ERROR",properties:{message:o instanceof Error?o.message:"Error parsing the deeplink",uri:this.uri,mobile_link:this.wallet.mobile_link,name:this.wallet.name}}),this.error=!0}},!this.wallet)throw new Error("w3m-connecting-wc-mobile: No wallet provided");this.secondaryBtnLabel="Open",this.secondaryLabel=et.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.onHandleURI(),this.unsubscribe.push(w.subscribeKey("wcUri",()=>{this.onHandleURI()})),O.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"mobile",displayIndex:(e=this.wallet)==null?void 0:e.display_index,walletRank:this.wallet.order,view:f.state.view}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){var e;this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,(e=this.onConnect)==null||e.call(this))}onTryAgain(){var e;w.setWcError(!1),(e=this.onConnect)==null||e.call(this)}};we([d()],ce.prototype,"redirectDeeplink",void 0);we([d()],ce.prototype,"redirectUniversalLink",void 0);we([d()],ce.prototype,"target",void 0);we([d()],ce.prototype,"preferUniversalLinks",void 0);we([d()],ce.prototype,"isLoading",void 0);ce=we([y("w3m-connecting-wc-mobile")],ce);const Rt=.1,He=2.5,Q=7;function Ae(t,e,i){return t===e?!1:(t-e<0?e-t:t-e)<=i+Rt}function Wt(t,e){const i=Array.prototype.slice.call(ht.create(t,{errorCorrectionLevel:e}).modules.data,0),o=Math.sqrt(i.length);return i.reduce((r,n,s)=>(s%o===0?r.push([n]):r[r.length-1].push(n))&&r,[])}const _t={generate({uri:t,size:e,logoSize:i,padding:o=8,dotColor:r="var(--apkt-colors-black)"}){const s=[],a=Wt(t,"Q"),u=(e-2*o)/a.length,m=[{x:0,y:0},{x:1,y:0},{x:0,y:1}];m.forEach(({x:p,y:h})=>{const x=(a.length-Q)*u*p+o,$=(a.length-Q)*u*h+o,S=.45;for(let R=0;R<m.length;R+=1){const M=u*(Q-R*2);s.push(ge`
            <rect
              fill=${R===2?"var(--apkt-colors-black)":"var(--apkt-colors-white)"}
              width=${R===0?M-10:M}
              rx= ${R===0?(M-10)*S:M*S}
              ry= ${R===0?(M-10)*S:M*S}
              stroke=${r}
              stroke-width=${R===0?10:0}
              height=${R===0?M-10:M}
              x= ${R===0?$+u*R+10/2:$+u*R}
              y= ${R===0?x+u*R+10/2:x+u*R}
            />
          `)}});const E=Math.floor((i+25)/u),G=a.length/2-E/2,N=a.length/2+E/2-1,Z=[];a.forEach((p,h)=>{p.forEach((x,$)=>{if(a[h][$]&&!(h<Q&&$<Q||h>a.length-(Q+1)&&$<Q||h<Q&&$>a.length-(Q+1))&&!(h>G&&h<N&&$>G&&$<N)){const S=h*u+u/2+o,R=$*u+u/2+o;Z.push([S,R])}})});const _={};return Z.forEach(([p,h])=>{var x;_[p]?(x=_[p])==null||x.push(h):_[p]=[h]}),Object.entries(_).map(([p,h])=>{const x=h.filter($=>h.every(S=>!Ae($,S,u)));return[Number(p),x]}).forEach(([p,h])=>{h.forEach(x=>{s.push(ge`<circle cx=${p} cy=${x} fill=${r} r=${u/He} />`)})}),Object.entries(_).filter(([p,h])=>h.length>1).map(([p,h])=>{const x=h.filter($=>h.some(S=>Ae($,S,u)));return[Number(p),x]}).map(([p,h])=>{h.sort(($,S)=>$<S?-1:1);const x=[];for(const $ of h){const S=x.find(R=>R.some(M=>Ae($,M,u)));S?S.push($):x.push([$])}return[p,x.map($=>[$[0],$[$.length-1]])]}).forEach(([p,h])=>{h.forEach(([x,$])=>{s.push(ge`
              <line
                x1=${p}
                x2=${p}
                y1=${x}
                y2=${$}
                stroke=${r}
                stroke-width=${u/(He/2)}
                stroke-linecap="round"
              />
            `)})}),s}},Et=W`
  :host {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    width: 100%;
    height: 100%;
    background-color: ${({colors:t})=>t.white};
    border: 1px solid ${({tokens:t})=>t.theme.borderPrimary};
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
`;var ne=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let V=class extends v{constructor(){super(...arguments),this.uri="",this.size=500,this.theme="dark",this.imageSrc=void 0,this.alt=void 0,this.arenaClear=void 0,this.farcaster=void 0}render(){return this.dataset.theme=this.theme,this.dataset.clear=String(this.arenaClear),l`<wui-flex
      alignItems="center"
      justifyContent="center"
      class="wui-qr-code"
      direction="column"
      gap="4"
      width="100%"
      style="height: 100%"
    >
      ${this.templateVisual()} ${this.templateSvg()}
    </wui-flex>`}templateSvg(){return ge`
      <svg viewBox="0 0 ${this.size} ${this.size}" width="100%" height="100%">
        ${_t.generate({uri:this.uri,size:this.size,logoSize:this.arenaClear?0:this.size/4})}
      </svg>
    `}templateVisual(){return this.imageSrc?l`<wui-image src=${this.imageSrc} alt=${this.alt??"logo"}></wui-image>`:this.farcaster?l`<wui-icon
        class="farcaster"
        size="inherit"
        color="inherit"
        name="farcaster"
      ></wui-icon>`:l`<wui-icon size="inherit" color="inherit" name="walletConnect"></wui-icon>`}};V.styles=[z,Et];ne([c()],V.prototype,"uri",void 0);ne([c({type:Number})],V.prototype,"size",void 0);ne([c()],V.prototype,"theme",void 0);ne([c()],V.prototype,"imageSrc",void 0);ne([c()],V.prototype,"alt",void 0);ne([c({type:Boolean})],V.prototype,"arenaClear",void 0);ne([c({type:Boolean})],V.prototype,"farcaster",void 0);V=ne([y("wui-qr-code")],V);const kt=W`
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
`;var xe=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let de=class extends v{constructor(){super(...arguments),this.width="",this.height="",this.variant="default",this.rounded=!1}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
    `,this.dataset.rounded=this.rounded?"true":"false",l`<slot></slot>`}};de.styles=[kt];xe([c()],de.prototype,"width",void 0);xe([c()],de.prototype,"height",void 0);xe([c()],de.prototype,"variant",void 0);xe([c({type:Boolean})],de.prototype,"rounded",void 0);de=xe([y("wui-shimmer")],de);const St=W`
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
`;var ot=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let ke=class extends k{constructor(){super(),this.basic=!1}firstUpdated(){var e,i,o;this.basic||O.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:((e=this.wallet)==null?void 0:e.name)??"WalletConnect",platform:"qrcode",displayIndex:(i=this.wallet)==null?void 0:i.display_index,walletRank:(o=this.wallet)==null?void 0:o.order,view:f.state.view}})}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this.unsubscribe)==null||e.forEach(i=>i())}render(){return this.onRenderProxy(),l`
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
    `}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0)}qrCodeTemplate(){if(!this.uri||!this.ready)return null;const e=this.wallet?this.wallet.name:void 0;w.setWcLinking(void 0),w.setRecentWallet(this.wallet);const i=Re.state.themeVariables["--apkt-qr-color"]??Re.state.themeVariables["--w3m-qr-color"];return l` <wui-qr-code
      theme=${Re.state.themeMode}
      uri=${this.uri}
      imageSrc=${C(te.getWalletImage(this.wallet))}
      color=${C(i)}
      alt=${C(e)}
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
    </wui-button>`}};ke.styles=St;ot([c({type:Boolean})],ke.prototype,"basic",void 0);ke=ot([y("w3m-connecting-wc-qrcode")],ke);var Tt=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Ge=class extends v{constructor(){var e,i,o;if(super(),this.wallet=(e=f.state.data)==null?void 0:e.wallet,!this.wallet)throw new Error("w3m-connecting-wc-unsupported: No wallet provided");O.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:(i=this.wallet)==null?void 0:i.display_index,walletRank:(o=this.wallet)==null?void 0:o.order,view:f.state.view}})}render(){return l`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="5"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${C(te.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="md-regular" color="primary">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};Ge=Tt([y("w3m-connecting-wc-unsupported")],Ge);var rt=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Be=class extends k{constructor(){var e,i;if(super(),this.isLoading=!0,!this.wallet)throw new Error("w3m-connecting-wc-web: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel="Open",this.secondaryLabel=et.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.updateLoadingState(),this.unsubscribe.push(w.subscribeKey("wcUri",()=>{this.updateLoadingState()})),O.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"web",displayIndex:(e=this.wallet)==null?void 0:e.display_index,walletRank:(i=this.wallet)==null?void 0:i.order,view:f.state.view}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){var e;if((e=this.wallet)!=null&&e.webapp_link&&this.uri)try{this.error=!1;const{webapp_link:i,name:o}=this.wallet,{redirect:r,href:n}=b.formatUniversalUrl(i,this.uri);w.setWcLinking({name:o,href:n}),w.setRecentWallet(this.wallet),b.openHref(r,"_blank")}catch{this.error=!0}}};rt([d()],Be.prototype,"isLoading",void 0);Be=rt([y("w3m-connecting-wc-web")],Be);const Ot=W`
  :host([data-mobile-fullscreen='true']) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :host([data-mobile-fullscreen='true']) wui-ux-by-reown {
    margin-top: auto;
  }
`;var he=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Y=class extends v{constructor(){var e;super(),this.wallet=(e=f.state.data)==null?void 0:e.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!T.state.siwx,this.remoteFeatures=T.state.remoteFeatures,this.displayBranding=!0,this.basic=!1,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(T.subscribeKey("remoteFeatures",i=>this.remoteFeatures=i))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return T.state.enableMobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),l`
      ${this.headerTemplate()}
      <div class="platform-container">${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){var e;return!((e=this.remoteFeatures)!=null&&e.reownBranding)||!this.displayBranding?null:l`<wui-ux-by-reown></wui-ux-by-reown>`}async initializeConnection(e=!1){var i,o;if(!(this.platform==="browser"||T.state.manualWCControl&&!e))try{const{wcPairingExpiry:r,status:n}=w.state,{redirectView:s}=f.state.data??{};if(e||T.state.enableEmbedded||b.isPairingExpired(r)||n==="connecting"){const a=w.getConnections(ee.state.activeChain),u=(i=this.remoteFeatures)==null?void 0:i.multiWallet,m=a.length>0;await w.connectWalletConnect({cache:"never"}),this.isSiwxEnabled||(m&&u?(f.replace("ProfileWallets"),ye.showSuccess("New Wallet Added")):s?f.replace(s):Ye.close())}}catch(r){if(r instanceof Error&&r.message.includes("An error occurred when attempting to switch chain")&&!T.state.enableNetworkSwitch&&ee.state.activeChain){ee.setActiveCaipNetwork(dt.getUnsupportedNetwork(`${ee.state.activeChain}:${(o=ee.state.activeCaipNetwork)==null?void 0:o.id}`)),ee.showUnsupportedChainUI();return}r instanceof Je&&r.originalName===Ze.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?O.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:r.message}}):O.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:(r==null?void 0:r.message)??"Unknown"}}),w.setWcError(!0),ye.showError(r.message??"Connection error"),w.resetWcConnection(),f.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push("qrcode"),this.platform="qrcode";return}if(this.platform)return;const{mobile_link:e,desktop_link:i,webapp_link:o,injected:r,rdns:n}=this.wallet,s=r==null?void 0:r.map(({injected_id:_})=>_).filter(Boolean),a=[...n?[n]:s??[]],u=T.state.isUniversalProvider?!1:a.length,m=e,E=o,G=w.checkInstalled(a),N=u&&G,Z=i&&!b.isMobile();N&&!ee.state.noAdapters&&this.platforms.push("browser"),m&&this.platforms.push(b.isMobile()?"mobile":"qrcode"),E&&this.platforms.push("web"),Z&&this.platforms.push("desktop"),!N&&u&&!ee.state.noAdapters&&this.platforms.push("unsupported"),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case"browser":return l`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case"web":return l`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case"desktop":return l`
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
    `:null}async onSelectPlatform(e){var o;const i=(o=this.shadowRoot)==null?void 0:o.querySelector("div");i&&(await i.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.platform=e,i.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}};Y.styles=Ot;he([d()],Y.prototype,"platform",void 0);he([d()],Y.prototype,"platforms",void 0);he([d()],Y.prototype,"isSiwxEnabled",void 0);he([d()],Y.prototype,"remoteFeatures",void 0);he([c({type:Boolean})],Y.prototype,"displayBranding",void 0);he([c({type:Boolean})],Y.prototype,"basic",void 0);Y=he([y("w3m-connecting-wc-view")],Y);var qe=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Se=class extends v{constructor(){super(),this.unsubscribe=[],this.isMobile=b.isMobile(),this.remoteFeatures=T.state.remoteFeatures,this.unsubscribe.push(T.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(this.isMobile){const{featured:e,recommended:i}=g.state,{customWallets:o}=T.state,r=ut.getRecentWallets(),n=e.length||i.length||(o==null?void 0:o.length)||r.length;return l`<wui-flex flexDirection="column" gap="2" .margin=${["1","3","3","3"]}>
        ${n?l`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return l`<wui-flex flexDirection="column" .padding=${["0","0","4","0"]}>
        <w3m-connecting-wc-view ?basic=${!0} .displayBranding=${!1}></w3m-connecting-wc-view>
        <wui-flex flexDirection="column" .padding=${["0","3","0","3"]}>
          <w3m-all-wallets-widget></w3m-all-wallets-widget>
        </wui-flex>
      </wui-flex>
      ${this.reownBrandingTemplate()} `}reownBrandingTemplate(){var e;return(e=this.remoteFeatures)!=null&&e.reownBranding?l` <wui-flex flexDirection="column" .padding=${["1","0","1","0"]}>
      <wui-ux-by-reown></wui-ux-by-reown>
    </wui-flex>`:null}};qe([d()],Se.prototype,"isMobile",void 0);qe([d()],Se.prototype,"remoteFeatures",void 0);Se=qe([y("w3m-connecting-wc-basic-view")],Se);const It=W`
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
`;var je=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let fe=class extends v{constructor(){super(...arguments),this.inputElementRef=De(),this.checked=!1,this.disabled=!1,this.size="md"}render(){return l`
      <label data-size=${this.size}>
        <input
          ${Ne(this.inputElementRef)}
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){var e;this.dispatchEvent(new CustomEvent("switchChange",{detail:(e=this.inputElementRef.value)==null?void 0:e.checked,bubbles:!0,composed:!0}))}};fe.styles=[z,ie,It];je([c({type:Boolean})],fe.prototype,"checked",void 0);je([c({type:Boolean})],fe.prototype,"disabled",void 0);je([c()],fe.prototype,"size",void 0);fe=je([y("wui-toggle")],fe);const Lt=W`
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
`;var st=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Te=class extends v{constructor(){super(...arguments),this.checked=!1}render(){return l`
      <wui-flex>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle
          ?checked=${this.checked}
          size="sm"
          @switchChange=${this.handleToggleChange.bind(this)}
        ></wui-toggle>
      </wui-flex>
    `}handleToggleChange(e){e.stopPropagation(),this.checked=e.detail,this.dispatchSwitchEvent()}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent("certifiedSwitchChange",{detail:this.checked,bubbles:!0,composed:!0}))}};Te.styles=[z,ie,Lt];st([c({type:Boolean})],Te.prototype,"checked",void 0);Te=st([y("wui-certified-switch")],Te);const Pt=W`
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
`;var B=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let I=class extends v{constructor(){super(...arguments),this.inputElementRef=De(),this.disabled=!1,this.loading=!1,this.placeholder="",this.type="text",this.value="",this.size="md"}render(){return l` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${Ne(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${C(this.enterKeyHint)}
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
      </button>`:null}templateError(){return this.errorText?l`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`:null}templateWarning(){return this.warningText?l`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`:null}dispatchInputChangeEvent(){var e;this.dispatchEvent(new CustomEvent("inputChange",{detail:(e=this.inputElementRef.value)==null?void 0:e.value,bubbles:!0,composed:!0}))}};I.styles=[z,ie,Pt];B([c()],I.prototype,"icon",void 0);B([c({type:Boolean})],I.prototype,"disabled",void 0);B([c({type:Boolean})],I.prototype,"loading",void 0);B([c()],I.prototype,"placeholder",void 0);B([c()],I.prototype,"type",void 0);B([c()],I.prototype,"value",void 0);B([c()],I.prototype,"errorText",void 0);B([c()],I.prototype,"warningText",void 0);B([c()],I.prototype,"onSubmit",void 0);B([c()],I.prototype,"size",void 0);B([c({attribute:!1})],I.prototype,"onKeyDown",void 0);I=B([y("wui-input-text")],I);const jt=W`
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
`;var at=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Oe=class extends v{constructor(){super(...arguments),this.inputComponentRef=De(),this.inputValue=""}render(){return l`
      <wui-input-text
        ${Ne(this.inputComponentRef)}
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
    `}onInputChange(e){this.inputValue=e.detail||""}clearValue(){const e=this.inputComponentRef.value,i=e==null?void 0:e.inputElementRef.value;i&&(i.value="",this.inputValue="",i.focus(),i.dispatchEvent(new Event("input")))}};Oe.styles=[z,jt];at([c()],Oe.prototype,"inputValue",void 0);Oe=at([y("wui-search-bar")],Oe);const At=ge`<svg  viewBox="0 0 48 54" fill="none">
  <path
    d="M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z"
  />
</svg>`,zt=W`
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
`;var lt=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Ie=class extends v{constructor(){super(...arguments),this.type="wallet"}render(){return l`
      ${this.shimmerTemplate()}
      <wui-shimmer width="80px" height="20px"></wui-shimmer>
    `}shimmerTemplate(){return this.type==="network"?l` <wui-shimmer data-type=${this.type} width="48px" height="54px"></wui-shimmer>
        ${At}`:l`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}};Ie.styles=[z,ie,zt];lt([c()],Ie.prototype,"type",void 0);Ie=lt([y("wui-card-select-loader")],Ie);const Bt=tt`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`;var D=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let L=class extends v{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--apkt-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--apkt-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--apkt-spacing-${this.gap})`};
      padding-top: ${this.padding&&X.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&X.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&X.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&X.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&X.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&X.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&X.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&X.getSpacingStyles(this.margin,3)};
    `,l`<slot></slot>`}};L.styles=[z,Bt];D([c()],L.prototype,"gridTemplateRows",void 0);D([c()],L.prototype,"gridTemplateColumns",void 0);D([c()],L.prototype,"justifyItems",void 0);D([c()],L.prototype,"alignItems",void 0);D([c()],L.prototype,"justifyContent",void 0);D([c()],L.prototype,"alignContent",void 0);D([c()],L.prototype,"columnGap",void 0);D([c()],L.prototype,"rowGap",void 0);D([c()],L.prototype,"gap",void 0);D([c()],L.prototype,"padding",void 0);D([c()],L.prototype,"margin",void 0);L=D([y("wui-grid")],L);const Dt=W`
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
`;var K=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let j=class extends v{constructor(){super(),this.observer=new IntersectionObserver(()=>{}),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.isImpressed=!1,this.explorerId="",this.walletQuery="",this.certified=!1,this.displayIndex=0,this.wallet=void 0,this.observer=new IntersectionObserver(e=>{e.forEach(i=>{i.isIntersecting?(this.visible=!0,this.fetchImageSrc(),this.sendImpressionEvent()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){var i,o;const e=((i=this.wallet)==null?void 0:i.badge_type)==="certified";return l`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="1">
          <wui-text
            variant="md-regular"
            color="inherit"
            class=${C(e?"certified":void 0)}
            >${(o=this.wallet)==null?void 0:o.name}</wui-text
          >
          ${e?l`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){var e,i;return!this.visible&&!this.imageSrc||this.imageLoading?this.shimmerTemplate():l`
      <wui-wallet-image
        size="lg"
        imageSrc=${C(this.imageSrc)}
        name=${C((e=this.wallet)==null?void 0:e.name)}
        .installed=${((i=this.wallet)==null?void 0:i.installed)??!1}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `}shimmerTemplate(){return l`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}async fetchImageSrc(){this.wallet&&(this.imageSrc=te.getWalletImage(this.wallet),!this.imageSrc&&(this.imageLoading=!0,this.imageSrc=await te.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}sendImpressionEvent(){!this.wallet||this.isImpressed||(this.isImpressed=!0,O.sendWalletImpressionEvent({name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.explorerId,view:f.state.view,query:this.walletQuery,certified:this.certified,displayIndex:this.displayIndex}))}};j.styles=Dt;K([d()],j.prototype,"visible",void 0);K([d()],j.prototype,"imageSrc",void 0);K([d()],j.prototype,"imageLoading",void 0);K([d()],j.prototype,"isImpressed",void 0);K([c()],j.prototype,"explorerId",void 0);K([c()],j.prototype,"walletQuery",void 0);K([c()],j.prototype,"certified",void 0);K([c()],j.prototype,"displayIndex",void 0);K([c({type:Object})],j.prototype,"wallet",void 0);j=K([y("w3m-all-wallets-list-item")],j);const Nt=W`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
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
`;var oe=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};const Qe="local-paginator";let F=class extends v{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!g.state.wallets.length,this.wallets=g.state.wallets,this.recommended=g.state.recommended,this.featured=g.state.featured,this.filteredWallets=g.state.filteredWallets,this.mobileFullScreen=T.state.enableMobileFullScreen,this.unsubscribe.push(g.subscribeKey("wallets",e=>this.wallets=e),g.subscribeKey("recommended",e=>this.recommended=e),g.subscribeKey("featured",e=>this.featured=e),g.subscribeKey("filteredWallets",e=>this.filteredWallets=e))}firstUpdated(){this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){var e;this.unsubscribe.forEach(i=>i()),(e=this.paginationObserver)==null||e.disconnect()}render(){return this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),l`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${["0","3","3","3"]}
        gap="2"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){var i;this.loading=!0;const e=(i=this.shadowRoot)==null?void 0:i.querySelector("wui-grid");e&&(await g.fetchWalletsByPage({page:1}),await e.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.loading=!1,e.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}shimmerTemplate(e,i){return[...Array(e)].map(()=>l`
        <wui-card-select-loader type="wallet" id=${C(i)}></wui-card-select-loader>
      `)}getWallets(){var r;const e=[...this.featured,...this.recommended];((r=this.filteredWallets)==null?void 0:r.length)>0?e.push(...this.filteredWallets):e.push(...this.wallets);const i=b.uniqueBy(e,"id"),o=ze.markWalletsAsInstalled(i);return ze.markWalletsWithDisplayIndex(o)}walletsTemplate(){return this.getWallets().map((i,o)=>l`
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${i.id}"
          @click=${()=>this.onConnectWallet(i)}
          .wallet=${i}
          explorerId=${i.id}
          certified=${this.badge==="certified"}
          displayIndex=${o}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){const{wallets:e,recommended:i,featured:o,count:r,mobileFilteredOutWalletsLength:n}=g.state,s=window.innerWidth<352?3:4,a=e.length+i.length;let m=Math.ceil(a/s)*s-a+s;return m-=e.length?o.length%s:0,r===0&&o.length>0?null:r===0||[...o,...e,...i].length<r-(n??0)?this.shimmerTemplate(m,Qe):null}createPaginationObserver(){var i;const e=(i=this.shadowRoot)==null?void 0:i.querySelector(`#${Qe}`);e&&(this.paginationObserver=new IntersectionObserver(([o])=>{if(o!=null&&o.isIntersecting&&!this.loading){const{page:r,count:n,wallets:s}=g.state;s.length<n&&g.fetchWalletsByPage({page:r+1})}}),this.paginationObserver.observe(e))}onConnectWallet(e){P.selectWalletConnector(e)}};F.styles=Nt;oe([d()],F.prototype,"loading",void 0);oe([d()],F.prototype,"wallets",void 0);oe([d()],F.prototype,"recommended",void 0);oe([d()],F.prototype,"featured",void 0);oe([d()],F.prototype,"filteredWallets",void 0);oe([d()],F.prototype,"badge",void 0);oe([d()],F.prototype,"mobileFullScreen",void 0);F=oe([y("w3m-all-wallets-list")],F);const Ut=tt`
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

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
    height: auto;
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
`;var Ce=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let ue=class extends v{constructor(){super(...arguments),this.prevQuery="",this.prevBadge=void 0,this.loading=!0,this.mobileFullScreen=T.state.enableMobileFullScreen,this.query=""}render(){return this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.onSearch(),this.loading?l`<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await g.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){const{search:e}=g.state,i=ze.markWalletsAsInstalled(e);return e.length?l`
      <wui-grid
        data-testid="wallet-list"
        .padding=${["0","3","3","3"]}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${i.map((o,r)=>l`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(o)}
              .wallet=${o}
              data-testid="wallet-search-item-${o.id}"
              explorerId=${o.id}
              certified=${this.badge==="certified"}
              walletQuery=${this.query}
              displayIndex=${r}
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
      `}onConnectWallet(e){P.selectWalletConnector(e)}};ue.styles=Ut;Ce([d()],ue.prototype,"loading",void 0);Ce([d()],ue.prototype,"mobileFullScreen",void 0);Ce([c()],ue.prototype,"query",void 0);Ce([c()],ue.prototype,"badge",void 0);ue=Ce([y("w3m-all-wallets-search")],ue);var Me=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Le=class extends v{constructor(){super(...arguments),this.search="",this.badge=void 0,this.onDebouncedSearch=b.debounce(e=>{this.search=e})}render(){const e=this.search.length>=2;return l`
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
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}onCertifiedSwitchChange(e){e.detail?(this.badge="certified",ye.showSvg("Only WalletConnect certified",{icon:"walletConnectBrown",iconColor:"accent-100"})):this.badge=void 0}qrButtonTemplate(){return b.isMobile()?l`
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){f.push("ConnectingWalletConnect")}};Me([d()],Le.prototype,"search",void 0);Me([d()],Le.prototype,"badge",void 0);Le=Me([y("w3m-all-wallets-view")],Le);const qt=W`
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
`;var H=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let A=class extends v{constructor(){super(...arguments),this.imageSrc="google",this.loading=!1,this.disabled=!1,this.rightIcon=!0,this.rounded=!1,this.fullSize=!1}render(){return this.dataset.rounded=this.rounded?"true":"false",l`
      <button
        ?disabled=${this.loading?!0:!!this.disabled}
        data-loading=${this.loading}
        tabindex=${C(this.tabIdx)}
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
        iconColor=${C(this.iconColor)}
        ?boxed=${!0}
        ?rounded=${this.rounded}
      ></wui-image>`:l`<wui-image
      ?boxed=${!0}
      ?rounded=${this.rounded}
      ?fullSize=${this.fullSize}
      src=${this.imageSrc}
    ></wui-image>`}templateRightIcon(){return this.rightIcon?this.loading?l`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:l`<wui-icon name="chevronRight" size="lg" color="default"></wui-icon>`:null}};A.styles=[z,ie,qt];H([c()],A.prototype,"imageSrc",void 0);H([c()],A.prototype,"icon",void 0);H([c()],A.prototype,"iconColor",void 0);H([c({type:Boolean})],A.prototype,"loading",void 0);H([c()],A.prototype,"tabIdx",void 0);H([c({type:Boolean})],A.prototype,"disabled",void 0);H([c({type:Boolean})],A.prototype,"rightIcon",void 0);H([c({type:Boolean})],A.prototype,"rounded",void 0);H([c({type:Boolean})],A.prototype,"fullSize",void 0);A=H([y("wui-list-item")],A);var Mt=function(t,e,i,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n};let Xe=class extends v{constructor(){var e;super(...arguments),this.wallet=(e=f.state.data)==null?void 0:e.wallet}render(){if(!this.wallet)throw new Error("w3m-downloads-view");return l`
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
    `:null}openStore(e){e.href&&this.wallet&&(O.sendEvent({type:"track",event:"GET_WALLET",properties:{name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.wallet.id,type:e.type}}),b.openHref(e.href,"_blank"))}onChromeStore(){var e;(e=this.wallet)!=null&&e.chrome_store&&this.openStore({href:this.wallet.chrome_store,type:"chrome_store"})}onAppStore(){var e;(e=this.wallet)!=null&&e.app_store&&this.openStore({href:this.wallet.app_store,type:"app_store"})}onPlayStore(){var e;(e=this.wallet)!=null&&e.play_store&&this.openStore({href:this.wallet.play_store,type:"play_store"})}onHomePage(){var e;(e=this.wallet)!=null&&e.homepage&&this.openStore({href:this.wallet.homepage,type:"homepage"})}};Xe=Mt([y("w3m-downloads-view")],Xe);export{Le as W3mAllWalletsView,Se as W3mConnectingWcBasicView,Xe as W3mDownloadsView};
//# sourceMappingURL=basic-CTeh--tv.js.map
