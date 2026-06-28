(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new Intl.DateTimeFormat(`en-IN`,{month:`long`,year:`numeric`}),t=new Intl.DateTimeFormat(`en-IN`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`}),n=[`S`,`M`,`T`,`W`,`T`,`F`,`S`];function r(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function i(){let e=new Date;return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function a(e,t){return new Date(e,t+1,0).getDate()}function o(e,t,n){let r=a(e,t);return new Date(e,t,Math.min(n,r))}function s(e,t){return o(e.getFullYear(),e.getMonth()+t,e.getDate())}function c(e,t){return o(e.getFullYear()+t,e.getMonth(),e.getDate())}function l(e){let t=e.getFullYear(),n=e.getMonth(),r=new Date(t,n,1).getDay(),i=a(t,n),o=[];for(let e=0;e<r;e+=1)o.push(null);for(let e=1;e<=i;e+=1)o.push(new Date(t,n,e));for(;o.length%7!=0;)o.push(null);return o}var u=`./data/messages.json`,d=`https://docs.google.com/spreadsheets/d/e/2PACX-1vS11BNTNc_RzdXUDLU_PZlSO5vf-2Acgct3N8bUVZJIsr08acmAldID_JgrR8x8nSlroFwwLJ6WQJo7/pub?output=csv`;async function f(){let e=await p();try{let t=await m(d);return v([...e,...t])}catch(t){return console.warn(`Google Sheet data unavailable. Falling back to local JSON.`,t),v(e)}}async function p(){let e=await fetch(h(u),{cache:`no-store`,headers:{"Cache-Control":`no-cache`}});if(!e.ok)throw Error(`Unable to load local messages.json`);let t=await e.json();return Array.isArray(t)?t:[]}async function m(e){let t=h(e),n=await fetch(t,{cache:`no-store`,headers:{"Cache-Control":`no-cache`}});if(!n.ok)throw Error(`Unable to load Google Sheet CSV`);return g(await n.text())}function h(e){return`${e}${e.includes(`?`)?`&`:`?`}v=${Date.now()}`}function g(e){let t=_(e.trim());if(!t.length)return[];let n=t[0].map(e=>e.trim().toLowerCase()),r=n.indexOf(`date`),i=n.indexOf(`message`);if(r===-1||i===-1)throw Error(`Google Sheet CSV must contain date and message columns`);return t.slice(1).map(e=>({date:e[r],message:e[i]}))}function _(e){let t=[],n=[],r=``,i=!1;for(let a=0;a<e.length;a+=1){let o=e[a],s=e[a+1];o===`"`&&i&&s===`"`?(r+=`"`,a+=1):o===`"`?i=!i:o===`,`&&!i?(n.push(r),r=``):(o===`
`||o===`\r`)&&!i?(o===`\r`&&s===`
`&&(a+=1),n.push(r),t.push(n),n=[],r=``):r+=o}return n.push(r),t.push(n),t.filter(e=>e.some(e=>e.trim()))}function v(e){let t=new Map;for(let n of e){if(!n||typeof n.message!=`string`)continue;let e=y(n.date),r=n.message.trim();!e||!r||t.set(e,r)}return t}function y(e){if(!e)return null;let t=String(e).trim();if(/^\d{4}-\d{2}-\d{2}$/.test(t))return t;let n=t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);if(!n)return null;let r=n[1].padStart(2,`0`),i=n[2].padStart(2,`0`);return`${n[3].length===2?`20${n[3]}`:n[3]}-${i}-${r}`}var b=`No wisdom message available for this date.`;function x(e){let t={selectedDate:i(),displayDate:i(),messages:new Map,favorites:A(),isLoading:!0,isDark:localStorage.getItem(`aka-theme`)===`dark`};e.innerHTML=S();let n=C(e);M(t.isDark),w(n,t),E(n,t),f().then(e=>{t.messages=e}).catch(()=>P(n,`Could not load messages. Showing empty state.`)).finally(()=>{t.isLoading=!1,E(n,t)})}function S(){return`
    <main class="app-shell" aria-label="Anant Ki Aur daily satsang wisdom">
      <section class="phone-frame">
        <header class="hero">
          <button class="icon-button theme-toggle" type="button" aria-label="Toggle dark mode">☾</button>
          <div class="om-mark" aria-hidden="true">ॐ</div>
            <div class="brand-copy">
            <h1>अनन्त की ओर</h1>
            <p class="subtitle">गुरु अनुग्रह की उच्छेष्टि प्रसादी</p>
            <p class="guru-name">परम पूज्य</p>
            <p class="guru-title">स्वामी अवधेशानंद गिरि जी महाराज</p>
            </div>
        </header>

        <section class="message-card" aria-live="polite">
          <div class="date-line skeleton-target"></div>
          <blockquote class="message-text skeleton-target"></blockquote>
          <div class="message-actions" aria-label="Message actions">
            <button class="pill-button today-button" type="button">Today</button>
            <button class="pill-button random-button" type="button">Random</button>
            <button class="pill-button favorite-button" type="button" aria-pressed="false">♡</button>
            <button class="pill-button copy-button" type="button">Copy</button>
            <button class="pill-button share-button" type="button">Share</button>
          </div>
        </section>

        <section class="calendar-panel" aria-label="Calendar">
          <div class="calendar-toolbar">
            <button class="nav-button prev-year" type="button" aria-label="Previous year">«</button>
            <button class="nav-button prev-month" type="button" aria-label="Previous month">‹</button>
            <button class="month-title" type="button" aria-label="Current month and year"></button>
            <button class="nav-button next-month" type="button" aria-label="Next month">›</button>
            <button class="nav-button next-year" type="button" aria-label="Next year">»</button>
          </div>

          <label class="year-jump">
            <span>Year</span>
            <input class="year-input" type="number" min="1900" max="2200" inputmode="numeric" aria-label="Jump to year" />
          </label>

          <div class="weekday-row" aria-hidden="true"></div>
          <div class="calendar-grid" role="grid" aria-label="Monthly calendar"></div>
        </section>

        <footer>ॐ तत् सत्</footer>
        <div class="toast" role="status" aria-live="polite"></div>
      </section>
    </main>
  `}function C(e){return{root:e,dateLine:e.querySelector(`.date-line`),messageText:e.querySelector(`.message-text`),calendarGrid:e.querySelector(`.calendar-grid`),weekdayRow:e.querySelector(`.weekday-row`),monthTitle:e.querySelector(`.month-title`),yearInput:e.querySelector(`.year-input`),prevMonth:e.querySelector(`.prev-month`),nextMonth:e.querySelector(`.next-month`),prevYear:e.querySelector(`.prev-year`),nextYear:e.querySelector(`.next-year`),todayButton:e.querySelector(`.today-button`),randomButton:e.querySelector(`.random-button`),favoriteButton:e.querySelector(`.favorite-button`),copyButton:e.querySelector(`.copy-button`),shareButton:e.querySelector(`.share-button`),themeToggle:e.querySelector(`.theme-toggle`),toast:e.querySelector(`.toast`)}}function w(e,t){e.prevMonth.addEventListener(`click`,()=>T(e,t,s(t.selectedDate,-1))),e.nextMonth.addEventListener(`click`,()=>T(e,t,s(t.selectedDate,1))),e.prevYear.addEventListener(`click`,()=>T(e,t,c(t.selectedDate,-1))),e.nextYear.addEventListener(`click`,()=>T(e,t,c(t.selectedDate,1))),e.todayButton.addEventListener(`click`,()=>T(e,t,i())),e.yearInput.addEventListener(`change`,()=>{let n=Number(e.yearInput.value);if(!Number.isInteger(n)||n<1900||n>2200){P(e,`Please enter a year between 1900 and 2200.`),e.yearInput.value=t.selectedDate.getFullYear();return}T(e,t,o(n,t.selectedDate.getMonth(),t.selectedDate.getDate()))}),e.randomButton.addEventListener(`click`,()=>{let n=[...t.messages.keys()];if(!n.length){P(e,`No messages available yet.`);return}let[r,i,a]=n[Math.floor(Math.random()*n.length)].split(`-`).map(Number);T(e,t,new Date(r,i-1,a))}),e.favoriteButton.addEventListener(`click`,()=>{let n=r(t.selectedDate);t.favorites.has(n)?(t.favorites.delete(n),P(e,`Removed from favorites.`)):(t.favorites.add(n),P(e,`Added to favorites.`)),j(t.favorites),E(e,t)}),e.copyButton.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(k(t)),P(e,`Wisdom copied.`)}catch{P(e,`Copy is not available on this device.`)}}),e.shareButton.addEventListener(`click`,async()=>{let n=k(t);try{navigator.share?await navigator.share({title:`Anant Ki Aur`,text:n}):(await navigator.clipboard.writeText(n),P(e,`Sharing not available. Wisdom copied instead.`))}catch{P(e,`Sharing was cancelled.`)}}),e.themeToggle.addEventListener(`click`,()=>{t.isDark=!t.isDark,localStorage.setItem(`aka-theme`,t.isDark?`dark`:`light`),M(t.isDark),E(e,t)})}function T(e,t,n){t.selectedDate=n,t.displayDate=n,E(e,t,!0)}function E(n,i,a=!1){let o=r(i.selectedDate),s=i.messages.get(o)||b;n.root.classList.toggle(`is-loading`,i.isLoading),n.root.classList.toggle(`is-animating`,a),n.dateLine.textContent=t.format(i.selectedDate),n.messageText.textContent=i.isLoading?``:s,n.monthTitle.textContent=e.format(i.displayDate),n.yearInput.value=i.selectedDate.getFullYear();let c=i.favorites.has(o);n.favoriteButton.textContent=c?`♥`:`♡`,n.favoriteButton.setAttribute(`aria-pressed`,String(c)),n.favoriteButton.setAttribute(`aria-label`,c?`Remove from favorites`:`Add to favorites`),n.themeToggle.textContent=i.isDark?`☀`:`☾`,D(n),O(n,i),a&&window.setTimeout(()=>n.root.classList.remove(`is-animating`),180)}function D(e){e.weekdayRow.children.length||(e.weekdayRow.innerHTML=n.map(e=>`<span>${e}</span>`).join(``))}function O(e,n){let a=r(i()),o=r(n.selectedDate),s=l(n.displayDate);e.calendarGrid.innerHTML=s.map(e=>{if(!e)return`<span class="calendar-empty" aria-hidden="true"></span>`;let i=r(e),s=n.messages.has(i),c=i===o,l=i===a,u=n.favorites.has(i);return`
        <button
          class="day-button ${c?`selected`:``} ${l?`today`:``} ${s?`has-message`:``} ${u?`favorite`:``}"
          type="button"
          data-date="${i}"
          role="gridcell"
          aria-selected="${c}"
          aria-label="${t.format(e)}${s?`, message available`:`, no message available`}"
          aria-current="${l?`date`:`false`}"
        >
          <span>${e.getDate()}</span>
        </button>
      `}).join(``),e.calendarGrid.querySelectorAll(`[data-date]`).forEach(t=>{t.addEventListener(`click`,()=>{let[r,i,a]=t.dataset.date.split(`-`).map(Number);T(e,n,new Date(r,i-1,a))})})}function k(e){let n=r(e.selectedDate),i=e.messages.get(n)||b;return`${t.format(e.selectedDate)}\n\n${i}\n\nॐ तत् सत्\nAnant Ki Aur`}function A(){try{return new Set(JSON.parse(localStorage.getItem(`aka-favorites`)||`[]`))}catch{return new Set}}function j(e){localStorage.setItem(`aka-favorites`,JSON.stringify([...e]))}function M(e){document.documentElement.dataset.theme=e?`dark`:`light`}var N;function P(e,t){window.clearTimeout(N),e.toast.textContent=t,e.toast.classList.add(`visible`),N=window.setTimeout(()=>e.toast.classList.remove(`visible`),2200)}x(document.querySelector(`#app`)),`serviceWorker`in navigator&&window.addEventListener(`load`,async()=>{try{let e=await navigator.serviceWorker.register(`./sw.js`);e.update(),e.waiting&&e.waiting.postMessage({type:`SKIP_WAITING`})}catch(e){console.warn(`Service worker registration failed:`,e)}});