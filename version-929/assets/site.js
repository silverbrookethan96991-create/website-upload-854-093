(function(){
function ready(fn){document.readyState!=="loading"?fn():document.addEventListener("DOMContentLoaded",fn)}
ready(function(){
  var toggle=document.querySelector("[data-menu-toggle]");
  var menu=document.querySelector("[data-mobile-menu]");
  if(toggle&&menu){toggle.addEventListener("click",function(){menu.classList.toggle("is-open")})}
  var slides=[].slice.call(document.querySelectorAll(".hero-slide"));
  var dots=[].slice.call(document.querySelectorAll(".hero-dot"));
  var current=0;
  function show(i){if(!slides.length)return;current=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle("is-active",n===current)});dots.forEach(function(d,n){d.classList.toggle("is-active",n===current)})}
  dots.forEach(function(d,i){d.addEventListener("click",function(){show(i)})});
  var prev=document.querySelector("[data-hero-prev]");
  var next=document.querySelector("[data-hero-next]");
  if(prev)prev.addEventListener("click",function(){show(current-1)});
  if(next)next.addEventListener("click",function(){show(current+1)});
  if(slides.length>1){setInterval(function(){show(current+1)},5200)}
  var filterInput=document.querySelector("[data-filter-input]");
  var chips=[].slice.call(document.querySelectorAll("[data-filter-chip]"));
  var items=[].slice.call(document.querySelectorAll(".filter-item"));
  var empty=document.querySelector("[data-empty]");
  var active="all";
  function applyFilter(){
    var q=filterInput?filterInput.value.trim().toLowerCase():"";
    var shown=0;
    items.forEach(function(item){
      var text=[item.dataset.title,item.dataset.year,item.dataset.region,item.dataset.category,item.dataset.tags,item.textContent].join(" ").toLowerCase();
      var chipOk=active==="all"||text.indexOf(active.toLowerCase())>-1;
      var qOk=!q||text.indexOf(q)>-1;
      var ok=chipOk&&qOk;
      item.style.display=ok?"":"none";
      if(ok)shown++;
    });
    if(empty)empty.style.display=shown?"none":"block";
  }
  if(filterInput)filterInput.addEventListener("input",applyFilter);
  chips.forEach(function(chip){chip.addEventListener("click",function(){chips.forEach(function(c){c.classList.remove("is-active")});chip.classList.add("is-active");active=chip.getAttribute("data-filter-chip")||"all";applyFilter()})});
  if(filterInput||chips.length)applyFilter();
  if(window.SEARCH_DATA){
    var params=new URLSearchParams(location.search);
    var box=document.querySelector("[data-search-box]");
    var result=document.querySelector("[data-search-results]");
    var q=params.get("q")||"";
    if(box)box.value=q;
    function render(){
      if(!result)return;
      var term=(box?box.value:q).trim().toLowerCase();
      var rows=window.SEARCH_DATA.filter(function(m){return !term||[m.t,m.y,m.r,m.g,m.c].join(" ").toLowerCase().indexOf(term)>-1}).slice(0,240);
      result.innerHTML=rows.map(function(m){return '<article class="movie-card"><a class="poster" href="'+m.u+'"><img src="./'+m.i+'.jpg" alt="'+escapeHtml(m.t)+'" loading="lazy"></a><div class="movie-info"><div class="movie-meta"><span>'+escapeHtml(m.y)+'</span><span>'+escapeHtml(m.r)+'</span><span>'+escapeHtml(m.c)+'</span></div><h3><a href="'+m.u+'">'+escapeHtml(m.t)+'</a></h3><p>'+escapeHtml(m.o)+'</p><div class="tag-row"><span>'+escapeHtml(m.g)+'</span></div></div></article>'}).join("");
      var empty=document.querySelector("[data-search-empty]");
      if(empty)empty.style.display=rows.length?"none":"block";
    }
    if(box)box.addEventListener("input",render);
    render();
  }
});
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
window.initMoviePlayer=function(videoId,buttonId,src){
  var video=document.getElementById(videoId);
  var button=document.getElementById(buttonId);
  if(!video)return;
  var attached=false;
  function attach(){
    if(attached)return;
    attached=true;
    if(video.canPlayType("application/vnd.apple.mpegurl")){
      video.src=src;
    }else if(window.Hls&&window.Hls.isSupported()){
      var hls=new window.Hls({enableWorker:true,lowLatencyMode:true});
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls=hls;
    }else{
      video.src=src;
    }
  }
  function start(){
    attach();
    if(button)button.classList.add("is-hidden");
    var play=video.play();
    if(play&&play.catch)play.catch(function(){});
  }
  if(button)button.addEventListener("click",start);
  video.addEventListener("click",function(){if(!attached)start()});
  video.addEventListener("play",function(){if(button)button.classList.add("is-hidden")});
};
})();