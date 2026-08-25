// ==========================================
// 1. إعدادات Firebase الأساسية
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBhBuU1OdkHDkcWTNu0G8wzvrjHHM5BsCE",
    authDomain: "medeamawahib.firebaseapp.com",
    projectId: "medeamawahib",
    storageBucket: "medeamawahib.firebasestorage.app",
    messagingSenderId: "292370574224",
    appId: "1:292370574224:web:40cf123c34c7401ef32115",
    measurementId: "G-FB8QE8L2JZ"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ==========================================
// 2. الوظائف العامة للموقع
// ==========================================
document.getElementById("current-year").textContent = new Date().getFullYear();

function toggleSiteScroll() {
    const isAnyPopupActive = document.querySelector(".popup.active");
    if (isAnyPopupActive) {
        document.body.style.overflowY = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${window.scrollY}px`;
    } else {
        const scrollY = document.body.style.top;
        document.body.style.overflowY = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
}

document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-toggle]");
    if (btn) {
        const targetClass = btn.getAttribute("data-toggle");
        const target = document.querySelector("." + targetClass);
        if (!target) return;
        document.querySelectorAll(".popup").forEach((p) => {
            if (p !== target) p.classList.remove("active");
        });
        target.classList.toggle("active");
        toggleSiteScroll();
        return;
    }
    if (e.target.closest("[data-close]")) {
        e.target.closest(".popup").classList.remove("active");
        toggleSiteScroll();
        return;
    }
    if (e.target.closest(".profileList a")) {
        const profileList = document.querySelector(".profileList");
        if (profileList) {
            profileList.classList.remove("active");
            toggleSiteScroll();
        }
    }
    if (!e.target.closest(".popup") && !e.target.closest("[data-toggle]")) {
        let closedAny = false;
        document.querySelectorAll(".popup").forEach((p) => {
            if (p.classList.contains("active")) {
                p.classList.remove("active");
                closedAny = true;
            }
        });
        if (closedAny) toggleSiteScroll();
    }
});

// ==========================================
// 3. النشرة والاقتراحات والعداد والشراكة
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // --- أ. النشرة البريدية ---
    const newsBtn = document.querySelector('#newsletter .submit-btn');
    const newsInput = document.querySelector('#newsletter input[type="email"]');
    const newsForm = document.querySelector('#newsletter .newsletter-form');
    
    if (newsBtn && newsInput && newsForm) {
        newsForm.style.position = 'relative';
        newsForm.style.marginBottom = '35px'; 
        const newsMsg = document.createElement('p');
        newsMsg.style.cssText = `position: absolute; bottom: -30px; left: 0; width: 100%; text-align: center; font-size: 0.85rem; font-weight: 600; margin: 0; opacity: 0; transform: translateY(-5px); transition: all 0.3s ease; pointer-events: none;`;
        newsForm.appendChild(newsMsg);

        let msgTimeout;
        function showNewsMessage(text, color) {
            clearTimeout(msgTimeout);
            newsMsg.textContent = text;
            newsMsg.style.color = color;
            newsMsg.style.opacity = '1';
            newsMsg.style.transform = 'translateY(0)';
            msgTimeout = setTimeout(() => {
                newsMsg.style.opacity = '0';
                newsMsg.style.transform = 'translateY(-5px)';
            }, 3000);
        }

        newsBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = newsInput.value.trim().toLowerCase();
            if (!email || !email.includes('@')) {
                showNewsMessage("يرجى إدخال بريد إلكتروني صحيح.", "#ff6b6b");
                return;
            }
            try {
                const exists = await db.collection('subscribers').where('email', '==', email).get();
                if (!exists.empty) {
                    showNewsMessage("أنت مشترك بالفعل! شكراً لاهتمامك.", "#cbd5e1");
                    return;
                }
                await db.collection('subscribers').add({
                    email: email,
                    subscribedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    source: 'homepage_newsletter'
                });
                showNewsMessage("تم الاشتراك بنجاح! ستصلك الأخبار قريباً.", "#00f5a0");
                newsInput.value = "";
            } catch (err) {
                console.error(err);
                showNewsMessage("حدث خطأ، يرجى المحاولة لاحقاً.", "#ff6b6b");
            }
        });
    }

    // --- ب. الاقتراحات ---
    const sugForm = document.querySelector('.suggestion-form');
    if (sugForm) {
        const sugMsg = document.createElement('p');
        sugMsg.style.cssText = "text-align:center; margin-top:10px; font-size:0.9rem; min-height:20px; opacity:0; transition: opacity 0.3s;";
        sugForm.appendChild(sugMsg);
        let sugTimeout;
        function showSugMessage(text, color) {
            clearTimeout(sugTimeout);
            sugMsg.textContent = text;
            sugMsg.style.color = color;
            sugMsg.style.opacity = '1';
            sugTimeout = setTimeout(() => { sugMsg.style.opacity = '0'; }, 4000);
        }

        sugForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = sugForm.querySelector('.submit-btn');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = "جاري الإرسال...";
            try {
                const email = sugForm.querySelector('input[type="email"]').value.trim().toLowerCase();
                const content = sugForm.querySelector('textarea').value.trim();
                if (!email || !content) {
                    showSugMessage("يرجى ملء جميع الحقول المطلوبة.", "#ff6b6b");
                    btn.disabled = false;
                    btn.textContent = originalText;
                    return;
                }
                await db.collection('suggestions').add({
                    email: email,
                    content: content,
                    suggestedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'new',
                    source: 'homepage_suggestion_form'
                });
                showSugMessage("شكراً لاقتراحك! تم إرساله بنجاح.", "#00f5a0");
                sugForm.reset();
            } catch (err) {
                console.error(err);
                showSugMessage("حدث خطأ أثناء الإرسال.", "#ff6b6b");
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }

    // --- ج. زر الشراكة ---
    const partnerBtn = document.getElementById('partnerBtn');
    if (partnerBtn) {
        partnerBtn.addEventListener('mousedown', () => {
            partnerBtn.style.transform = 'scale(0.95)';
            partnerBtn.style.opacity = '0.8';
        });
        partnerBtn.addEventListener('mouseup', () => {
            partnerBtn.style.transform = '';
            partnerBtn.style.opacity = '';
        });
        partnerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = partnerBtn.href;
        });
    }

    // --- د. عداد المواهب الحقيقي (مصحح) ---
    async function updateTalentCounter() {
        const counterEl = document.getElementById('talentCount');
        if (!counterEl) return;
        try {
            // ✅ البحث عن approved واستخدام size بدلاً من count()
            const snapshot = await db.collection('talents')
                .where('status', '==', 'approved') 
                .get();
            const count = snapshot.size;
            
            let current = 0;
            const increment = Math.ceil(count / 50) || 1; 
            const timer = setInterval(() => {
                current += increment;
                if (current >= count) {
                    current = count;
                    clearInterval(timer);
                }
                counterEl.textContent = current + '+';
            }, 30);
        } catch (error) {
            console.error("Error fetching talent count:", error);
            counterEl.textContent = "0"; 
        }
    }
    updateTalentCounter();
});