/**
 * Funzione principale per il caricamento dinamico
 * @param {string} section - Il nome della sezione da caricare
 */
async function loadPage(section) {
    try {
        // 1. Recupero dati dal JSON
        const response = await fetch('./data.json');
        if (!response.ok) throw new Error("Impossibile trovare data.json");
        
        const data = await response.json();
        
        // 2. Selezione del contenitore (ID sincronizzato con HTML)
        const container = document.getElementById('main-content-area');

        // Controllo di sicurezza per evitare l'errore "innerHTML of null"
        if (!container) {
            console.error("ERRORE: L'elemento 'main-content-area' non esiste nell'HTML.");
            return;
        }

        // 3. Renderizzazione del contenuto
        renderContent(section, data, container);

    } catch (error) {
        console.error("Errore nel caricamento dinamico:", error);
    }
}

/**
 * Funzione interna per generare l'HTML
 */
function renderContent(section, data, container) {
    // Effetto dissolvenza
    container.style.opacity = 0;

    setTimeout(() => {
        container.innerHTML = ""; // Pulisce la sezione

        if (section === 'home') {
            container.innerHTML = `
                <h3 class="label">${data.home.sottotitolo}</h3>
                <h1 class="title">${data.home.titolo}</h1>
                <p class="description-text">${data.home.descrizione}</p>
            `;
        } 
        else if (section === 'droni') {
            const drone = data.droni[0];
            container.innerHTML = `
                <h1 class="title">${drone.nome}</h1>
                <img src="${drone.immagine}" alt="${drone.nome}" class="drone-image">
                <table class="compact-table">
                    ${Object.entries(drone.specifiche).map(([k, v]) => `
                        <tr>
                            <td>${k.toUpperCase()}</td>
                            <td>${v}</td>
                        </tr>
                    `).join('')}
                </table>
            `;
        }
        else if (section === 'servizi') {
            container.innerHTML = `
                <h3 class="label">COSA FACCIAMO</h3>
                <h1 class="title">I NOSTRI SERVIZI</h1>
                <div class="services-list">
                    ${data.servizi.map(s => `
                        <div class="service-card">
                            <h3>${s.icona ? s.icona + ' ' : ''}${s.nome}</h3>
                            <p>${s.descrizione}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // ... dentro renderContent ...
        else if (section === 'social') {
            container.innerHTML = `
                <h3 class="label">SEGUICI SUI SOCIAL</h3>
                <h1 class="title">AIRDEVS COMMUNITY</h1>
                <div class="social-list">
                    <a href="${data.social.instagram}" target="_blank" class="social-card">
                        <span class="social-icon">📸</span>
                        <div class="social-info">
                            <h3>INSTAGRAM</h3>
                            <p>Guarda i nostri ultimi voli e dietro le quinte.</p>
                        </div>
                    </a>
                    <a href="${data.social.tiktok}" target="_blank" class="social-card">
                        <span class="social-icon">📱</span>
                        <div class="social-info">
                            <h3>TIKTOK</h3>
                            <p>Video tech, trick e soluzioni rapide con i droni.</p>
                        </div>
                    </a>
                </div>
            `;
        }
        else if (section === 'prenota') {
            container.innerHTML = `
                <h3 class="label">PREVENTIVI VELOCI</h3>
                <h1 class="title">PRENOTA UN SERVIZIO</h1>
                <div class="booking-wrapper">
                    <p style="margin-bottom: 10px; font-size: 13px; color: #888;">COSA TI INTERESSA?</p>
                    
                    <select id="select-servizio" class="glass-select">
                        ${data.servizi.map(s => `<option value="${s.nome}">${s.nome}</option>`).join('')}
                    </select>

                    <div class="contact-wrapper" style="margin-top: 30px;">
                        <div class="contact-item" onclick="inviaEmailPrenotazione('${data.contatti.email}')" style="cursor:pointer;">
                            <span class="icon">📧</span>
                            <div class="contact-info">
                                <small>OFFICIAL BOOKING</small>
                                <h3>INVIA RICHIESTA EMAIL</h3>
                                <p>Clicca per generare la mail di prenotazione</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        else if (section === 'contatti') {
            container.innerHTML = `
                <h3 class="label">RESTA IN CONTATTO</h3>
                <h1 class="title">CONTATTACI</h1>
                
                <div class="contact-wrapper">
                    <a href="mailto:${data.contatti.email}" class="contact-item">
                        <span class="icon">📧</span>
                        <div class="contact-info">
                            <small>SCRIVICI</small>
                            <h3>EMAIL</h3>
                            <p>${data.contatti.email}</p>
                        </div>
                    </a>

                    <a href="tel:${data.contatti.telefono.replace(/\s+/g, '')}" class="contact-item">
                        <span class="icon">📞</span>
                        <div class="contact-info">
                            <small>CHIAMACI</small>
                            <h3>TELEFONO</h3>
                            <p>${data.contatti.telefono}</p>
                        </div>
                    </a>
                </div>
            `;

        }

        container.style.opacity = 1;
    }, 200);
}

/* Funzione per comporre ed inviare la mail di prenotazione*/
function inviaEmailPrenotazione(emailAziendale) {
    // Recupera il servizio selezionato dalla tendina
    const servizioScelto = document.getElementById('select-servizio').value;
    
    // Configura Oggetto e Corpo del messaggio
    const subject = encodeURIComponent(`Richiesta Prenotazione: ${servizioScelto}`);
    const body = encodeURIComponent(`Salve AirDevs,\n\nVorrei richiedere maggiori informazioni o prenotare il seguente servizio: ${servizioScelto}.\n\nIn attesa di un vostro riscontro.`);

    // Apre il client email dell'utente
    window.location.href = `mailto:${emailAziendale}?subject=${subject}&body=${body}`;
}

// All'avvio carica la Home chiamando loadPage
window.onload = () => {
    loadPage('home');
};

let currentOTP = null;

// 1. Generazione e Invio OTP
function handleSendOTP() {
    
    const userEmail = document.getElementById('email').value;
    if (!userEmail) return alert("Inserisci l'email!");

    currentOTP = Math.floor(100000 + Math.random() * 900000);

    const templateParams = {
        to_email: userEmail,       // Destinatario (chi sta loggando)
        otp_code: currentOTP       // Codice generato
    };

    // Usa i dati aggiornati
    emailjs.send('service_j07b4ov', 'template_nadt11n', templateParams)
        .then(() => {
           document.getElementById('step-request').style.display = 'none';
           document.getElementById('step-verify').style.display = 'block';
        })
        .catch((err) => {
           console.error("Errore:", err);
           alert("Errore tecnico. Controlla la console.");
        });
}

// 2. Verifica del Codice
async function handleVerifyOTP() {
    const inputCode = document.getElementById('otp-code').value;
    const userEmail = document.getElementById('email').value.toLowerCase();

    // Verifica se l'OTP è corretto (usa inputCode == currentOTP per la produzione)
    if (inputCode == currentOTP || true) { 
        const areaPersonale = document.getElementById('area-personale');

        try {
            // 1. Carichiamo il database specifico 'database.json'
            const response = await fetch('./database.json');
            if (!response.ok) throw new Error("Impossibile caricare database.json");
            
            const data = await response.json();

            // 2. Cerchiamo il profilo cliente
            const profilo = data.clienti.find(c => c.email === userEmail);

            if (profilo) {
                let urlBase = "";
                let titoloDisplay = "";

                // 3. Gestione permessi Admin vs User
                if (profilo.ruolo === "admin") {
                    urlBase = "http://192.168.0.198/drone-files/";
                    titoloDisplay = "Pannello Amministratore (Tutti i Clienti)";
                } else {
                    const nomeCartella = encodeURIComponent(profilo.cartella);
                    urlBase = `http://192.168.0.198/drone-files/${nomeCartella}/`;
                    titoloDisplay = `Archivio Cliente: ${profilo.cartella}`;
                }

               // ... dentro handleVerifyOTP dopo aver trovato il profilo ...

            // Calcoliamo l'altezza: 100% dell'area disponibile meno 40px di margine
            areaPersonale.innerHTML = `
                <div style="display: flex; flex-direction: column; height: calc(100% - 20px); width: 100%; max-height: 600px; border-radius: 12px; overflow: hidden; background: #111; border: 1px solid rgba(255,255,255,0.1);">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; padding: 8px 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <h3 style="color: #00d4ff; margin: 0; font-size: 12px;">${profilo.ruolo === 'admin' ? 'ADMIN' : profilo.cartella}</h3>
                        
                        <div style="display: flex; gap: 5px;">
                            <button onclick="document.getElementById('drone-iframe').src='${urlBase}'" style="background:#34495e; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:9px;">🏠 HOME</button>
                            <button onclick="document.getElementById('drone-iframe').contentWindow.history.back()" style="background:#f39c12; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:9px;">⬅ IND.</button>
                            <button onclick="alert('Tasto destro > Salva link')" style="background:#27ae60; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:9px;">📥 DOWNLOAD</button>
                            <button onclick="location.reload()" style="background:#c0392b; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:9px;">✖ ESCI</button>
                        </div>
                    </div>

                    <div style="flex-grow: 1; overflow: hidden; background: white; position: relative;">
                        <iframe 
                            id="drone-iframe" 
                            src="${urlBase}" 
                            style="width: 125%; height: 125%; border: none; transform: scale(0.8); transform-origin: 0 0; position: absolute; top: 0; left: 0;">
                        </iframe>
                    </div>
                </div>
            `;
            } else {
                alert("Accesso negato: Email non presente nel database clienti.");
                resetUI();
            }
        } catch (error) {
            console.error("Errore critico:", error);
            alert("Errore nel caricamento del file database.json. Verifica che il file esista nella stessa cartella.");
        }
    } else {
        alert("Codice OTP errato. Riprova.");
    }
}

// Helper: Reset UI
function resetUI() {
    document.getElementById('step-request').style.display = 'block';
    document.getElementById('step-verify').style.display = 'none';
    currentOTP = null;
}
