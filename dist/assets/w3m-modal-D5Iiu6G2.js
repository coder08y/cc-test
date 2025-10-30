import{ev as b,ew as _e,ex as Be,ey as u,ez as v,eA as me,b8 as O,eB as F,eC as we,eD as he,b4 as f,ba as ee,eE as fe,eF as te,bb as ne,eG as ie,eH as Ge,eI as De,eJ as Ye,eK as ve,eL as Ue,eM as ze,eN as W,eO as ge,eP as P,eQ as de,dm as x,dn as l,eR as Fe,eS as Se,eT as Xe,eU as G,eV as S,dl as Le,bc as pe,eW as qe,eX as Qe,eY as Ze}from"./index-Lo8eQgA0.js";import{n as m,o as Y,r as h}from"./class-map-DNAvK37t.js";import{c as T,U as Me}from"./index-D6DW347f.js";import"./vendor-CBmAETR3.js";import"./cross-J9VCREIf.js";const z={getGasPriceInEther(e,t){const o=t*e;return Number(o)/1e18},getGasPriceInUSD(e,t,o){const i=z.getGasPriceInEther(t,o);return b.bigNumber(e).times(i).toNumber()},getPriceImpact({sourceTokenAmount:e,sourceTokenPriceInUSD:t,toTokenPriceInUSD:o,toTokenAmount:i}){const a=b.bigNumber(e).times(t),n=b.bigNumber(i).times(o);return a.minus(n).div(a).times(100).toNumber()},getMaxSlippage(e,t){const o=b.bigNumber(e).div(100);return b.multiply(t,o).toNumber()},getProviderFee(e,t=.0085){return b.bigNumber(e).times(t).toString()},isInsufficientNetworkTokenForGas(e,t){const o=t||"0";return b.bigNumber(e).eq(0)?!0:b.bigNumber(b.bigNumber(o)).gt(e)},isInsufficientSourceTokenForSwap(e,t,o){var n,s;const i=(s=(n=o==null?void 0:o.find(c=>c.address===t))==null?void 0:n.quantity)==null?void 0:s.numeric;return b.bigNumber(i||"0").lt(e)}},Ee=15e4,Je=6,A={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:"",sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:"",toTokenPriceInUSD:0,networkPrice:"0",networkBalanceInUSD:"0",networkTokenSymbol:"",inputError:void 0,slippage:De.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:"0",gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},r=Be({...A}),be={state:r,subscribe(e){return ze(r,()=>e(r))},subscribeKey(e,t){return Ue(r,e,t)},getParams(){var p,w,g,C,I,H,V,K;const e=f.state.activeChain,t=ne.getCaipAddress(e)??f.state.activeCaipAddress,o=fe.getPlainAddress(t),i=Ye(),a=ve.getConnectorId(f.state.activeChain);if(!o)throw new Error("No address found to swap the tokens from.");const n=!((p=r.toToken)!=null&&p.address)||!((w=r.toToken)!=null&&w.decimals),s=!((g=r.sourceToken)!=null&&g.address)||!((C=r.sourceToken)!=null&&C.decimals)||!b.bigNumber(r.sourceTokenAmount).gt(0),c=!r.sourceTokenAmount;return{networkAddress:i,fromAddress:o,fromCaipAddress:t,sourceTokenAddress:(I=r.sourceToken)==null?void 0:I.address,toTokenAddress:(H=r.toToken)==null?void 0:H.address,toTokenAmount:r.toTokenAmount,toTokenDecimals:(V=r.toToken)==null?void 0:V.decimals,sourceTokenAmount:r.sourceTokenAmount,sourceTokenDecimals:(K=r.sourceToken)==null?void 0:K.decimals,invalidToToken:n,invalidSourceToken:s,invalidSourceTokenAmount:c,availableToSwap:t&&!n&&!s&&!c,isAuthConnector:a===O.CONNECTOR_ID.AUTH}},setSourceToken(e){if(!e){r.sourceToken=e,r.sourceTokenAmount="",r.sourceTokenPriceInUSD=0;return}r.sourceToken=e,d.setTokenPrice(e.address,"sourceToken")},setSourceTokenAmount(e){r.sourceTokenAmount=e},setToToken(e){if(!e){r.toToken=e,r.toTokenAmount="",r.toTokenPriceInUSD=0;return}r.toToken=e,d.setTokenPrice(e.address,"toToken")},setToTokenAmount(e){r.toTokenAmount=e?b.toFixed(e,Je):""},async setTokenPrice(e,t){let o=r.tokensPriceMap[e]||0;o||(r.loadingPrices=!0,o=await d.getAddressPrice(e)),t==="sourceToken"?r.sourceTokenPriceInUSD=o:t==="toToken"&&(r.toTokenPriceInUSD=o),r.loadingPrices&&(r.loadingPrices=!1),d.getParams().availableToSwap&&d.swapTokens()},switchTokens(){if(r.initializing||!r.initialized)return;const e=r.toToken?{...r.toToken}:void 0,t=r.sourceToken?{...r.sourceToken}:void 0,o=e&&r.toTokenAmount===""?"1":r.toTokenAmount;d.setSourceToken(e),d.setToToken(t),d.setSourceTokenAmount(o),d.setToTokenAmount(""),d.swapTokens()},resetState(){r.myTokensWithBalance=A.myTokensWithBalance,r.tokensPriceMap=A.tokensPriceMap,r.initialized=A.initialized,r.initializing=A.initializing,r.sourceToken=A.sourceToken,r.sourceTokenAmount=A.sourceTokenAmount,r.sourceTokenPriceInUSD=A.sourceTokenPriceInUSD,r.toToken=A.toToken,r.toTokenAmount=A.toTokenAmount,r.toTokenPriceInUSD=A.toTokenPriceInUSD,r.networkPrice=A.networkPrice,r.networkTokenSymbol=A.networkTokenSymbol,r.networkBalanceInUSD=A.networkBalanceInUSD,r.inputError=A.inputError},resetValues(){var o;const{networkAddress:e}=d.getParams(),t=(o=r.tokens)==null?void 0:o.find(i=>i.address===e);d.setSourceToken(t),d.setToToken(void 0)},getApprovalLoadingState(){return r.loadingApprovalTransaction},clearError(){r.transactionError=void 0},async initializeState(){if(!r.initializing){if(r.initializing=!0,!r.initialized)try{await d.fetchTokens(),r.initialized=!0}catch{r.initialized=!1,v.showError("Failed to initialize swap"),u.goBack()}r.initializing=!1}},async fetchTokens(){var o;const{networkAddress:e}=d.getParams();await d.getNetworkTokenPrice(),await d.getMyTokensWithBalance();const t=(o=r.myTokensWithBalance)==null?void 0:o.find(i=>i.address===e);t&&(r.networkTokenSymbol=t.symbol,d.setSourceToken(t),d.setSourceTokenAmount("0"))},async getTokenList(){var t;const e=(t=f.state.activeCaipNetwork)==null?void 0:t.caipNetworkId;if(!(r.caipNetworkId===e&&r.tokens))try{r.tokensLoading=!0;const o=await te.getTokenList(e);r.tokens=o,r.caipNetworkId=e,r.popularTokens=o.sort((i,a)=>i.symbol<a.symbol?-1:i.symbol>a.symbol?1:0),r.suggestedTokens=o.filter(i=>!!De.SWAP_SUGGESTED_TOKENS.includes(i.symbol))}catch{r.tokens=[],r.popularTokens=[],r.suggestedTokens=[]}finally{r.tokensLoading=!1}},async getAddressPrice(e){var p,w;const t=r.tokensPriceMap[e];if(t)return t;const o=await ee.fetchTokenPrice({addresses:[e]}),i=(o==null?void 0:o.fungibles)||[],a=[...r.tokens||[],...r.myTokensWithBalance||[]],n=(p=a==null?void 0:a.find(g=>g.address===e))==null?void 0:p.symbol,s=((w=i.find(g=>g.symbol.toLowerCase()===(n==null?void 0:n.toLowerCase())))==null?void 0:w.price)||0,c=parseFloat(s.toString());return r.tokensPriceMap[e]=c,c},async getNetworkTokenPrice(){var a;const{networkAddress:e}=d.getParams(),o=(a=(await ee.fetchTokenPrice({addresses:[e]}).catch(()=>(v.showError("Failed to fetch network token price"),{fungibles:[]}))).fungibles)==null?void 0:a[0],i=(o==null?void 0:o.price.toString())||"0";r.tokensPriceMap[e]=parseFloat(i),r.networkTokenSymbol=(o==null?void 0:o.symbol)||"",r.networkPrice=i},async getMyTokensWithBalance(e){const t=await Ge.getMyTokensWithBalance(e),o=te.mapBalancesToSwapTokens(t);o&&(await d.getInitialGasPrice(),d.setBalances(o))},setBalances(e){const{networkAddress:t}=d.getParams(),o=f.state.activeCaipNetwork;if(!o)return;const i=e.find(a=>a.address===t);e.forEach(a=>{r.tokensPriceMap[a.address]=a.price||0}),r.myTokensWithBalance=e.filter(a=>a.address.startsWith(o.caipNetworkId)),r.networkBalanceInUSD=i?b.multiply(i.quantity.numeric,i.price).toString():"0"},async getInitialGasPrice(){var t,o;const e=await te.fetchGasPrice();if(!e)return{gasPrice:null,gasPriceInUSD:null};switch((o=(t=f.state)==null?void 0:t.activeCaipNetwork)==null?void 0:o.chainNamespace){case O.CHAIN.SOLANA:return r.gasFee=e.standard??"0",r.gasPriceInUSD=b.multiply(e.standard,r.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(r.gasFee),gasPriceInUSD:Number(r.gasPriceInUSD)};case O.CHAIN.EVM:default:const i=e.standard??"0",a=BigInt(i),n=BigInt(Ee),s=z.getGasPriceInUSD(r.networkPrice,n,a);return r.gasFee=i,r.gasPriceInUSD=s,{gasPrice:a,gasPriceInUSD:s}}},async swapTokens(){var n,s;const e=ne.state.address,t=r.sourceToken,o=r.toToken,i=b.bigNumber(r.sourceTokenAmount).gt(0);if(i||d.setToTokenAmount(""),!o||!t||r.loadingPrices||!i)return;r.loadingQuote=!0;const a=b.bigNumber(r.sourceTokenAmount).times(10**t.decimals).round(0);try{const c=await ee.fetchSwapQuote({userAddress:e,from:t.address,to:o.address,gasPrice:r.gasFee,amount:a.toString()});r.loadingQuote=!1;const p=(s=(n=c==null?void 0:c.quotes)==null?void 0:n[0])==null?void 0:s.toAmount;if(!p){ie.open({displayMessage:"Incorrect amount",debugMessage:"Please enter a valid amount"},"error");return}const w=b.bigNumber(p).div(10**o.decimals).toString();d.setToTokenAmount(w),d.hasInsufficientToken(r.sourceTokenAmount,t.address)?r.inputError="Insufficient balance":(r.inputError=void 0,d.setTransactionDetails())}catch(c){const p=await te.handleSwapError(c);r.loadingQuote=!1,r.inputError=p||"Insufficient balance"}},async getTransaction(){const{fromCaipAddress:e,availableToSwap:t}=d.getParams(),o=r.sourceToken,i=r.toToken;if(!(!e||!t||!o||!i||r.loadingQuote))try{r.loadingBuildTransaction=!0;const a=await te.fetchSwapAllowance({userAddress:e,tokenAddress:o.address,sourceTokenAmount:r.sourceTokenAmount,sourceTokenDecimals:o.decimals});let n;return a?n=await d.createSwapTransaction():n=await d.createAllowanceTransaction(),r.loadingBuildTransaction=!1,r.fetchError=!1,n}catch{u.goBack(),v.showError("Failed to check allowance"),r.loadingBuildTransaction=!1,r.approvalTransaction=void 0,r.swapTransaction=void 0,r.fetchError=!0;return}},async createAllowanceTransaction(){const{fromCaipAddress:e,sourceTokenAddress:t,toTokenAddress:o}=d.getParams();if(!(!e||!o)){if(!t)throw new Error("createAllowanceTransaction - No source token address found.");try{const i=await ee.generateApproveCalldata({from:t,to:o,userAddress:e}),a=fe.getPlainAddress(i.tx.from);if(!a)throw new Error("SwapController:createAllowanceTransaction - address is required");const n={data:i.tx.data,to:a,gasPrice:BigInt(i.tx.eip155.gasPrice),value:BigInt(i.tx.value),toAmount:r.toTokenAmount};return r.swapTransaction=void 0,r.approvalTransaction={data:n.data,to:n.to,gasPrice:n.gasPrice,value:n.value,toAmount:n.toAmount},{data:n.data,to:n.to,gasPrice:n.gasPrice,value:n.value,toAmount:n.toAmount}}catch{u.goBack(),v.showError("Failed to create approval transaction"),r.approvalTransaction=void 0,r.swapTransaction=void 0,r.fetchError=!0;return}}},async createSwapTransaction(){var s;const{networkAddress:e,fromCaipAddress:t,sourceTokenAmount:o}=d.getParams(),i=r.sourceToken,a=r.toToken;if(!t||!o||!i||!a)return;const n=(s=me.parseUnits(o,i.decimals))==null?void 0:s.toString();try{const c=await ee.generateSwapCalldata({userAddress:t,from:i.address,to:a.address,amount:n,disableEstimate:!0}),p=i.address===e,w=BigInt(c.tx.eip155.gas),g=BigInt(c.tx.eip155.gasPrice),C=fe.getPlainAddress(c.tx.to);if(!C)throw new Error("SwapController:createSwapTransaction - address is required");const I={data:c.tx.data,to:C,gas:w,gasPrice:g,value:BigInt(p?n??"0":"0"),toAmount:r.toTokenAmount};return r.gasPriceInUSD=z.getGasPriceInUSD(r.networkPrice,w,g),r.approvalTransaction=void 0,r.swapTransaction=I,I}catch{u.goBack(),v.showError("Failed to create transaction"),r.approvalTransaction=void 0,r.swapTransaction=void 0,r.fetchError=!0;return}},onEmbeddedWalletApprovalSuccess(){v.showLoading("Approve limit increase in your wallet"),u.replace("SwapPreview")},async sendTransactionForApproval(e){var a,n,s;const{fromAddress:t,isAuthConnector:o}=d.getParams();r.loadingApprovalTransaction=!0,o?u.pushTransactionStack({onSuccess:d.onEmbeddedWalletApprovalSuccess}):v.showLoading("Approve limit increase in your wallet");try{await me.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:O.CHAIN.EVM}),await d.swapTokens(),await d.getTransaction(),r.approvalTransaction=void 0,r.loadingApprovalTransaction=!1}catch(c){const p=c;r.transactionError=p==null?void 0:p.displayMessage,r.loadingApprovalTransaction=!1,v.showError((p==null?void 0:p.displayMessage)||"Transaction error"),F.sendEvent({type:"track",event:"SWAP_APPROVAL_ERROR",properties:{message:(p==null?void 0:p.displayMessage)||(p==null?void 0:p.message)||"Unknown",network:((a=f.state.activeCaipNetwork)==null?void 0:a.caipNetworkId)||"",swapFromToken:((n=d.state.sourceToken)==null?void 0:n.symbol)||"",swapToToken:((s=d.state.toToken)==null?void 0:s.symbol)||"",swapFromAmount:d.state.sourceTokenAmount||"",swapToAmount:d.state.toTokenAmount||"",isSmartAccount:we(O.CHAIN.EVM)===he.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(e){var s,c,p,w,g,C,I,H,V,K,U,J;if(!e)return;const{fromAddress:t,toTokenAmount:o,isAuthConnector:i}=d.getParams();r.loadingTransaction=!0;const a=`Swapping ${(s=r.sourceToken)==null?void 0:s.symbol} to ${b.formatNumberToLocalString(o,3)} ${(c=r.toToken)==null?void 0:c.symbol}`,n=`Swapped ${(p=r.sourceToken)==null?void 0:p.symbol} to ${b.formatNumberToLocalString(o,3)} ${(w=r.toToken)==null?void 0:w.symbol}`;i?u.pushTransactionStack({onSuccess(){u.replace("Account"),v.showLoading(a),be.resetState()}}):v.showLoading("Confirm transaction in your wallet");try{const Q=[(g=r.sourceToken)==null?void 0:g.address,(C=r.toToken)==null?void 0:C.address].join(","),y=await me.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:O.CHAIN.EVM});return r.loadingTransaction=!1,v.showSuccess(n),F.sendEvent({type:"track",event:"SWAP_SUCCESS",properties:{network:((I=f.state.activeCaipNetwork)==null?void 0:I.caipNetworkId)||"",swapFromToken:((H=d.state.sourceToken)==null?void 0:H.symbol)||"",swapToToken:((V=d.state.toToken)==null?void 0:V.symbol)||"",swapFromAmount:d.state.sourceTokenAmount||"",swapToAmount:d.state.toTokenAmount||"",isSmartAccount:we(O.CHAIN.EVM)===he.ACCOUNT_TYPES.SMART_ACCOUNT}}),be.resetState(),i||u.replace("Account"),be.getMyTokensWithBalance(Q),y}catch(Q){const y=Q;r.transactionError=y==null?void 0:y.displayMessage,r.loadingTransaction=!1,v.showError((y==null?void 0:y.displayMessage)||"Transaction error"),F.sendEvent({type:"track",event:"SWAP_ERROR",properties:{message:(y==null?void 0:y.displayMessage)||(y==null?void 0:y.message)||"Unknown",network:((K=f.state.activeCaipNetwork)==null?void 0:K.caipNetworkId)||"",swapFromToken:((U=d.state.sourceToken)==null?void 0:U.symbol)||"",swapToToken:((J=d.state.toToken)==null?void 0:J.symbol)||"",swapFromAmount:d.state.sourceTokenAmount||"",swapToAmount:d.state.toTokenAmount||"",isSmartAccount:we(O.CHAIN.EVM)===he.ACCOUNT_TYPES.SMART_ACCOUNT}});return}},hasInsufficientToken(e,t){return z.isInsufficientSourceTokenForSwap(e,t,r.myTokensWithBalance)},setTransactionDetails(){const{toTokenAddress:e,toTokenDecimals:t}=d.getParams();!e||!t||(r.gasPriceInUSD=z.getGasPriceInUSD(r.networkPrice,BigInt(r.gasFee),BigInt(Ee)),r.priceImpact=z.getPriceImpact({sourceTokenAmount:r.sourceTokenAmount,sourceTokenPriceInUSD:r.sourceTokenPriceInUSD,toTokenPriceInUSD:r.toTokenPriceInUSD,toTokenAmount:r.toTokenAmount}),r.maxSlippage=z.getMaxSlippage(r.slippage,r.toTokenAmount),r.providerFee=z.getProviderFee(r.sourceTokenAmount))}},d=_e(be),E=Be({message:"",open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:"shade"}),et={state:E,subscribe(e){return ze(E,()=>e(E))},subscribeKey(e,t){return Ue(E,e,t)},showTooltip({message:e,triggerRect:t,variant:o}){E.open=!0,E.message=e,E.triggerRect=t,E.variant=o},hide(){E.open=!1,E.message="",E.triggerRect={width:0,height:0,top:0,left:0}}},oe=_e(et),je={isUnsupportedChainView(){return u.state.view==="UnsupportedChain"||u.state.view==="SwitchNetwork"&&u.state.history.includes("UnsupportedChain")},async safeClose(){if(this.isUnsupportedChainView()){W.shake();return}if(await ge.isSIWXCloseDisabled()){W.shake();return}(u.state.view==="DataCapture"||u.state.view==="DataCaptureOtpConfirm")&&me.disconnect(),W.close()}},tt=P`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius:e})=>e[8]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    overflow: hidden;
  }
`;var ot=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let xe=class extends x{render(){return l`<slot></slot>`}};xe.styles=[de,tt];xe=ot([T("wui-card")],xe);const nt=P`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[6]};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens:e})=>e.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundWarning};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundError};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:e})=>e[2]};
    background-color: var(--local-icon-bg-value);
  }
`;var Ae=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};const it={info:"info",success:"checkmark",warning:"warningCircle",error:"warning"};let ae=class extends x{constructor(){super(...arguments),this.message="",this.type="info"}render(){return l`
      <wui-flex
        data-type=${Y(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${it[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){ie.close()}};ae.styles=[de,nt];Ae([m()],ae.prototype,"message",void 0);Ae([m()],ae.prototype,"type",void 0);ae=Ae([T("wui-alertbar")],ae);const rt=P`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing:e})=>e[3]};
    left: ${({spacing:e})=>e[4]};
    right: ${({spacing:e})=>e[4]};
    opacity: 0;
    pointer-events: none;
  }
