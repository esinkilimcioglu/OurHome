import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Heart, 
  Plus, 
  Droplet, 
  Globe, 
  CheckCircle2, 
  Home, 
  User, 
  LogOut,
  Pencil
} from 'lucide-react';

// --- ÇEVİRİ SÖZLÜĞÜ (DIL DESTEĞI) ---
const dict = {
  tr: {
    welcome: "Hoş Geldin!",
    selectProfile: "Lütfen kendi profilini seç.",
    addUser: "Yeni Kişi Ekle",
    enterName: "Eklenecek kişinin adını yazın:",
    renamePrompt: "Yeni ismi girin:",
    mySpace: "Benim Alanım",
    sharedSpace: "Ortak Alan",
    hug: "Sarıl",
    water: "Su İç",
    newTask: "Yeni bir adım ekle...",
    add: "Ekle",
    logout: "Profilden Çık",
    noTask: "Henüz bir şey yok. Sadece dinlen.",
    hugSent: "Sımsıkı sarıldın! 💖",
    waterDrank: "Su içildi! 💧",
    tasks: "Günün Akışı",
  },
  en: {
    welcome: "Welcome!",
    selectProfile: "Please select your profile.",
    addUser: "Add User",
    enterName: "Enter the new user's name:",
    renamePrompt: "Enter new name:",
    mySpace: "My Space",
    sharedSpace: "Shared Space",
    hug: "Send Hug",
    water: "Drink Water",
    newTask: "Add a gentle step...",
    add: "Add",
    logout: "Log Out",
    noTask: "Nothing here yet. Take it easy.",
    hugSent: "Hug sent! 💖",
    waterDrank: "Water drank! 💧",
    tasks: "Daily Flow",
  }
};

