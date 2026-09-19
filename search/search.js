const firebaseConfig = {
    apiKey: "AIzaSyBhBuU1OdkHDkcWTNu0G8wzvrjHHM5BsCE",
    authDomain: "medeamawahib.firebaseapp.com",
    projectId: "medeamawahib",
    storageBucket: "medeamawahib.firebasestorage.app",
    messagingSenderId: "292370574224",
    appId: "1:292370574224:web:40cf123c34c7401ef32115",
    measurementId: "G-FB8QE8L2JZ"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const talentsGrid = document.getElementById('talentsGrid');
const resultsCount = document.getElementById('resultsCount');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');
const municipalitySelect = document.getElementById('municipalitySelect');
const sortSelect = document.getElementById('sortSelect');

async function fetchTalents(category = 'الكل', municipality = '', sort = 'newest', searchTerm = '') {
    talentsGrid.innerHTML = '<p style="text-align:center; color:#64748b; grid-column: 1/-1; padding: 2rem;">جاري تحميل المواهب...</p>';
    
    try {
        let query = db.collection('talents')
            .where('status', '==', 'approved')
            .orderBy('createdAt', 'desc');
            
        const snapshot = await query.get();
        let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (category !== 'الكل') {
            docs = docs.filter(t => t.category === category);
        }
        
        if (municipality) {
            docs = docs.filter(t => t.municipality === municipality);
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            docs = docs.filter(t => 
                (t.fullName && t.fullName.toLowerCase().includes(term)) ||
                (t.description && t.description.toLowerCase().includes(term)) ||
                (t.talentName && t.talentName.toLowerCase().includes(term)) ||
                (t.category && t.category.toLowerCase().includes(term)) ||
                (t.municipality && t.municipality.toLowerCase().includes(term))
            );
        }
        
        if (sort === 'oldest') {
            docs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        } else if (sort === 'random') {
            docs.sort(() => Math.random() - 0.5);
        }
        
        renderTalents(docs);
    } catch (error) {
        console.error("Error fetching talents:", error);
        talentsGrid.innerHTML = '<p style="text-align:center; color:#ff6b6b; grid-column: 1/-1; padding: 2rem;">حدث خطأ في جلب البيانات. يرجى التحقق من اتصال الإنترنت.</p>';
    }
}

function renderTalents(dataArray) {
    talentsGrid.innerHTML = '';
    resultsCount.textContent = dataArray.length;
    
    if (dataArray.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    dataArray.forEach(data => {
        const card = document.createElement('div');
        card.className = 'talent-card';
        const initial = data.fullName ? data.fullName.charAt(0).toUpperCase() : '?';
        
        card.innerHTML = `
            <div class="talent-header">
                <div class="talent-avatar">${initial}</div>
                <div class="talent-info">
                    <h3>${data.fullName || 'اسم غير معروف'}</h3>
                    <span>${data.category || 'غير محدد'}</span>
                </div>
            </div>
            <p class="talent-desc">${data.description || 'لا يوجد وصف متاح لهذه الموهبة.'}</p>
            <div class="talent-tags">
                <span class="tag"><i class="fa-solid fa-location-dot"></i> ${data.municipality || 'غير محدد'}</span>
                ${data.age ? `<span class="tag"><i class="fa-solid fa-calendar"></i> ${data.age} سنة</span>` : ''}
            </div>
        `;
        
        talentsGrid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTalents();
    
    document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            fetchTalents(e.currentTarget.dataset.filter, municipalitySelect.value, sortSelect.value, searchInput.value);
        });
    });
    
    if (municipalitySelect) {
        municipalitySelect.addEventListener('change', (e) => {
            const activeCat = document.querySelector('.cat-pill.active')?.dataset.filter || 'الكل';
            fetchTalents(activeCat, e.target.value, sortSelect.value, searchInput.value);
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const activeCat = document.querySelector('.cat-pill.active')?.dataset.filter || 'الكل';
            fetchTalents(activeCat, municipalitySelect.value, e.target.value, searchInput.value);
        });
    }
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const activeCat = document.querySelector('.cat-pill.active')?.dataset.filter || 'الكل';
                fetchTalents(activeCat, municipalitySelect.value, sortSelect.value, e.target.value);
            }, 400);
        });
    }
});