`;var He=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};const at={info:{backgroundColor:"fg-350",iconColor:"fg-325",icon:"info"},success:{backgroundColor:"success-glass-reown-020",iconColor:"success-125",icon:"checkmark"},warning:{backgroundColor:"warning-glass-reown-020",iconColor:"warning-100",icon:"warningCircle"},error:{backgroundColor:"error-glass-reown-020",iconColor:"error-125",icon:"warning"}};let ye=class extends x{constructor(){super(),this.unsubscribe=[],this.open=ie.state.open,this.onOpen(!0),this.unsubscribe.push(ie.subscribeKey("open",t=>{this.open=t,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){const{message:t,variant:o}=ie.state,i=at[o];return l`
      <wui-alertbar
        message=${t}
        backgroundColor=${i==null?void 0:i.backgroundColor}
        iconColor=${i==null?void 0:i.iconColor}
        icon=${i==null?void 0:i.icon}
        type=${o}
      ></wui-alertbar>
    `}onOpen(t){this.open?(this.animate([{opacity:0,transform:"scale(0.85)"},{opacity:1,transform:"scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: auto"):t||(this.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: none")}};ye.styles=rt;He([h()],ye.prototype,"open",void 0);ye=He([T("w3m-alertbar")],ye);const st=P`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var q=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let _=class extends x{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.fullWidth=!1,this.disabled=!1}render(){return l`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon}></wui-icon>
    </button>`}};_.styles=[de,Fe,st];q([m()],_.prototype,"icon",void 0);q([m()],_.prototype,"variant",void 0);q([m()],_.prototype,"type",void 0);q([m()],_.prototype,"size",void 0);q([m({type:Boolean})],_.prototype,"fullWidth",void 0);q([m({type:Boolean})],_.prototype,"disabled",void 0);_=q([T("wui-icon-button")],_);const ct=P`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
    border-radius: ${({borderRadius:e})=>e[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing:e})=>e[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    opacity: 0.5;
  }
`;var Z=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};const lt={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},dt={lg:"lg",md:"md",sm:"sm"};let L=class extends x{constructor(){super(...arguments),this.imageSrc="",this.text="",this.size="lg",this.type="text-dropdown",this.disabled=!1}render(){return l`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){const t=lt[this.size];return this.text?l`<wui-text color="primary" variant=${t}>${this.text}</wui-text>`:null}imageTemplate(){if(this.imageSrc)return l`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;const t=dt[this.size];return l` <wui-flex class="left-icon-container">
      <wui-icon size=${t} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};L.styles=[de,Fe,ct];Z([m()],L.prototype,"imageSrc",void 0);Z([m()],L.prototype,"text",void 0);Z([m()],L.prototype,"size",void 0);Z([m()],L.prototype,"type",void 0);Z([m({type:Boolean})],L.prototype,"disabled",void 0);L=Z([T("wui-select")],L);const ut=P`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  wui-text {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings:e})=>e["ease-out-power-2"]},
      slide-down-in 120ms forwards ${({easings:e})=>e["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings:e})=>e["ease-out-power-2"]},
      slide-up-in 120ms forwards ${({easings:e})=>e["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;var M=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};const pt=["SmartSessionList"];function We(){var s,c,p,w,g,C,I;const e=(c=(s=u.state.data)==null?void 0:s.connector)==null?void 0:c.name,t=(w=(p=u.state.data)==null?void 0:p.wallet)==null?void 0:w.name,o=(C=(g=u.state.data)==null?void 0:g.network)==null?void 0:C.name,i=t??e,a=ve.getConnectors();return{Connect:`Connect ${a.length===1&&((I=a[0])==null?void 0:I.id)==="w3m-email"?"Email":""} Wallet`,Create:"Create Wallet",ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:"All Wallets",ApproveTransaction:"Approve Transaction",BuyInProgress:"Buy",ConnectingExternal:i??"Connect Wallet",ConnectingWalletConnect:i??"WalletConnect",ConnectingWalletConnectBasic:"WalletConnect",ConnectingSiwe:"Sign In",Convert:"Convert",ConvertSelectToken:"Select token",ConvertPreview:"Preview Convert",Downloads:i?`Get ${i}`:"Downloads",EmailLogin:"Email Login",EmailVerifyOtp:"Confirm Email",EmailVerifyDevice:"Register Device",GetWallet:"Get a Wallet",Networks:"Choose Network",OnRampProviders:"Choose Provider",OnRampActivity:"Activity",OnRampTokenSelect:"Select Token",OnRampFiatSelect:"Select Currency",Pay:"How you pay",ProfileWallets:"Wallets",SwitchNetwork:o??"Switch Network",Transactions:"Activity",UnsupportedChain:"Switch Network",UpgradeEmailWallet:"Upgrade Your Wallet",UpdateEmailWallet:"Edit Email",UpdateEmailPrimaryOtp:"Confirm Current Email",UpdateEmailSecondaryOtp:"Confirm New Email",WhatIsABuy:"What is Buy?",RegisterAccountName:"Choose Name",RegisterAccountNameSuccess:"",WalletReceive:"Receive",WalletCompatibleNetworks:"Compatible Networks",Swap:"Swap",SwapSelectToken:"Select Token",SwapPreview:"Preview Swap",WalletSend:"Send",WalletSendPreview:"Review Send",WalletSendSelectToken:"Select Token",WalletSendConfirmed:"Confirmed",WhatIsANetwork:"What is a network?",WhatIsAWallet:"What is a Wallet?",ConnectWallets:"Connect Wallet",ConnectSocials:"All Socials",ConnectingSocial:ne.state.socialProvider?ne.state.socialProvider.charAt(0).toUpperCase()+ne.state.socialProvider.slice(1):"Connect Social",ConnectingMultiChain:"Select Chain",ConnectingFarcaster:"Farcaster",SwitchActiveChain:"Switch Chain",SmartSessionCreated:void 0,SmartSessionList:"Smart Sessions",SIWXSignMessage:"Sign In",PayLoading:"Payment in Progress",DataCapture:"Profile",DataCaptureOtpConfirm:"Confirm Email",FundWallet:"Fund Wallet",PayWithExchange:"Deposit from Exchange",PayWithExchangeSelectAsset:"Select Asset"}}let R=class extends x{constructor(){super(),this.unsubscribe=[],this.heading=We()[u.state.view],this.network=f.state.activeCaipNetwork,this.networkImage=Se.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=u.state.view,this.viewDirection="",this.unsubscribe.push(Xe.subscribeNetworkImages(()=>{this.networkImage=Se.getNetworkImage(this.network)}),u.subscribeKey("view",t=>{setTimeout(()=>{this.view=t,this.heading=We()[t]},G.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),f.subscribeKey("activeCaipNetwork",t=>{this.network=t,this.networkImage=Se.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(t=>t())}render(){return l`
      <wui-flex
        .padding=${["0","4","0","4"]}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){F.sendEvent({type:"track",event:"CLICK_WALLET_HELP"}),u.push("WhatIsAWallet")}async onClose(){await je.safeClose()}rightHeaderTemplate(){var o,i,a;const t=(a=(i=(o=S)==null?void 0:o.state)==null?void 0:i.features)==null?void 0:a.smartSessions;return u.state.view!=="Account"||!t?this.closeButtonTemplate():l`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        type="neutral"
        variant="primary"
        @click=${()=>u.push("SmartSessionList")}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `}closeButtonTemplate(){return l`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){const t=pt.includes(this.view);return l`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text variant="lg-regular" color="primary" data-testid="w3m-header-text">
          ${this.heading}
        </wui-text>
        ${t?l`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){var w;const{view:t}=u.state,o=t==="Connect",i=S.state.enableEmbedded,a=t==="ApproveTransaction",n=t==="ConnectingSiwe",s=t==="Account",c=S.state.enableNetworkSwitch,p=a||n||o&&i;return s&&c?l`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${Y((w=this.network)==null?void 0:w.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${Y(this.networkImage)}
      ></wui-select>`:this.showBack&&!p?l`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:l`<wui-icon-button
      data-hidden=${!o}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(F.sendEvent({type:"track",event:"CLICK_NETWORKS"}),u.push("Networks"))}isAllowedNetworkSwitch(){const t=f.getAllRequestedCaipNetworks(),o=t?t.length>1:!1,i=t==null?void 0:t.find(({id:a})=>{var n;return a===((n=this.network)==null?void 0:n.id)});return o||!i}onViewChange(){const{history:t}=u.state;let o=G.VIEW_DIRECTION.Next;t.length<this.prevHistoryLength&&(o=G.VIEW_DIRECTION.Prev),this.prevHistoryLength=t.length,this.viewDirection=o}async onHistoryChange(){var i;const{history:t}=u.state,o=(i=this.shadowRoot)==null?void 0:i.querySelector("#dynamic");t.length>1&&!this.showBack&&o?(await o.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!0,o.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"})):t.length<=1&&this.showBack&&o&&(await o.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!1,o.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}onGoBack(){u.goBack()}};R.styles=ut;M([h()],R.prototype,"heading",void 0);M([h()],R.prototype,"network",void 0);M([h()],R.prototype,"networkImage",void 0);M([h()],R.prototype,"showBack",void 0);M([h()],R.prototype,"prevHistoryLength",void 0);M([h()],R.prototype,"view",void 0);M([h()],R.prototype,"viewDirection",void 0);R=M([T("w3m-header")],R);const mt=P`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[2]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens:e})=>e.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius:e})=>e.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing:e})=>e[1]};
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    border-radius: ${({borderRadius:e})=>e.round} !important;
  }
