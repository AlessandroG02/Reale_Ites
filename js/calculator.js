const RealeCalculator = {
  /**
   * Calcola il premio assicurativo basato sui parametri forniti dall'utente
   * Applica diverse maggiorazioni o sconti in base a: tipo polizza, età, valore,
   * anni senza sinistri e livello di copertura
   * 
   * @param {string} tipo - Tipo di polizza (auto, casa, vita)
   * @param {number} eta - Età dell'assicurato
   * @param {number} valore - Valore assicurato in euro
   * @param {number} sinistri - Anni senza sinistri (rilevante solo per auto)
   * @param {string} copertura - Livello di copertura (base o completa)
   * @returns {Object} - Oggetto contenente il premio calcolato e i dettagli del calcolo
   */
  calculatePremium: function(tipo, eta, valore, sinistri, copertura) {
    let moltiplicatore = 1.0;
    const dettagli = [`Premio base: ${(valore * RealeConfig.BASE_RATE).toFixed(2)}€ (5% del valore assicurato)`];
    
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
    
    
    if (tipo === "auto" && sinistri > 0) {
      const bonus = sinistri * 0.25;
      moltiplicatore -= bonus; 
      dettagli.push(`${sinistri} anni senza sinistri: -${(bonus * 100).toFixed(0)}% sul moltiplicatore`);
    } else if (tipo === "auto") {
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
    
    const premio = valore * RealeConfig.BASE_RATE * moltiplicatore;
    dettagli.push(`Moltiplicatore totale: ${moltiplicatore.toFixed(2)}`);
    dettagli.push(`Premio finale: ${premio.toFixed(2)}€`);
    
    return { premio, dettagli };
  },
  
  /**
   * Valida i dati inseriti nel form prima di procedere con il calcolo
   * Controlla che età, valore e anni senza sinistri rientrino nei range consentiti
   * Mostra messaggi di errore specifici in caso di validazione fallita
   * 
   * @returns {boolean} - true se la validazione ha successo, false altrimenti
   */
  validateForm: function() {
    const tipo = document.getElementById("tipo-polizza").value;
    const eta = parseInt(document.getElementById("eta").value);
    const valore = parseFloat(document.getElementById("valore").value);
    const sinistri = tipo === "auto" ? parseInt(document.getElementById("sinistri").value) : 0;
    
    if (eta < RealeConfig.MIN_AGE || eta > RealeConfig.MAX_AGE) {
      RealeUI.showError(`L'età deve essere compresa tra ${RealeConfig.MIN_AGE} e ${RealeConfig.MAX_AGE} anni.`);
      return false;
    }
    
    if (valore < RealeConfig.MIN_VALUE) {
      RealeUI.showError(`Il valore assicurato deve essere almeno €${RealeConfig.MIN_VALUE}.`);
      return false;
    }
    
    if (tipo === "auto" && (sinistri < 0 || sinistri > RealeConfig.MAX_SINISTRI)) {
      RealeUI.showError(`Gli anni senza sinistri devono essere compresi tra 0 e ${RealeConfig.MAX_SINISTRI}.`);
      return false;
    }
    
    return true;
  },
  
  /**
   * Mostra o nasconde il campo "anni senza sinistri" in base al tipo di polizza
   * Il campo è visibile solo per le polizze auto, nascosto per casa e vita
   * Manipola direttamente il DOM per modificare la visualizzazione del campo
   */
  toggleSinistriField: function() {
    const tipo = document.getElementById("tipo-polizza").value;
    const sinistriContainer = document.querySelector('label[for="sinistri"]');
    const sinistriInput = document.getElementById("sinistri");
    
    // Protezione contro elementi non trovati
    if (!sinistriContainer) return;
    
    if (tipo === "auto") {
      sinistriContainer.style.display = "block";
      // Se l'input esiste, gestisci l'attributo required
      if (sinistriInput) {
        sinistriInput.required = true;
      }
    } else {
      sinistriContainer.style.display = "none";
      // Se l'input esiste, rimuovi required e imposta un valore
      if (sinistriInput) {
        sinistriInput.required = false;
        sinistriInput.value = "0";
      }
    }
  },
  
  /**
   * Inizializza il form per il calcolo della polizza
   * Configura gli event listener per la gestione del submit e per il cambio del tipo polizza
   * Esegue la validazione, calcola il premio e salva la simulazione quando il form viene inviato
   * Aggiorna l'interfaccia utente con i risultati e lo storico delle simulazioni
   */
  setupPolicyForm: function() {
    const insuranceForm = document.getElementById("form-polizza");
    if (!insuranceForm) return;
    
    // Inizializza lo stato del campo sinistri all'avvio
    this.toggleSinistriField();
    
    // Aggiunge event listener per aggiornare il campo sinistri quando cambia il tipo di polizza
    document.getElementById("tipo-polizza").addEventListener("change", () => {
      this.toggleSinistriField();
    });
    
    // Aggiunge event listener per gestire il submit del form
    insuranceForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Interrompe l'esecuzione se la validazione fallisce
      if (!this.validateForm()) return;
      
      // Raccoglie i dati dal form
      const tipo = document.getElementById("tipo-polizza").value;
      const eta = parseInt(document.getElementById("eta").value);
      const valore = parseFloat(document.getElementById("valore").value);
      const sinistri = tipo === "auto" ? parseInt(document.getElementById("sinistri").value) : 0;
      const copertura = document.getElementById("copertura").value;
      
      // Calcola il premio assicurativo
      const { premio, dettagli } = this.calculatePremium(tipo, eta, valore, sinistri, copertura);
      
      // Visualizza i risultati nell'interfaccia
      RealeUI.displayResults(tipo, eta, valore, sinistri, copertura, premio, dettagli);
      
      // Crea l'oggetto simulazione con tutti i dati
      const simulazioneObj = {
        tipo,
        eta,
        valore,
        sinistri: tipo === "auto" ? sinistri : "N/A",
        copertura,
        premio,
        dettagli,
        data: new Date().toLocaleString()
      };
      
      // Salva la simulazione e aggiorna lo storico
      RealeStorage.saveSimulation(simulazioneObj);
      RealeUI.displayHistory();
    });
  }
};