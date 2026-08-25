/**
 * Yoopedia - Register Logic (Final Version with Duplicate Check & 7 Steps)
 */
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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==========================================
// 2. منطق التنقل بين الخطوات (محدث لـ 7 خطوات)
// ==========================================
const steps = document.querySelectorAll(".step");
const nextButtons = document.querySelectorAll(".nextBtn:not([type='submit'])");
const prevButtons = document.querySelectorAll(".prevBtn");
const registerForm = document.getElementById("registerForm");
const progressBar = document.querySelector(".subProgress");
const currentStepNum = document.getElementById("currentStepNum");
const stepTitle = document.getElementById("stepTitle");
const dynamicTitle = document.getElementById("dynamicTitle");
const stepIcon = document.getElementById("stepIcon");
const totalStepsEl = document.getElementById("totalSteps");

const stepData = [
    { title: "أخبرنا عنك", iconClass: "fa-solid fa-user", fullTitle: "سجل الان و دعنا نتعرف بك" },
    { title: "إنشاء كلمة المرور", iconClass: "fa-solid fa-lock", fullTitle: "أنشئ كلمة مرور آمنة" },
    { title: "تفاصيل الموهبة", iconClass: "fa-solid fa-star", fullTitle: "أخبرنا عن موهبتك الإبداعية" },
    { title: "المعلومات الشخصية", iconClass: "fa-solid fa-id-card", fullTitle: "أكمل بياناتك الشخصية" },
    { title: "مراقبة الوالدين", iconClass: "fa-solid fa-shield-halved", fullTitle: "مراقبة الوالدين" },
    { title: "التواصل", iconClass: "fa-solid fa-address-book", fullTitle: "بيانات التواصل" },
    { title: "مراجعة السياسة", iconClass: "fa-solid fa-check-circle", fullTitle: "أوشكت على الانتهاء!" }
];
let currentStep = 0;

function showStep(index) {
    steps.forEach(s => s.classList.remove("active"));
    steps[index]?.classList.add("active");
    const totalSteps = steps.length;
    if (totalStepsEl) totalStepsEl.textContent = totalSteps;
    const progressPercent = ((index + 1) / totalSteps) * 100;
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (currentStepNum) currentStepNum.textContent = index + 1;
    if (stepTitle && stepData[index]) stepTitle.textContent = stepData[index].title;
    if (dynamicTitle && stepData[index]) dynamicTitle.textContent = stepData[index].fullTitle;
    if (stepIcon && stepData[index]) stepIcon.innerHTML = `<i class="${stepData[index].iconClass}"></i>`; 
    if (index === 4 || index === 5) updateMinorSteps();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateMinorSteps() {
    const age = parseInt(document.getElementById("age")?.value || "0");
    const adultMsg = document.getElementById("adultMessage");
    const minorForm = document.getElementById("minorForm");
    const contactLabel = document.getElementById("contactLabel");
    const socialLabel = document.getElementById("socialLabel");
    const isAdult = age >= 18;
    
    if (adultMsg && minorForm) {
        if (isAdult) {
            adultMsg.style.display = "block";
            minorForm.style.display = "none";
            document.getElementById("guardianName")?.removeAttribute("required");
            document.getElementById("guardianEmail")?.removeAttribute("required");
            document.getElementById("parentalConsent")?.removeAttribute("required");
        } else {
            adultMsg.style.display = "none";
            minorForm.style.display = "block";
            document.getElementById("guardianName")?.setAttribute("required", "true");
            document.getElementById("guardianEmail")?.setAttribute("required", "true");
            document.getElementById("parentalConsent")?.setAttribute("required", "true");
        }
    }
    if (contactLabel && socialLabel) {
        if (isAdult) {
            contactLabel.textContent = "رقم الهاتف (إجباري)";
            socialLabel.innerHTML = 'روابط منصاتك الخاصة <small style="color:#64748b">(يمكن إضافة حتى 3 روابط)</small>';
        } else {
            contactLabel.textContent = "رقم هاتف ولي الأمر (إجباري)";
            socialLabel.innerHTML = 'روابط تواصل ولي الأمر <small style="color:#64748b">(اختياري - لتسهيل التواصل معه)</small>';
        }
    }
}

function calculateAge() {
    const day = document.getElementById("day").value;
    const month = document.getElementById("months").value;
    const year = document.getElementById("year").value;
    const ageInput = document.getElementById("age");
    if (day && month && year) {
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        ageInput.value = age > 0 ? age : "";
    } else {
        ageInput.value = "";
    }
}

function validatePassword(input) {
    const value = input?.value || "";
    const ruleLetter = document.getElementById("rule-letter");
    const ruleNumber = document.getElementById("rule-number");
    const ruleLength = document.getElementById("rule-length");
    if (ruleLetter) ruleLetter.checked = /[a-zA-Z]/.test(value);
    if (ruleNumber) ruleNumber.checked = /\d/.test(value);
    if (ruleLength) ruleLength.checked = value.length >= 10;
    return (ruleLetter?.checked && ruleNumber?.checked && ruleLength?.checked);
}

function validateStep(stepIndex) {
    const currentStepElement = steps[stepIndex];
    if (!currentStepElement) return true;
    let valid = true;

    if (stepIndex === 0) {
        const emailInput = document.getElementById("email");
        if (!emailInput || !emailInput.value.trim() || !emailInput.checkValidity()) {
            emailInput?.classList.add("input-error");
            const errorMsg = emailInput?.parentElement?.querySelector(".error-msg");
            if (errorMsg) errorMsg.style.display = "block";
            valid = false;
        } else {
            emailInput?.classList.remove("input-error");
            const errorMsg = emailInput?.parentElement?.querySelector(".error-msg");
            if (errorMsg) errorMsg.style.display = "none";
        }
        return valid;
    }
    if (stepIndex === 1) {
        const passwordInput = document.getElementById("password");
        if (!validatePassword(passwordInput)) {
            passwordInput?.classList.add("input-error");
            valid = false;
        } else {
            passwordInput?.classList.remove("input-error");
        }
        return valid;
    }
    if (stepIndex === 4) {
        const age = parseInt(document.getElementById("age")?.value || "0");
        if (age < 18) {
            const guardianInputs = currentStepElement.querySelectorAll("#minorForm input[required], #minorForm select[required]");
            guardianInputs.forEach(input => {
                if (!input.value || !input.value.trim()) {
                    input.classList.add("input-error");
                    valid = false;
                } else {
                    input.classList.remove("input-error");
                }
            });
            const consent = document.getElementById("parentalConsent");
            if (consent && !consent.checked) {
                consent.parentElement.classList.add("input-error");
                valid = false;
            } else if (consent) {
                consent.parentElement.classList.remove("input-error");
            }
        }
        return valid;
    }
    if (stepIndex === 6) {
        const checkboxes = currentStepElement.querySelectorAll("input[type='checkbox'][required]");
        checkboxes.forEach(cb => {
            if (!cb.checked) {
                cb.parentElement.classList.add("input-error");
                valid = false;
            } else {
                cb.parentElement.classList.remove("input-error");
            }
        });
    }

    const requiredInputs = currentStepElement.querySelectorAll("input[required], select[required], textarea[required]");
    requiredInputs.forEach(input => {
        if (input.id === "guardianName" || input.id === "guardianEmail" || input.id === "parentalConsent") return;
        if (!input.value || !input.value.trim()) {
            input.classList.add("input-error");
            valid = false;
        } else {
            input.classList.remove("input-error");
        }
    });
    return valid;
}

nextButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep < steps.length - 1) {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        }
    });
});

prevButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
});

document.querySelectorAll(".radio-option, .policyBox").forEach(option => {
    option.addEventListener("click", (e) => {
        if (e.target.tagName === 'A') return;
        const input = option.querySelector("input[type='radio'], input[type='checkbox']");
        if (input) {
            if (input.type === 'radio') input.checked = true;
            else input.checked = !input.checked;
            input.dispatchEvent(new Event('change'));
        }
    });
});

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
passwordInput?.addEventListener("input", () => validatePassword(passwordInput));
togglePassword?.addEventListener("click", () => {
    const icon = togglePassword.querySelector("i");
    if (passwordInput?.type === "password") {
        passwordInput.type = "text";
        icon?.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        passwordInput.type = "password";
        icon?.classList.replace("fa-eye-slash", "fa-eye");
    }
});

// ==========================================
// 3. إرسال النموذج إلى Firebase (مع منع التكرار)
// ==========================================
registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري التحقق والتسجيل... <i class="fa-solid fa-spinner fa-spin"></i>';
    
    try {
        const formData = new FormData(registerForm);
        const email = formData.get("email").trim().toLowerCase();
        
        // ✅ التحقق من عدم تكرار البريد الإلكتروني
        const existingUserQuery = await db.collection("talents")
            .where("email", "==", email)
            .limit(1)
            .get();
            
        if (!existingUserQuery.empty) {
            alert("عذراً، هذا البريد الإلكتروني مسجل لدينا بالفعل.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        // ✅ إنشاء مستند جديد
        const userData = Object.fromEntries(formData.entries());
        delete userData.profilePic; 
        delete userData.password; 
        userData.email = email;
        
        // ✅ استخدام createdAt ليتطابق مع قاعدة البيانات الحالية
        userData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        
        // ✅ استخدام pending ليتطابق مع قاعدة البيانات الحالية
        userData.status = "pending"; 
        
        // معالجة الروابط الاجتماعية
        userData.socialLinks = [];
        for (let i = 1; i <= 3; i++) {
            const platform = formData.get(`platform${i}`);
            const link = formData.get(`link${i}`);
            if (platform && link) {
                userData.socialLinks.push({ platform, link });
            }
        }
        
        await db.collection("talents").add(userData);
        alert("تم تسجيل موهبتك بنجاح! سيتم مراجعتها وعرضها قريباً.");
        window.location.href = "../index.html";
        
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("حدث خطأ أثناء التسجيل: " + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

showStep(0);