const RealeStorage = {
    saveSimulation: function(simulazioneObj) {
      const utenteCorrente = RealeAuth.getCurrentUser();
      const chiaveStorico = `${RealeConfig.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      const storico = JSON.parse(localStorage.getItem(chiaveStorico)) || [];
      
      storico.push(simulazioneObj);
      localStorage.setItem(chiaveStorico, JSON.stringify(storico));
    },
    
    getHistory: function() {
      const utenteCorrente = RealeAuth.getCurrentUser();
      const chiaveStorico = `${RealeConfig.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      return JSON.parse(localStorage.getItem(chiaveStorico)) || [];
    },
    
    clearHistory: function() {
      const utenteCorrente = RealeAuth.getCurrentUser();
      const chiaveStorico = `${RealeConfig.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      localStorage.removeItem(chiaveStorico);
    },
    
    deleteSimulation: function(index) {
      const utenteCorrente = RealeAuth.getCurrentUser();
      const chiaveStorico = `${RealeConfig.STORAGE_KEY_PREFIX}${utenteCorrente}`;
      const storico = JSON.parse(localStorage.getItem(chiaveStorico)) || [];
      
      if (index < 0 || index >= storico.length) return;
      
      storico.splice(index, 1);
      localStorage.setItem(chiaveStorico, JSON.stringify(storico));
    },
    
    exportHistory: function() {
      const storico = this.getHistory();
      
      if (storico.length === 0) {
        RealeUI.showError("Nessuna simulazione da esportare!");
        return;
      }
      
      const utenteCorrente = RealeAuth.getCurrentUser();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storico, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `storico-polizze-${utenteCorrente}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };
  