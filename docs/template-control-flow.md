# Angular Template Control Flow Cheat Sheet

Nous utilisons la nouvelle syntaxe de contrôle d'Angular (`@if`, `@else`, `@for`, `@switch`) pour garder les templates lisibles et performants.

## Bonnes pratiques
- Préférer `@if (...) { ... } @else { ... }` à `*ngIf` / `<ng-template>` lorsque l'on doit afficher des blocs alternatifs.
- Utiliser `@for (item of items; track item.id)` pour remplacer `*ngFor`, en pensant à un `track` stable (id, code métier ou `$index` en dernier recours).
- Les blocs peuvent s'emboîter : on peut chaîner des `@if` à l'intérieur d'un `@for` ou inversement.
- Pour des listes vides, combiner `@for` avec `@empty` ou un `@else` sur l'`@if` parent afin de gérer les messages d'état.

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

Consultez cette note avant d'écrire ou de revoir un template afin d'assurer la cohérence de l'app avec la nouvelle syntaxe.
