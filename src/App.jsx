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
                      ? `${profile.activeBg} ${profile.color} font-medium` 
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
            <div className="flex items-center gap-2.5 text-xl font-semibold text-stone-800">
              <activeTabData.icon className={`w-6 h-6 ${activeTabData.type === 'shared' ? 'text-amber-500' : profile.color}`} />
              <span>{t.tabs[activeTabData.id]}</span>
            </div>
          </div>

          <button 
            onClick={handleSendHug}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all shadow-2xs border border-rose-100 active:scale-95"
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span className="text-sm font-medium hidden sm:block">{t.hug}</span>
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
          <div className="max-w-3xl mx-auto pb-20">
            {activeTab === 'ozbakim' ? (
              <SelfCareBoard 
                dailyCare={dailyCare} 
                onToggleHabit={handleToggleHabit} 
                onSetWater={handleSetWater} 
                profile={profile} 
                t={t}
              />
            ) : (
              <ListBoard 
                tasks={currentTasks} 
                onAdd={handleAddTask} 
                onToggle={handleToggleTask} 
                onDelete={handleDeleteTask}
                isShared={activeTabData.type === 'shared'}
                profile={profile}
                profiles={profiles}
                t={t}
                activeTab={activeTab}
              />
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-up {
          0% { transform: translateY(50px) scale(0.5) rotate(-10deg); opacity: 0; }
          20% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) scale(1.5) rotate(20deg); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up forwards cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d6d3d1; }
      `}} />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SelfCareBoard({ dailyCare, onToggleHabit, onSetWater, profile, t }) {
  const maxWater = 8;
  const currentWater = dailyCare.water || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Habits Card */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-stone-100 shadow-2xs text-center">
        <h3 className="text-lg font-medium text-stone-800 mb-1">{t.dailyStepsTitle}</h3>
        <p className="text-stone-400 text-sm mb-8">{t.dailyStepsSubtitle}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {t.habits.map(habit => {
            const isDone = !!dailyCare[habit.id];
            const HabitIcon = habit.icon;
            return (
              <button
                key={habit.id}
                onClick={() => onToggleHabit(habit.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  isDone 
                    ? `${profile.bg} ${profile.border} ${profile.color}` 
                    : 'bg-white border-stone-100 hover:border-stone-200 text-stone-600'
                }`}
              >
                <div className={`shrink-0 ${isDone ? profile.color : 'text-stone-300'}`}>
                  {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </div>
                <span className={`flex-1 font-medium text-sm ${isDone ? '' : 'text-stone-600'}`}>
                  {habit.label}
                </span>
                <HabitIcon className={`w-5 h-5 opacity-40`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Water Tracker Card */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-stone-100 shadow-2xs text-center">
        <h3 className="text-lg font-medium text-stone-800 mb-6 flex items-center justify-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" /> {t.waterTracker}
        </h3>
        
        <div className="flex flex-wrap justify-center gap-3">
          {[...Array(maxWater)].map((_, i) => (
            <button
              key={i}
              onClick={() => onSetWater(currentWater === i + 1 ? i : i + 1)}
              className={`relative w-12 h-16 sm:w-14 sm:h-20 rounded-b-2xl rounded-t-lg border-2 overflow-hidden transition-all group
                ${i < currentWater ? 'border-blue-200 bg-blue-50' : 'border-stone-100 hover:border-blue-100 bg-stone-50'}
              `}
            >
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-200 transition-all duration-500 ease-out"
                style={{ height: i < currentWater ? '100%' : '0%' }}
              />
              <Droplets className={`absolute inset-0 m-auto w-6 h-6 transition-colors z-10 ${
                i < currentWater ? 'text-blue-600' : 'text-stone-300 group-hover:text-blue-300'
              }`} />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

function ListBoard({ tasks, onAdd, onToggle, onDelete, isShared, profile, profiles, t, activeTab }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onAdd(inputValue);
    setInputValue('');
  };

  const presets = t.presets[activeTab] || [];
  const pending = tasks.filter(tItem => !tItem.completed);
  const completed = tasks.filter(tItem => tItem.completed);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Quick Add Presets */}
      {presets.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider pl-1">{t.quickAdd}</span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {presets.map((presetText, idx) => (
              <button
                key={idx}
                onClick={() => onAdd(presetText)}
                className="bg-white hover:bg-stone-50 border border-stone-100 text-stone-600 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap shadow-2xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus size={13} className="text-stone-400" />
                <span>{presetText}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-stone-400">
          <Plus className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t.newTaskPlaceholder}
          className="w-full bg-white border-2 border-stone-100 rounded-3xl py-4 pl-14 pr-16 text-base focus:outline-none focus:border-stone-300 focus:ring-0 transition-all shadow-2xs placeholder:text-stone-300 text-stone-700"
        />
        <button 
          type="submit"
          disabled={!inputValue.trim()}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl transition-all disabled:opacity-50 ${
            isShared ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : `${profile.bg} ${profile.color} hover:${profile.activeBg}`
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 && (
          <div className="py-12 text-center text-stone-400 flex flex-col items-center gap-3">
            <User className="w-12 h-12 opacity-20" />
            <p className="text-sm">{t.emptyState}</p>
          </div>
        )}

        {/* Pending */}
        {pending.map(task => (
          <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} isShared={isShared} profiles={profiles} t={t} />
        ))}

        {/* Completed */}
        {completed.length > 0 && (
          <div className="pt-6 mt-6 border-t border-stone-100 space-y-3">
            <p className="text-xs font-bold text-stone-300 uppercase tracking-wider pl-2">{t.completedTitle}</p>
            {completed.map(task => (
              <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} isShared={isShared} profiles={profiles} t={t} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, isShared, profiles, t }) {
  const creatorProfile = profiles.find(p => p.id === task.createdBy);

  return (
    <div className={`group flex items-center gap-4 p-4 sm:p-5 bg-white rounded-[1.5rem] border-2 transition-all shadow-2xs
      ${task.completed ? 'border-stone-100 bg-stone-50/50 opacity-60' : 'border-stone-100 hover:border-stone-200 hover:shadow-xs'}`}
    >
      <button 
        onClick={() => onToggle(task)}
        className="shrink-0 text-stone-300 hover:text-stone-500 transition-colors"
      >
        {task.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6" />}
      </button>

      <span className={`flex-1 text-sm sm:text-base transition-all break-words ${task.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>
        {task.text}
      </span>

      {isShared && creatorProfile && (
        <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${creatorProfile.bg} ${creatorProfile.color}`}>
          <span>{creatorProfile.name} {t.addedBy}</span>
        </div>
      )}

      <button 
        onClick={() => onDelete(task.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all focus:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
