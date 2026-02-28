
// Update the Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

//  ================= ScrollSpy 滚动监测 ================= //   

//  ---------------- Initialization  ---------------- //  

// Access all the Navbar link
const links = Array.from(document.querySelectorAll(".navlink")); 

// Access the corresponding Section DOM
const sections = links
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

// Access the top bar 
const topbar = document.querySelector(".topbar"); 

// Access the brand
const brand = document.querySelector(".topbar__brand");

// lockId: State Vairable, Highlighting locked or not
let lockId = null;


//  ---------------- Core Functions ---------------- //   


// Function: Hightlighting Setting function 高亮设置
// Input: section id; Output: if id matches with navlink, set the section active
function setActive(id){
  links.forEach(a => {
    a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
    // Toogle 函数：根据Boolean值强制添加或移除元素
  });
}

// Access topnar height
function getTopbarH(){
  return topbar ? topbar.offsetHeight : 0;
}

// Function: Current Section Tracking 当前section追踪高亮
function onScroll(){
  if (lockId) return;  // Return If Highlighting locked 
  // Setting the thereshold 更新界限
  const y = window.scrollY + getTopbarH() + 12;  // Current scroll-down pxs = 当前窗口距网页顶端距离 + Topbar高度 + buffer

  // Current highliting id (default first section)
  let current = sections[0]?.id;
  
  // Decision Rule: 若当前section距网页顶部距离小于 y, 则切换高亮
  for (const sec of sections){
    if (sec.offsetTop <= y) current = sec.id;
  }
  // Set Highlighting
  if (current) setActive(current);
}

// Function: Unlock and Update Highlighting after scrolling 刷新高亮
function unlockFromUserAction(){
  if (!lockId) return;
  lockId = null;
  onScroll(); // 解锁后立即按当前位置刷新一次高亮
}


// ---------------- Event Binding & User Interaction ---------------- // 
setActive("");

// requestAnimationFrame 防抖滚动监听
let ticking = false;
// listen to "scroll"
window.addEventListener("scroll", () => { // addEventListener函数: 第一个参数为监听事件类型，第二个为执行函数
  if (!ticking){
    window.requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// listen to "web update"
window.addEventListener("resize", onScroll);


// Highlighting-Locked after click 点击锁定高亮
links.forEach(a => {
  // Listen to "click" for each navlink
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) return;  // Filter: href D.N.E or format not corret
    
    e.preventDefault(); // 阻止默认跳转

    const id = href.slice(1); // Get section id from format "href=#section1"
    const el = document.getElementById(id); // Locate the corresponding element
    if (!el) return;

    // Highlight and lock
    setActive(id); 
    lockId = id;

    // Move to target smoothly
    const offset = getTopbarH() + 12;
    const targetY = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  });
});

// Back to top (Like home page)
brand.addEventListener("click", function(e){
  e.preventDefault();   // 阻止默认行为

  lockId = "__brand__"; // Unlock
  window.scrollTo({ top: 0, behavior: "smooth" });  // Scroll to top
  setActive("");  // Cancel all highlights
});



// Listen to keyboard, touchboarch, wheel etc.
window.addEventListener("wheel", unlockFromUserAction, { passive: true });
window.addEventListener("touchmove", unlockFromUserAction, { passive: true });

window.addEventListener("keydown", (e) => {
  const keys = ["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "];
  if (keys.includes(e.key)) unlockFromUserAction();
});