const RealeApp = {
    init: function() {
      RealeAuth.setupLoginForm();
      RealeUI.displayUsername();
      RealeCalculator.setupPolicyForm();
      RealeUI.setupButtons();
      
      if (document.getElementById("lista-storico")) {
        RealeUI.displayHistory();
      }
    }
  };
  
  document.addEventListener("DOMContentLoaded", () => {
    RealeApp.init();
  });