export default function App() {
  const [lang, setLang] = useState('tr');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState("");

  const t = dict[lang];

  // Kullanıcıları Firebase'den çek, eğer veritabanı boşsa varsayılan 2 profili oluştur
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        const seedDefaultUsers = async () => {
          await addDoc(collection(db, 'users'), { 
            name: 'Profil 1', 
            color: 'bg-pink-100 text-pink-600 border-pink-200', 
            createdAt: serverTimestamp() 
          });
          await addDoc(collection(db, 'users'), { 
            name: 'Profil 2', 
            color: 'bg-blue-100 text-blue-600 border-blue-200', 
            createdAt: serverTimestamp() 
          });
        };
        seedDefaultUsers();
      } else {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });
    return () => unsub();
  }, []);

  // Görevleri Çek
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [currentUser]);

  // Yeni Kullanıcı Ekleme
  const handleAddUser = async () => {
    const name = window.prompt(t.enterName);
    if (!name || !name.trim()) return;
    await addDoc(collection(db, 'users'), {
      name: name.trim(),
      color: 'bg-green-100 text-green-600 border-green-200',
      createdAt: serverTimestamp()
    });
  };

  // İsim Değiştirme (Kalem İkonuyla)
  const handleRenameUser = async (e, user) => {
    e.stopPropagation();
    const newName = window.prompt(t.renamePrompt, user.name);
    if (newName && newName.trim() !== "") {
      await updateDoc(doc(db, 'users', user.id), { 
        name: newName.trim() 
      });
    }
  };

  // Görev Ekleme
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await addDoc(collection(db, 'tasks'), {
      text: newTask,
      completed: false,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      isShared: activeTab === 'shared',
      createdAt: serverTimestamp()
    });
    setNewTask("");
  };

  // Görev Tamamlama
  const toggleTask = async (taskId, currentStatus) => {
    await updateDoc(doc(db, 'tasks', taskId), {
      completed: !currentStatus
    });
  };

  // Bildirimler (Toast)
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const displayedTasks = tasks.filter(task => 
    activeTab === 'shared' ? task.isShared : (!task.isShared && task.ownerId === currentUser?.id)
  );

  // --- GİRİŞ EKRANI (PROFIL SEÇIMI) ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 transition-colors duration-300">
        
        {/* Dil Seçeneği */}
        <button 
          onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
          className="absolute top-6 right-6 flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full shadow-sm text-gray-500 hover:bg-white transition"
        >
          <Globe size={18} />
          <span className="text-sm font-medium uppercase">{lang}</span>
        </button>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm w-full max-w-sm text-center">
          <h1 className="text-3xl font-semibold text-gray-700 mb-2">OurHome</h1>
          <p className="text-gray-400 mb-8">{t.selectProfile}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => setCurrentUser(u)}
                className={`${u.color} border-2 aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 relative group`}
              >
                {/* İsim Değiştirme Butonu */}
                <div 
                  onClick={(e) => handleRenameUser(e, u)}
                  className="absolute top-3 right-3 p-1.5 bg-white/50 rounded-full text-current opacity-70 hover:opacity-100 transition-opacity"
                  title={t.renamePrompt}
                >
                  <Pencil size={14} />
                </div>

                <div className="bg-white/50 p-3 rounded-full mt-2">
                  <User size={32} />
                </div>
                <span className="font-medium text-lg px-2 text-center w-full truncate">{u.name}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={handleAddUser}
            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-medium flex items-center justify-center gap-2 hover:bg-gray-50/50 transition"
          >
            <Plus size={20} />
            {t.addUser}
          </button>
        </div>
      </div>
    );
  }

  // --- ANA UYGULAMA EKRANI ---
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* Toast Mesajı */}
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg font-medium text-gray-600 flex items-center gap-2 transition-all z-50 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        {toast}
      </div>

      {/* Üst Bar */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="overflow-hidden">
          <h2 className="text-2xl font-semibold text-gray-700 truncate">{t.welcome} {currentUser.name}!</h2>
          <p className="text-sm text-gray-400">OurHome</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} className="p-2 bg-white rounded-full shadow-sm text-gray-400">
            <Globe size={20} />
          </button>
          <button onClick={() => setCurrentUser(null)} className="p-2 bg-white rounded-full shadow-sm text-gray-400">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Tab Menüsü */}
      <div className="px-6 flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-3 rounded-2xl font-medium transition flex items-center justify-center gap-2 ${activeTab === 'personal' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400'}`}
        >
          <User size={18} />
          {t.mySpace}
        </button>
        <button 
          onClick={() => setActiveTab('shared')}
          className={`flex-1 py-3 rounded-2xl font-medium transition flex items-center justify-center gap-2 ${activeTab === 'shared' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400'}`}
        >
          <Home size={18} />
          {t.sharedSpace}
        </button>
      </div>

      {/* Etkileşim Butonları */}
      {activeTab === 'personal' && (
        <div className="px-6 flex gap-4 mb-8">
          <button onClick={() => showToast(t.hugSent)} className="flex-1 bg-pink-100 text-pink-500 py-4 rounded-3xl font-medium flex flex-col items-center justify-center gap-2 active:scale-95 transition">
            <Heart size={24} fill="currentColor" />
            {t.hug}
          </button>
          <button onClick={() => showToast(t.waterDrank)} className="flex-1 bg-blue-100 text-blue-500 py-4 rounded-3xl font-medium flex flex-col items-center justify-center gap-2 active:scale-95 transition">
            <Droplet size={24} fill="currentColor" />
            {t.water}
          </button>
        </div>
      )}

      {/* Görev Listesi */}
      <div className="px-6 flex-1 overflow-y-auto pb-24">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-2">{t.tasks}</h3>
        
        <div className="space-y-3">
          {displayedTasks.length === 0 ? (
            <p className="text-center text-gray-400 mt-10 italic">{t.noTask}</p>
          ) : (
            displayedTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id, task.completed)}
                className={`bg-white p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition ${task.completed ? 'opacity-50' : 'shadow-sm'}`}
              >
                <div className={`${task.completed ? 'text-green-400' : 'text-gray-200'}`}>
                  <CheckCircle2 size={24} fill={task.completed ? "currentColor" : "none"} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={`font-medium break-words ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.text}
                  </p>
                  {activeTab === 'shared' && (
                    <span className="text-xs text-gray-400 mt-1 block truncate">Ekleyen: {task.ownerName}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Yeni Görev Ekleme Inputu */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7] to-transparent">
        <form onSubmit={addTask} className="flex gap-2">
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder={t.newTask}
            className="flex-1 px-6 py-4 rounded-full shadow-sm border-none focus:ring-2 focus:ring-pink-200 outline-none text-gray-600 bg-white"
          />
          <button 
            type="submit"
            className="bg-gray-800 text-white px-6 py-4 rounded-full font-medium active:scale-95 transition flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">{t.add}</span>
          </button>
        </form>
      </div>

    </div>
  );
}
