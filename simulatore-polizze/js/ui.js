const RealeUI = {
    showError: function(message) {
      alert(message);
    },
    
    displayUsername: function() {
      const elementoUtente = document.getElementById("utente-corrente");
      if (!elementoUtente) return;
      
      const utenteCorrente = RealeAuth.getCurrentUser();
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
  