# @koehler8/cms-theme-swamp — Swamp Nocturne

- **Slug**: `swamp`
- **Version**: 1.0.1
- **Author**: koehler8

## Install

```bash
npm install @koehler8/cms-theme-swamp
```

```js
// vite.config.js
import cms from '@koehler8/cms/vite';

export default {
  plugins: cms({ siteDir: './site', themes: ['@koehler8/cms-theme-swamp'] }),
};
```

Set `site.theme` to `"swamp"` in your site config. External fonts ship via Google Fonts — self-host if your deployment forbids remote imports.

## Visual Direction
- Dark, moody palette with toxic greens, deep forest shadows, and violet undertones.
- CTA/hero gradients push lime → mint → violet; cards and helper rails use heavy glows and glassy overlays.
- Ideal for sci-fi/hacker drops or anything that wants a bio-luminescent feel.

## Token Highlights
- Field/tab/helper tokens tuned for very dark canvases; chip/outline colors stick to the neon-green family.
- Status/headline/chart tokens embrace the venom green accent for countdowns and KPI ribbons.
- Generous radii and strong shadows pair with the theme’s dense backdrop gradients.

## Compatibility Notes
- Background layers are intense; avoid stacking additional full-bleed imagery without testing contrast.
- Theme CSS scopes to `[data-site-theme="swamp"]` and touches hero/status/CTA shells—keep further overrides colocated here to prevent spillover into other themes.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

[MIT](./LICENSE)
