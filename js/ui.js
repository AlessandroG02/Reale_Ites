const RealeUI = {
  showError: function(message) {
    alert(message);
  },
  
  showSuccess: function(message) {
    // Crea un toast di successo
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4CAF50;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-weight: bold;
      animation: slideIn 0.3s ease-out;
    `;
    
    toast.innerHTML = `
      <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
      ${message}
    `;
    
    // Aggiungi animazione CSS
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Rimuovi dopo 3 secondi
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  },
  
  // Nuove funzioni per gestire il loading durante le chiamate API
  showLoading: function(message = 'Caricamento...') {
    // Rimuovi eventuali loader esistenti
    this.hideLoading();
    
    const loader = document.createElement('div');
    loader.id = 'api-loader';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
      font-size: 18px;
      font-weight: bold;
    `;
    
    loader.innerHTML = `
      <div style="text-align: center; background: var(--primary-color); padding: 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
        <div style="margin-bottom: 15px;">
          <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
        </div>
        <div>${message}</div>
      </div>
    `;
    
    document.body.appendChild(loader);
  },
  
  hideLoading: function() {
    const loader = document.getElementById('api-loader');
    if (loader) {
      loader.remove();
    }
  },
  
  displayUsername: function() {
    const elementoUtente = document.getElementById("utente-corrente");
    if (!elementoUtente) return;
    
    const utenteCorrente = RealeAuth.getCurrentUser();
    const userInfo = RealeAuth.getUserInfo();
    
    if (utenteCorrente && utenteCorrente !== 'default') {
      // Se abbiamo informazioni complete dell'utente dall'API, mostriamole
      if (userInfo && userInfo.name) {
        elementoUtente.textContent = `Utente: ${userInfo.name} (${utenteCorrente})`;
      } else {
        elementoUtente.textContent = `Utente: ${utenteCorrente}`;
      }
    }
  },
  
  displayResults: function(tipo, eta, valore, sinistri, copertura, premio, dettagli) {
    const risultatoDiv = document.getElementById("risultato");
    if (!risultatoDiv) return;
    
    // Modifica qui per mostrare gli anni senza sinistri solo per le polizze auto
    const sinistriText = tipo === "auto" ? 
      `<p>Anni senza sinistri: ${sinistri}, Copertura: ${copertura}</p>` : 
      `<p>Copertura: ${copertura}</p>`;
    
    risultatoDiv.innerHTML = `
      <h3>Risultato Simulazione</h3>
      <p>Tipo: ${tipo}, Età: ${eta}, Valore: €${valore.toFixed(2)}</p>
      ${sinistriText}
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
    
    const storico = RealeStorage.getHistory();
    
    listaStorico.innerHTML = "";
    
    if (storico.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nessuna simulazione salvata";
      listaStorico.appendChild(li);
      return;
    }
    
    storico.forEach((item, index) => {
      const li = document.createElement("li");
      // Modifica qui per mostrare gli anni senza sinistri solo per le polizze auto
      const sinistriText = item.tipo === "auto" ? 
        `Anni senza sinistri: ${item.sinistri}, ` : 
        "";
      
      li.innerHTML = `
        <strong>${index + 1}. ${item.data}</strong><br>
        Tipo: ${item.tipo}, Età: ${item.eta}, Valore: €${item.valore.toFixed(2)}, ${sinistriText}Premio: €${item.premio.toFixed(2)}
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
        RealeUI.showSimulationDetails(parseInt(index));
      });
    });
    
    document.querySelectorAll(".btn-elimina").forEach(btn => {
      btn.addEventListener("click", function() {
        const index = this.getAttribute("data-index");
        RealeUI.confirmDeleteSimulation(parseInt(index));
      });
    });
  },
  
  showSimulationDetails: function(index) {
    const storico = RealeStorage.getHistory();
    
    if (index < 0 || index >= storico.length) return;
    
    const item = storico[index];
    
    // Modifica qui per mostrare gli anni senza sinistri solo per le polizze auto
    const sinistriHTML = item.tipo === "auto" ? 
      `<p><strong>Anni senza sinistri:</strong> ${item.sinistri}</p>` : 
      "";
    
    const dettaglioHTML = `
      <div class="modal" id="modal-dettaglio">
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h3>Dettaglio Simulazione</h3>
          <p><strong>Data:</strong> ${item.data}</p>
          <p><strong>Tipo polizza:</strong> ${item.tipo}</p>
          <p><strong>Età:</strong> ${item.eta}</p>
          <p><strong>Valore assicurato:</strong> €${item.valore.toFixed(2)}</p>
          ${sinistriHTML}
          <p><strong>Copertura:</strong> ${item.copertura}</p>
          <p><strong>Premio calcolato:</strong> €${item.premio.toFixed(2)}</p>
          <h4>Dettagli del calcolo:</h4>
          <ul>
            ${item.dettagli.map(d => `<li>${d}</li>`).join("")}
          </ul>
          <div class="json-download-container">
            <button id="btn-scarica-json">Scarica JSON</button>
          </div>
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
    
    document.getElementById("btn-scarica-json").addEventListener("click", function() {
      RealeUI.downloadSimulationAsJson(item);
    });
  },
  
  downloadSimulationAsJson: function(simulazione) {
    
    const simulazioneJson = JSON.stringify(simulazione, null, 2);
    
    
    const blob = new Blob([simulazioneJson], { type: 'application/json' });
    
   
    const url = URL.createObjectURL(blob);
    
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulazione_${simulazione.tipo}_${new Date().toISOString().slice(0,10)}.json`;
    
    
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },
  
  confirmDeleteSimulation: function(index) {
    if (confirm("Sei sicuro di voler eliminare questa simulazione?")) {
      RealeStorage.deleteSimulation(index);
      this.displayHistory();
    }
  },
  
  confirmClearHistory: function() {
    if (confirm("Sei sicuro di voler eliminare tutto lo storico?")) {
      RealeStorage.clearHistory();
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
        RealeStorage.exportHistory();
      });
    }
  }
};