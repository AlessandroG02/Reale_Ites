/**
 * Modulo per la gestione dell'interfaccia utente
 * Gestisce la visualizzazione, l'interazione, e l'aggiornamento degli elementi UI
 * Responsabile per la presentazione dei dati all'utente e per la gestione degli eventi UI
 */
const RealeUI = {
  /**
   * Mostra un messaggio di errore all'utente tramite un alert
   * 
   * @param {string} message - Messaggio di errore da mostrare
   */
  showError: function(message) {
    alert(message);
  },
  
  /**
   * Visualizza il nome dell'utente corrente nell'interfaccia
   * Se l'utente non è autenticato o è 'default', non mostra nulla
   */
  displayUsername: function() {
    // Trova l'elemento HTML che conterrà il nome utente
    const elementoUtente = document.getElementById("utente-corrente");
    if (!elementoUtente) return;
    
    // Ottiene l'username dell'utente corrente
    const utenteCorrente = RealeAuth.getCurrentUser();
    // Aggiorna l'elemento solo se l'utente è autenticato
    if (utenteCorrente && utenteCorrente !== 'default') {
      elementoUtente.textContent = `Utente: ${utenteCorrente}`;
    }
  },
  
  /**
   * Visualizza i risultati della simulazione nell'interfaccia
   * Crea dinamicamente gli elementi HTML con i dettagli del premio calcolato
   * Aggiunge un pulsante per visualizzare i dettagli più approfonditi
   * 
   * @param {string} tipo - Tipo di polizza (auto, casa, vita)
   * @param {number} eta - Età dell'assicurato
   * @param {number} valore - Valore assicurato in euro
   * @param {number} sinistri - Anni senza sinistri (per auto)
   * @param {string} copertura - Livello di copertura (base o completa)
   * @param {number} premio - Premio calcolato in euro
   * @param {Array} dettagli - Array con le spiegazioni del calcolo
   */
  displayResults: function(tipo, eta, valore, sinistri, copertura, premio, dettagli) {
    // Trova il container dove visualizzare i risultati
    const risultatoDiv = document.getElementById("risultato");
    if (!risultatoDiv) return;
    
    // Crea testo differenziato per anni senza sinistri in base al tipo di polizza
    const sinistriText = tipo === "auto" ? 
      `<p>Anni senza sinistri: ${sinistri}, Copertura: ${copertura}</p>` : 
      `<p>Copertura: ${copertura}</p>`;
    
    // Aggiorna l'HTML dell'elemento con i risultati principali
    risultatoDiv.innerHTML = `
      <h3>Risultato Simulazione</h3>
      <p>Tipo: ${tipo}, Età: ${eta}, Valore: €${valore.toFixed(2)}</p>
      ${sinistriText}
      <p><strong>Premio: €${premio.toFixed(2)}</strong></p>
      <button id="mostra-dettagli">Mostra dettagli calcolo</button>
    `;
    
    // Aggiunge evento click al pulsante per mostrare dettagli aggiuntivi
    document.getElementById("mostra-dettagli").addEventListener("click", function() {
      // Crea un nuovo elemento div per i dettagli
      const dettagliDiv = document.createElement("div");
      dettagliDiv.className = "dettagli-calcolo";
      // Popola il div con la lista dei dettagli di calcolo
      dettagliDiv.innerHTML = `
        <h4>Dettagli del calcolo:</h4>
        <ul>
          ${dettagli.map(d => `<li>${d}</li>`).join("")}
        </ul>
      `;
      // Aggiunge il div dei dettagli ai risultati e nasconde il pulsante
      risultatoDiv.appendChild(dettagliDiv);
      this.style.display = "none";
    });
  },
  
  /**
   * Visualizza lo storico delle simulazioni nella pagina
   * Crea elementi lista per ogni simulazione e aggiunge pulsanti di interazione
   */
  displayHistory: function() {
    // Trova il container dove visualizzare lo storico
    const listaStorico = document.getElementById("lista-storico");
    if (!listaStorico) return;
    
    // Recupera lo storico delle simulazioni
    const storico = RealeStorage.getHistory();
    
    // Svuota la lista attuale
    listaStorico.innerHTML = "";
    
    // Se non ci sono simulazioni, mostra un messaggio appropriato
    if (storico.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nessuna simulazione salvata";
      listaStorico.appendChild(li);
      return;
    }
    
    // Crea un elemento lista per ogni simulazione
    storico.forEach((item, index) => {
      const li = document.createElement("li");
      
      // Testo per anni senza sinistri, mostrato solo per polizze auto
      const sinistriText = item.tipo === "auto" ? 
        `Anni senza sinistri: ${item.sinistri}, ` : 
        "";
      
      // Popola l'elemento lista con i dati della simulazione e pulsanti di azione
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
    
    // Aggiunge eventi click ai pulsanti "Dettagli"
    document.querySelectorAll(".btn-dettaglio").forEach(btn => {
      btn.addEventListener("click", function() {
        const index = this.getAttribute("data-index");
        RealeUI.showSimulationDetails(parseInt(index));
      });
    });
    
    // Aggiunge eventi click ai pulsanti "Elimina"
    document.querySelectorAll(".btn-elimina").forEach(btn => {
      btn.addEventListener("click", function() {
        const index = this.getAttribute("data-index");
        RealeUI.confirmDeleteSimulation(parseInt(index));
      });
    });
  },
  
  /**
   * Mostra i dettagli completi di una simulazione in una finestra modale
   * 
   * @param {number} index - Indice della simulazione nello storico
   */
  showSimulationDetails: function(index) {
    // Recupera lo storico delle simulazioni
    const storico = RealeStorage.getHistory();
    
    // Verifica che l'indice sia valido
    if (index < 0 || index >= storico.length) return;
    
    // Ottiene i dati della simulazione specificata
    const item = storico[index];
    
    // Prepara HTML per anni senza sinistri (se applicabile)
    const sinistriHTML = item.tipo === "auto" ? 
      `<p><strong>Anni senza sinistri:</strong> ${item.sinistri}</p>` : 
      "";
    
    // Prepara HTML per la finestra modale con tutti i dettagli
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
    
    // Crea e aggiunge la modale al DOM
    const modalElement = document.createElement("div");
    modalElement.innerHTML = dettaglioHTML;
    document.body.appendChild(modalElement.firstElementChild);
    
    // Mostra la modale
    document.getElementById("modal-dettaglio").style.display = "block";
    
    // Aggiunge evento per chiudere la modale
    document.querySelector(".close-modal").addEventListener("click", function() {
      document.getElementById("modal-dettaglio").remove();
    });
    
    // Aggiunge evento per scaricare i dati come JSON
    document.getElementById("btn-scarica-json").addEventListener("click", function() {
      RealeUI.downloadSimulationAsJson(item);
    });
  },
  
  /**
   * Crea e scarica un file JSON con i dati di una singola simulazione
   * 
   * @param {Object} simulazione - Oggetto contenente i dati della simulazione
   */
  downloadSimulationAsJson: function(simulazione) {
    // Converte l'oggetto simulazione in una stringa JSON formattata
    const simulazioneJson = JSON.stringify(simulazione, null, 2);
    
    // Crea un Blob con il contenuto JSON
    const blob = new Blob([simulazioneJson], { type: 'application/json' });
    
    // Crea un URL oggetto per il Blob
    const url = URL.createObjectURL(blob);
    
    // Crea un elemento anchor per il download
    const a = document.createElement('a');
    a.href = url;
    // Imposta nome file con tipo polizza e data attuale
    a.download = `simulazione_${simulazione.tipo}_${new Date().toISOString().slice(0,10)}.json`;
    
    // Aggiunge l'elemento al DOM, fa clic per scaricare e poi lo rimuove
    document.body.appendChild(a);
    a.click();

    // Pulisce dopo il download
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },
  
  /**
   * Chiede conferma e gestisce l'eliminazione di una simulazione
   * 
   * @param {number} index - Indice della simulazione da eliminare
   */
  confirmDeleteSimulation: function(index) {
    if (confirm("Sei sicuro di voler eliminare questa simulazione?")) {
      // Elimina la simulazione dallo storage
      RealeStorage.deleteSimulation(index);
      // Aggiorna la visualizzazione dello storico
      this.displayHistory();
    }
  },
  
  /**
   * Chiede conferma e gestisce l'eliminazione di tutto lo storico
   */
  confirmClearHistory: function() {
    if (confirm("Sei sicuro di voler eliminare tutto lo storico?")) {
      // Cancella completamente lo storico
      RealeStorage.clearHistory();
      // Aggiorna la visualizzazione
      this.displayHistory();
    }
  },
  
  /**
   * Configura gli event listener per i vari pulsanti dell'interfaccia
   * Viene chiamato all'inizializzazione dell'applicazione
   */
  setupButtons: function() {
    // Configura il pulsante per pulire tutto lo storico
    const pulisciStorico = document.getElementById("pulisci-storico");
    if (pulisciStorico) {
      pulisciStorico.addEventListener("click", () => {
        this.confirmClearHistory();
      });
    }
    
    // Configura il pulsante per esportare lo storico
    const esportaStoricoBtn = document.getElementById("esporta-storico");
    if (esportaStoricoBtn) {
      esportaStoricoBtn.addEventListener("click", () => {
        RealeStorage.exportHistory();
      });
    }
  }
};