const RealeConfig = {
    STORAGE_KEY_PREFIX: 'storico_',
    MIN_AGE: 18,
    MAX_AGE: 99,
    MIN_VALUE: 1000,
    MAX_SINISTRI: 30,
    BASE_RATE: 0.05,
    // Configurazione API DummyJSON
    API_BASE_URL: 'https://dummyjson.com',
    API_ENDPOINTS: {
        LOGIN: '/auth/login',
        REFRESH: '/auth/refresh',
        ME: '/auth/me'
    }
};

const RealeAuth = (function() {
    
    return {
        // Login con DummyJSON API
        login: async function(username, password) {
            try {
                // Mostra indicatore di caricamento
                RealeUI.showLoading('Autenticazione in corso...');
                
                const response = await fetch(`${RealeConfig.API_BASE_URL}${RealeConfig.API_ENDPOINTS.LOGIN}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        expiresInMins: 30 // Token valido per 30 minuti
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Salva il token e i dati utente
                sessionStorage.setItem("authToken", data.token);
                sessionStorage.setItem("refreshToken", data.refreshToken);
                sessionStorage.setItem("utenteCorrente", data.username);
                sessionStorage.setItem("userInfo", JSON.stringify(data));
                
                RealeUI.hideLoading();
                return {
                    success: true,
                    user: data,
                    token: data.token
                };
                
            } catch (error) {
                console.error('Errore durante il login:', error);
                RealeUI.hideLoading();
                return {
                    success: false,
                    error: error.message || 'Errore di connessione'
                };
            }
        },
        
        // Refresh del token usando DummyJSON
        refreshToken: async function() {
            const refreshToken = sessionStorage.getItem("refreshToken");
            if (!refreshToken) return false;
            
            try {
                const response = await fetch(`${RealeConfig.API_BASE_URL}${RealeConfig.API_ENDPOINTS.REFRESH}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refreshToken: refreshToken,
                        expiresInMins: 30
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Refresh token failed');
                }
                
                const data = await response.json();
                
                // Aggiorna i token
                sessionStorage.setItem("authToken", data.token);
                sessionStorage.setItem("refreshToken", data.refreshToken);
                
                return true;
                
            } catch (error) {
                console.error('Errore durante il refresh del token:', error);
                this.logout();
                return false;
            }
        },
        
        // Verifica se l'utente è autenticato
        isAuthenticated: function() {
            const token = sessionStorage.getItem("authToken");
            const user = sessionStorage.getItem("utenteCorrente");
            return token && user;
        },
        
        // Verifica la validità del token con l'API
        verifyToken: async function() {
            const token = sessionStorage.getItem("authToken");
            if (!token) return false;
            
            try {
                const response = await fetch(`${RealeConfig.API_BASE_URL}${RealeConfig.API_ENDPOINTS.ME}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                
                if (!response.ok) {
                    // Prova a fare il refresh del token
                    const refreshed = await this.refreshToken();
                    if (!refreshed) {
                        this.logout();
                        return false;
                    }
                    return true;
                }
                
                // Token valido, aggiorna le informazioni utente
                const userData = await response.json();
                sessionStorage.setItem("userInfo", JSON.stringify(userData));
                
                return true;
                
            } catch (error) {
                console.error('Errore nella verifica del token:', error);
                
                // Prova il refresh come fallback
                const refreshed = await this.refreshToken();
                if (!refreshed) {
                    this.logout();
                    return false;
                }
                return true;
            }
        },
        
        // Logout
        logout: function() {
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("refreshToken");
            sessionStorage.removeItem("utenteCorrente");
            sessionStorage.removeItem("userInfo");
        },
        
        // Ottieni utente corrente
        getCurrentUser: function() {
            return sessionStorage.getItem("utenteCorrente") || 'default';
        },
        
        // Ottieni informazioni complete dell'utente
        getUserInfo: function() {
            const userInfo = sessionStorage.getItem("userInfo");
            if (userInfo) {
                try {
                    return JSON.parse(userInfo);
                } catch (error) {
                    console.error('Errore nel parsing delle informazioni utente:', error);
                }
            }
            return null;
        },
        
        // Setup del form di login
        setupLoginForm: function() {
            const loginForm = document.getElementById("form-login");
            if (!loginForm) return;
            
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                
                const username = document.getElementById("username").value.trim();
                const password = document.getElementById("password").value.trim();
                
                if (!username || !password) {
                    RealeUI.showError("Inserisci username e password");
                    return;
                }
                
                const result = await this.login(username, password);
                
                if (result.success) {
                    // Mostra messaggio di successo con nome utente
                    const userInfo = result.user;
                    const displayName = userInfo.firstName && userInfo.lastName 
                        ? `${userInfo.firstName} ${userInfo.lastName}` 
                        : userInfo.username;
                    
                    RealeUI.showSuccess(`Benvenuto, ${displayName}!`);
                    
                    // Reindirizza alla pagina polizze
                    setTimeout(() => {
                        window.location.href = "polizza.html";
                    }, 1500);
                } else {
                    RealeUI.showError(result.error);
                }
            });
        }
    };
})();