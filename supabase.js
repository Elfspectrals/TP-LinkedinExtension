// Configuration Supabase pour l'extension LinkedIn
const SUPABASE_URL = 'https://elxsbvnkiemuzyeemefm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVseHNidm5raWVtdXp5ZWVtZWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDE2MDYsImV4cCI6MjA3NTk3NzYwNn0.SvhLjVkla2WmA8pTjQIHzxPcODcdiTFFXHDl1Ohu9LU';

// Client Supabase simple sans import (pour extension Chrome)
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    async insert(table, data) {
        try {
            const response = await fetch(`${this.url}/rest/v1/${table}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return { data: result, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    async select(table, query = '*') {
        try {
            const response = await fetch(`${this.url}/rest/v1/${table}?select=${query}`, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return { data: result, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }
}

// Instance globale
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction pour sauvegarder un profil LinkedIn
async function saveLinkedInProfile(profileData) {
    console.log('💾 Sauvegarde en cours dans Supabase...');

    const dataToSave = {
        nom_prenom: profileData.nomPrenom,
        poste_actuel: profileData.posteActuel,
        nombre_abonnes: profileData.nombreAbonnes,
        nombre_relations: profileData.nombreRelations,
        experiences_professionnelles: profileData.experiencesProfessionnelles,
        certifications_formations: profileData.certificationsFormations,
        nombre_competences: profileData.nombreCompetences,
        url_profil: window.location.href,
        extracted_at: new Date().toISOString()
    };

    const { data, error } = await supabase.insert('linkedin_profiles', dataToSave);

    if (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        return { success: false, error };
    } else {
        console.log('✅ Profil sauvegardé avec succès dans Supabase!', data);
        return { success: true, data };
    }
}

// Fonction pour récupérer tous les profils
async function getAllProfiles() {
    const { data, error } = await supabase.select('linkedin_profiles');

    if (error) {
        console.error('❌ Erreur lors de la récupération:', error);
        return { success: false, error };
    } else {
        console.log('✅ Profils récupérés:', data);
        return { success: true, data };
    }
}
