/**
 * Configurazione globale dell'applicazione
 * Contiene costanti utilizzate in tutto il sistema per definire
 * limiti, tassi e prefissi per lo storage
 */
const RealeConfig = {
    // Prefisso utilizzato per le chiavi di localStorage per separare i dati utente
    STORAGE_KEY_PREFIX: 'storico_',
    
    // Età minima per sottoscrivere una polizza assicurativa (18 anni)
    MIN_AGE: 18,
    
    // Età massima per sottoscrivere una polizza assicurativa (99 anni)
    MAX_AGE: 99,
    
    // Valore minimo assicurabile in euro (€1000)
    MIN_VALUE: 1000,
    
    // Numero massimo di anni senza sinistri considerati per gli sconti (30 anni)
    MAX_SINISTRI: 30,
    
    // Percentuale base applicata al valore assicurato per il calcolo del premio (5%)
    BASE_RATE: 0.05
};


/**
 * Modulo per la gestione dell'autenticazione degli utenti
 * Implementato come IIFE (Immediately Invoked Function Expression) 
 * per incapsulare i dati sensibili e fornire solo i metodi necessari all'esterno
 * Implementa il pattern Module per proteggere i dati privati
 */
const RealeAuth = (function() {
    
    /**
     * Database semplificato degli utenti con credenziali
     * In un'applicazione reale, questi dati sarebbero memorizzati
     * in un database sicuro con password criptate
     * @private
     */
    const users = {
      "alessandro": "1234",
      "admin": "admin",
      "demo": "demo"
    };
    
    // Interfaccia pubblica del modulo
    return {
      /**
       * Verifica le credenziali utente e imposta la sessione se valide
       * Memorizza l'username in sessionStorage per mantenere lo stato di login
       * 
       * @param {string} username - Nome utente inserito nel form
       * @param {string} password - Password inserita nel form
       * @returns {boolean} - true se login avvenuto con successo, false altrimenti
       */
      login: function(username, password) {
        if (users[username] && users[username] === password) {
          sessionStorage.setItem("utenteCorrente", username);
          return true;
        }
        return false;
      },
      
      /**
       * Recupera l'utente correntemente autenticato dalla sessione
       * Se nessun utente è autenticato, restituisce 'default'
       * 
       * @returns {string} - Username dell'utente corrente o 'default' se non autenticato
       */
      getCurrentUser: function() {
        return sessionStorage.getItem("utenteCorrente") || 'default';
      },
      
      /**
       * Configura il form di login con l'event listener per il submit
       * Gestisce l'autenticazione e la redirezione in caso di successo
       * Mostra un messaggio di errore in caso di credenziali errate
       */
      setupLoginForm: function() {
        const loginForm = document.getElementById("form-login");
        if (!loginForm) return;
        
        loginForm.addEventListener("submit", (e) => {
          e.preventDefault();
          
          // Recupera e pulisce i valori inseriti dall'utente
          const username = document.getElementById("username").value.trim();
          const password = document.getElementById("password").value.trim();
          
          // Se il login è riuscito, reindirizza alla pagina del simulatore
          if (this.login(username, password)) {
            window.location.href = "polizza.html";
          } else {
            // Altrimenti mostra un messaggio di errore
            RealeUI.showError("Credenziali non valide. Riprova.");
          }
        });
      }
    };
})();