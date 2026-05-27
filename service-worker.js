self.addEventListener('push', function(event) {
    // Par défaut si aucun texte n'est envoyé
    let title = "💧 Drink Water !";
    let options = {
        body: "Il est temps de boire un grand verre d'eau !",
        icon: "💧",
        badge: "💧",
        vibrate: [300, 100, 300, 100, 400],
        data: { url: self.location.origin }
    };

    // Si Supabase envoie des détails personnalisés
    if (event.data) {
        try {
            const data = event.data.json();
            title = data.title || title;
            options.body = data.body || options.body;
        } catch (e) {
            options.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Quand on clique sur la notification, ça ouvre le site
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

    Clique sur Commit changes pour enregistrer.

Étape 2 : Mettre à jour ton fichier index.html

Maintenant, il faut modifier ton fichier principal pour qu'il demande la permission d'envoyer des notifications et qu'il active le fichier qu'on vient de créer.

Remplace tout le code de ton fichier index.html sur GitHub par ce code complet :
HTML

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>💧 Drink Water !</title>
    
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#0f172a">

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

    <style>
        :root {
            --bg: #0f172a;
            --card: #1e293b;
            --water: #38bdf8;
            --water-deep: #0284c7;
            --text: #f8fafc;
            --text-secondary: #94a3b8;
        }

        * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            margin: 0;
            padding: 0;
            background-color: var(--bg);
            color: var(--text);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
        }

        #profile-selection {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 30px;
            text-align: center;
            z-index: 10;
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 10px;
            color: var(--water);
        }

        .subtitle {
            color: var(--text-secondary);
            margin-bottom: 20px;
        }

        .profile-btn {
            background: var(--card);
            border: 2px solid var(--card);
            color: var(--text);
            padding: 20px 40px;
            font-size: 1.3rem;
            font-weight: bold;
            border-radius: 16px;
            cursor: pointer;
            width: 260px;
            transition: all 0.2s ease;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }

        .profile-btn:active {
            transform: scale(0.95);
            border-color: var(--water);
        }

        #main-app {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 100vh;
            padding: 30px 20px 50px 20px;
            position: relative;
        }

        .top-bar {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--card);
            padding: 15px 20px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header-status {
            text-align: left;
            font-size: 1rem;
            color: var(--text-secondary);
            line-height: 1.4;
        }

        .user-tag {
            color: var(--water);
            font-weight: bold;
        }

        .reset-profile {
            background: #ef4444;
            border: none;
            color: white;
            padding: 10px 14px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: bold;
            transition: background 0.2s;
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
        }

        .water-button-container {
            position: relative;
            width: 220px;
            height: 220px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: auto 0;
        }

        .main-water-btn {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--water), var(--water-deep));
            border: none;
            color: white;
            font-size: 4rem;
            cursor: pointer;
            box-shadow: 0 0 30px rgba(56, 189, 248, 0.4), inset 0 -8px 0 rgba(0,0,0,0.1);
            z-index: 2;
            transition: transform 0.1s ease;
        }

        .main-water-btn:active {
            transform: scale(0.92);
        }

        .pulse-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: var(--water);
            opacity: 0.4;
            z-index: 1;
        }

        .animate-pulse .pulse-ring {
            animation: ripple 1.2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }

        @keyframes ripple {
            0% { transform: scale(1); opacity: 0.4; }
            100% { transform: scale(1.6); opacity: 0; }
        }

        #alert-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.9);
            z-index: 100;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .alert-box {
            background: var(--card);
            border: 3px solid var(--water);
            padding: 40px 30px;
            border-radius: 24px;
            max-width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .alert-title {
            font-size: 2.2rem;
            margin-bottom: 15px;
            animation: bounce 0.5s infinite alternate;
        }

        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }

        .got-it-btn {
            background: var(--water);
            color: #000;
            border: none;
            padding: 15px 40px;
            font-size: 1.2rem;
            font-weight: bold;
            border-radius: 12px;
            margin-top: 25px;
            cursor: pointer;
            width: 100%;
        }

        #toast {
            position: fixed;
            bottom: 30px;
            background: #22c55e;
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: bold;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 50;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }

        /* Bannière d'autorisation des notifs */
        #notif-banner {
            display: none;
            background: #eab308;
            color: #000;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            font-size: 0.9rem;
            cursor: pointer;
            width: 100%;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 99;
        }
    </style>
