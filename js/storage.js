/**
 * Modulo per la gestione della persistenza dei dati delle simulazioni
 * Utilizza localStorage per memorizzare e recuperare lo storico delle simulazioni
 * Ogni utente ha il proprio storico separato, identificato dal proprio username
 */
const RealeStorage = {
    /**
     * Salva una nuova simulazione nello storico dell'utente corrente
     * Aggiunge la simulazione all'array esistente e lo salva in localStorage
     * 
     * @param {Object} simulazioneObj - Oggetto contenente i dati della simulazione
     *                                (tipo, età, valore, sinistri, copertura, premio, dettagli, data)
     */
    saveSimulation: function(simulazioneObj) {
      // Ottiene l'utente corrente per salvare i dati nel suo spazio personale
      const utenteCorrente = RealeAuth.getCurrentUser();
      
      // Crea una chiave unica per lo storico dell'utente corrente
      const chiaveStorico = `${RealeConfig.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      
      // Recupera lo storico esistente o inizializza un array vuoto se non esiste
      const storico = JSON.parse(localStorage.getItem(chiaveStorico)) || [];
      
      // Aggiunge la nuova simulazione allo storico
      storico.push(simulazioneObj);
      
      // Salva lo storico aggiornato in localStorage come stringa JSON
      localStorage.setItem(chiaveStorico, JSON.stringify(storico));
    },
    
    /**
     * Recupera tutte le simulazioni salvate dell'utente corrente
     * 
     * @returns {Array} - Array di oggetti simulazione o array vuoto se non ce ne sono
     */
    getHistory: function() {
      // Ottiene l'utente corrente per recuperare i suoi dati personali
      const utenteCorrente = RealeAuth.getCurrentUser();
      
      // Crea la chiave per accedere allo storico dell'utente
      const chiaveStorico = `${RealeConfig.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      
      // Recupera e converte lo storico da JSON a oggetto JavaScript, o ritorna array vuoto
      return JSON.parse(localStorage.getItem(chiaveStorico)) || [];
    },
    
    /**
     * Cancella tutto lo storico delle simulazioni dell'utente corrente
     * Rimuove completamente la voce corrispondente dal localStorage
     */
    clearHistory: function() {
      // Ottiene l'utente corrente
      const utenteCorrente = RealeAuth.getCurrentUser();
      
      // Crea la chiave per accedere allo storico dell'utente
      const chiaveStorico = `${RealeConfig.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      
      // Rimuove completamente l'elemento dal localStorage
      localStorage.removeItem(chiaveStorico);
    },
    
    /**
     * Elimina una singola simulazione dallo storico basandosi sull'indice
     * 
     * @param {number} index - Indice della simulazione da eliminare nell'array
     */
    deleteSimulation: function(index) {
      // Ottiene l'utente corrente
      const utenteCorrente = RealeAuth.getCurrentUser();
      
      // Crea la chiave per accedere allo storico dell'utente
      const chiaveStorico = `${RealeConfig.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      
      // Recupera lo storico esistente o inizializza un array vuoto
      const storico = JSON.parse(localStorage.getItem(chiaveStorico)) || [];
      
      // Verifica che l'indice sia valido
      if (index < 0 || index >= storico.length) return;
      
      // Rimuove l'elemento all'indice specificato
      storico.splice(index, 1);
      
      // Salva lo storico aggiornato
      localStorage.setItem(chiaveStorico, JSON.stringify(storico));
    },
    
    /**
     * Esporta lo storico delle simulazioni in formato JSON
     * Crea un file scaricabile con i dati delle simulazioni dell'utente corrente
     * Utilizza il Data URI scheme per generare un link scaricabile
     */
    exportHistory: function() {
      // Recupera lo storico dell'utente corrente
      const storico = this.getHistory();
      
      // Verifica che ci siano simulazioni da esportare
      if (storico.length === 0) {
        RealeUI.showError("Nessuna simulazione da esportare!");
        return;
      }
      
      // Ottiene l'username per includere nel nome del file
      const utenteCorrente = RealeAuth.getCurrentUser();
      
      // Crea una stringa Data URI con il JSON formattato
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storico, null, 2));
      
      // Crea un elemento <a> per il download
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `storico-polizze-${utenteCorrente}.json`);
      
      // Aggiunge temporaneamente l'elemento al DOM, lo clicca per avviare il download, poi lo rimuove
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };