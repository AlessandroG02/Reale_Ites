// calculator.js
const RealeCalculator = {
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
      
      const premio = valore * RealeConfig.BASE_RATE * moltiplicatore;
      dettagli.push(`Moltiplicatore totale: ${moltiplicatore.toFixed(2)}`);
      dettagli.push(`Premio finale: ${premio.toFixed(2)}€`);
      
      return { premio, dettagli };
    },
    
    validateForm: function() {
      const eta = parseInt(document.getElementById("eta").value);
      const valore = parseFloat(document.getElementById("valore").value);
      const sinistri = parseInt(document.getElementById("sinistri").value);
      
      if (eta < RealeConfig.MIN_AGE || eta > RealeConfig.MAX_AGE) {
        RealeUI.showError(`L'età deve essere compresa tra ${RealeConfig.MIN_AGE} e ${RealeConfig.MAX_AGE} anni.`);
        return false;
      }
      
      if (valore < RealeConfig.MIN_VALUE) {
        RealeUI.showError(`Il valore assicurato deve essere almeno €${RealeConfig.MIN_VALUE}.`);
        return false;
      }
      
      if (sinistri < 0 || sinistri > RealeConfig.MAX_SINISTRI) {
        RealeUI.showError(`Gli anni senza sinistri devono essere compresi tra 0 e ${RealeConfig.MAX_SINISTRI}.`);
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
        
        RealeUI.displayResults(tipo, eta, valore, sinistri, copertura, premio, dettagli);
        
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
        
        RealeStorage.saveSimulation(simulazioneObj);
        RealeUI.displayHistory();
      });
    }
  };