const RealeConfig = {
    STORAGE_KEY_PREFIX: 'storico_',
    MIN_AGE: 18,
    MAX_AGE: 99,
    MIN_VALUE: 1000,
    MAX_SINISTRI: 30,
    BASE_RATE: 0.05
  };
  
  // auth.js
  const RealeAuth = (function() {
    // Dati privati del modulo
    const users = {
      "alessandro": "1234",
      "admin": "admin",
      "demo": "demo"
    };
    
    return {
      login: function(username, password) {
        if (users[username] && users[username] === password) {
          sessionStorage.setItem("utenteCorrente", username);
          return true;
        }
        return false;
      },
      
      getCurrentUser: function() {
        return sessionStorage.getItem("utenteCorrente") || 'default';
      },
      
      setupLoginForm: function() {
        const loginForm = document.getElementById("form-login");
        if (!loginForm) return;
        
        loginForm.addEventListener("submit", (e) => {
          e.preventDefault();
          
          const username = document.getElementById("username").value.trim();
          const password = document.getElementById("password").value.trim();
          
          if (this.login(username, password)) {
            window.location.href = "polizza.html";
          } else {
            RealeUI.showError("Credenziali non valide. Riprova.");
          }
        });
      }
    };
  })();