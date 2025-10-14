-- Script SQL pour créer la table linkedin_profiles dans Supabase
-- À exécuter dans l'éditeur SQL de votre dashboard Supabase

CREATE TABLE linkedin_profiles (
  id BIGSERIAL PRIMARY KEY,
  nom_prenom TEXT,
  poste_actuel TEXT,
  nombre_abonnes TEXT,
  nombre_relations TEXT,
  experiences_professionnelles JSONB,
  certifications_formations JSONB,
  nombre_competences INTEGER,
  url_profil TEXT,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter des index pour améliorer les performances
CREATE INDEX idx_linkedin_profiles_nom ON linkedin_profiles(nom_prenom);
CREATE INDEX idx_linkedin_profiles_poste ON linkedin_profiles(poste_actuel);
CREATE INDEX idx_linkedin_profiles_date ON linkedin_profiles(extracted_at);

-- Politique de sécurité (RLS) - optionnel
-- ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;

-- Exemple de politique pour permettre la lecture/écriture à tous (à adapter selon vos besoins)
-- CREATE POLICY "Allow all operations" ON linkedin_profiles FOR ALL USING (true);

-- Commentaires sur les colonnes
COMMENT ON TABLE linkedin_profiles IS 'Table pour stocker les profils LinkedIn extraits';
COMMENT ON COLUMN linkedin_profiles.nom_prenom IS 'Nom complet du profil LinkedIn';
COMMENT ON COLUMN linkedin_profiles.poste_actuel IS 'Poste actuel de la personne';
COMMENT ON COLUMN linkedin_profiles.nombre_abonnes IS 'Nombre d''abonnés (format texte avec unité)';
COMMENT ON COLUMN linkedin_profiles.nombre_relations IS 'Nombre de relations (format texte avec unité)';
COMMENT ON COLUMN linkedin_profiles.experiences_professionnelles IS 'Array JSON des expériences professionnelles';
COMMENT ON COLUMN linkedin_profiles.certifications_formations IS 'Array JSON des certifications et formations';
COMMENT ON COLUMN linkedin_profiles.nombre_competences IS 'Nombre total de compétences';
COMMENT ON COLUMN linkedin_profiles.url_profil IS 'URL du profil LinkedIn';
COMMENT ON COLUMN linkedin_profiles.extracted_at IS 'Date et heure d''extraction';
