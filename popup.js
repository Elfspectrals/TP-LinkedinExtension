// Script pour le popup de l'extension LinkedIn
document.addEventListener('DOMContentLoaded', function () {
    const extractBtn = document.getElementById('extractBtn');
    const viewDataBtn = document.getElementById('viewDataBtn');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const supabaseKeyInput = document.getElementById('supabaseKey');
    const statusDiv = document.getElementById('status');

    // Charger la configuration sauvegardée
    chrome.storage.sync.get(['supabaseKey'], function (result) {
        if (result.supabaseKey) {
            supabaseKeyInput.value = result.supabaseKey;
            updateStatus('Configuration Supabase chargée', 'success');
        }
    });

    // Fonction pour mettre à jour le statut
    function updateStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    // Sauvegarder la configuration Supabase
    saveConfigBtn.addEventListener('click', function () {
        const key = supabaseKeyInput.value.trim();
        if (key) {
            chrome.storage.sync.set({ supabaseKey: key }, function () {
                updateStatus('Configuration sauvegardée!', 'success');

                // Injecter la clé dans le content script
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateSupabaseKey',
                        key: key
                    });
                });
            });
        } else {
            updateStatus('Veuillez entrer une clé API valide', 'error');
        }
    });

    // Extraire le profil actuel
    extractBtn.addEventListener('click', function () {
        updateStatus('Extraction en cours...', 'info');

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];

            // Vérifier si on est sur LinkedIn
            if (!currentTab.url.includes('linkedin.com')) {
                updateStatus('Veuillez aller sur une page LinkedIn', 'error');
                return;
            }

            // Envoyer un message au content script pour extraire
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'extractProfile'
            }, function (response) {
                if (chrome.runtime.lastError) {
                    updateStatus('Erreur: Extension non chargée sur cette page', 'error');
                    return;
                }

                if (response && response.success) {
                    updateStatus('Profil extrait et sauvegardé!', 'success');
                } else {
                    updateStatus('Erreur lors de l\'extraction', 'error');
                }
            });
        });
    });

    // Voir les données extraites
    viewDataBtn.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'getLastData'
            }, function (response) {
                if (response && response.data) {
                    // Ouvrir une nouvelle fenêtre avec les données
                    const dataWindow = window.open('', '_blank', 'width=600,height=400');
                    dataWindow.document.write(`
                        <html>
                        <head><title>Données LinkedIn Extraites</title></head>
                        <body style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>📊 Dernières données extraites</h2>
                            <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow: auto;">
${JSON.stringify(response.data, null, 2)}
                            </pre>
                        </body>
                        </html>
                    `);
                } else {
                    updateStatus('Aucune donnée disponible', 'error');
                }
            });
        });
    });

    // Vérifier le statut de la page actuelle
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        if (currentTab.url.includes('linkedin.com')) {
            if (currentTab.url.includes('/in/')) {
                updateStatus('Page de profil détectée - Prêt!', 'success');
            } else {
                updateStatus('Allez sur une page de profil LinkedIn', 'info');
            }
        } else {
            updateStatus('Veuillez aller sur LinkedIn', 'error');
        }
    });
});
