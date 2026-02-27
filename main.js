
// 年份
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- ScrollSpy（稳定版：scrollY 判定） ----------
const links = Array.from(document.querySelectorAll(".navlink"));
const sections = links
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const topbar = document.querySelector(".topbar");

// 点击导航后锁定高亮：直到用户下一次手动滚动或再次点击
let lockId = null;

// 设置高亮
function setActive(id){
  links.forEach(a => {
    a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
  });
}

// 获取 topbar 高度（如果你已用 scroll-margin-top，也可以不用，但保留更稳）
function getTopbarH(){
  return topbar ? topbar.offsetHeight : 0;
}

// 根据滚动位置确定当前 section（锁定期间不更新）
function onScroll(){
  if (lockId) return; // 点击后锁定：不随滚动变化
  const y = window.scrollY + getTopbarH() + 12;
  let current = sections[0]?.id;

  for (const sec of sections){
    if (sec.offsetTop <= y) current = sec.id;
  }
  if (current) setActive(current);
}

// requestAnimationFrame 防抖滚动监听
let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking){
    window.requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

window.addEventListener("load", onScroll);
window.addEventListener("resize", onScroll);

// ---------- 点击导航：立即高亮 + 锁定（不会在滚动途中变化） ----------
links.forEach(a => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    e.preventDefault();

    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    // 立刻高亮并锁定
    setActive(id);
    lockId = id;

    // 平滑滚动到目标（考虑 topbar）
    const offset = getTopbarH() + 12;
    const targetY = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  });
});

// ---------- 用户手动滚动/操作时解锁：恢复滚动驱动高亮 ----------
function unlockFromUserAction(){
  if (!lockId) return;
  lockId = null;
  onScroll(); // 解锁后立即按当前位置刷新一次高亮
}

// 鼠标滚轮/触控滑动：认为是用户主动滚动
window.addEventListener("wheel", unlockFromUserAction, { passive: true });
window.addEventListener("touchmove", unlockFromUserAction, { passive: true });

// 键盘滚动：方向键、PageUp/Down、Home/End、Space
window.addEventListener("keydown", (e) => {
  const keys = ["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "];
  if (keys.includes(e.key)) unlockFromUserAction();
});