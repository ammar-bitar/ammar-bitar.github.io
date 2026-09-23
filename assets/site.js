/* Shared by every page: theme switch and the floating contact button. */

(function(){
  var root=document.documentElement, btn=document.getElementById('themeBtn');
  var tc=document.querySelector('meta[name="theme-color"]');
  function current(){return root.dataset.theme==='light'?'light':'dark'}
  function sync(){
    var dark=current()==='dark';
    btn.setAttribute('aria-checked',dark?'true':'false');
    if(tc) tc.setAttribute('content',dark?'#0E151B':'#ECEFF1');
  }
  sync();
  btn.addEventListener('click',function(){var n=current()==='dark'?'light':'dark';root.dataset.theme=n;try{localStorage.setItem('theme',n)}catch(e){}sync();window.dispatchEvent(new Event('themechange'))});
})();

(function(){
  var fab=document.getElementById('fab'), btn=document.getElementById('fabBtn'), links=document.getElementById('fabLinks');
  if(!fab) return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function open(v){ fab.dataset.open=v?'true':'false'; btn.setAttribute('aria-expanded',v?'true':'false'); }
  btn.addEventListener('click',function(e){ e.stopPropagation(); open(fab.dataset.open!=='true'); burst(18); });
  document.addEventListener('click',function(e){ if(!fab.contains(e.target)) open(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') open(false); });
  fab.addEventListener('mouseenter',function(){ if(!reduce) burst(8); });

  /* the button sheds ON/OFF events when it moves, like everything else here */
  var c=document.getElementById('fabSpark'), x=c&&c.getContext('2d'), evs=[], raf=0;
  function colors(){var cs=getComputedStyle(document.documentElement);return[cs.getPropertyValue('--on').trim(),cs.getPropertyValue('--off').trim()]}
  function burst(n){
    if(!x||reduce) return;
    var r=c.width, b=c.height;
    for(var i=0;i<n;i++){
      var a=Math.PI*(0.75+Math.random()*0.9), s=1.2+Math.random()*3.4;
      evs.push({x:r-60+Math.random()*26,y:b-40+Math.random()*16,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.1,p:Math.random()<.5?0:1,e:1});
    }
    if(!raf) raf=requestAnimationFrame(tick);
  }
  function tick(){
    var cl=colors(); x.clearRect(0,0,c.width,c.height);
    for(var i=evs.length-1;i>=0;i--){
      var e=evs[i]; e.x+=e.vx; e.y+=e.vy; e.vy+=0.11; e.e*=0.955;
      if(e.e<0.06||e.y>c.height+20){ evs.splice(i,1); continue; }
      x.globalAlpha=e.e; x.fillStyle=cl[e.p]; x.fillRect(e.x,e.y,5,5);
    }
    x.globalAlpha=1;
    raf = evs.length ? requestAnimationFrame(tick) : 0;
  }
  var lastY=window.scrollY, acc=0;
  window.addEventListener('scroll',function(){
    var dy=Math.abs(window.scrollY-lastY); lastY=window.scrollY; acc+=dy;
    if(acc>900){ acc=0; burst(6); }
  },{passive:true});

  /* stay off the first screen, which already has the nav's Contact link,
     and step aside once the real contact section is on screen */
  var away={}, watch={top:document.querySelector('.hero, .cs-head'), contact:document.getElementById('contact')};
  if('IntersectionObserver' in window){
    Object.keys(watch).forEach(function(k){
      if(!watch[k]) return;
      new IntersectionObserver(function(es){
        away[k]=es[0].isIntersecting;
        var t=away.top||away.contact;
        fab.classList.toggle('tucked',t);
        if(t) open(false);
      },{threshold:k==='contact'?.25:0}).observe(watch[k]);
    });
  }
})();
