# 🎨 Frontend – Fonctionnalités Angular (Gestion de comptes)

## Implémentation actuelle
- **Carte santé backend** : ping `/health`, affichage status + timestamp + bouton d'actualisation.
- **Liste des comptes** : chargement via `/api/accounts`, sélection automatique du premier compte, états `chargement`, `erreur` et `vide`.
- **Détails du compte** : solde, devise, IBAN conditionnel, badge devise, rafraîchissement lors de la sélection.
- **Transactions** : tableau trié par ordre d'arrivée, feedback lorsqu'il n'y a pas d'opérations.
- **Formulaire de transaction** : Reactive Forms, validation min 0.01 €, reset après succès, messages inline (`success` / `error`).
- **Signaux Angular** : état local pour `accounts`, `selectedAccount`, `loading` et `transactionFeedback`, facilitant la réactivité sans `Subject`.

## 1. Dashboard
- Vue globale du solde
- Courbes (line chart) des dépenses / revenus
- Donut chart par catégorie
- Timeline des transactions

## 2. Gestion des comptes
- Liste des comptes (carte ou tableau)
- Détails du compte (solde, opérations)
- Création / édition / suppression
- Sélecteur de comptes pour les transferts

## 3. Gestion des transactions
- Formulaire avec Reactive Forms
- Dépôt / retrait / transfert
- Validation en temps réel
- Toasts de confirmation (success / error)
- Historique filtrable (date, type, catégorie)

## 4. Auth & Sécurité
- Login / Register
- Gestion tokens + refresh
- Guard + Interceptor
- Rôle admin (tableau d’audit)

## 5. UX / UI
- Dark mode
- Animations Tailwind
- Skeleton loaders
- Pagination dynamique
- Infinite scroll sur les transactions

## 6. Profil utilisateur
- Mise à jour informations
- Changement mot de passe
- Visualisation des paramètres de sécurité

## 7. Exports
- Téléchargement PDF / CSV
- Aperçu des relevés

## 8. Fonctionnalités avancées
- Auto-catégorisation visuelle des transactions
- Widgets customisables
- Notifications (toast, modal, bannière)
