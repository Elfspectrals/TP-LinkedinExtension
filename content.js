console.log("app load");

// Function to extract complete LinkedIn profile information
function extractLinkedInProfile() {
    const profile = {};

    // 1. Nom et prénom du profil
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
            const fullName = element.textContent.trim();
            const nameParts = fullName.split(' ');
            profile.firstName = nameParts[0];
            profile.lastName = nameParts.slice(1).join(' ');
            profile.fullName = fullName;
            break;
        }
    }

    // 2. Poste actuel du profil
    const jobSelectors = [
        '.text-body-medium.break-words',
        '.pv-text-details__left-panel .text-body-medium',
        '.pv-top-card .text-body-medium',
        '.ph5 .text-body-medium'
    ];

    for (const selector of jobSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            profile.currentPosition = element.textContent.trim();
            break;
        }
    }

    // 3. Nombre d'abonnés (followers)
    const followersSelectors = [
        'a[href*="followers"] strong',
        'a[data-test-app-aware-link][href*="followers"] strong',
        '.pvs-header__optional-link a[href*="followers"] strong'
    ];

    for (const selector of followersSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.includes('abonnés')) {
            profile.followers = element.textContent.trim();
            break;
        }
    }

    // 4. Nombre de relations (connections)
    const connectionsSelectors = [
        'a[href*="connections"] .t-bold',
        'a[href="/mynetwork/invite-connect/connections/"] .t-bold',
        '.text-body-small a[href*="connections"] .t-bold'
    ];

    for (const selector of connectionsSelectors) {
        const element = document.querySelector(selector);
        if (element && (element.textContent.trim().match(/^\d+$/) || element.parentElement.textContent.includes('relations'))) {
            const parentText = element.parentElement.textContent;
            if (parentText.includes('relations')) {
                profile.connections = parentText.trim();
            } else {
                profile.connections = element.textContent.trim() + ' relations';
            }
            break;
        }
    }

    // 5. Liste des expériences professionnelles
    const experienceSection = document.querySelector('#experience + .pvs-list__outer-container');
    if (experienceSection) {
        const experiences = [];
        const experienceItems = experienceSection.querySelectorAll('.pvs-list__paged-list-item');

        experienceItems.forEach(item => {
            const title = item.querySelector('.mr1.t-bold span[aria-hidden="true"]')?.textContent?.trim();
            const company = item.querySelector('.t-14.t-normal span[aria-hidden="true"]')?.textContent?.trim();
            const duration = item.querySelector('.pvs-entity__caption-wrapper .t-14.t-normal.t-black--light span[aria-hidden="true"]')?.textContent?.trim();

            if (title) {
                experiences.push({
                    title: title,
                    company: company || '',
                    duration: duration || ''
                });
            }
        });

        profile.experiences = experiences;
    }

    // 6. Liste des certifications et formations
    const educationSection = document.querySelector('#education + .pvs-list__outer-container');
    const certificationsSection = document.querySelector('#licenses_and_certifications + .pvs-list__outer-container');

    profile.education = [];
    profile.certifications = [];

    if (educationSection) {
        const educationItems = educationSection.querySelectorAll('.pvs-list__paged-list-item');
        educationItems.forEach(item => {
            const school = item.querySelector('.mr1.t-bold span[aria-hidden="true"]')?.textContent?.trim();
            const degree = item.querySelector('.t-14.t-normal span[aria-hidden="true"]')?.textContent?.trim();

            if (school) {
                profile.education.push({
                    school: school,
                    degree: degree || ''
                });
            }
        });
    }

    if (certificationsSection) {
        const certItems = certificationsSection.querySelectorAll('.pvs-list__paged-list-item');
        certItems.forEach(item => {
            const name = item.querySelector('.mr1.t-bold span[aria-hidden="true"]')?.textContent?.trim();
            const issuer = item.querySelector('.t-14.t-normal span[aria-hidden="true"]')?.textContent?.trim();

            if (name) {
                profile.certifications.push({
                    name: name,
                    issuer: issuer || ''
                });
            }
        });
    }

    // 7. Nombre de compétences (skills)
    const skillsSection = document.querySelector('#skills + .pvs-list__outer-container');
    if (skillsSection) {
        const skillsItems = skillsSection.querySelectorAll('.artdeco-list__item');
        profile.skillsCount = skillsItems.length;

        const skills = [];
        skillsItems.forEach(item => {
            // Utiliser les sélecteurs basés sur votre HTML
            const skillName = item.querySelector('.hoverable-link-text.t-bold span[aria-hidden="true"]')?.textContent?.trim();
            if (skillName) {
                skills.push(skillName);
            }
        });
        profile.skills = skills;
    }

    return profile;
}

// Function to display extracted profile data
function displayProfileData() {
    const profile = extractLinkedInProfile();

    console.log('=== PROFIL LINKEDIN EXTRAIT ===');
    console.log('Nom complet:', profile.fullName || 'Non trouvé');
    console.log('Prénom:', profile.firstName || 'Non trouvé');
    console.log('Nom:', profile.lastName || 'Non trouvé');
    console.log('Poste actuel:', profile.currentPosition || 'Non trouvé');
    console.log('Abonnés:', profile.followers || 'Non trouvé');
    console.log('Relations:', profile.connections || 'Non trouvé');
    console.log('Nombre de compétences:', profile.skillsCount || 0);

    if (profile.experiences && profile.experiences.length > 0) {
        console.log('Expériences professionnelles:');
        profile.experiences.forEach((exp, index) => {
            console.log(`  ${index + 1}. ${exp.title} chez ${exp.company} (${exp.duration})`);
        });
    }

    if (profile.education && profile.education.length > 0) {
        console.log('Formation:');
        profile.education.forEach((edu, index) => {
            console.log(`  ${index + 1}. ${edu.degree} - ${edu.school}`);
        });
    }

    if (profile.certifications && profile.certifications.length > 0) {
        console.log('Certifications:');
        profile.certifications.forEach((cert, index) => {
            console.log(`  ${index + 1}. ${cert.name} - ${cert.issuer}`);
        });
    }

    if (profile.skills && profile.skills.length > 0) {
        console.log('Compétences:', profile.skills.join(', '));
    }

    console.log('=== FIN EXTRACTION ===');

    return profile;
}

// Wait for page to load and extract profile data
setTimeout(() => {
    displayProfileData();
}, 3000);

// Also try to extract data when DOM changes (for single-page app navigation)
let extractionTimeout;
const observer = new MutationObserver(() => {
    clearTimeout(extractionTimeout);
    extractionTimeout = setTimeout(() => {
        displayProfileData();
    }, 1000);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});