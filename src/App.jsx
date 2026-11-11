import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { 
  Heart, Droplets, CheckCircle2, Circle, Plus, Trash2, 
  BookOpen, Film, Dumbbell, Sun, Menu, X, Send, 
  Utensils, Wind, ShoppingCart, Shirt, Sparkles, Coffee,
  Globe, Pencil, User, Home, LogOut
} from 'lucide-react';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBYsOxNILZSU55D4HW3WxD1gPCGbZYwCz8",
  authDomain: "pati-evi.firebaseapp.com",
  projectId: "pati-evi",
  storageBucket: "pati-evi.firebasestorage.app",
  messagingSenderId: "532805656496",
  appId: "1:532805656496:web:e17fada37ebac437bd8075"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "ourhome";

// --- ÇEVİRİ VE İÇERİK SÖZLÜĞÜ (TR / EN) ---
const DICT = {
  tr: {
    appName: "OurHome",
    welcome: "Hoş Geldin!",
    selectProfile: "Lütfen profilini seç veya yeni bir alan oluştur.",
    addUser: "Yeni Kişi Ekle",
    enterName: "Eklenecek kişinin adı:",
    renamePrompt: "Profilin yeni ismi:",
    changeProfile: "Profili Değiştir",
    hug: "Sarıl",
    mySpace: "Benim Alanım",
    sharedSpace: "Ortak Alan",
    waterTracker: "Su Takibi (8 Bardak)",
    dailyStepsTitle: "Günlük Küçük Adımlar 🌿",
    dailyStepsSubtitle: "Zorunluluk yok, yapabildiğin kadarını işaretle. Kendine iyi bak.",
    newTaskPlaceholder: "Yeni bir şey veya fikir ekle...",
    completedTitle: "Tamamlananlar",
    emptyState: "Buralar henüz boş. Hadi ilk notu sen ekle!",
    quickAdd: "Hızlı Mikro-Adımlar ✨",
    addedBy: "ekledi",
    tabs: {
      ozbakim: 'Özbakım',
      market: 'Market',
      camasir: 'Çamaşır',
      temizlik: 'Temizlik',
      spor: 'Spor',
      ders: 'Ders',
      filmdizi: 'Film & Dizi',
      tarifler: 'Tarif Defteri'
    },
    habits: [
      { id: 'dus', label: 'Ilık bir duş al', icon: Droplets },
      { id: 'hava', label: 'Odayı 10 dk havalandır', icon: Wind },
      { id: 'yemek', label: 'Güzel bir öğün ye', icon: Utensils },
      { id: 'kahve', label: 'Sıcak bir şeyler iç', icon: Coffee }
    ],
    presets: {
      ozbakim: ["Odayı havalandır 🌬️", "Yatağı topla 🛏️", "Duş al 🧼", "5 dk yürüyüş 🚶‍♀️"],
      market: ["Meyve & Sebze 🍎", "Süt & Yoğurt 🥛", "Atıştırmalık 🥨"],
      camasir: ["Açıkları yıka 🧺", "Koyu renkleri yıka 👕", "Çamaşırları as ☀️"],
      temizlik: ["Çöpü dök 🗑️", "Bulaşıkları diz 🍽️", "Masayı sil 🧽"],
      spor: ["10 dk esneme 🧘‍♀️", "Hafif yürüyüş 👟", "Beden ağırlığı sporu 💪"],
      ders: ["25 dk odaklanma (Pomodoro) ⏱️", "Notları gözden geçir 📝"],
      filmdizi: ["Nostaljik bir film seç 🎬", "Yeni mini diziye başla 📺", "Belgesel izle 🌿"],
      tarifler: ["Pratik akşam yemeği 🍝", "Kahvaltı krepi 🥞", "Bitki çayı demle 🫖"]
    }
  },
  en: {
    appName: "OurHome",
    welcome: "Welcome!",
    selectProfile: "Please select your profile or add a new space.",
    addUser: "Add User",
    enterName: "Enter new user's name:",
    renamePrompt: "New profile name:",
    changeProfile: "Switch Profile",
    hug: "Send Hug",
    mySpace: "My Space",
    sharedSpace: "Shared Space",
    waterTracker: "Water Tracker (8 Glasses)",
    dailyStepsTitle: "Gentle Daily Steps 🌿",
    dailyStepsSubtitle: "No pressure, check off what you can. Take care of yourself.",
    newTaskPlaceholder: "Add a new task or idea...",
    completedTitle: "Completed",
    emptyState: "Nothing here yet. Go ahead and add the first note!",
    quickAdd: "Quick Micro-Steps ✨",
    addedBy: "added",
    tabs: {
      ozbakim: 'Self-Care',
      market: 'Groceries',
      camasir: 'Laundry',
      temizlik: 'Cleaning',
      spor: 'Fitness',
      ders: 'Study',
      filmdizi: 'Movies & Shows',
      tarifler: 'Recipe Book'
    },
    habits: [
      { id: 'dus', label: 'Take a warm shower', icon: Droplets },
      { id: 'hava', label: 'Air out room for 10m', icon: Wind },
      { id: 'yemek', label: 'Eat a good meal', icon: Utensils },
      { id: 'kahve', label: 'Drink something warm', icon: Coffee }
    ],
    presets: {
      ozbakim: ["Air out room 🌬️", "Make the bed 🛏️", "Take a shower 🧼", "5-min walk 🚶‍♀️"],
      market: ["Fruits & Veggies 🍎", "Milk & Yogurt 🥛", "Snacks 🥨"],
      camasir: ["Wash lights 🧺", "Wash darks 👕", "Hang clothes ☀️"],
      temizlik: ["Take out trash 🗑️", "Load dishwasher 🍽️", "Wipe table 🧽"],
      spor: ["10-min stretch 🧘‍♀️", "Light walk 👟", "Bodyweight workout 💪"],
      ders: ["25-min focus session ⏱️", "Review notes 📝"],
      filmdizi: ["Pick a comfort movie 🎬", "Start a new mini-series 📺", "Watch a doc 🌿"],
      tarifler: ["Quick dinner idea 🍝", "Breakfast pancakes 🥞", "Brew herbal tea 🫖"]
    }
  }
};

