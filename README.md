# Driveaway Premium Rentals

Crée une plateforme web moderne, premium et responsive pour une entreprise de location de voitures.

OBJECTIF

Développer une plateforme professionnelle permettant aux visiteurs de consulter les véhicules disponibles, rechercher une voiture selon leurs critères, effectuer une demande de réservation en ligne et suivre les informations de leur réservation.

La plateforme doit également disposer d'un espace ADMIN complet permettant à l'administrateur de gérer les véhicules, les réservations, les clients, les disponibilités et les tarifs.

==================================================

1. TECHNOLOGIES

==================================================

Utiliser une architecture moderne et scalable :

- React + TypeScript

- Vite

- Tailwind CSS

- shadcn/ui

- Supabase pour :

  - PostgreSQL

  - Authentication

  - Database

  - Storage

  - Row Level Security

- React Router

- Formulaires avec validation

- Architecture propre et modulaire

- Design totalement responsive Desktop / Tablet / Mobile

Le code doit être propre, maintenable et facilement extensible.

==================================================

2. DESIGN / IDENTITÉ VISUELLE

==================================================

Créer un design premium inspiré des plateformes modernes de location automobile.

Style :

- Moderne

- Élégant

- Premium

- Minimaliste

- Professionnel

- Beaucoup d'espace blanc

- Grandes images des véhicules

- Cartes avec coins légèrement arrondis

- Animations discrètes

- Micro-interactions

- Excellent responsive design

Palette recommandée :

- Noir / anthracite

- Blanc

- Gris clair

- Une couleur d'accent élégante (orange ou bleu selon cohérence visuelle)

Utiliser des images automobiles de haute qualité.

Ne pas créer une interface générique de dashboard.

L'ensemble doit donner l'impression d'une véritable plateforme commerciale prête à être utilisée.

==================================================

3. PAGE D'ACCUEIL

==================================================

Créer une homepage premium avec :

HEADER

- Logo

- Accueil

- Nos véhicules

- Comment ça marche

- À propos

- Contact

- Bouton "Réserver maintenant"

- Bouton Connexion / Espace client

HERO SECTION

Grande image d'une voiture premium.

Titre principal :

"Louez votre voiture en toute simplicité"

Sous-titre :

"Des véhicules fiables, des tarifs transparents et une réservation rapide."

Ajouter un moteur de recherche de réservation directement dans le Hero.

Champs :

- Lieu de prise en charge

- Date de départ

- Heure de départ

- Date de retour

- Heure de retour

Bouton :

"Rechercher un véhicule"

Ajouter une section avec les avantages :

- Réservation rapide

- Véhicules récents

- Prix transparents

- Assistance client

- Paiement sécurisé

==================================================

4. PAGE NOS VÉHICULES

==================================================

Créer une page permettant de consulter tous les véhicules.

Filtres :

- Marque

- Modèle

- Catégorie

- Prix minimum

- Prix maximum

- Transmission :

  - Automatique

  - Manuelle

- Carburant :

  - Essence

  - Diesel

  - Hybride

  - Électrique

- Nombre de places

- Disponibilité

Afficher les véhicules sous forme de cartes.

Chaque carte doit afficher :

- Grande photo

- Marque

- Modèle

- Année

- Catégorie

- Transmission

- Carburant

- Nombre de places

- Prix / jour

- Badge "Disponible"

- Bouton "Voir détails"

- Bouton "Réserver"

==================================================

5. PAGE DÉTAIL D'UNE VOITURE

==================================================

Créer une page détaillée pour chaque véhicule.

Afficher :

- Galerie photos

- Marque

- Modèle

- Année

- Prix par jour

- Prix par semaine

- Disponibilité

- Transmission

- Carburant

- Nombre de places

- Nombre de portes

- Climatisation

- GPS

- Bluetooth

- Bagages

Ajouter une description complète.

Ajouter un calendrier permettant de visualiser les périodes où le véhicule est réservé.

Ajouter un bloc de réservation :

Date de départ

Heure de départ

Date de retour

Heure de retour

Lieu de prise en charge

Lieu de restitution

Calculer automatiquement :

Nombre de jours

Prix journalier

Sous-total

Options supplémentaires

Total

Bouton :

"Réserver cette voiture"

==================================================

6. SYSTÈME DE RÉSERVATION

==================================================

Créer un véritable workflow de réservation.

ÉTAPE 1 :

Sélection du véhicule

ÉTAPE 2 :

Informations de location :

- Date de départ

- Heure de départ

- Date de retour

- Heure de retour

- Lieu de prise en charge

- Lieu de restitution

ÉTAPE 3 :

Informations client :

- Nom

- Prénom

- Email

- Téléphone

- Adresse

- Numéro de permis de conduire

ÉTAPE 4 :

Options supplémentaires :

- GPS

- Siège bébé

- Conducteur supplémentaire

- Assurance supplémentaire

ÉTAPE 5 :

Résumé :

Véhicule

Dates

Durée

Prix journalier

Options

Total

Afficher une case :

"J'accepte les conditions générales de location."

Bouton :

"Confirmer la réservation"

