(() => {
  const bar = document.getElementById('tickerWrap');
  const run = document.getElementById('tickerRun');
  const latest = (window.NEWS || []).slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,6);
  if (!latest.length) {
    document.documentElement.style.setProperty('--tk', '0px');
    return;
  }
  for (let copy = 0; copy < 2; copy++) {
    for (const item of latest) {
      const link = document.createElement('a');
      link.href = bar.dataset.home + '#news-' + encodeURIComponent(item.id);
      link.textContent = item.title;
      if (!bar.dataset.home) link.dataset.open = item.id;
      if (bar.hasAttribute('data-editor')) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      if (copy) {
        link.tabIndex = -1;
        link.setAttribute('aria-hidden', 'true');
      }
      run.append(link);
    }
  }
  bar.hidden = false;
})();

/* إغلاق القائمة المنسدلة عند النقر في أي مكان خارجها */
document.addEventListener("click",function(e){
  var nav=document.getElementById("nav"),b=document.getElementById("burger");
  if(!nav||!nav.classList.contains("open"))return;
  if(e.target.closest("#nav")||e.target.closest("#burger"))return;
  nav.classList.remove("open");
  if(b)b.setAttribute("aria-expanded","false");
});
