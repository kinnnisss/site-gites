# Polices locales

Polices issues de Google Fonts, récupérées le 10 octobre 2026 :

- **Newsreader** : normal et italique, graisse 400, sous-ensemble latin.
- **Inter** : police variable, graisses 400 à 600, sous-ensemble latin.

Les WOFF2 sont chargés avec `next/font/local` dans `app/layout.tsx`. Le navigateur du visiteur n’effectue aucun appel à Google Fonts. Les caractères français et la ponctuation courante sont inclus dans le sous-ensemble latin.

Les licences SIL Open Font License originales sont conservées dans `Newsreader-OFL.txt` et `Inter-OFL.txt`.

Sources :
- https://fonts.google.com/specimen/Newsreader
- https://fonts.google.com/specimen/Inter
- https://github.com/google/fonts/tree/main/ofl/newsreader
- https://github.com/google/fonts/tree/main/ofl/inter