`;var $e=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let se=class extends x{constructor(){super(...arguments),this.message="",this.variant="success"}render(){return l`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){const t={success:"success",error:"error",warning:"warning",info:"default"},o={success:"checkmark",error:"warning",warning:"warningCircle",info:"info"};return this.variant==="loading"?l`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:l`<wui-icon-box
      size="md"
      color=${t[this.variant]}
      icon=${o[this.variant]}
    ></wui-icon-box>`}};se.styles=[de,mt];$e([m()],se.prototype,"message",void 0);$e([m()],se.prototype,"variant",void 0);se=$e([T("wui-snackbar")],se);const wt=Le`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`;var Ve=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let ke=class extends x{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=v.state.open,this.unsubscribe.push(v.subscribeKey("open",t=>{this.open=t,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(t=>t())}render(){const{message:t,variant:o}=v.state;return l` <wui-snackbar message=${t} variant=${o}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:"translateX(-50%) scale(0.85)"},{opacity:1,transform:"translateX(-50%) scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.timeout&&clearTimeout(this.timeout),v.state.autoClose&&(this.timeout=setTimeout(()=>v.hide(),2500))):this.animate([{opacity:1,transform:"translateX(-50%) scale(1)"},{opacity:0,transform:"translateX(-50%) scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"})}};ke.styles=wt;Ve([h()],ke.prototype,"open",void 0);ke=Ve([T("w3m-snackbar")],ke);const ht=P`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px ${({spacing:e})=>e[3]} 10px ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.backgroundPrimary};
    position: absolute;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - ${({spacing:e})=>e[5]});
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.textPrimary};
    border: none;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var ue=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let X=class extends x{constructor(){super(),this.unsubscribe=[],this.open=oe.state.open,this.message=oe.state.message,this.triggerRect=oe.state.triggerRect,this.variant=oe.state.variant,this.unsubscribe.push(oe.subscribe(t=>{this.open=t.open,this.message=t.message,this.triggerRect=t.triggerRect,this.variant=t.variant}))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){this.dataset.variant=this.variant;const t=this.triggerRect.top,o=this.triggerRect.left;return this.style.cssText=`
    --w3m-tooltip-top: ${t}px;
    --w3m-tooltip-left: ${o}px;
    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;
    --w3m-tooltip-display: ${this.open?"flex":"none"};
    --w3m-tooltip-opacity: ${this.open?1:0};
    `,l`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};X.styles=[ht];ue([h()],X.prototype,"open",void 0);ue([h()],X.prototype,"message",void 0);ue([h()],X.prototype,"triggerRect",void 0);ue([h()],X.prototype,"variant",void 0);X=ue([T("w3m-tooltip")],X);const re={getTabsByNamespace(e){var o;return!!e&&e===O.CHAIN.EVM?((o=S.state.remoteFeatures)==null?void 0:o.activity)===!1?G.ACCOUNT_TABS.filter(i=>i.label!=="Activity"):G.ACCOUNT_TABS:[]},isValidReownName(e){return/^[a-zA-Z0-9]+$/gu.test(e)},isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(e)},validateReownName(e){return e.replace(/\^/gu,"").toLowerCase().replace(/[^a-zA-Z0-9]/gu,"")},hasFooter(){var t;const e=u.state.view;if(G.VIEWS_WITH_LEGAL_FOOTER.includes(e)){const{termsConditionsUrl:o,privacyPolicyUrl:i}=S.state,a=(t=S.state.features)==null?void 0:t.legalCheckbox;return!(!o&&!i||a)}return G.VIEWS_WITH_DEFAULT_FOOTER.includes(e)}},ft=P`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing:e})=>e[3]};
  }

  a {
    text-decoration: none;
    color: ${({tokens:e})=>e.core.textAccentPrimary};
    font-weight: 500;
  }
