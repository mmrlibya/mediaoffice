/* نافذة عرض الفيديو: تفتح فيديو واحداً فقط، وإغلاقها يوقف التشغيل */
(function(){
  var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[m]})};
  var box=document.createElement("div");
  box.className="modal vmodal";box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");
  box.innerHTML='<div class="m-box vm-box"></div>';
  document.body.appendChild(box);
  var inner=box.firstChild,lastFocus=null;
  function src(u){return "https://www.facebook.com/plugins/video.php?href="+encodeURIComponent(u)+"&show_text=false&width=1000&autoplay=true"}
  function open(card){
    var d=card.dataset;lastFocus=document.activeElement;
    inner.innerHTML='<button class="m-close" aria-label="إغلاق">×</button>'+
      '<div class="fbv'+(d.vertical==="1"?' vert':'')+'"><iframe src="'+src(d.url)+'" title="'+esc(d.title)+'" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen scrolling="no" frameborder="0"></iframe></div>'+
      '<div class="m-body"><h3>'+esc(d.title)+'</h3>'+(d.dateText?'<div class="meta"><span class="calendar-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7.5 3v4M16.5 3v4M3 10h18M8 15h3"/></svg></span> '+esc(d.dateText)+'</div>':'')+
      '<a class="vlink" href="'+esc(d.url)+'" target="_blank" rel="noopener">فتح على فيسبوك ↗</a></div>';
    box.classList.add("open");document.body.style.overflow="hidden";
    var c=inner.querySelector(".m-close");c&&c.focus();
  }
  function close(){
    if(!box.classList.contains("open"))return;
    box.classList.remove("open");inner.innerHTML=""; /* حذف الإطار يوقف الفيديو فوراً */
    document.body.style.overflow="";
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  document.addEventListener("click",function(e){
    var c=e.target.closest&&e.target.closest(".vcard[data-url]");
    if(c&&!e.target.closest("a")){e.preventDefault();open(c);return}
    if(e.target.closest&&e.target.closest(".vmodal .m-close")||e.target===box)close();
  });
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape")close();
    if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("vcard")&&e.target.dataset.url)open(e.target);
  });
})();
