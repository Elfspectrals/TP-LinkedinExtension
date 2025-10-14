// Fonction utilitaire pour déboguer les sélecteurs
function debugSelector(selector, context = document) {
    const elements = context.querySelectorAll(selector);
    return elements;
}

function extractLinkedInProfile() {
    const userInfo = {
        nomPrenom: null,
        posteActuel: null,
        nombreAbonnes: null,
        nombreRelations: null,
        experiencesProfessionnelles: [],
        certificationsFormations: [],
        nombreCompetences: 0
    };

    const nameSelectors = [
        'h1.text-heading-xlarge',
        '.text-heading-xlarge',
        '[data-anonymize="person-name"]',
        '.pv-text-details__left-panel h1',
        '.ph5 h1'
    ];

    for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            userInfo.nomPrenom = element.textContent.trim();
            break;
        }
    }

    const jobSelectors = [
        '.text-body-medium.break-words',
        '.pv-text-details__left-panel .text-body-medium',
        '.pv-top-card .text-body-medium',
        '.ph5 .text-body-medium'
    ];

    for (const selector of jobSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            userInfo.posteActuel = element.textContent.trim();
            break;
        }
    }

    // Extraction des abonnés - Sélecteurs améliorés
    const followersSelectors = [
        'a[href*="followers"] strong',
        'a[data-test-app-aware-link][href*="followers"] strong',
        '.pvs-header__optional-link a[href*="followers"] strong',
        'a[href*="followers"] span',
        '.pv-top-card__connections a[href*="followers"]'
    ];

    for (const selector of followersSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            const text = element.textContent.trim();
            if (text.includes('abonnés') || text.includes('followers')) {
                userInfo.nombreAbonnes = text;
                break;
            }
        }
    }

    // Si pas trouvé, chercher dans tout le document
    if (!userInfo.nombreAbonnes) {
        const allLinks = document.querySelectorAll('a[href*="followers"]');
        for (const link of allLinks) {
            const text = link.textContent.trim();
            if (text.includes('abonnés') || text.includes('followers')) {
                userInfo.nombreAbonnes = text;
                break;
            }
        }
    }

    // Extraction des relations - Sélecteurs améliorés
    const connectionsSelectors = [
        'a[href*="connections"] .t-bold',
        'a[href="/mynetwork/invite-connect/connections/"] .t-bold',
        '.text-body-small a[href*="connections"] .t-bold',
        'a[href*="connections"] span',
        '.pv-top-card__connections a[href*="connections"]'
    ];

    for (const selector of connectionsSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            const text = element.textContent.trim();
            const parentText = element.parentElement ? element.parentElement.textContent.trim() : '';

            if (text.match(/^\d+$/) || parentText.includes('relations') || parentText.includes('connections')) {
                if (parentText.includes('relations')) {
                    userInfo.nombreRelations = parentText;
                } else if (text.match(/^\d+$/)) {
                    userInfo.nombreRelations = text + ' relations';
                } else {
                    userInfo.nombreRelations = text;
                }
                break;
            }
        }
    }

    // Si pas trouvé, chercher dans tout le document
    if (!userInfo.nombreRelations) {
        const allLinks = document.querySelectorAll('a[href*="connections"]');
        for (const link of allLinks) {
            const text = link.textContent.trim();
            if (text.includes('relations') || text.includes('connections')) {
                userInfo.nombreRelations = text;
                break;
            }
        }
    }

    // Extraction des expériences - Sélecteurs multiples pour plus de robustesse

    const experienceSelectors = [
        '#experience',
        'section h2[id*="experience"]',
        'div[id="experience"]'
    ];

    let experienceSection = null;

    // Recherche de la section expérience
    for (const selector of experienceSelectors) {
        const anchor = document.querySelector(selector);
        if (anchor) {
            experienceSection = anchor.closest('section') || anchor.parentElement.closest('section');
            if (experienceSection) {
                break;
            }
        }
    }

    // Si pas trouvé, chercher par texte
    if (!experienceSection) {
        const sections = document.querySelectorAll('section');
        for (const section of sections) {
            const heading = section.querySelector('h2, h3');
            if (heading && (heading.textContent.includes('Expérience') || heading.textContent.includes('Experience'))) {
                experienceSection = section;
                break;
            }
        }
    }

    if (experienceSection) {
        const experienceItemSelectors = [
            '.artdeco-list__item[data-view-name="profile-component-entity"]',
            '.pvs-list__paged-list-item',
            '.artdeco-list__item',
            'li[data-view-name="profile-component-entity"]',
            '.pvs-entity'
        ];

        let experienceItems = [];
        for (const itemSelector of experienceItemSelectors) {
            experienceItems = experienceSection.querySelectorAll(itemSelector);
            if (experienceItems.length > 0) {
                break;
            }
        }

        experienceItems.forEach((item, index) => {

            // Sélecteurs pour le titre du poste
            const titleSelectors = [
                '.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]',
                '.mr1.t-bold span[aria-hidden="true"]',
                '.pvs-entity__path-node span[aria-hidden="true"]',
                'h3 span[aria-hidden="true"]',
                '.t-bold span[aria-hidden="true"]'
            ];

            let title = '';
            for (const titleSelector of titleSelectors) {
                const titleElement = item.querySelector(titleSelector);
                if (titleElement && titleElement.textContent.trim()) {
                    title = titleElement.textContent.trim();
                    break;
                }
            }

            if (title) {
                let company = '';

                // Sélecteurs pour l'entreprise
                const companySelectors = [
                    '.t-14.t-normal span[aria-hidden="true"]',
                    '.pvs-entity__secondary-title span[aria-hidden="true"]',
                    '.t-normal span[aria-hidden="true"]'
                ];

                for (const companySelector of companySelectors) {
                    const spans = item.querySelectorAll(companySelector);
                    if (spans.length > 0) {
                        const companyText = spans[0].textContent.trim();
                        company = companyText.split(' · ')[0];
                        if (company) break;
                    }
                }

                userInfo.experiencesProfessionnelles.push({
                    poste: title,
                    entreprise: company
                });
            }
        });
    }

    // Extraction de l'éducation - Sélecteurs multiples

    const educationSelectors = [
        '#education + .pvs-list__outer-container',
        '#education',
        'div[id="education"]'
    ];

    let educationSection = null;

    // Recherche de la section éducation
    for (const selector of educationSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            if (selector.includes('+')) {
                educationSection = element;
            } else {
                educationSection = element.closest('section') || element.parentElement.closest('section');
            }
            if (educationSection) {
                break;
            }
        }
    }

    // Si pas trouvé, chercher par texte
    if (!educationSection) {
        const sections = document.querySelectorAll('section');
        for (const section of sections) {
            const heading = section.querySelector('h2, h3');
            if (heading && (heading.textContent.includes('Formation') || heading.textContent.includes('Education') || heading.textContent.includes('Éducation'))) {
                educationSection = section;
                break;
            }
        }
    }

    if (educationSection) {
        const educationItemSelectors = [
            '.pvs-list__paged-list-item',
            '.artdeco-list__item[data-view-name="profile-component-entity"]',
            '.artdeco-list__item',
            'li[data-view-name="profile-component-entity"]',
            '.pvs-entity'
        ];

        let educationItems = [];
        for (const itemSelector of educationItemSelectors) {
            educationItems = educationSection.querySelectorAll(itemSelector);
            if (educationItems.length > 0) {
                break;
            }
        }

        educationItems.forEach((item, index) => {

            // Sélecteurs pour l'école/université
            const schoolSelectors = [
                '.mr1.t-bold span[aria-hidden="true"]',
                '.pvs-entity__path-node span[aria-hidden="true"]',
                'h3 span[aria-hidden="true"]',
                '.t-bold span[aria-hidden="true"]'
            ];

            let school = '';
            for (const schoolSelector of schoolSelectors) {
                const schoolElement = item.querySelector(schoolSelector);
                if (schoolElement && schoolElement.textContent.trim()) {
                    school = schoolElement.textContent.trim();
                    break;
                }
            }

            // Sélecteurs pour le diplôme
            const degreeSelectors = [
                '.t-14.t-normal span[aria-hidden="true"]',
                '.pvs-entity__secondary-title span[aria-hidden="true"]',
                '.t-normal span[aria-hidden="true"]'
            ];

            let degree = '';
            for (const degreeSelector of degreeSelectors) {
                const degreeElement = item.querySelector(degreeSelector);
                if (degreeElement && degreeElement.textContent.trim()) {
                    degree = degreeElement.textContent.trim();
                    break;
                }
            }

            if (school) {
                userInfo.certificationsFormations.push({
                    type: 'Formation',
                    nom: school,
                    details: degree || ''
                });
            }
        });
    }

    // Extraction des certifications - Sélecteurs multiples

    const certificationSelectors = [
        '#licenses_and_certifications + .pvs-list__outer-container',
        '#licenses_and_certifications',
        '#certifications',
        'div[id="licenses_and_certifications"]'
    ];

    let certificationsSection = null;

    // Recherche de la section certifications
    for (const selector of certificationSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            if (selector.includes('+')) {
                certificationsSection = element;
            } else {
                certificationsSection = element.closest('section') || element.parentElement.closest('section');
            }
            if (certificationsSection) {
                break;
            }
        }
    }

    // Si pas trouvé, chercher par texte
    if (!certificationsSection) {
        const sections = document.querySelectorAll('section');
        for (const section of sections) {
            const heading = section.querySelector('h2, h3');
            if (heading && (heading.textContent.includes('Certifications') || heading.textContent.includes('Licences') || heading.textContent.includes('Certificates'))) {
                certificationsSection = section;
                break;
            }
        }
    }

    if (certificationsSection) {
        const certItemSelectors = [
            '.pvs-list__paged-list-item',
            '.artdeco-list__item[data-view-name="profile-component-entity"]',
            '.artdeco-list__item',
            'li[data-view-name="profile-component-entity"]',
            '.pvs-entity'
        ];

        let certItems = [];
        for (const itemSelector of certItemSelectors) {
            certItems = certificationsSection.querySelectorAll(itemSelector);
            if (certItems.length > 0) {
                break;
            }
        }

        certItems.forEach((item, index) => {

            // Sélecteurs pour le nom de la certification
            const nameSelectors = [
                '.mr1.t-bold span[aria-hidden="true"]',
                '.pvs-entity__path-node span[aria-hidden="true"]',
                'h3 span[aria-hidden="true"]',
                '.t-bold span[aria-hidden="true"]'
            ];

            let name = '';
            for (const nameSelector of nameSelectors) {
                const nameElement = item.querySelector(nameSelector);
                if (nameElement && nameElement.textContent.trim()) {
                    name = nameElement.textContent.trim();
                    break;
                }
            }

            // Sélecteurs pour l'organisme émetteur
            const issuerSelectors = [
                '.t-14.t-normal span[aria-hidden="true"]',
                '.pvs-entity__secondary-title span[aria-hidden="true"]',
                '.t-normal span[aria-hidden="true"]'
            ];

            let issuer = '';
            for (const issuerSelector of issuerSelectors) {
                const issuerElement = item.querySelector(issuerSelector);
                if (issuerElement && issuerElement.textContent.trim()) {
                    issuer = issuerElement.textContent.trim();
                    break;
                }
            }

            if (name) {
                userInfo.certificationsFormations.push({
                    type: 'Certification',
                    nom: name,
                    details: issuer || ''
                });
            }
        });
    }

    let skills = [];
    const competencesSection = Array.from(document.querySelectorAll('section')).find(section => {
        const titleElement = section.querySelector('h2, h3');
        return titleElement && titleElement.textContent.includes('Compétences');
    });

    if (competencesSection) {
        const skillElements = competencesSection.querySelectorAll('.pvs-list__paged-list-item');

        skillElements.forEach(item => {
            const skillNameElement = item.querySelector('.mr1.t-bold span[aria-hidden="true"]');
            if (skillNameElement) {
                const skillText = skillNameElement.textContent.trim();
                if (skillText &&
                    !skillText.includes('chez') &&
                    !skillText.includes('Une personne') &&
                    skillText.length < 50) {
                    skills.push(skillText);
                }
            }
        });

        if (skills.length === 0) {
            const alternativeSkills = competencesSection.querySelectorAll('div[data-view-name="profile-component-entity"]');
            alternativeSkills.forEach(item => {
                const titleElement = item.querySelector('span[aria-hidden="true"]');
                if (titleElement) {
                    const skillText = titleElement.textContent.trim();
                    if (skillText &&
                        !skillText.includes('chez') &&
                        !skillText.includes('Une personne') &&
                        skillText.length < 50) {
                        skills.push(skillText);
                    }
                }
            });
        }

        const showMoreButton = competencesSection.querySelector('.pvs-navigation__text, a[href*="details/skills"] .pvs-navigation__text');
        if (showMoreButton) {
            const buttonText = showMoreButton.textContent.trim();
            const match = buttonText.match(/Afficher\s+les\s+(\d+)\s+compétences/);
            if (match) {
                userInfo.nombreCompetences = parseInt(match[1]);
            }
        }

        if (!userInfo.nombreCompetences) {
            const alternativeButton = competencesSection.querySelector('a[href*="details/skills"]');
            if (alternativeButton) {
                const linkText = alternativeButton.textContent.trim();
                const match = linkText.match(/(\d+)\s*compétences/);
                if (match) {
                    userInfo.nombreCompetences = parseInt(match[1]);
                }
            }
        }
    }

    if (skills.length === 0) {
        const allPossibleSkills = document.querySelectorAll('.mr1.t-bold span[aria-hidden="true"]');
        allPossibleSkills.forEach(element => {
            const text = element.textContent.trim();
            if (text &&
                !text.includes('chez') &&
                !text.includes('Une personne') &&
                !text.includes('Voir') &&
                !text.includes('Suivre') &&
                text.length < 50 &&
                text.length > 2) {
                skills.push(text);
            }
        });
    }

    // Si aucun nombre de compétences trouvé, utiliser le nombre de compétences visibles
    if (!userInfo.nombreCompetences) {
        const cleanSkills = [...new Set(skills.filter(skill =>
            skill &&
            skill.trim() !== '' &&
            !skill.includes('Voir') &&
            !skill.includes('étudié') &&
            !skill.includes('abonnés') &&
            !skill.includes('relations')
        ))];
        userInfo.nombreCompetences = cleanSkills.length;
    }

    return userInfo;
}

function getLinkedInUserInfo() {
    const userInfo = extractLinkedInProfile();

    window.linkedInUserData = {
        extractedAt: new Date().toISOString(),
        data: userInfo,
        url: window.location.href
    };

    console.log('✅ Extraction terminée. Données complètes:', userInfo);

    return userInfo;
}

setTimeout(() => {
    getLinkedInUserInfo();
}, 3000);

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

