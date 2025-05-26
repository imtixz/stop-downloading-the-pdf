(function () {
    const waitForBody = setInterval(() => {
      if (!document.body) return;
  
      clearInterval(waitForBody);
  
      const observer = new MutationObserver(() => {
        const buttons = [...document.querySelectorAll('button.btn.btn-info')];
        for (const btn of buttons) {
          if (btn.textContent.trim() === "Download") {
            btn.innerHTML = `<i class="fa fa-cloud-arrow-down fs-4 me-2"></i>View PDF`;
            console.log("✅ Replaced Download with View PDF");
          }
        }
      });
  
      observer.observe(document.body, { childList: true, subtree: true });
    }, 100); // checks every 100ms until document.body is ready
})();

const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove();