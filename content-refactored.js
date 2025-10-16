// LinkedIn Profile Extractor - Version refactorisée
// Extraction intelligente et modulaire des profils LinkedIn

class LinkedInExtractor {
    constructor() {
        this.selectors = {
            name: [
                'h1.text-heading-xlarge',
                '.text-heading-xlarge',
                '[data-anonymize="person-name"]',
                '.pv-text-details__left-panel h1',
                '.ph5 h1'
            ],
            job: [
                '.text-body-medium.break-words',
                '.pv-text-details__left-panel .text-body-medium',
                '.pv-top-card .text-body-medium',
                '.ph5 .text-body-medium'
            ],
            followers: [
                'a[href*="followers"] strong',
                'a[data-test-app-aware-link][href*="followers"] strong',
                '.pvs-header__optional-link a[href*="followers"] strong',
                'a[href*="followers"] span',
                '.pv-top-card__connections a[href*="followers"]',
                '.pvs-entity__caption-wrapper span[aria-hidden="true"]',
                '.pvs-header__optional-link span[aria-hidden="true"]'
            ],
            connections: [
                'a[href*="connectionOf"] .t-bold',
                'a[href*="network"] .t-bold',
                'a[href*="connections"] .t-bold',
                'a[href="/mynetwork/invite-connect/connections/"] .t-bold',
                '.text-body-small a[href*="connections"] .t-bold',
                'a[href*="connections"] span',
                '.pv-top-card__connections a[href*="connections"]'
            ],
            experienceSection: [
                '#experience',
                'section h2[id*="experience"]',
                'div[id="experience"]'
            ],
            experienceItems: [
                '.artdeco-list__item[data-view-name="profile-component-entity"]',
                '.pvs-list__paged-list-item',
                '.artdeco-list__item',
                'li[data-view-name="profile-component-entity"]',
                '.pvs-entity'
            ],
            itemTitle: [
                '.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]',
                '.mr1.t-bold span[aria-hidden="true"]',
                '.pvs-entity__path-node span[aria-hidden="true"]',
                'h3 span[aria-hidden="true"]',
                '.t-bold span[aria-hidden="true"]'
            ],
            itemSubtitle: [
                '.t-14.t-normal span[aria-hidden="true"]',
                '.pvs-entity__secondary-title span[aria-hidden="true"]',
                '.t-normal span[aria-hidden="true"]'
            ]
        };

        this.cache = new Map();
        this.extractionId = Date.now();
    }

    // Méthode utilitaire pour déboguer les sélecteurs
    debugSelector(selector, context = document) {
        return context.querySelectorAll(selector);
    }

    // Extraction avec cache et fallback
    extractWithSelectors(selectors, context = document, validator = null) {
        const cacheKey = selectors.join('|') + (context !== document ? context.outerHTML.substring(0, 100) : '');

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        for (const selector of selectors) {
            try {
                const element = context.querySelector(selector);
                if (element && element.textContent.trim()) {
                    const text = element.textContent.trim();
                    if (!validator || validator(text, element)) {
                        this.cache.set(cacheKey, text);
                        return text;
                    }
                }
            } catch (error) {
                console.warn(`Erreur avec le sélecteur ${selector}:`, error);
            }
        }

        this.cache.set(cacheKey, null);
        return null;
    }

    // Extraction du nom avec validation
    extractName() {
        return this.extractWithSelectors(this.selectors.name, document, (text) => {
            return text.length > 2 && text.length < 100 && !text.includes('LinkedIn');
        });
    }

    // Extraction du poste actuel
    extractCurrentJob() {
        return this.extractWithSelectors(this.selectors.job, document, (text) => {
            return text.length > 2 && !text.includes('abonnés') && !text.includes('relations');
        });
    }

