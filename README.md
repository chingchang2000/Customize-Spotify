# Customify for Spotify

A Windows desktop app for visually customizing the Spotify desktop client with clean presets, artist-inspired themes, animated backgrounds, and a full custom theme editor.

## Highlights

- Clean Windows desktop UI built with Electron.
- Artist presets for **Kanye West / Graduation**, **Travis Scott**, **Drake**, **Kendrick Lamar**, **Tyler, The Creator**, **Playboi Carti**, and **The Weeknd**.
- Neutral presets such as Glass Black, Frost, and Midnight.
- Live Spotify-style preview before applying.
- Custom background image or GIF by URL, or choose a local image/GIF.
- Controls for accent, text, background, panels, blur, opacity, radius, dimming, and artwork intensity.
- Save custom presets locally.
- Export/import theme JSON.
- Uses **Spicetify** to apply the generated CSS/theme to the Spotify desktop client.
- Windows installer builds automatically with GitHub Actions.

> Customify is an unofficial community project. It is not affiliated with Spotify or any artist.

## Images

The built-in artist presets intentionally do **not** ship AI-generated artist artwork. Their visual media is loaded from internet sources (primarily Wikimedia Commons), and the Graduation preset also uses a GIF hosted by GIPHY. The app stores source/attribution links in the preset metadata.

Remote media is downloaded to the local Spicetify theme folder when you apply a theme, which makes the final theme more reliable than hot-linking images from Spotify CSS.

## Windows one-click install

For normal Windows users, the easiest method is:

1. Download this repository as a ZIP and extract it.
2. Double-click **`INSTALL-CUSTOMIFY.bat`**.
3. The installer automatically checks/installs Node.js, the normal Spotify desktop app, Spicetify, and Customify's dependencies.
4. If Spotify is being installed for the first time, sign in when it opens, leave it open for about one minute, then return to the installer.
5. Customify starts automatically when setup is complete.

The normal Spotify desktop build is used because Spicetify recommends it over the Microsoft Store version when troubleshooting Windows installs.

To start Customify again later, double-click **`START-CUSTOMIFY.bat`**.

### Manual/developer start

```powershell
npm install
npm start
```

## Build a Windows .exe

```powershell
npm install
npm run dist
```

The installer will be written to `dist/`.

GitHub Actions also builds a Windows installer artifact on pushes to `main` and on version tags.

## Restore Spotify

Use the **Restore Spotify** button in Customify, or run:

```powershell
spicetify restore
```

## Notes

Spotify changes its internal UI regularly. Customify uses a mix of Spicetify variables and resilient selectors, but an upstream Spotify update can still require CSS adjustments.

## License

MIT. External images/GIFs keep their original licenses/terms and are not relicensed by this repository.
