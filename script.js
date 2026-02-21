/* Valid Users */
const users = {
    "Sarith": "Sarith@2013", "Sneha": "Sneha@2008", "Sumi": "Sumi@1982", "Sijoy": "1973"
};

/* State Management */
let files = JSON.parse(localStorage.getItem("cloudFiles")) || [];
let usedStorage = parseFloat(localStorage.getItem("usedStorage")) || 0;
const totalStorage = 100;

window.onload = function() {
    const savedUser = localStorage.getItem("activeUser");
    if(savedUser) renderDashboard(savedUser);
    
    updateStorageUI();
    renderFiles();
    updateClock();
    updateSystemStats();
    setInterval(updateClock, 1000);

    const notes = document.getElementById("quickNotes");
    notes.value = localStorage.getItem("userNotes") || "";
    notes.oninput = (e) => localStorage.setItem("userNotes", e.target.value);

    document.getElementById("togglePassword").onclick = function() {
        const pw = document.getElementById("password");
        pw.type = pw.type === "password" ? "text" : "password";
        this.innerText = pw.type === "password" ? "👁️" : "🙈";
    };
};

/* Auth & Dashboard */
function showDashboard() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    if(users[user] === pass) {
        localStorage.setItem("activeUser", user);
        localStorage.setItem("lastLogin", new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
        renderDashboard(user);
    } else {
        alert("Incorrect credentials");
    }
}

function renderDashboard(username) {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("loggedUser").innerText = username;
    document.getElementById("avatar").innerText = username[0].toUpperCase();
    updateSystemStats();
}

function logout() {
    localStorage.removeItem("activeUser");
    location.reload();
}

/* File Actions */
async function handleFileUpload(input) {
    const formData = new FormData();
    for (let file of input.files) {
        formData.append('files', file);
    }

    try {
        // Update this URL to your Render link
        const response = await fetch('https://your-app.onrender.com/upload', {
            method: 'POST',
            body: formData
        });

        const uploadedFiles = await response.json();

        uploadedFiles.forEach(file => {
            files.push({
                name: file.name,
                size: file.size / (1024**3),
                data: file.url // This is now the permanent Cloudinary link!
            });
        });

        saveAndRefresh();
        alert("Files uploaded to the Cloud successfully!");
    } catch (error) {
        alert("Cloud server is sleeping or down. Please wait a moment.");
    }
}

function deleteFile(index) {
    usedStorage -= files[index].size;
    files.splice(index, 1);
    saveAndRefresh();
}

/* UI Rendering */
function renderFiles(filteredData = files) {
    const list = document.getElementById("fileList");
    list.innerHTML = "";
    filteredData.forEach((file) => {
        const originalIndex = files.indexOf(file);
        const icon = file.type.includes("image") ? "🖼️" : "📄";
        list.innerHTML += `
            <div class="glass app-card">
                <span style="font-size:40px;">${icon}</span>
                <p style="font-size:11px; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${file.name}</p>
                <div style="margin-top:10px; display:flex; gap:10px;">
                    <a href="${file.data}" download="${file.name}" style="text-decoration:none;">📥</a>
                    <span onclick="deleteFile(${originalIndex})" style="color:#ff4d4d; cursor:pointer;">✕</span>
                </div>
            </div>
        `;
    });
}

function filterFiles() {
    const term = document.getElementById("searchInput").value.toLowerCase();
    const filtered = files.filter(f => f.name.toLowerCase().includes(term));
    renderFiles(filtered);
}

/* Stats Updates */
function updateSystemStats() {
    const statFiles = document.getElementById("statFiles");
    const statLogin = document.getElementById("statLogin");
    const statHealth = document.getElementById("statHealth");

    if(statFiles) statFiles.innerText = files.length;
    if(statLogin) statLogin.innerText = localStorage.getItem("lastLogin") || "New Session";
    
    if(statHealth) {
        if(usedStorage > 80) statHealth.innerText = "Critical";
        else if(usedStorage > 50) statHealth.innerText = "Warning";
        else statHealth.innerText = "Healthy";
    }
}

function updateStorageUI() {
    const percent = Math.min((usedStorage / totalStorage) * 100, 100).toFixed(1);
    document.getElementById("storagePercent").innerText = percent + "%";
    document.getElementById("storageText").innerText = `Used: ${usedStorage.toFixed(4)}GB / 100GB`;
    document.getElementById("storageCircle").style.background = `conic-gradient(#2d7fff ${percent}%, rgba(255,255,255,0.1) 0%)`;
}

function updateClock() {
    const now = new Date();
    document.getElementById("clock").innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById("date").innerText = now.toDateString();
}

function saveAndRefresh() {
    localStorage.setItem("cloudFiles", JSON.stringify(files));
    localStorage.setItem("usedStorage", usedStorage);
    renderFiles();
    updateStorageUI();
    updateSystemStats();
}
