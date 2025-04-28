
const RealeApp = {
  
  constants: {
    STORAGE_KEY_PREFIX: 'storico_',
    MIN_AGE: 18,
    MAX_AGE: 99,
    MIN_VALUE: 1000,
    MAX_SINISTRI: 30,
    BASE_RATE: 0.05 
  },
  
  
  auth: {
    
    users: {
      "alessandro": "1234",
      "admin": "admin",
      "demo": "demo"
    },
    
   
    login: function(username, password) {
      if (this.users[username] && this.users[username] === password) {
        sessionStorage.setItem("utenteCorrente", username);
        return true;
      }
      return false;
    },
    
    
    getCurrentUser: function() {
      return sessionStorage.getItem("utenteCorrente") || 'default';
    },
    
   
    setupLoginForm: function() {
      const loginForm = document.getElementById("form-login");
      if (!loginForm) return;
      
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        
        if (this.login(username, password)) {
          window.location.href = "polizza.html";
        } else {
          RealeApp.ui.showError("Credenziali non valide. Riprova.");
        }
      });
    }
  },
  
 
  calculator: {
    
    calculatePremium: function(tipo, eta, valore, sinistri, copertura) {
      let moltiplicatore = 1.0;
      const dettagli = [`Premio base: ${(valore * RealeApp.constants.BASE_RATE).toFixed(2)}€ (5% del valore assicurato)`];
      
      
      if (copertura === "completa") {
        moltiplicatore += 0.5;
        dettagli.push("Copertura completa: +50% sul moltiplicatore");
      } else {
        dettagli.push("Copertura base: nessuna maggiorazione");
      }
      
      
      if (eta < 25) {
        moltiplicatore += 0.4;
        dettagli.push("Età < 25 anni: +40% sul moltiplicatore");
      } else if (eta > 65) {
        moltiplicatore += 0.3;
        dettagli.push("Età > 65 anni: +30% sul moltiplicatore");
      } else {
        moltiplicatore += 0.1;
        dettagli.push("Età tra 25 e 65 anni: +10% sul moltiplicatore");
      }
      
      
      if (sinistri > 0) {
        const bonus = sinistri * 0.25;
        moltiplicatore -= bonus; 
        dettagli.push(`${sinistri} anni senza sinistri: -${(bonus * 100).toFixed(0)}% sul moltiplicatore`);
      } else {
        dettagli.push("0 anni senza sinistri: nessuna maggiorazione");
      }
      
      
      switch (tipo) {
        case "auto":
          moltiplicatore += 0.3;
          dettagli.push("Polizza Auto: +30% sul moltiplicatore");
          break;
        case "casa":
          moltiplicatore += 0.1;
          dettagli.push("Polizza Casa: +10% sul moltiplicatore");
          break;
        case "vita":
          moltiplicatore += 0.4;
          dettagli.push("Polizza Vita: +40% sul moltiplicatore");
          break;
      }
      
      const premio = valore * RealeApp.constants.BASE_RATE * moltiplicatore;
      dettagli.push(`Moltiplicatore totale: ${moltiplicatore.toFixed(2)}`);
      dettagli.push(`Premio finale: ${premio.toFixed(2)}€`);
      
      return { premio, dettagli };
    },
    
    
    validateForm: function() {
      const eta = parseInt(document.getElementById("eta").value);
      const valore = parseFloat(document.getElementById("valore").value);
      const sinistri = parseInt(document.getElementById("sinistri").value);
      
      if (eta < RealeApp.constants.MIN_AGE || eta > RealeApp.constants.MAX_AGE) {
        RealeApp.ui.showError(`L'età deve essere compresa tra ${RealeApp.constants.MIN_AGE} e ${RealeApp.constants.MAX_AGE} anni.`);
        return false;
      }
      
      if (valore < RealeApp.constants.MIN_VALUE) {
        RealeApp.ui.showError(`Il valore assicurato deve essere almeno €${RealeApp.constants.MIN_VALUE}.`);
        return false;
      }
      
      if (sinistri < 0 || sinistri > RealeApp.constants.MAX_SINISTRI) {
        RealeApp.ui.showError(`Gli anni senza sinistri devono essere compresi tra 0 e ${RealeApp.constants.MAX_SINISTRI}.`);
        return false;
      }
      
      return true;
    },
    
    
    setupPolicyForm: function() {
      const insuranceForm = document.getElementById("form-polizza");
      if (!insuranceForm) return;
      
      insuranceForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        if (!this.validateForm()) return;
        
        const tipo = document.getElementById("tipo-polizza").value;
        const eta = parseInt(document.getElementById("eta").value);
        const valore = parseFloat(document.getElementById("valore").value);
        const sinistri = parseInt(document.getElementById("sinistri").value);
        const copertura = document.getElementById("copertura").value;
        
        const { premio, dettagli } = this.calculatePremium(tipo, eta, valore, sinistri, copertura);
        
        RealeApp.ui.displayResults(tipo, eta, valore, sinistri, copertura, premio, dettagli);
        
        const simulazioneObj = {
          tipo,
          eta,
          valore,
          sinistri,
          copertura,
          premio,
          dettagli,
          data: new Date().toLocaleString()
        };
        
        RealeApp.storage.saveSimulation(simulazioneObj);
        RealeApp.ui.displayHistory();
      });
    }
  },
  
 
  storage: {
    
    saveSimulation: function(simulazioneObj) {
      const utenteCorrente = RealeApp.auth.getCurrentUser();
      const chiaveStorico = `${RealeApp.constants.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      const storico = JSON.parse(localStorage.getItem(chiaveStorico)) || [];
      
      storico.push(simulazioneObj);
      localStorage.setItem(chiaveStorico, JSON.stringify(storico));
    },
    
    
    getHistory: function() {
      const utenteCorrente = RealeApp.auth.getCurrentUser();
      const chiaveStorico = `${RealeApp.constants.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      return JSON.parse(localStorage.getItem(chiaveStorico)) || [];
    },
    
    
    clearHistory: function() {
      const utenteCorrente = RealeApp.auth.getCurrentUser();
      const chiaveStorico = `${RealeApp.constants.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      localStorage.removeItem(chiaveStorico);
    },
    
   
    deleteSimulation: function(index) {
      const utenteCorrente = RealeApp.auth.getCurrentUser();
      const chiaveStorico = `${RealeApp.constants.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      const storico = JSON.parse(localStorage.getItem(chiaveStorico)) || [];
      
      if (index < 0 || index >= storico.length) return;
      
      storico.splice(index, 1);
      localStorage.setItem(chiaveStorico, JSON.stringify(storico));
    },
    
    
    exportHistory: function() {
      const storico = this.getHistory();
      
      if (storico.length === 0) {
        RealeApp.ui.showError("Nessuna simulazione da esportare!");
        return;
      }
      
      const utenteCorrente = RealeApp.auth.getCurrentUser();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storico, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `storico-polizze-${utenteCorrente}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  },
  
  
  ui: {
    
    showError: function(message) {
      alert(message);
    },
    
    
    displayUsername: function() {
      const elementoUtente = document.getElementById("utente-corrente");
      if (!elementoUtente) return;
      
      const utenteCorrente = RealeApp.auth.getCurrentUser();
      if (utenteCorrente && utenteCorrente !== 'default') {
        elementoUtente.textContent = `Utente: ${utenteCorrente}`;
      }
    },
    
    
    displayResults: function(tipo, eta, valore, sinistri, copertura, premio, dettagli) {
      const risultatoDiv = document.getElementById("risultato");
      if (!risultatoDiv) return;
      
      risultatoDiv.innerHTML = `
        <h3>Risultato Simulazione</h3>
        <p>Tipo: ${tipo}, Età: ${eta}, Valore: €${valore.toFixed(2)}</p>
        <p>Anni senza sinistri: ${sinistri}, Copertura: ${copertura}</p>
        <p><strong>Premio: €${premio.toFixed(2)}</strong></p>
        <button id="mostra-dettagli">Mostra dettagli calcolo</button>
      `;
      
      document.getElementById("mostra-dettagli").addEventListener("click", function() {
        const dettagliDiv = document.createElement("div");
        dettagliDiv.className = "dettagli-calcolo";
        dettagliDiv.innerHTML = `
          <h4>Dettagli del calcolo:</h4>
          <ul>
            ${dettagli.map(d => `<li>${d}</li>`).join("")}
          </ul>
        `;
        risultatoDiv.appendChild(dettagliDiv);
        this.style.display = "none";
      });
    },
    
    
    displayHistory: function() {
      const listaStorico = document.getElementById("lista-storico");
      if (!listaStorico) return;
      
      const storico = RealeApp.storage.getHistory();
      
      listaStorico.innerHTML = "";
      
      if (storico.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Nessuna simulazione salvata";
        listaStorico.appendChild(li);
        return;
      }
      
      storico.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${index + 1}. ${item.data}</strong><br>
          Tipo: ${item.tipo}, Età: ${item.eta}, Valore: €${item.valore.toFixed(2)}, Premio: €${item.premio.toFixed(2)}
          <div class="item-actions">
            <button class="btn-dettaglio" data-index="${index}">Dettagli</button>
            <button class="btn-elimina" data-index="${index}">Elimina</button>
          </div>
        `;
        listaStorico.appendChild(li);
      });
      
      
      document.querySelectorAll(".btn-dettaglio").forEach(btn => {
        btn.addEventListener("click", function() {
          const index = this.getAttribute("data-index");
          RealeApp.ui.showSimulationDetails(parseInt(index));
        });
      });
      
     
      document.querySelectorAll(".btn-elimina").forEach(btn => {
        btn.addEventListener("click", function() {
          const index = this.getAttribute("data-index");
          RealeApp.ui.confirmDeleteSimulation(parseInt(index));
        });
      });
    },
    
    
    showSimulationDetails: function(index) {
      const storico = RealeApp.storage.getHistory();
      
      if (index < 0 || index >= storico.length) return;
      
      const item = storico[index];
      
      const dettaglioHTML = `
        <div class="modal" id="modal-dettaglio">
          <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Dettaglio Simulazione</h3>
            <p><strong>Data:</strong> ${item.data}</p>
            <p><strong>Tipo polizza:</strong> ${item.tipo}</p>
            <p><strong>Età:</strong> ${item.eta}</p>
            <p><strong>Valore assicurato:</strong> €${item.valore.toFixed(2)}</p>
            <p><strong>Anni senza sinistri:</strong> ${item.sinistri}</p>
            <p><strong>Copertura:</strong> ${item.copertura}</p>
            <p><strong>Premio calcolato:</strong> €${item.premio.toFixed(2)}</p>
            <h4>Dettagli del calcolo:</h4>
            <ul>
              ${item.dettagli.map(d => `<li>${d}</li>`).join("")}
            </ul>
            <button id="btn-pdf-singolo">Genera PDF</button>
          </div>
        </div>
      `;
      
      const modalElement = document.createElement("div");
      modalElement.innerHTML = dettaglioHTML;
      document.body.appendChild(modalElement.firstElementChild);
      
      document.getElementById("modal-dettaglio").style.display = "block";
      
      document.querySelector(".close-modal").addEventListener("click", function() {
        document.getElementById("modal-dettaglio").remove();
      });
      
      document.getElementById("btn-pdf-singolo").addEventListener("click", function() {
        
        alert("Funzionalità di generazione PDF in fase di sviluppo");
      });
    },
    
    
    confirmDeleteSimulation: function(index) {
      if (confirm("Sei sicuro di voler eliminare questa simulazione?")) {
        RealeApp.storage.deleteSimulation(index);
        this.displayHistory();
      }
    },
    
    
    confirmClearHistory: function() {
      if (confirm("Sei sicuro di voler eliminare tutto lo storico?")) {
        RealeApp.storage.clearHistory();
        this.displayHistory();
      }
    },
    
    
    setupButtons: function() {
      
      const pulisciStorico = document.getElementById("pulisci-storico");
      if (pulisciStorico) {
        pulisciStorico.addEventListener("click", () => {
          this.confirmClearHistory();
        });
      }
      
      
      const esportaStoricoBtn = document.getElementById("esporta-storico");
      if (esportaStoricoBtn) {
        esportaStoricoBtn.addEventListener("click", () => {
          RealeApp.storage.exportHistory();
        });
      }
    }
  },
  
 
  init: function() {
    
    this.auth.setupLoginForm();
    
   
    this.ui.displayUsername();
    
    
    this.calculator.setupPolicyForm();
    
    
    this.ui.setupButtons();
    
    
    if (document.getElementById("lista-storico")) {
      this.ui.displayHistory();
    }
  }
};


document.addEventListener("DOMContentLoaded", () => {
  RealeApp.init();
});
