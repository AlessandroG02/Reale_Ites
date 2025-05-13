/**
 * Punto di ingresso principale dell'applicazione
 * Modulo principale che coordina l'inizializzazione di tutti i componenti
 * e gestisce il ciclo di vita dell'applicazione
 */
const RealeApp = {
    /**
     * Inizializza tutti i componenti dell'applicazione in modo ordinato
     * Questo metodo viene chiamato automaticamente al caricamento della pagina
     * e configura tutte le funzionalità principali:
     * 1. Sistema di autenticazione
     * 2. Visualizzazione del nome utente corrente
     * 3. Form per il calcolo delle polizze
     * 4. Pulsanti di interazione nell'interfaccia
     * 5. Storico delle simulazioni (se presente nella pagina)
     */
    init: function() {
      // Inizializza il form di login per la gestione dell'autenticazione
      RealeAuth.setupLoginForm();
      
      // Aggiorna l'interfaccia con il nome dell'utente corrente
      RealeUI.displayUsername();
      
      // Configura il form per il calcolo delle polizze e i relativi event listener
      RealeCalculator.setupPolicyForm();
      
      // Imposta i pulsanti dell'interfaccia (pulisci storico, esporta, ecc.)
      RealeUI.setupButtons();
      
      // Se presente l'elemento che contiene lo storico, lo popola con i dati salvati
      if (document.getElementById("lista-storico")) {
        RealeUI.displayHistory();
      }
    }
  };
  
  /**
   * Event listener che attende il completo caricamento del DOM
   * prima di inizializzare l'applicazione.
   * Questo garantisce che tutti gli elementi HTML siano disponibili
   * prima che il JavaScript tenti di accedervi.
   */
  document.addEventListener("DOMContentLoaded", () => {
    RealeApp.init();
  });