    // Extraction des abonnés avec recherche intelligente
    extractFollowers() {
        // Recherche avec sélecteurs spécifiques
        let result = this.extractWithSelectors(this.selectors.followers, document, (text) => {
            return text.includes('abonnés') || text.includes('followers');
        });

        if (result) return result;

        // Recherche élargie
        const searchTerms = ['abonnés', 'followers'];
        const elements = document.querySelectorAll('a[href*="followers"], span[aria-hidden="true"], p');

        for (const element of elements) {
            const text = element.textContent.trim();
            if (searchTerms.some(term => text.includes(term))) {
                return text;
            }
        }

        return null;
    }

    // Extraction des relations
    extractConnections() {
        // Recherche avec sélecteurs spécifiques
        for (const selector of this.selectors.connections) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent.trim();
                const parentText = element.parentElement?.textContent.trim() || '';
                const grandParentText = element.parentElement?.parentElement?.textContent.trim() || '';

                // Vérifier si c'est un nombre seul dans un élément .t-bold
                if (text.match(/^\d+$/)) {
                    if (parentText.includes('relations') || grandParentText.includes('relations')) {
                        return text + ' relations';
                    }
                } else if (text.includes('relations') || parentText.includes('relations')) {
                    return parentText.includes('relations') ? parentText : text;
                }
            }
        }

        // Recherche élargie
        const searchTerms = ['relations', 'connections'];
        const elements = document.querySelectorAll('a[href*="connections"], span[aria-hidden="true"], p');

        for (const element of elements) {
            const text = element.textContent.trim();
            if (searchTerms.some(term => text.includes(term))) {
                return text;
            }
        }

        return null;
    }

    // Extraction d'une section générique (expérience, éducation, certifications)
    extractSection(sectionSelectors, sectionNames, itemType = 'item') {
        let section = null;

        // Recherche de la section par sélecteur
        for (const selector of sectionSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                section = element.closest('section') || element.parentElement?.closest('section');
                if (section) break;
            }
        }

        // Recherche par texte si pas trouvé
        if (!section) {
            const sections = document.querySelectorAll('section');
            for (const sectionEl of sections) {
                const heading = sectionEl.querySelector('h2, h3');
                if (heading && sectionNames.some(name => heading.textContent.includes(name))) {
                    section = sectionEl;
                    break;
                }
            }
        }

        if (!section) return [];

        // Extraction des éléments de la section
        let items = [];
        for (const itemSelector of this.selectors.experienceItems) {
            items = section.querySelectorAll(itemSelector);
            if (items.length > 0) break;
        }

        const results = [];
        items.forEach((item, index) => {
            const title = this.extractWithSelectors(this.selectors.itemTitle, item);
            const subtitle = this.extractWithSelectors(this.selectors.itemSubtitle, item);

            if (title) {
                const result = {
                    type: itemType,
                    nom: title,
                    details: subtitle ? subtitle.split(' · ')[0] : ''
                };

                if (itemType === 'Experience') {
                    result.poste = title;
                    result.entreprise = result.details;
                    delete result.nom;
                    delete result.details;
                }

                results.push(result);
            }
        });

        return results;
    }

    // Extraction des expériences professionnelles
    extractExperiences() {
        return this.extractSection(
            this.selectors.experienceSection,
            ['Expérience', 'Experience'],
            'Experience'
        );
    }

    // Extraction de l'éducation
    extractEducation() {
        const educationSelectors = [
            '#education + .pvs-list__outer-container',
            '#education',
            'div[id="education"]'
        ];
        return this.extractSection(
            educationSelectors,
            ['Formation', 'Education', 'Éducation'],
            'Formation'
        );
    }

    // Extraction des certifications
    extractCertifications() {
        const certificationSelectors = [
            '#licenses_and_certifications + .pvs-list__outer-container',
            '#licenses_and_certifications',
            '#certifications',
            'div[id="licenses_and_certifications"]'
        ];
        return this.extractSection(
            certificationSelectors,
            ['Certifications', 'Licences', 'Certificates'],
            'Certification'
        );
    }

    // Extraction des compétences avec comptage intelligent
    extractSkills() {
        const competencesSection = Array.from(document.querySelectorAll('section')).find(section => {
            const titleElement = section.querySelector('h2, h3');
            return titleElement && titleElement.textContent.includes('Compétences');
        });

        if (!competencesSection) return { skills: [], count: 0 };

        const skills = [];
        const skillElements = competencesSection.querySelectorAll('.pvs-list__paged-list-item');

        skillElements.forEach(item => {
            const skillNameElement = item.querySelector('.mr1.t-bold span[aria-hidden="true"]');
            if (skillNameElement) {
                const skillText = skillNameElement.textContent.trim();
                if (this.isValidSkill(skillText)) {
                    skills.push(skillText);
                }
            }
        });

        // Recherche alternative si aucune compétence trouvée
        if (skills.length === 0) {
            const alternativeSkills = competencesSection.querySelectorAll('div[data-view-name="profile-component-entity"]');
            alternativeSkills.forEach(item => {
                const titleElement = item.querySelector('span[aria-hidden="true"]');
                if (titleElement) {
                    const skillText = titleElement.textContent.trim();
                    if (this.isValidSkill(skillText)) {
                        skills.push(skillText);
                    }
                }
            });
        }

        // Extraction du nombre total de compétences
        let totalCount = skills.length;
        const showMoreButton = competencesSection.querySelector('.pvs-navigation__text, a[href*="details/skills"] .pvs-navigation__text');
        if (showMoreButton) {
            const buttonText = showMoreButton.textContent.trim();
            const match = buttonText.match(/Afficher\s+les\s+(\d+)\s+compétences/);
            if (match) {
                totalCount = parseInt(match[1]);
            }
        }

        if (totalCount === skills.length) {
            const alternativeButton = competencesSection.querySelector('a[href*="details/skills"]');
            if (alternativeButton) {
                const linkText = alternativeButton.textContent.trim();
                const match = linkText.match(/(\d+)\s*compétences/);
                if (match) {
                    totalCount = parseInt(match[1]);
                }
            }
        }

        return {
            skills: [...new Set(skills)], // Supprimer les doublons
            count: totalCount
        };
    }

    // Validation d'une compétence
    isValidSkill(skillText) {
        const invalidTerms = ['chez', 'Une personne', 'Voir', 'Suivre', 'étudié', 'abonnés', 'relations'];
        return skillText &&
            skillText.trim() !== '' &&
            skillText.length > 2 &&
            skillText.length < 50 &&
            !invalidTerms.some(term => skillText.includes(term));
    }

    // Méthode principale d'extraction
    extractProfile() {
        console.log(`🚀 Début de l'extraction (ID: ${this.extractionId})`);

        const startTime = performance.now();

        const profile = {
            nomPrenom: this.extractName(),
            posteActuel: this.extractCurrentJob(),
            nombreAbonnes: this.extractFollowers(),
            nombreRelations: this.extractConnections(),
            experiencesProfessionnelles: this.extractExperiences(),
            certificationsFormations: [
                ...this.extractEducation(),
                ...this.extractCertifications()
            ],
            nombreCompetences: 0,
            metadata: {
                extractionId: this.extractionId,
                extractedAt: new Date().toISOString(),
                url: window.location.href,
                extractionTime: 0,
                cacheHits: this.cache.size
            }
        };

        // Extraction des compétences
        const skillsData = this.extractSkills();
        profile.nombreCompetences = skillsData.count;
        profile.competences = skillsData.skills; // Nouvelle propriété

        const endTime = performance.now();
        profile.metadata.extractionTime = Math.round(endTime - startTime);

        console.log(`✅ Extraction terminée en ${profile.metadata.extractionTime}ms`);
        console.log('📊 Données extraites:', profile);

        return profile;
    }

    // Nettoyage du cache
    clearCache() {
        this.cache.clear();
    }
}