</head>
<body>

    <div id="notif-banner" onclick="requestNotificationPermission()">
        ⚠️ Cliquez ici pour activer les notifications style SMS !
    </div>

    <div id="profile-selection">
        <h1>💧 Drink Water Reminder</h1>
        <p class="subtitle">Qui êtes-vous ? / Who are you ?</p>
        <button class="profile-btn" onclick="selectProfile('Clément')">👨‍💻 Clément</button>
        <button class="profile-btn" onclick="selectProfile('Hoa')">👩‍⚕️ Hoa</button>
    </div>

    <div id="main-app">
        <div class="top-bar">
            <div class="header-status">
                <span id="label-profile">Profil :</span> <span id="current-user" class="user-tag">...</span><br>
                <span style="font-size: 0.8rem;" id="target-user">Envoie un rappel à ...</span>
            </div>
            <button id="btn-logout" class="reset-profile" onclick="logout()">Changer</button>
        </div>

        <div class="water-button-container" id="btn-container">
            <div class="pulse-ring"></div>
            <button class="main-water-btn" onclick="sendWaterReminder()">💧</button>
        </div>

        <div></div>
    </div>

    <div id="alert-overlay">
        <div class="alert-box">
            <div id="alert-title-text" class="alert-title">🌊 BOIS DE L'EAU !</div>
            <p id="alert-message" style="font-size: 1.2rem; line-height: 1.5;"></p>
            <button id="btn-dismiss" class="got-it-btn" onclick="dismissAlert()">C'est fait ! 👍</button>
        </div>
    </div>

    <div id="toast">Rappel envoyé ! 🚀</div>

    <audio id="water-sound" src="https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav" preload="auto"></audio>

