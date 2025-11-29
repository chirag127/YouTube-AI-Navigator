import {
    _id,
    sg,
    lg,
    l,
    w,
    tq,
    tsm,
    url,
    rt,
    tab,
} from "../utils/shortcuts.js";
const a = _id("api-status"),
    p = _id("page-status"),
    b = _id("analyze-btn"),
    h = _id("history-btn"),
    o = _id("options-btn"),
    m = _id("message"),
    g = _id("setup-guide-btn");
function showMsg(t, y = "info") {
    m.textContent = t;
    m.className = `show ${y}`;
    setTimeout(() => m.classList.remove("show"), 3000);
}
async function checkApi() {
    try {
        const s = await sg(["apiKey", "onboardingCompleted"]),
            lc = await lg("geminiApiKey"),
            k = s.apiKey || lc.geminiApiKey;
        if (k) {
            a.innerHTML = "<span>✅ Configured</span>";
            a.className = "value success";
            return true;
        }
        a.innerHTML = "<span>⚠️ Not configured</span>";
        a.className = "value warning";
        if (!s.onboardingCompleted) {
            g.style.display = "block";
            g.onclick = () => rt.openOptionsPage();
        }
        return false;
    } catch (x) {
        w("API check failed:", x);
        return false;
    }
}
async function checkPage() {
    try {
        const [t] = await tq({ active: true, currentWindow: true });
        if (t && t.url && t.url.includes("youtube.com/watch")) {
            p.innerHTML = "<span>✅ YouTube Video</span>";
            p.className = "value success";
            b.disabled = false;
            return true;
        }
        p.innerHTML = "<span>⚠️ Not on YouTube</span>";
        p.className = "value warning";
        b.disabled = true;
        return false;
    } catch (x) {
        w("Page check failed:", x);
        return false;
    }
}
b.onclick = async () => {
    try {
        const [t] = await tq({ active: true, currentWindow: true });
        if (!t) return;
        await tsm(t.id, { action: "ANALYZE_VIDEO" });
        showMsg("Analysis started!", "success");
    } catch (x) {
        showMsg("Failed to start analysis", "error");
    }
};
h.onclick = () => tab({ url: url("history/history.html") });
o.onclick = () => rt.openOptionsPage();
(async () => {
    await checkApi();
    await checkPage();
})();
