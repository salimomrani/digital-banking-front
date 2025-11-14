# Angular Template Control Flow Cheat Sheet

Nous utilisons la nouvelle syntaxe de contrôle d'Angular (`@if`, `@else`, `@for`, `@switch`) pour garder les templates lisibles et performants.

## Bonnes pratiques
- Préférer `@if (...) { ... } @else { ... }` à `*ngIf` / `<ng-template>` pour les blocs alternatifs.
- Utiliser `@if (expr; as alias)` pour éviter de recalculer des signaux/computeds plusieurs fois dans le template (ex. `@if (selectedAccount(); as account) { ... }`).
- Remplacer `*ngFor` par `@for (item of items; track trackFn)` en pensant à un `track` stable (identifiant métier, timestamp unique, ou `$index` en dernier recours).
- Les blocs peuvent s'emboîter : `@if` dans `@for`, `@else` par bloc, ou `@switch` si plusieurs états exclusifs.
- Pour les listes vides, combiner `@for` avec `@empty` ou un `@else` sur l'`@if` parent afin d'afficher un message d'état lisible.
- Une fois le template migré, retirez `NgIf` / `NgFor` des `imports` du composant standalone : la nouvelle syntaxe est fournie par Angular sans directives supplémentaires.

## Exemple rapide
```html
@if (users().length) {
  <ul>
    @for (user of users(); track user.id) {
      <li>{{ user.name }}</li>
    }
  </ul>
} @else {
  <p>Aucun utilisateur.</p>
}
```

### Exemple issu du dashboard des comptes
```html
@if (account.transactions?.length) {
  <table>
    <tbody>
      @for (transaction of account.transactions; track transaction.id ?? transaction.timestamp ?? $index) {
        <tr>
          <td>
            <span class="pill" [ngClass]="transaction.type">
              {{ transaction.type | titlecase }}
            </span>
          </td>
          <td>{{ transaction.label || '—' }}</td>
          <td>{{ transaction.amount | currency: account.currency }}</td>
          <td>{{ transaction.timestamp ? (transaction.timestamp | date: 'short') : '—' }}</td>
        </tr>
      }
    </tbody>
  </table>
} @else {
  <div class="status">Aucune transaction enregistrée.</div>
}
```

Cet exemple illustre :
- l'utilisation de `@if` pour séparer les états "liste remplie" / "liste vide" ;
- un alias `account` obtenu plus haut via `@if (selectedAccount(); as account)` ;
- un `track` combinant `id`, `timestamp` puis `$index` pour couvrir les cas de transactions locales non persistées.

Consultez cette note avant d'écrire ou de revoir un template afin d'assurer la cohérence de l'app avec la nouvelle syntaxe.