// Instance globale de l'extracteur
const linkedInExtractor = new LinkedInExtractor();

// Fonction principale compatible avec l'ancien code
async function getLinkedInUserInfo(saveToSupabase = false) {
    console.log('🔄 getLinkedInUserInfo appelée, saveToSupabase:', saveToSupabase);

    const userInfo = linkedInExtractor.extractProfile();
    console.log('📋 Données extraites brutes:', userInfo);

    window.linkedInUserData = {
        extractedAt: userInfo.metadata.extractedAt,
        data: userInfo,
        url: userInfo.metadata.url
    };

    // Sauvegarder dans Supabase seulement si demandé explicitement
    if (saveToSupabase) {
        console.log('💾 Tentative de sauvegarde Supabase...');
        console.log('🔍 Fonction saveLinkedInProfile disponible:', typeof saveLinkedInProfile);

        if (typeof saveLinkedInProfile === 'function') {
            try {
                console.log('📤 Envoi vers Supabase avec les données:', userInfo);
                const saveResult = await saveLinkedInProfile(userInfo);
                console.log('📥 Résultat Supabase:', saveResult);

                if (saveResult.success) {
                    console.log('🎉 Profil sauvegardé avec succès dans Supabase!');
                } else {
                    console.log('⚠️ Échec de la sauvegarde:', saveResult.error);
                    throw new Error('Échec sauvegarde: ' + JSON.stringify(saveResult.error));
                }
            } catch (error) {
                console.error('❌ Erreur lors de la sauvegarde:', error);
                throw error;
            }
        } else {
            const errorMsg = 'Fonction saveLinkedInProfile non disponible';
            console.error('❌', errorMsg);
            throw new Error(errorMsg);
        }
    }

    return userInfo;
}

