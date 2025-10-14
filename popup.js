// Script pour le popup de l'extension LinkedIn
document.addEventListener('DOMContentLoaded', function () {
    const extractBtn = document.getElementById('extractBtn');
    const viewDataBtn = document.getElementById('viewDataBtn');
    const exportBtn = document.getElementById('exportBtn');
    const statusDiv = document.getElementById('status');
    const statsGrid = document.getElementById('statsGrid');
    const profilesCount = document.getElementById('profilesCount');
    const todayCount = document.getElementById('todayCount');

    // Fonction pour mettre à jour le statut avec animation de chargement
    function updateStatus(message, type = 'info', showLoading = false) {
        const loadingSpinner = showLoading ? '<span class="loading"></span>' : '';
        statusDiv.innerHTML = loadingSpinner + message;
        statusDiv.className = `status ${type}`;
    }

    // Fonction pour mettre à jour les statistiques
    async function updateStats() {
        try {
            const result = await chrome.storage.local.get(['extractedProfiles', 'todayExtractions']);
            const profiles = result.extractedProfiles || [];
            const today = new Date().toDateString();
            const todayProfiles = profiles.filter(p => new Date(p.extractedAt).toDateString() === today);

            profilesCount.textContent = profiles.length;
            todayCount.textContent = todayProfiles.length;

            if (profiles.length > 0) {
                statsGrid.style.display = 'grid';
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des stats:', error);
        }
    }

    // Extraire le profil actuel
    extractBtn.addEventListener('click', function () {
        updateStatus('Extraction en cours...', 'info', true);

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
            }, async function (response) {
                if (chrome.runtime.lastError) {
                    updateStatus('Erreur: Extension non chargée sur cette page', 'error');
                    return;
                }

                if (response && response.success) {
                    updateStatus('Profil extrait et sauvegardé!', 'success');

                    // Sauvegarder localement pour les statistiques
                    try {
                        const result = await chrome.storage.local.get(['extractedProfiles']);
                        const profiles = result.extractedProfiles || [];
                        profiles.push({
                            url: currentTab.url,
                            extractedAt: new Date().toISOString(),
                            title: currentTab.title
                        });
                        await chrome.storage.local.set({ extractedProfiles: profiles });
                        updateStats();
                    } catch (error) {
                        console.error('Erreur sauvegarde locale:', error);
                    }
                } else {
                    updateStatus('Erreur lors de l\'extraction', 'error');
                }
            });
        });
    });

    // Voir les données extraites avec interface améliorée
    viewDataBtn.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'getLastData'
            }, function (response) {
                if (response && response.data) {
                    // Ouvrir une nouvelle fenêtre avec les données stylées
                    const dataWindow = window.open('', '_blank', 'width=800,height=600');
                    dataWindow.document.write(`
                        <html>
                        <head>
                            <title>Données LinkedIn Extraites</title>
                            <style>
                                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f5f7fa; }
                                .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                                h2 { color: #333; margin-bottom: 20px; }
                                .data-section { margin: 20px 0; padding: 16px; background: #f8f9ff; border-radius: 8px; border-left: 4px solid #667eea; }
                                .data-label { font-weight: 600; color: #667eea; margin-bottom: 8px; }
                                .data-value { color: #333; }
                                pre { background: #2d3748; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow: auto; font-size: 14px; }
                                .export-btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin: 10px 5px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h2>📊 Données LinkedIn Extraites</h2>
                                <div class="data-section">
                                    <div class="data-label">Nom et Prénom:</div>
                                    <div class="data-value">${response.data.nomPrenom || 'Non disponible'}</div>
                                </div>
                                <div class="data-section">
                                    <div class="data-label">Poste Actuel:</div>
                                    <div class="data-value">${response.data.posteActuel || 'Non disponible'}</div>
                                </div>
                                <div class="data-section">
                                    <div class="data-label">Abonnés:</div>
                                    <div class="data-value">${response.data.nombreAbonnes || 'Non disponible'}</div>
                                </div>
                                <div class="data-section">
                                    <div class="data-label">Relations:</div>
                                    <div class="data-value">${response.data.nombreRelations || 'Non disponible'}</div>
                                </div>
                                <button class="export-btn" onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(response.data)}, null, 2))">📋 Copier JSON</button>
                                <h3>Données complètes (JSON):</h3>
                                <pre>${JSON.stringify(response.data, null, 2)}</pre>
                            </div>
                        </body>
                        </html>
                    `);
                } else {
                    updateStatus('Aucune donnée disponible', 'error');
                }
            });
        });
    });

    // Nouvelle fonctionnalité : Export CSV
    exportBtn.addEventListener('click', async function () {
        try {
            const result = await chrome.storage.local.get(['extractedProfiles']);
            const profiles = result.extractedProfiles || [];

            if (profiles.length === 0) {
                updateStatus('Aucune donnée à exporter', 'warning');
                return;
            }

            // Créer le CSV
            const csvContent = "data:text/csv;charset=utf-8,"
                + "URL,Titre,Date d'extraction\n"
                + profiles.map(p => `"${p.url}","${p.title}","${p.extractedAt}"`).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `linkedin_extractions_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            updateStatus('Export CSV réussi!', 'success');
        } catch (error) {
            updateStatus('Erreur lors de l\'export', 'error');
            console.error('Erreur export:', error);
        }
    });


    // Initialisation et vérification du statut
    async function initialize() {
        await updateStats();

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
    }

    // Lancer l'initialisation
    initialize();
});