const TABS = [
  // Kişisel
  { id: 'ozbakim', icon: Sun, type: 'personal' },
  { id: 'market', icon: ShoppingCart, type: 'personal' },
  { id: 'camasir', icon: Shirt, type: 'personal' },
  { id: 'temizlik', icon: Sparkles, type: 'personal' },
  { id: 'spor', icon: Dumbbell, type: 'personal' },
  { id: 'ders', icon: BookOpen, type: 'personal' },
  // Ortak
  { id: 'filmdizi', icon: Film, type: 'shared' },
  { id: 'tarifler', icon: Utensils, type: 'shared' },
];

const DEFAULT_PROFILES = [
  { id: 'p1', name: 'Profil 1', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', activeBg: 'bg-rose-100', icon: User },
  { id: 'p2', name: 'Profil 2', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', activeBg: 'bg-indigo-100', icon: User }
];

const getTodayId = () => new Date().toISOString().split('T')[0];

export default function App() {
  const [lang, setLang] = useState('tr');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [activeTab, setActiveTab] = useState('ozbakim');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [tasks, setTasks] = useState([]);
  const [dailyCare, setDailyCare] = useState({ water: 0 });
  const [floatingHearts, setFloatingHearts] = useState([]);

  const mountTime = useRef(Date.now());
  const t = DICT[lang];

  // 1. AUTHENTICATION
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth hatası:", error);
        if (isMounted) setLoading(false);
      }
    };
    
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (isMounted) {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 2. FETCH PROFILES, TASKS & HEARTS (OurHome Collections)
  useEffect(() => {
    if (!user) return;

    // Profiles
    const profilesRef = collection(db, 'artifacts', appId, 'public', 'data', 'ourhome_profiles');
    const unsubProfiles = onSnapshot(profilesRef, (snapshot) => {
      if (!snapshot.empty) {
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const styled = fetched.map((p, idx) => ({
          ...p,
          color: p.color || (idx % 2 === 0 ? 'text-rose-500' : 'text-indigo-500'),
          bg: p.bg || (idx % 2 === 0 ? 'bg-rose-50' : 'bg-indigo-50'),
          border: p.border || (idx % 2 === 0 ? 'border-rose-200' : 'border-indigo-200'),
          activeBg: p.activeBg || (idx % 2 === 0 ? 'bg-rose-100' : 'bg-indigo-100'),
          icon: User
        }));
        setProfiles(styled);
      }
    });

    // Tasks
    const tasksRef = collection(db, 'artifacts', appId, 'public', 'data', 'ourhome_tasks');
    const unsubTasks = onSnapshot(tasksRef, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedTasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setTasks(fetchedTasks);
    }, (err) => console.error("Görevler alınamadı:", err));

    // Hearts
    const heartsRef = collection(db, 'artifacts', appId, 'public', 'data', 'ourhome_hearts');
    const unsubHearts = onSnapshot(heartsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const heartData = change.doc.data();
          if (heartData.timestamp > mountTime.current) {
            triggerHeart(heartData.from);
          }
        }
      });
    }, (err) => console.error("Kalpler alınamadı:", err));

    return () => {
      unsubProfiles();
      unsubTasks();
      unsubHearts();
    };
  }, [user]);

  // 3. FETCH DAILY CARE
  useEffect(() => {
    if (!user || !activeProfileId) return;
    
    const today = getTodayId();
    const docId = `care_${activeProfileId}_${today}`;
    const careRef = doc(db, 'artifacts', appId, 'public', 'data', 'ourhome_care', docId);

    const unsubCare = onSnapshot(careRef, (docSnap) => {
      if (docSnap.exists()) {
        setDailyCare(docSnap.data());
      } else {
        setDailyCare({ water: 0 });
      }
    }, (err) => console.error("Özbakım verisi alınamadı:", err));

    return () => unsubCare();
  }, [user, activeProfileId]);

  // --- ACTIONS ---

  const handleAddUser = async () => {
    const name = window.prompt(t.enterName);
    if (!name || !name.trim()) return;
    const newId = `user_${Date.now()}`;
    const profileData = {
      name: name.trim(),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      activeBg: 'bg-emerald-100'
    };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ourhome_profiles', newId), profileData);
  };

  const handleRenameProfile = async (e, profileItem) => {
    e.stopPropagation();
    const newName = window.prompt(t.renamePrompt, profileItem.name);
    if (!newName || !newName.trim()) return;
    
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ourhome_profiles', profileItem.id), {
      name: newName.trim()
    }, { merge: true });
  };

  const handleAddTask = async (text) => {
    if (!user || !text.trim() || !activeProfileId) return;
    const isShared = TABS.find(tItem => tItem.id === activeTab)?.type === 'shared';
    
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'ourhome_tasks'), {
      text: text.trim(),
      category: activeTab,
      completed: false,
      owner: isShared ? 'shared' : activeProfileId,
      createdBy: activeProfileId,
      createdAt: Date.now()
    });
  };

  const handleToggleTask = async (task) => {
    if (!user) return;
    const taskRef = doc(db, 'artifacts', appId, 'public', 'data', 'ourhome_tasks', task.id);
    await setDoc(taskRef, { completed: !task.completed }, { merge: true });
  };

  const handleDeleteTask = async (taskId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ourhome_tasks', taskId));
  };

  const handleToggleHabit = async (habitId) => {
    if (!user || !activeProfileId) return;
    const docId = `care_${activeProfileId}_${getTodayId()}`;
    const careRef = doc(db, 'artifacts', appId, 'public', 'data', 'ourhome_care', docId);
    
    const currentValue = dailyCare[habitId] || false;
    await setDoc(careRef, { [habitId]: !currentValue }, { merge: true });
  };

  const handleSetWater = async (count) => {
    if (!user || !activeProfileId) return;
    const docId = `care_${activeProfileId}_${getTodayId()}`;
    const careRef = doc(db, 'artifacts', appId, 'public', 'data', 'ourhome_care', docId);
    
    await setDoc(careRef, { water: count }, { merge: true });
  };

  const handleSendHug = async () => {
    if (!user || !activeProfileId) return;
    
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'ourhome_hearts'), {
      from: activeProfileId,
      timestamp: Date.now()
    });
    
    triggerHeart(activeProfileId);
  };

  const triggerHeart = (fromProfile) => {
    const id = Date.now() + Math.random();
    setFloatingHearts(prev => [...prev, { id, fromProfile }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 4000);
  };

  // --- RENDER HELPERS ---

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center flex-col gap-4 font-sans">
        <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-400 rounded-full animate-spin"></div>
        <p className="text-stone-400 font-medium tracking-wide">OurHome Yükleniyor...</p>
      </div>
    );
  }

  if (!activeProfileId) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xs border border-stone-100 text-center relative">
          
          <button 
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-500 text-xs font-semibold uppercase transition-all"
          >
            <Globe size={14} />
            <span>{lang}</span>
          </button>

          <h1 className="text-3xl font-semibold text-stone-800 mb-2">{t.appName}</h1>
          <p className="text-stone-400 text-sm mb-8">{t.selectProfile}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProfileId(p.id)}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all hover:-translate-y-1 relative group ${p.bg} ${p.border}`}
              >
                <div 
                  onClick={(e) => handleRenameProfile(e, p)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/70 hover:bg-white text-stone-400 hover:text-stone-700 transition-all shadow-2xs"
                  title={t.renamePrompt}
                >
                  <Pencil size={13} />
                </div>

                <div className={`p-4 rounded-full bg-white shadow-xs ${p.color}`}>
                  <User className="w-8 h-8" />
                </div>
                <span className={`font-medium text-base truncate w-full px-2 ${p.color}`}>{p.name}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={handleAddUser}
            className="w-full py-4 border-2 border-dashed border-stone-200 rounded-3xl text-stone-400 font-medium flex items-center justify-center gap-2 hover:bg-stone-50 transition-all text-sm"
          >
            <Plus size={18} />
            {t.addUser}
          </button>
        </div>
      </div>
    );
  }

  const profile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const activeTabData = TABS.find(tItem => tItem.id === activeTab);
  
  const currentTasks = tasks.filter(tItem => {
    if (tItem.category !== activeTab) return false;
    if (activeTabData.type === 'personal' && tItem.owner !== activeProfileId) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-700 font-sans flex overflow-hidden">
      
      {/* Floating Hearts Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingHearts.map(heart => {
          const sender = profiles.find(p => p.id === heart.fromProfile);
          return (
            <div 
              key={heart.id}
              className="absolute bottom-0 animate-float-up"
              style={{ 
                left: `${Math.random() * 80 + 10}%`,
                animationDuration: `${Math.random() * 2 + 3}s` 
              }}
            >
              <Heart className={`w-16 h-16 fill-current opacity-70 ${sender?.color || 'text-rose-400'}`} />
            </div>
          );
        })}
      </div>

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-100 transform transition-transform duration-300 ease-in-out flex flex-col shadow-lg lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:relative`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${profile.bg} ${profile.color}`}>
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-stone-800 leading-tight">{profile.name}</h2>
              <span className="text-xs text-stone-400">{t.appName}</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-stone-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
          
          {/* Benim Alanım */}
          <div>
            <h3 className="px-3 mb-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">{t.mySpace}</h3>
            <div className="space-y-1">
              {TABS.filter(tItem => tItem.type === 'personal').map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                    activeTab === tab.id 
                      ? `${profile.activeBg}${profile.color} font-medium` 
                      : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{t.tabs[tab.id]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ortak Alan */}
          <div>
            <h3 className="px-3 mb-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">{t.sharedSpace}</h3>
            <div className="space-y-1">
              {TABS.filter(tItem => tItem.type === 'shared').map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                    activeTab === tab.id 
                      ? `bg-amber-100 text-amber-700 font-medium` 
                      : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{t.tabs[tab.id]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between">
          <button 
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-50 uppercase transition-all"
          >
            <Globe size={16} />
            <span>{lang}</span>
          </button>
          
          <button 
            onClick={() => setActiveProfileId(null)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
          >
            <LogOut size={14} />
            <span>{t.changeProfile}</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-20 px-6 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-stone-100 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-stone-500 hover:text-stone-700 p-1 -ml-2">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2