// Extraction automatique désactivée pour éviter les doublons
// L'extraction se fait maintenant uniquement via le bouton/modal

// Gestion des messages du popup (compatible avec l'ancien code)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'extractProfile') {
        // Extraire le profil ET sauvegarder dans Supabase
        getLinkedInUserInfo(true).then(() => {
            sendResponse({ success: true, message: 'Profil extrait et sauvegardé avec succès' });
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
        });
        return true; // Indique une réponse asynchrone
    }

    if (request.action === 'getLastData') {
        // Retourner les dernières données extraites
        if (window.linkedInUserData) {
            sendResponse({ success: true, data: window.linkedInUserData.data });
        } else {
            sendResponse({ success: false, message: 'Aucune donnée disponible' });
        }
    }

});

// Création et injection du bouton de scraping dans la page
function createScrapingButton() {
    console.log('🔧 createScrapingButton() appelée');

    // Vérifier si le bouton existe déjà
    if (document.getElementById('linkedin-scraper-btn')) {
        console.log('✅ Bouton déjà présent');
        return;
    }

    // Essayer plusieurs sélecteurs pour trouver l'élément parent
    const selectors = [
        '.qCamYmQbgudFVzKuctSzgAikIqbmqYU.mt2',
        '.pv-text-details__left-panel',
        '.ph5.pb5',
        '.pv-top-card',
        'main section:first-child',
        '.scaffold-layout__main section:first-child'
    ];

    let targetContainer = null;
    for (const selector of selectors) {
        targetContainer = document.querySelector(selector);
        if (targetContainer) {
            console.log('🎯 Conteneur trouvé avec le sélecteur:', selector);
            break;
        }
    }

    if (!targetContainer) {
        console.log('⚠️ Aucun conteneur trouvé, nouvelle tentative dans 2 secondes...');
        setTimeout(createScrapingButton, 2000);
        return;
    }

    // Créer le bouton de scraping
    const scrapingButton = document.createElement('div');
    scrapingButton.id = 'linkedin-scraper-btn';
    scrapingButton.innerHTML = `
        <button class="linkedin-scraper-button" type="button">
            <svg class="scraper-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM7 7V5h2v2h2v2H9v2H7V9H5V7h2z"/>
            </svg>
            <span>Extraire le profil</span>
        </button>
    `;

    // Styles CSS pour le bouton
    const styles = `
        <style id="linkedin-scraper-styles">
            .linkedin-scraper-button {
                display: flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 10px 16px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 12px;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
            }
            
            .linkedin-scraper-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                background: linear-gradient(135deg, #5a6fd8, #6a42a0);
            }
            
            .scraper-icon {
                width: 16px;
                height: 16px;
            }
            
            .linkedin-scraper-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .linkedin-scraper-modal.show {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-content {
                background: white;
                border-radius: 16px;
                padding: 32px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .linkedin-scraper-modal.show .modal-content {
                transform: scale(1);
            }
            
            .modal-header {
                text-align: center;
                margin-bottom: 24px;
            }
            
            .modal-title {
                font-size: 24px;
                font-weight: 700;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 8px;
            }
            
            .modal-subtitle {
                color: #666;
                font-size: 14px;
            }
            
            .modal-section {
                margin-bottom: 24px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e0e7ff;
            }
            
            .modal-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .section-title {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                margin-bottom: 12px;
            }
            
            .modal-button {
                width: 100%;
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 8px;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
            }
            
            .btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            .btn-secondary {
                background: #f8f9fa;
                color: #333;
                border: 2px solid #e0e7ff;
            }
            
            .btn-secondary:hover {
                background: #e9ecef;
            }
            
            .close-button {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .close-button:hover {
                background: #f0f0f0;
                color: #333;
            }
            
            .status-message {
                padding: 12px 16px;
                border-radius: 8px;
                margin: 12px 0;
                font-weight: 500;
                text-align: center;
            }
            
            .status-success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .status-error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .status-info {
                background: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }
            
            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid #ffffff40;
                border-radius: 50%;
                border-top-color: #ffffff;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;

    // Injecter les styles
    if (!document.getElementById('linkedin-scraper-styles')) {
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Ajouter le bouton après l'élément de localisation
    targetContainer.appendChild(scrapingButton);
    console.log('🎉 Bouton de scraping ajouté avec succès!');

    // Ajouter l'événement click
    scrapingButton.querySelector('.linkedin-scraper-button').addEventListener('click', openScrapingModal);
    console.log('🔗 Event listener ajouté au bouton');
}

// Création de la modal de scraping
function createScrapingModal() {
    const modal = document.createElement('div');
    modal.id = 'linkedin-scraper-modal';
    modal.className = 'linkedin-scraper-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-button" id="modal-close-btn">&times;</button>
            
            <div class="modal-header">
                <h2 class="modal-title">🔗 LinkedIn Extractor</h2>
                <p class="modal-subtitle">Extraction intelligente de profils LinkedIn</p>
            </div>
            
            <div id="modal-status"></div>
            
            <div class="modal-section">
                <h3 class="section-title">📊 Actions principales</h3>
                <button class="modal-button btn-primary" id="extract-and-save-btn">
                    💾 Extraire et sauvegarder
                </button>
                <button class="modal-button btn-secondary" id="extract-only-btn">
                    🔍 Extraire seulement
                </button>
            </div>
            
            <div class="modal-section">
                <h3 class="section-title">📋 Données et export</h3>
                <button class="modal-button btn-secondary" id="view-data-btn">
                    👁️ Voir les données extraites
                </button>
                <button class="modal-button btn-secondary" id="export-csv-btn">
                    📊 Exporter en CSV
                </button>
            </div>
            
            <div class="modal-section">
                <h3 class="section-title">ℹ️ Informations</h3>
                <p style="font-size: 12px; color: #666; line-height: 1.4;">
                    Cette extension extrait les informations publiques du profil LinkedIn.
                    <br><strong>Respectez les conditions d'utilisation de LinkedIn.</strong>
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Ajouter les event listeners pour tous les boutons
    modal.querySelector('#modal-close-btn').addEventListener('click', closeScrapingModal);
    modal.querySelector('#extract-and-save-btn').addEventListener('click', extractAndSave);
    modal.querySelector('#extract-only-btn').addEventListener('click', extractOnly);
    modal.querySelector('#view-data-btn').addEventListener('click', viewExtractedData);
    modal.querySelector('#export-csv-btn').addEventListener('click', exportToCSV);

    // Fermer la modal en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeScrapingModal();
        }
    });
}

// Fonctions de gestion de la modal
function openScrapingModal() {
    let modal = document.getElementById('linkedin-scraper-modal');
    if (!modal) {
        createScrapingModal();
        modal = document.getElementById('linkedin-scraper-modal');
    }
    modal.classList.add('show');
}

function closeScrapingModal() {
    const modal = document.getElementById('linkedin-scraper-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Fonctions d'action de la modal
async function extractAndSave() {
    updateModalStatus('Extraction en cours...', 'info', true);
    try {
        console.log('🚀 Début extraction et sauvegarde...');
        const data = await getLinkedInUserInfo(true);
        console.log('📊 Données extraites:', data);
        updateModalStatus('Profil extrait et sauvegardé avec succès!', 'success');
    } catch (error) {
        console.error('❌ Erreur complète:', error);
        updateModalStatus('Erreur lors de l\'extraction: ' + error.message, 'error');
    }
}

async function extractOnly() {
    updateModalStatus('Extraction en cours...', 'info', true);
    try {
        const data = await getLinkedInUserInfo(false);
        updateModalStatus('Profil extrait avec succès!', 'success');
    } catch (error) {
        updateModalStatus('Erreur lors de l\'extraction: ' + error.message, 'error');
    }
}

function viewExtractedData() {
    if (window.linkedInUserData) {
        const data = window.linkedInUserData.data;
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
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>📊 Données LinkedIn Extraites</h2>
                    <div class="data-section">
                        <div class="data-label">Nom et Prénom:</div>
                        <div class="data-value">${data.nomPrenom || 'Non disponible'}</div>
                    </div>
                    <div class="data-section">
                        <div class="data-label">Poste Actuel:</div>
                        <div class="data-value">${data.posteActuel || 'Non disponible'}</div>
                    </div>
                    <div class="data-section">
                        <div class="data-label">Abonnés:</div>
                        <div class="data-value">${data.nombreAbonnes || 'Non disponible'}</div>
                    </div>
                    <div class="data-section">
                        <div class="data-label">Relations:</div>
                        <div class="data-value">${data.nombreRelations || 'Non disponible'}</div>
                    </div>
                    <h3>Données complètes (JSON):</h3>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            </body>
            </html>
        `);
    } else {
        updateModalStatus('Aucune donnée disponible. Effectuez d\'abord une extraction.', 'error');
    }
}