<script>
    const SUPABASE_URL = "https://dbcxfskynfuwcbbgjlso.supabase.co"; 
    const SUPABASE_KEY = "sb_publishable_vcEj5jZ7UcrirwO4HglatQ_tgrbAg6n";

    let supabaseClient;
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        alert("Erreur de configuration Supabase.");
    }

    let currentUser = localStorage.getItem('water_user') || null;
    let targetUser = "";

    // --- ENREGISTREMENT DU SERVICE WORKER (ANDROID NOTIFS) ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
        .then(reg => {
            console.log('Service Worker enregistré avec succès !', reg);
            checkNotificationPermission();
        })
        .catch(err => console.log('Échec de l\'enregistrement du Service Worker', err));
    }

    function checkNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                document.getElementById('notif-banner').style.display = 'block';
            }
        }
    }

    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    document.getElementById('notif-banner').style.display = 'none';
                    // Déclenche une petite notification de test
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification("💧 Drink Water", { body: "Notifications activées avec succès ! 🚀" });
                    });
                }
            });
        }
    }

    if (currentUser) {
        showApp();
    }

    function selectProfile(name) {
        try {
            currentUser = name;
            localStorage.setItem('water_user', name);
            showApp();
            checkNotificationPermission();
        } catch(err) {
            alert("Erreur lors de la sélection : " + err.message);
        }
    }

    function showApp() {
        targetUser = (currentUser === "Clément") ? "Hoa" : "Clément";
        
        document.getElementById('profile-selection').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        document.getElementById('current-user').innerText = currentUser;
        
        if (currentUser === "Hoa") {
            document.getElementById('label-profile').innerText = "Hồ sơ:";
            document.getElementById('target-user').innerText = `Gửi nhắc nhở uống nước cho ${targetUser}`;
            document.getElementById('btn-logout').innerText = "Thay đổi";
            document.getElementById('toast').innerText = "Đã gửi nhắc nhở! 🚀";
            document.getElementById('alert-title-text').innerText = "🌊 UỐNG NƯỚC ĐI !";
            document.getElementById('btn-dismiss').innerText = "Đã xong! 👍";
            document.getElementById('notif-banner').innerText = "⚠️ Bấm vào đây để bật thông báo như tin nhắn SMS !";
        } else {
            document.getElementById('label-profile').innerText = "Profil :";
            document.getElementById('target-user').innerText = `Envoie un rappel de boire à ${targetUser}`;
            document.getElementById('btn-logout').innerText = "Changer";
            document.getElementById('toast').innerText = "Rappel envoyé ! 🚀";
            document.getElementById('alert-title-text').innerText = "🌊 BOIS DE L'EAU !";
            document.getElementById('btn-dismiss').innerText = "C'est fait ! 👍";
        }
        
        listenToReminders();
    }

    function logout() {
        localStorage.removeItem('water_user');
        window.location.href = window.location.origin + window.location.pathname;
    }

    async function sendWaterReminder() {
        const container = document.getElementById('btn-container');
        container.classList.add('animate-pulse');
        setTimeout(() => container.classList.remove('animate-pulse'), 1200);

        try {
            const { error } = await supabaseClient
                .from('water_reminders')
                .insert([{ sender: currentUser }]);

            if (!error) {
                showToast();
            } else {
                alert("Erreur : " + error.message);
            }
        } catch(e) {
            alert("Impossible d'envoyer : " + e.message);
        }
    }

    function listenToReminders() {
        try {
            supabaseClient
                .channel('public:water_reminders')
                .on('postgres_changes', { event: 'INSERT', pattern: 'public', table: 'water_reminders' }, payload => {
                    const newReminder = payload.new;
                    if (newReminder.sender === targetUser) {
                        triggerAlert(newReminder.sender);
                        
                        // --- DÉCLENCHEMENT DE LA NOTIFICATION PUSH SYSTÈME (MÊME ARRIÈRE PLAN) ---
                        if ('Notification' in window && Notification.permission === 'granted') {
                            navigator.serviceWorker.ready.then(reg => {
                                let title = "🌊 BOIS DE L'EAU !";
                                let body = `${newReminder.sender} te rappelle qu'il faut boire immédiatement !`;
                                
                                if (currentUser === "Hoa") {
                                    title = "🌊 UỐNG NƯỚC ĐI !";
                                    body = `${newReminder.sender} nhắc bạn rằng đã đến lúc phải uống nước !`;
                                }
                                
                                reg.showNotification(title, {
                                    body: body,
                                    icon: "💧",
                                    badge: "💧",
                                    vibrate: [300, 100, 300, 100, 400],
                                    tag: 'water-reminder',
                                    renotify: true
                                });
                            });
                        }
                    }
                })
                .subscribe();
        } catch(e) {
            console.error("Erreur Realtime :", e);
        }
    }

    function triggerAlert(sender) {
        if (currentUser === "Hoa") {
            document.getElementById('alert-message').innerHTML = `<b>${sender}</b> nhắc bạn rằng đã đến lúc phải uống nước ngay lập tức!`;
        } else {
            document.getElementById('alert-message').innerHTML = `<b>${sender}</b> te rappelle qu'il est temps de t'hydrater immédiatement !`;
        }
        
        document.getElementById('alert-overlay').style.display = 'flex';
        
        try {
            document.getElementById('water-sound').play();
        } catch(e) { console.log("Son bloqué."); }
    }

    function dismissAlert() {
        document.getElementById('alert-overlay').style.display = 'none';
    }

    function showToast() {
        const toast = document.getElementById('toast');
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 2000);
    }
</script>
</body>
</html>