==================================================

7. LOGIQUE DE DISPONIBILITÉ

==================================================

IMPORTANT :

Empêcher automatiquement la réservation d'un véhicule déjà réservé pendant la période sélectionnée.

Lorsqu'un utilisateur sélectionne :

01/09/2026 → 05/09/2026

le système doit vérifier les réservations existantes.

Si le véhicule est indisponible :

Afficher :

"Ce véhicule n'est pas disponible pour cette période."

Proposer éventuellement d'autres véhicules disponibles.

Les réservations doivent avoir les statuts :

- En attente

- Confirmée

- En cours

- Terminée

- Annulée

==================================================

8. CONFIRMATION DE RÉSERVATION

==================================================

Après réservation :

Afficher une page de confirmation moderne.

Exemple :

"Votre réservation a bien été enregistrée."

Afficher :

- Numéro de réservation

- Véhicule

- Dates

- Lieu

- Montant total

- Statut

Créer également une confirmation par email.

Prévoir la possibilité d'envoyer ultérieurement :

- Email de confirmation

- Email de modification

- Email d'annulation

- Rappel avant réservation

==================================================

9. ESPACE CLIENT

==================================================

Créer un espace client.

Le client peut :

- Voir ses réservations

- Voir le détail d'une réservation

- Voir son statut

- Modifier certaines informations

- Annuler une réservation selon les conditions

- Télécharger son récapitulatif

- Modifier son profil

Dashboard client :

"Bonjour [Prénom]"

Statistiques :

- Réservations totales

- Réservations à venir

- Réservations terminées

==================================================

10. ESPACE ADMINISTRATEUR

==================================================

Créer un dashboard ADMIN complètement séparé du site public.

URL :

/admin

Authentification obligatoire.

Créer un système de rôles :

- Admin

- Manager

L'administrateur doit pouvoir gérer toute la plateforme.

==================================================

11. DASHBOARD ADMIN

==================================================

Créer un dashboard moderne avec statistiques.

Afficher :

- Nombre total de véhicules

- Véhicules disponibles

- Véhicules actuellement loués

- Réservations en attente

- Réservations confirmées

- Réservations du mois

- Chiffre d'affaires estimé

Ajouter des graphiques :

- Réservations par mois

- Revenus par mois

- Véhicules les plus loués

- Catégories les plus demandées

Ajouter une liste :

"Réservations récentes"

==================================================

12. GESTION DES VÉHICULES

==================================================

Créer une interface CRUD complète.

Admin peut :

- Ajouter une voiture

- Modifier une voiture

- Supprimer une voiture

- Désactiver une voiture

- Modifier son prix

- Ajouter plusieurs photos

Champs :

- Marque

- Modèle

- Année

- Catégorie

- Prix journalier

- Prix hebdomadaire

- Prix mensuel

- Transmission

- Carburant

- Places

- Portes

- Kilométrage

- Description

- Équipements

- Images

- Statut

Statuts :

- Disponible

- Louée

- Maintenance

- Désactivée

==================================================

13. GESTION DES RÉSERVATIONS ADMIN

==================================================

Créer une page :

/admin/reservations

Afficher un tableau professionnel.

Colonnes :

- ID

- Client

- Véhicule

- Date départ

- Date retour

- Durée

- Montant

- Statut

- Date de réservation

- Actions

Actions :

- Voir

- Modifier

- Confirmer

- Refuser

- Annuler

- Marquer comme terminée

Ajouter :

- Recherche

- Filtrage

- Tri

- Pagination

Filtres :

- Aujourd'hui

- Cette semaine

- Ce mois

- En attente

- Confirmées

- Annulées

- Terminées

==================================================

14. CALENDRIER ADMIN

==================================================

Créer une vue calendrier des réservations.

Utiliser une interface similaire à un calendrier professionnel.

Afficher les véhicules et leurs périodes de réservation.

Exemple :

VOITURE 1

01 → 05 septembre : Réservée

06 → 10 septembre : Disponible

11 → 15 septembre : Réservée

Permettre à l'admin de cliquer sur une réservation pour voir ses détails.

==================================================

15. GESTION DES CLIENTS

==================================================

Créer :

/admin/clients

Afficher :

- Nom

- Email

- Téléphone

- Nombre de réservations

- Dernière réservation

- Statut

Admin peut consulter la fiche complète d'un client.

Afficher l'historique de ses réservations.

==================================================

16. TARIFICATION

==================================================

Prévoir un système flexible.

Chaque véhicule peut avoir :

- Prix par jour

- Prix par semaine

- Prix par mois

Possibilité de définir des tarifs saisonniers.

Exemple :

Haute saison :

01/07 → 31/08

Prix :

80€/jour

Basse saison :

50€/jour

Le système doit calculer automatiquement le prix selon les dates sélectionnées.

==================================================

17. OPTIONS DE LOCATION

==================================================

Créer une gestion des options.

Exemples :

GPS : 5€/jour

Siège bébé : 7€/jour

Conducteur supplémentaire : 10€/jour

Assurance : 15€/jour

L'admin peut :