async function exportToCSV() {
    try {
        const result = await chrome.storage.local.get(['extractedProfiles']);
        const profiles = result.extractedProfiles || [];

        if (profiles.length === 0) {
            updateModalStatus('Aucune donnée à exporter', 'error');
            return;
        }

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

        updateModalStatus('Export CSV réussi!', 'success');
    } catch (error) {
        updateModalStatus('Erreur lors de l\'export: ' + error.message, 'error');
    }
}

function updateModalStatus(message, type = 'info', showLoading = false) {
    const statusDiv = document.getElementById('modal-status');
    if (statusDiv) {
        const loadingSpinner = showLoading ? '<span class="loading-spinner"></span>' : '';
        statusDiv.innerHTML = `<div class="status-message status-${type}">${loadingSpinner}${message}</div>`;

        // Supprimer le message après 5 secondes (sauf si c'est un loading)
        if (!showLoading) {
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 5000);
        }
    }
}

// Les fonctions sont maintenant attachées via des event listeners
// Plus besoin de les rendre globales

// Initialiser le bouton de scraping
console.log('🔄 Initialisation du bouton de scraping...');
setTimeout(() => {
    console.log('⏰ Tentative de création du bouton...');
    createScrapingButton();
}, 3000);

// Essayer aussi quand le DOM est complètement chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(createScrapingButton, 1000);
    });
} else {
    // DOM déjà chargé
    setTimeout(createScrapingButton, 1000);
}

// Observer pour recréer le bouton si la page change
const buttonObserver = new MutationObserver(() => {
    if (!document.getElementById('linkedin-scraper-btn')) {
        setTimeout(createScrapingButton, 1000);
    }
});

buttonObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Nettoyage lors du déchargement de la page
window.addEventListener('beforeunload', () => {
    buttonObserver.disconnect();
    linkedInExtractor.clearCache();
});

console.log('🔗 LinkedIn Extractor v2.0 avec modal intégrée chargé avec succès!');