`;var Ke=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let Te=class extends x{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=S.state.remoteFeatures,this.unsubscribe.push(S.subscribeKey("remoteFeatures",t=>this.remoteFeatures=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){var n;const{termsConditionsUrl:t,privacyPolicyUrl:o}=S.state,i=(n=S.state.features)==null?void 0:n.legalCheckbox;return!t&&!o||i?l`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `:l`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${["4","3","3","3"]} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}andTemplate(){const{termsConditionsUrl:t,privacyPolicyUrl:o}=S.state;return t&&o?"and":""}termsTemplate(){const{termsConditionsUrl:t}=S.state;return t?l`<a href=${t} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){const{privacyPolicyUrl:t}=S.state;return t?l`<a href=${t} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(t=!1){var o;return(o=this.remoteFeatures)!=null&&o.reownBranding?t?l`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:l`<wui-ux-by-reown></wui-ux-by-reown>`:null}};Te.styles=[ft];Ke([h()],Te.prototype,"remoteFeatures",void 0);Te=Ke([T("w3m-legal-footer")],Te);const gt=Le``;var bt=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let Ce=class extends x{render(){const{termsConditionsUrl:t,privacyPolicyUrl:o}=S.state;return!t&&!o?null:l`
      <wui-flex
        .padding=${["4","3","3","3"]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `}howDoesItWorkTemplate(){return l` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){F.sendEvent({type:"track",event:"SELECT_WHAT_IS_A_BUY",properties:{isSmartAccount:we(f.state.activeChain)===he.ACCOUNT_TYPES.SMART_ACCOUNT}}),u.push("WhatIsABuy")}};Ce.styles=[gt];Ce=bt([T("w3m-onramp-providers-footer")],Ce);const vt=P`
  :host {
    display: block;
  }

  div.container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    height: auto;
    display: block;
  }

  div.container[status='hide'] {
    animation: fade-out;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: 0s;
  }

  div.container[status='show'] {
    animation: fade-in;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(6px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
      filter: blur(0px);
    }
    to {
      opacity: 0;
      filter: blur(6px);
    }
  }
`;var Pe=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let ce=class extends x{constructor(){super(...arguments),this.resizeObserver=void 0,this.unsubscribe=[],this.status="hide",this.view=u.state.view}firstUpdated(){this.status=re.hasFooter()?"show":"hide",this.unsubscribe.push(u.subscribeKey("view",t=>{this.view=t,this.status=re.hasFooter()?"show":"hide",this.status==="hide"&&document.documentElement.style.setProperty("--apkt-footer-height","0px")})),this.resizeObserver=new ResizeObserver(t=>{for(const o of t)if(o.target===this.getWrapper()){const i=`${o.contentRect.height}px`;document.documentElement.style.setProperty("--apkt-footer-height",i)}}),this.resizeObserver.observe(this.getWrapper())}render(){return l`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `}templatePageContainer(){return re.hasFooter()?l` ${this.templateFooter()}`:null}templateFooter(){switch(this.view){case"Networks":return this.templateNetworksFooter();case"Connect":case"ConnectWallets":case"OnRampFiatSelect":case"OnRampTokenSelect":return l`<w3m-legal-footer></w3m-legal-footer>`;case"OnRampProviders":return l`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;default:return null}}templateNetworksFooter(){return l` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`}onNetworkHelp(){F.sendEvent({type:"track",event:"CLICK_NETWORK_HELP"}),u.push("WhatIsANetwork")}getWrapper(){var t;return(t=this.shadowRoot)==null?void 0:t.querySelector("div.container")}};ce.styles=[vt];Pe([h()],ce.prototype,"status",void 0);Pe([h()],ce.prototype,"view",void 0);ce=Pe([T("w3m-footer")],ce);const yt=P`
  :host {
    display: block;
    width: inherit;
  }
`;var Ie=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let le=class extends x{constructor(){super(),this.unsubscribe=[],this.viewState=u.state.view,this.history=u.state.history.join(","),this.unsubscribe.push(u.subscribeKey("view",()=>{this.history=u.state.history.join(","),document.documentElement.style.setProperty("--apkt-duration-dynamic","var(--apkt-durations-lg)")}))}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),document.documentElement.style.setProperty("--apkt-duration-dynamic","0s")}render(){return l`${this.templatePageContainer()}`}templatePageContainer(){return l`<w3m-router-container
      history=${this.history}
      .setView=${()=>{this.viewState=u.state.view}}
    >
      ${this.viewTemplate(this.viewState)}
    </w3m-router-container>`}viewTemplate(t){switch(t){case"AccountSettings":return l`<w3m-account-settings-view></w3m-account-settings-view>`;case"Account":return l`<w3m-account-view></w3m-account-view>`;case"AllWallets":return l`<w3m-all-wallets-view></w3m-all-wallets-view>`;case"ApproveTransaction":return l`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case"BuyInProgress":return l`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case"ChooseAccountName":return l`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case"Connect":return l`<w3m-connect-view></w3m-connect-view>`;case"Create":return l`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case"ConnectingWalletConnect":return l`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case"ConnectingWalletConnectBasic":return l`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case"ConnectingExternal":return l`<w3m-connecting-external-view></w3m-connecting-external-view>`;case"ConnectingSiwe":return l`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case"ConnectWallets":return l`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case"ConnectSocials":return l`<w3m-connect-socials-view></w3m-connect-socials-view>`;case"ConnectingSocial":return l`<w3m-connecting-social-view></w3m-connecting-social-view>`;case"DataCapture":return l`<w3m-data-capture-view></w3m-data-capture-view>`;case"DataCaptureOtpConfirm":return l`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`;case"Downloads":return l`<w3m-downloads-view></w3m-downloads-view>`;case"EmailLogin":return l`<w3m-email-login-view></w3m-email-login-view>`;case"EmailVerifyOtp":return l`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case"EmailVerifyDevice":return l`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case"GetWallet":return l`<w3m-get-wallet-view></w3m-get-wallet-view>`;case"Networks":return l`<w3m-networks-view></w3m-networks-view>`;case"SwitchNetwork":return l`<w3m-network-switch-view></w3m-network-switch-view>`;case"ProfileWallets":return l`<w3m-profile-wallets-view></w3m-profile-wallets-view>`;case"Transactions":return l`<w3m-transactions-view></w3m-transactions-view>`;case"OnRampProviders":return l`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case"OnRampTokenSelect":return l`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case"OnRampFiatSelect":return l`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case"UpgradeEmailWallet":return l`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case"UpdateEmailWallet":return l`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case"UpdateEmailPrimaryOtp":return l`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case"UpdateEmailSecondaryOtp":return l`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case"UnsupportedChain":return l`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case"Swap":return l`<w3m-swap-view></w3m-swap-view>`;case"SwapSelectToken":return l`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case"SwapPreview":return l`<w3m-swap-preview-view></w3m-swap-preview-view>`;case"WalletSend":return l`<w3m-wallet-send-view></w3m-wallet-send-view>`;case"WalletSendSelectToken":return l`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case"WalletSendPreview":return l`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case"WalletSendConfirmed":return l`<w3m-send-confirmed-view></w3m-send-confirmed-view>`;case"WhatIsABuy":return l`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case"WalletReceive":return l`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case"WalletCompatibleNetworks":return l`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case"WhatIsAWallet":return l`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case"ConnectingMultiChain":return l`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case"WhatIsANetwork":return l`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case"ConnectingFarcaster":return l`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case"SwitchActiveChain":return l`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case"RegisterAccountName":return l`<w3m-register-account-name-view></w3m-register-account-name-view>`;case"RegisterAccountNameSuccess":return l`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case"SmartSessionCreated":return l`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case"SmartSessionList":return l`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case"SIWXSignMessage":return l`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case"Pay":return l`<w3m-pay-view></w3m-pay-view>`;case"PayLoading":return l`<w3m-pay-loading-view></w3m-pay-loading-view>`;case"FundWallet":return l`<w3m-fund-wallet-view></w3m-fund-wallet-view>`;case"PayWithExchange":return l`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`;case"PayWithExchangeSelectAsset":return l`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`;default:return l`<w3m-connect-view></w3m-connect-view>`}}};le.styles=[yt];Ie([h()],le.prototype,"viewState",void 0);Ie([h()],le.prototype,"history",void 0);le=Ie([T("w3m-router")],le);const kt=P`
  :host {
    z-index: ${({tokens:e})=>e.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens:e})=>e.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      backdrop-filter ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    padding: ${({spacing:e})=>e[1]};
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    transition-delay: ${({durations:e})=>e.md};
    will-change: box-shadow;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:e})=>e.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      w3m-shake ${({durations:e})=>e.xl}
        ${({easings:e})=>e["ease-out-power-2"]};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    wui-flex {
      align-items: flex-end;
    }

    wui-card {
      max-width: 100%;
      border-bottom-left-radius: var(--local-border-bottom-mobile-radius);
      border-bottom-right-radius: var(--local-border-bottom-mobile-radius);
      border-bottom: none;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings:e})=>e["ease-out-power-2"]};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
  }
`;var j=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};const Ne="scroll-lock";class B extends x{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=S.state.enableEmbedded,this.open=W.state.open,this.caipAddress=f.state.activeCaipAddress,this.caipNetwork=f.state.activeCaipNetwork,this.shake=W.state.shake,this.filterByNamespace=ve.state.filterByNamespace,this.initializeTheming(),pe.prefetchAnalyticsConfig(),this.unsubscribe.push(W.subscribeKey("open",t=>t?this.onOpen():this.onClose()),W.subscribeKey("shake",t=>this.shake=t),f.subscribeKey("activeCaipNetwork",t=>this.onNewNetwork(t)),f.subscribeKey("activeCaipAddress",t=>this.onNewAddress(t)),S.subscribeKey("enableEmbedded",t=>this.enableEmbedded=t),ve.subscribeKey("filterByNamespace",t=>{var o;this.filterByNamespace!==t&&!((o=f.getAccountData(t))!=null&&o.caipAddress)&&(pe.fetchRecommendedWallets(),this.filterByNamespace=t)}),u.subscribeKey("view",()=>{this.dataset.border=re.hasFooter()?"true":"false"}))}firstUpdated(){if(this.dataset.border=re.hasFooter()?"true":"false",this.caipAddress){if(this.enableEmbedded){W.close(),this.prefetch();return}this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),this.onRemoveKeyboardListener()}render(){return this.style.cssText=`
      --local-border-bottom-mobile-radius: ${this.enableEmbedded?"clamp(0px, var(--apkt-borderRadius-8), 44px)":"0px"};
    `,this.enableEmbedded?l`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?l`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return l` <wui-card
      shake="${this.shake}"
      data-embedded="${Y(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(t){t.target===t.currentTarget&&await this.handleClose()}async handleClose(){await je.safeClose()}initializeTheming(){const{themeVariables:t,themeMode:o}=qe.state,i=Me.getColorTheme(o);Qe(t,i)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),v.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const t=document.createElement("style");t.dataset.w3m=Ne,t.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(t)}onScrollUnlock(){const t=document.head.querySelector(`style[data-w3m="${Ne}"]`);t&&t.remove()}onAddKeyboardListener(){var o;this.abortController=new AbortController;const t=(o=this.shadowRoot)==null?void 0:o.querySelector("wui-card");t==null||t.focus(),window.addEventListener("keydown",i=>{if(i.key==="Escape")this.handleClose();else if(i.key==="Tab"){const{tagName:a}=i.target;a&&!a.includes("W3M-")&&!a.includes("WUI-")&&(t==null||t.focus())}},this.abortController)}onRemoveKeyboardListener(){var t;(t=this.abortController)==null||t.abort(),this.abortController=void 0}async onNewAddress(t){const o=f.state.isSwitchingNamespace,i=u.state.view==="ProfileWallets";t?await this.onConnected({caipAddress:t,isSwitchingNamespace:o,isInProfileView:i}):!o&&!this.enableEmbedded&&!i&&W.close(),await ge.initializeIfEnabled(t),this.caipAddress=t,f.setIsSwitchingNamespace(!1)}async onConnected(t){if(t.isInProfileView)return;const{chainNamespace:o,chainId:i,address:a}=Ze.parseCaipAddress(t.caipAddress),n=`${o}:${i}`,s=!fe.getPlainAddress(this.caipAddress),c=await ge.getSessions({address:a,caipNetworkId:n}),p=ge.getSIWX()?c.some(C=>C.data.accountAddress===a):!0,w=t.isSwitchingNamespace&&p&&!this.enableEmbedded,g=this.enableEmbedded&&s;w?u.goBack():g&&W.close()}onNewNetwork(t){var J,Q,y;const o=this.caipNetwork,i=(J=o==null?void 0:o.caipNetworkId)==null?void 0:J.toString(),a=o==null?void 0:o.chainNamespace,n=(Q=t==null?void 0:t.caipNetworkId)==null?void 0:Q.toString(),s=t==null?void 0:t.chainNamespace,c=i!==n,w=c&&!(a!==s),g=(o==null?void 0:o.name)===O.UNSUPPORTED_NETWORK_NAME,C=u.state.view==="ConnectingExternal",I=u.state.view==="ProfileWallets",H=!((y=f.getAccountData(t==null?void 0:t.chainNamespace))!=null&&y.caipAddress),V=u.state.view==="UnsupportedChain",K=W.state.open;let U=!1;this.enableEmbedded&&u.state.view==="SwitchNetwork"&&(U=!0),c&&d.resetState(),K&&!C&&!I&&(H?c&&(U=!0):(V||w&&!g)&&(U=!0)),U&&u.state.view!=="SIWXSignMessage"&&u.goBack(),this.caipNetwork=t}prefetch(){this.hasPrefetched||(pe.prefetch(),pe.fetchWalletsByPage({page:1}),this.hasPrefetched=!0)}}B.styles=kt;j([m({type:Boolean})],B.prototype,"enableEmbedded",void 0);j([h()],B.prototype,"open",void 0);j([h()],B.prototype,"caipAddress",void 0);j([h()],B.prototype,"caipNetwork",void 0);j([h()],B.prototype,"shake",void 0);j([h()],B.prototype,"filterByNamespace",void 0);let Oe=class extends B{};Oe=j([T("w3m-modal")],Oe);let Re=class extends B{};Re=j([T("appkit-modal")],Re);const Tt=P`
  :host {
    width: 100%;
  }
`;var $=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let k=class extends x{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc="",this.name="",this.size="md",this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor="accent-100",this.rdnsId="",this.walletRank=void 0}connectedCallback(){super.connectedCallback(),this.setupIntersectionObserver()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(t){if(super.updated(t),(t.has("name")||t.has("imageSrc"))&&(this.hasImpressionSent=!1),t.has("loading")&&!this.loading&&this.intersectionObserver){const o=this.intersectionObserver.takeRecords().find(i=>i.target===this);o&&o.isIntersecting&&!this.hasImpressionSent&&this.sendImpressionEvent()}}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(t=>{t.forEach(o=>{o.isIntersecting&&!this.loading&&!this.hasImpressionSent&&this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=void 0)}sendImpressionEvent(){!this.name||this.hasImpressionSent||(this.hasImpressionSent=!0,this.rdnsId&&F.sendEvent({type:"track",event:"WALLET_IMPRESSION",properties:{name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:u.state.view}}))}render(){return l`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${Y(this.imageSrc)}
        name=${this.name}
        size=${Y(this.size)}
        tagLabel=${Y(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
      ></wui-list-wallet>
    `}};k.styles=Tt;$([m({type:Array})],k.prototype,"walletImages",void 0);$([m()],k.prototype,"imageSrc",void 0);$([m()],k.prototype,"name",void 0);$([m()],k.prototype,"size",void 0);$([m()],k.prototype,"tagLabel",void 0);$([m()],k.prototype,"tagVariant",void 0);$([m()],k.prototype,"walletIcon",void 0);$([m()],k.prototype,"tabIdx",void 0);$([m({type:Boolean})],k.prototype,"disabled",void 0);$([m({type:Boolean})],k.prototype,"showAllWallets",void 0);$([m({type:Boolean})],k.prototype,"loading",void 0);$([m({type:String})],k.prototype,"loadingSpinnerColor",void 0);$([m()],k.prototype,"rdnsId",void 0);$([m()],k.prototype,"walletRank",void 0);k=$([T("w3m-list-wallet")],k);const St=P`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations:e})=>e.lg};
    --local-transition: ${({easings:e})=>e["ease-out-power-2"]};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`;var D=function(e,t,o,i){var a=arguments.length,n=a<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,o):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(n=(a<3?s(n):a>3?s(t,o,n):s(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let N=class extends x{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration="0.15s",this.transitionFunction="",this.history="",this.view="",this.setView=void 0,this.viewDirection="",this.historyState="",this.previousHeight="0px"}updated(t){if(t.has("history")){const o=this.history;this.historyState!==""&&this.historyState!==o&&this.onViewChange(o)}t.has("transitionDuration")&&this.style.setProperty("--local-duration",this.transitionDuration),t.has("transitionFunction")&&this.style.setProperty("--local-transition",this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty("--local-transition",this.transitionFunction),this.style.setProperty("--local-duration",this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(t=>{for(const o of t)if(o.target===this.getWrapper()){let i=o.contentRect.height;const a=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0");i=i+a,this.style.setProperty("--local-border-bottom-radius",a?"var(--apkt-borderRadius-5)":"0px"),this.style.setProperty("--local-container-height",`${i}px`),this.previousHeight!=="0px"&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${i}px`}}),this.resizeObserver.observe(this.getWrapper())}disconnectedCallback(){const t=this.getWrapper();t&&this.resizeObserver&&this.resizeObserver.unobserve(t)}render(){return l`
      <div class="container">
        <div class="page" view-direction="${this.viewDirection}">
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(t){const o=t.split(",").filter(Boolean),i=this.historyState.split(",").filter(Boolean),a=i.length,n=o.length,s=o[o.length-1]||"",c=Me.cssDurationToNumber(this.transitionDuration);let p="";n>a?p="next":n<a?p="prev":n===a&&o[n-1]!==i[a-1]&&(p="next"),this.viewDirection=`${p}-${s}`,setTimeout(()=>{var w;this.historyState=t,(w=this.setView)==null||w.call(this,s)},c),setTimeout(()=>{this.viewDirection=""},c*2)}getWrapper(){var t;return(t=this.shadowRoot)==null?void 0:t.querySelector("div.page")}};N.styles=[St];D([m({type:String})],N.prototype,"transitionDuration",void 0);D([m({type:String})],N.prototype,"transitionFunction",void 0);D([m({type:String})],N.prototype,"history",void 0);D([m({type:String})],N.prototype,"view",void 0);D([m({attribute:!1})],N.prototype,"setView",void 0);D([h()],N.prototype,"viewDirection",void 0);D([h()],N.prototype,"historyState",void 0);D([h()],N.prototype,"previousHeight",void 0);N=D([T("w3m-router-container")],N);export{Re as AppKitModal,k as W3mListWallet,Oe as W3mModal,B as W3mModalBase,N as W3mRouterContainer};