- Ajouter une option

- Modifier son prix

- Désactiver une option

- Supprimer une option

==================================================

18. PAGES STATIQUES

==================================================

Créer :

/about

/contact

/terms

/privacy

/faq

PAGE CONTACT :

- Formulaire

- Téléphone

- Email

- Adresse

- Horaires

- Carte Google Maps

==================================================

19. BASE DE DONNÉES

==================================================

Créer une base PostgreSQL Supabase structurée.

Tables principales :

users

profiles

vehicles

vehicle_images

vehicle_features

locations

reservations

reservation_options

rental_options

payments

reviews

notifications

settings

Créer les relations nécessaires.

Exemple :

vehicles

  ↓

reservations

  ↓

profiles

Créer des contraintes pour éviter les réservations conflictuelles.

==================================================

20. SÉCURITÉ

==================================================

IMPORTANT :

Utiliser Supabase Row Level Security.

Un client ne doit pouvoir accéder qu'à ses propres réservations.

Un utilisateur normal ne doit jamais pouvoir accéder au dashboard admin.

Seuls les utilisateurs ayant le rôle admin ou manager peuvent accéder aux fonctionnalités administratives.

Valider toutes les données côté frontend ET backend.

Ne jamais exposer de clés secrètes côté frontend.

==================================================

21. SEO

==================================================

Optimiser les pages pour le référencement.

Ajouter :

- Meta title

- Meta description

- Open Graph

- URLs propres

- Balises H1/H2

- Alt text images

- Sitemap

- robots.txt

Optimiser les performances :

- Lazy loading images

- Compression images

- Code splitting

- Optimisation mobile

==================================================

22. RESPONSIVE

==================================================

Le site doit être parfaitement responsive.

Desktop :

Navigation complète + dashboard large.

Tablet :

Navigation adaptée.

Mobile :

Menu hamburger

Cartes véhicules adaptées

Formulaire réservation en plusieurs étapes

Dashboard admin mobile-friendly

==================================================

23. UX

==================================================

Ajouter :

- Loading states

- Skeleton loaders

- Empty states

- Toast notifications

- Confirmations avant suppression

- Messages d'erreur explicites

- Validation des formulaires

- Gestion des erreurs réseau

- Pages 404 et 500

Les boutons doivent avoir des états :

Normal

Hover

Loading

Disabled

==================================================

24. ADMIN SETTINGS

==================================================

Créer une page :

/admin/settings

Permettre à l'administrateur de modifier :

- Nom de l'entreprise

- Logo

- Téléphone

- Email

- Adresse

- Devise

- TVA

- Conditions de location

- Horaires

- Réseaux sociaux

==================================================

25. ARCHITECTURE DU PROJET

==================================================

Organiser le projet de manière professionnelle.

Exemple :

src/

 ├── components/

 ├── pages/

 ├── layouts/

 ├── hooks/

 ├── services/

 ├── lib/

 ├── types/

 ├── utils/

 ├── integrations/

 └── contexts/

Séparer clairement :

- Frontend public

- Authentification

- Espace client

- Espace admin

- Services API

- Database

==================================================

26. DONNÉES DE DÉMONSTRATION

==================================================

Créer des données fictives réalistes pour permettre de tester immédiatement l'application.

Ajouter au minimum :

10 véhicules

Exemples :

BMW Série 3

Mercedes Classe C

Audi A4

Volkswagen Golf

Peugeot 208

Renault Clio

Toyota Corolla

Hyundai Tucson

Mercedes GLC

BMW X5

Créer plusieurs réservations fictives avec différents statuts.

==================================================

27. IMPORTANT — QUALITÉ DU PRODUIT

==================================================

Ne crée pas simplement une landing page.

Je veux une véritable application web de location automobile avec :

- Front-office

- Moteur de recherche

- Disponibilité en temps réel

- Système de réservation

- Authentification

- Espace client

- Dashboard administrateur

- CRUD véhicules

- CRUD réservations

- Gestion clients

- Calendrier

- Tarification

- Options

- Statistiques

- Notifications

- Sécurité Supabase

- Base de données relationnelle

Toutes les fonctionnalités principales doivent être fonctionnelles et connectées à Supabase.

Créer une interface cohérente et professionnelle de niveau SaaS / startup.

Avant de terminer, vérifier que :

1. Un utilisateur peut rechercher une voiture.

2. Il peut voir uniquement les voitures disponibles.

3. Il peut effectuer une réservation.

4. Une réservation bloque automatiquement le véhicule sur la période concernée.

5. L'administrateur voit la réservation immédiatement dans son dashboard.

6. L'administrateur peut confirmer ou annuler la réservation.

7. Le client peut consulter sa réservation.

8. Les permissions empêchent un client d'accéder à l'espace admin.

9. Les données sont persistées dans Supabase.

10. L'application fonctionne correctement sur mobile et desktop.

Commencer par construire l'architecture complète, la base de données et l'interface utilisateur, puis implémenter progressivement toutes les fonctionnalités.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://swiftdrive-rent.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/64da4126-b0d8-4973-9ddc-6749700dbd54).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
