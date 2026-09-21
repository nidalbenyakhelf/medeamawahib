// ==========================================
// 1. إعدادات Firebase
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
// 2. تهيئة الصفحة عند التحميل (نسخة موحدة ونظيفة)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    
    // --- أ. تحديث سنة حقوق النشر ---
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- ب. عدد المواهب المسجلة ---
    const talentCountEl = document.getElementById('talentCount');
    if (talentCountEl) {
        db.collection('talents').get().then(snapshot => {
            talentCountEl.textContent = snapshot.size + '+';
        }).catch(error => {
            console.error("Error fetching talent count:", error);
            talentCountEl.textContent = '0+';
        });
    }

    // --- ج. التحكم في القائمة المنبثقة (Profile List) - [تم التعديل لحل المشكلتين] ---
    const toggleBtn = document.querySelector('[data-toggle="profileList"]');
    const popup = document.querySelector('.profileList');
    const closeBtn = document.querySelector('.btnClose');

    // دالة مساعدة لفتح القائمة وقفل خلفية الموقع
    function openPopup() {
        if (popup) {
            popup.classList.add('active');
            document.body.style.overflow = 'hidden'; // منع تمرير الموقع الخلفي
        }
    }

    // دالة مساعدة لإغلاق القائمة وفك قفل خلفية الموقع
    function closePopup() {
        if (popup) {
            popup.classList.remove('active');
            document.body.style.overflow = ''; // إعادة تمرير الموقع الخلفي
        }
    }

    if (toggleBtn && popup) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openPopup();
        });
    }

    if (closeBtn && popup) {
        closeBtn.addEventListener('click', () => {
            closePopup();
        });
    }

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (popup && popup.classList.contains('active')) {
            if (!popup.contains(e.target) && !toggleBtn.contains(e.target)) {
                closePopup();
            }
        }
    });

    // ✅ حل المشكلة الأولى: إغلاق القائمة عند النقر على أي رابط داخلها
    const popupLinks = popup.querySelectorAll('a');
    popupLinks.forEach(link => {
        link.addEventListener('click', () => {
            closePopup();
        });
    });


    // --- د. ✅ التحكم في صوت الفيديو (النسخة المقاومة للأخطاء 100%) ---
    const video = document.getElementById('heroVideo');
    const muteToggle = document.getElementById('muteToggle');
    const iconMuted = document.getElementById('iconMuted');
    const iconUnmuted = document.getElementById('iconUnmuted');

    if (video && muteToggle) {
        console.log("✅ تم العثور على الزر والفيديو بنجاح");
        
        video.muted = true;
        
        if (iconMuted) iconMuted.style.display = 'block';
        if (iconUnmuted) iconUnmuted.style.display = 'none';

        muteToggle.addEventListener('click', function(e) {
            e.preventDefault();      
            e.stopPropagation();     

            video.muted = !video.muted;

            if (video.muted) {
                if (iconMuted) iconMuted.style.display = 'block';
                if (iconUnmuted) iconUnmuted.style.display = 'none';
            } else {
                if (iconMuted) iconMuted.style.display = 'none';
                if (iconUnmuted) iconUnmuted.style.display = 'block';
                
                video.play().catch(err => {
                    console.log('محاولة تشغيل الفيديو:', err);
                });
            }
        });
    } else {
        console.error("❌ فشل العثور على الفيديو أو الزر. تأكد من تطابق الـ IDs في HTML");
    }

    // --- هـ. إرسال نموذج النشرة البريدية ---
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            const lang = newsletterForm.querySelector('select').value;
            const btn = newsletterForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الاشتراك...';

            try {
                await db.collection('subscribers').add({
                    email: email,
                    language: lang,
                    subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert('تم الاشتراك في النشرة البريدية بنجاح!');
                newsletterForm.reset();
            } catch (error) {
                console.error("Error subscribing:", error);
                alert('حدث خطأ أثناء الاشتراك، يرجى المحاولة لاحقاً.');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }

    // --- و. إرسال نموذج الاقتراحات ---
    const suggestionForm = document.querySelector('.suggestion-form');
    if (suggestionForm) {
        suggestionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = suggestionForm.querySelector('input[type="email"]').value;
            const content = suggestionForm.querySelector('textarea').value;
            const btn = suggestionForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';

            try {
                await db.collection('suggestions').add({
                    email: email,
                    content: content,
                    status: 'new',
                    suggestedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert('تم إرسال اقتراحك بنجاح! شكراً لمساهمتك.');
                suggestionForm.reset();
            } catch (error) {
                console.error("Error sending suggestion:", error);
                alert('حدث خطأ أثناء إرسال الاقتراح، يرجى المحاولة لاحقاً.');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }
});
