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
    const userInfo = linkedInExtractor.extractProfile();

    window.linkedInUserData = {
        extractedAt: userInfo.metadata.extractedAt,
        data: userInfo,
        url: userInfo.metadata.url
    };

    // Sauvegarder dans Supabase seulement si demandé explicitement
    if (saveToSupabase && typeof saveLinkedInProfile === 'function') {
        try {
            const saveResult = await saveLinkedInProfile(userInfo);
            if (saveResult.success) {
                console.log('🎉 Profil sauvegardé avec succès dans Supabase!');
            } else {
                console.log('⚠️ Échec de la sauvegarde:', saveResult.error);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
        }
    }

    return userInfo;
}

// Extraction automatique simplifiée
let extractionTimeout;
const observer = new MutationObserver(() => {
    clearTimeout(extractionTimeout);
    extractionTimeout = setTimeout(() => {
        getLinkedInUserInfo();
    }, 1000);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Extraction initiale
setTimeout(() => {
    getLinkedInUserInfo();
}, 3000);

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

// Nettoyage lors du déchargement de la page
window.addEventListener('beforeunload', () => {
    observer.disconnect();
    linkedInExtractor.clearCache();
});

console.log('🔗 LinkedIn Extractor v2.0 chargé avec succès!');
