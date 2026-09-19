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
// 2. تهيئة الصفحة عند التحميل
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
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

    // --- ج. التحكم في القائمة المنبثقة (Profile List) ---
    const toggleBtn = document.querySelector('[data-toggle="profileList"]');
    const popup = document.querySelector('.profileList');
    const closeBtn = document.querySelector('.btnClose');
    const overlay = document.querySelector('.overlay-bg'); // إذا كان موجوداً

    if (toggleBtn && popup) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            popup.classList.add('active');
        });
    }

    if (closeBtn && popup) {
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('active');
        });
    }

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (popup && popup.classList.contains('active')) {
            if (!popup.contains(e.target) && !toggleBtn.contains(e.target)) {
                popup.classList.remove('active');
            }
        }
    });

    // --- د. ✅ التحكم في صوت الفيديو (الحل النهائي) ---
    const video = document.getElementById('heroVideo');
    const muteToggle = document.getElementById('muteToggle');
    const iconMuted = document.getElementById('iconMuted');
    const iconUnmuted = document.getElementById('iconUnmuted');

    if (video && muteToggle) {
        // التأكد من أن الفيديو يبدأ صامتاً (مطلوب من المتصفحات للتشغيل التلقائي)
        video.muted = true;
        
        // ضبط حالة الأيقونات الابتدائية
        if (iconMuted) iconMuted.style.display = 'block';
        if (iconUnmuted) iconUnmuted.style.display = 'none';

        muteToggle.addEventListener('click', () => {
            // عكس حالة الصوت
            video.muted = !video.muted;
            
            if (video.muted) {
                // إذا أصبح صامتاً
                if (iconMuted) iconMuted.style.display = 'block';
                if (iconUnmuted) iconUnmuted.style.display = 'none';
            } else {
                // إذا تم تشغيل الصوت
                if (iconMuted) iconMuted.style.display = 'none';
                if (iconUnmuted) iconUnmuted.style.display = 'block';
                
                // محاولة تشغيل الفيديو لضمان عمل الصوت (بعض المتصفحات توقف الفيديو إذا كان صامتاً ثم طلب الصوت)
                video.play().catch(err => {
                    console.log('محاولة تشغيل الفيديو:', err);
                });
            }
        });
    }

    // --- هـ. إرسال نموذج النشرة البريدية (محاكاة) ---
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

    // --- و. إرسال نموذج الاقتراحات (محاكاة) ---
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

// ==========================================
// ✅ التحكم في صوت الفيديو (الحل النهائي)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('heroVideo');
    const muteToggle = document.getElementById('muteToggle');
    const iconMuted = document.getElementById('iconMuted');
    const iconUnmuted = document.getElementById('iconUnmuted');
    
    if (video && muteToggle) {
        // التأكد من أن الفيديو يبدأ صامتاً
        video.muted = true;
        
        // ضبط الأيقونات الابتدائية
        if (iconMuted) iconMuted.style.display = 'block';
        if (iconUnmuted) iconUnmuted.style.display = 'none';
        
        // حدث النقر على الزر
        muteToggle.addEventListener('click', function() {
            video.muted = !video.muted;
            
            if (video.muted) {
                // الفيديو صامت
                if (iconMuted) iconMuted.style.display = 'block';
                if (iconUnmuted) iconUnmuted.style.display = 'none';
            } else {
                // الفيديو بصوت
                if (iconMuted) iconMuted.style.display = 'none';
                if (iconUnmuted) iconUnmuted.style.display = 'block';
                
                // محاولة تشغيل الفيديو
                video.play().catch(function(err) {
                    console.log('خطأ في تشغيل الفيديو:', err);
                });
            }
        });
        
        console.log('✅ زر الصوت جاهز للعمل');
    } else {
        console.error('❌ لم يتم العثور على الفيديو أو زر الصوت');
    }
});
// ==========================================
// ✅ التحكم في صوت الفيديو (نسخة مقاومة للأخطاء)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('heroVideo');
    const muteToggle = document.getElementById('muteToggle');
    const iconMuted = document.getElementById('iconMuted');
    const iconUnmuted = document.getElementById('iconUnmuted');

    if (video && muteToggle) {
        console.log("✅ تم العثور على الزر والفيديو بنجاح");

        // التأكد من أن الفيديو يبدأ صامتاً
        video.muted = true;
        if(iconMuted) iconMuted.style.display = 'block';
        if(iconUnmuted) iconUnmuted.style.display = 'none';

        muteToggle.addEventListener('click', function(e) {
            e.preventDefault();      // منع أي سلوك افتراضي
            e.stopPropagation();     // منع الحدث من الانتشار للأب (يمنع السرقة)
            console.log("🔊 تم النقر على الزر بنجاح!");

            video.muted = !video.muted;

            if (video.muted) {
                if(iconMuted) iconMuted.style.display = 'block';
                if(iconUnmuted) iconUnmuted.style.display = 'none';
            } else {
                if(iconMuted) iconMuted.style.display = 'none';
                if(iconUnmuted) iconUnmuted.style.display = 'block';
                
                video.play().catch(err => console.log('محاولة تشغيل:', err));
            }
        });
    } else {
        console.error("❌ فشل العثور على الفيديو أو الزر. تأكد من تطابق الـ IDs في HTML");
    }
});
