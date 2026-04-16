<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>ZabHub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Cairo', sans-serif; background: #020205; color: #fff; overflow: hidden; }
        .glass-panel { background: rgba(10, 10, 15, 0.95); border: 1px solid #a855f7; box-shadow: 0 0 60px rgba(168, 85, 247, 0.15); }
        .neon-glow { text-shadow: 0 0 15px rgba(168, 85, 247, 0.7); color: #a855f7; }
        .input-style { 
            background: #050508; border: 1px solid #1e1e2e; color: white; 
            direction: ltr !important; text-align: left !important;
        }
        .input-style:focus { border-color: #a855f7; outline: none; }
        .btn-action { background: linear-gradient(135deg, #7e22ce, #a855f7); font-weight: 900; transition: 0.4s; cursor: pointer; }
        .btn-action:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(168, 85, 247, 0.4); }

        /* تنسيق شاشة الفيديو الترحيبية */
        #intro-video-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10000; /* للتأكد من أنها فوق كل شيء */
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 1s ease;
        }

        .switch { position: relative; display: inline-block; width: 40px; height: 20px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #1a1a2e; transition: .4s; border-radius: 20px; }
        .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #a855f7; }
        input:checked + .slider:before { transform: translateX(20px); }
    </style>
</head>
<body class="h-screen flex items-center justify-center p-6">

    <div id="intro-video-container">
  <video id="intro-video" width="100%" height="100%" autoplay muted playsinline>
    <source src="
    </div>

    <div class="glass-panel w-full max-w-6xl h-[88vh] rounded-[3rem] flex flex-col relative overflow-hidden">
        
        <div class="p-8 border-b border-white/5 flex justify-between items-center bg-black/30">
            <div>
                <h1 class="text-4xl font-black neon-glow italic tracking-tighter">ZABHUB</h1>
                <p class="text-[10px] text-gray-500 uppercase tracking-[0.4em] mt-1">Professional Code Pusher • v2.0</p>
            </div>
            <div id="status-box" class="flex items-center gap-3 px-5 py-2 border border-purple-500/20 rounded-full">
                <div id="status-dot" class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span id="status-text" class="text-[10px] font-bold text-red-500 uppercase">Locked</span>
            </div>
        </div>

        <div class="flex-1 p-10 flex flex-col">
            
            <div id="login-stage" class="flex-1 flex flex-col items-center justify-center space-y-6">
                <div class="text-6xl">🔒</div>
                <h2 class="text-2xl font-bold">ابدأ بتسجيل الدخول</h2>
                <button id="login-btn" class="btn-action px-12 py-4 rounded-xl text-white tracking-widest">LOGIN WITH GITHUB</button>
            </div>

            <div id="work-stage" class="hidden w-full h-full grid grid-cols-12 gap-8">
                <div class="col-span-5 space-y-5 flex flex-col justify-center">
                    <div class="space-y-1 text-right">
                        <label class="text-[10px] font-bold text-purple-400 uppercase tracking-widest">المستودع (Repository)</label>
                        <select id="repo-select" class="input-style w-full p-3 rounded-xl text-xs"></select>
                    </div>
                    <div class="space-y-1 text-right">
                        <label class="text-[10px] font-bold text-purple-400 uppercase tracking-widest">مسار المجلد</label>
                        <input id="folder-path" type="text" placeholder="مثلاً: src" class="input-style w-full p-3 rounded-xl text-xs">
                    </div>
                    <div class="space-y-1 text-right">
                        <label class="text-[10px] font-bold text-purple-400 uppercase tracking-widest">اسم الملف</label>
                        <input id="filename" type="text" placeholder="index.js" class="input-style w-full p-3 rounded-xl text-xs">
                    </div>
                    <div class="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex items-center justify-between">
                        <span class="text-[10px] font-bold">Update Mode</span>
                        <label class="switch"><input type="checkbox" id="update-mode"><span class="slider"></span></label>
                    </div>
                </div>

                <div class="col-span-7 flex flex-col">
                    <textarea id="code" class="flex-1 input-style w-full p-5 rounded-3xl text-sm font-mono resize-none" placeholder="// الصق كودك هنا..."></textarea>
                    <button id="push-btn" class="btn-action w-full mt-4 py-4 rounded-2xl text-white font-black">SEND TO GITHUB</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const { ipcRenderer } = require('electron');
        let USER_TOKEN = '';

        // كود التحكم في الفيديو الترحيبي
        const video = document.getElementById('intro-video');
        const videoContainer = document.getElementById('intro-video-container');

        video.onended = function() {
            videoContainer.style.opacity = '0'; // تأثير التلاشي
            setTimeout(() => {
                videoContainer.style.display = 'none'; // إخفاء الطبقة نهائياً
            }, 1000); // الانتظار ثانية واحدة لتكتمل الحركة
        };

        // باقي وظائف التطبيق كما هي
        document.getElementById('login-btn').onclick = () => ipcRenderer.send('login-github');

        ipcRenderer.on('token-received', (event, token) => {
            USER_TOKEN = token;
            document.getElementById('login-stage').classList.add('hidden');
            document.getElementById('work-stage').classList.remove('hidden');
            document.getElementById('status-dot').classList.replace('bg-red-500', 'bg-purple-500');
            document.getElementById('status-text').innerText = "Authorized";
            document.getElementById('status-text').classList.replace('text-red-500', 'text-purple-400');
            loadRepos();
        });

        async function loadRepos() {
            try {
                const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
                    headers: { 'Authorization': `token ${USER_TOKEN}` }
                });
                const repos = await res.json();
                const select = document.getElementById('repo-select');
                select.innerHTML = '';
                if (Array.isArray(repos)) {
                    repos.forEach(repo => { select.add(new Option(`📁 ${repo.full_name}`, repo.full_name)); });
                }
            } catch (e) { console.error(e); }
        }

        document.getElementById('push-btn').onclick = async () => {
            const repo = document.getElementById('repo-select').value;
            let folder = document.getElementById('folder-path').value.trim().replace(/\/+$/, "");
            let file = document.getElementById('filename').value.trim().replace(/^\/+/, "");
            const content = document.getElementById('code').value;
            const isUpdate = document.getElementById('update-mode').checked;

            if(!repo || !file || !content) return alert('أكمل البيانات!');
            const fullPath = folder ? `${folder}/${file}` : file;
            
            const btn = document.getElementById('push-btn');
            btn.innerText = 'SENDING...';

            try {
                let sha = null;
                if(isUpdate) {
                    const check = await fetch(`https://api.github.com/repos/${repo}/contents/${fullPath}`, {
                        headers: { 'Authorization': `token ${USER_TOKEN}` }
                    });
                    if(check.ok) { const d = await check.json(); sha = d.sha; }
                }

                const res = await fetch(`https://api.github.com/repos/${repo}/contents/${fullPath}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `token ${USER_TOKEN}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: "Push from ZabHub Pro",
                        content: btoa(unescape(encodeURIComponent(content))),
                        sha: sha
                    })
                });

                if(res.ok) { alert('Success! ✅'); document.getElementById('code').value = ''; }
                else { const e = await res.json(); alert('Error: ' + e.message); }
            } catch (e) { alert('Connection Error'); }
            finally { btn.innerText = 'SEND TO GITHUB'; }
        };
    </script>
</body>
</html>s