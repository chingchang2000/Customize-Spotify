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

## Windows quick start

### 1. Spotify

Install the normal Spotify desktop client from Spotify's website. Spicetify may be less reliable with some Microsoft Store installations.

### 2. Spicetify

Install Spicetify using the official instructions:

https://spicetify.app/docs/advanced-usage/installation/

Verify in PowerShell:

```powershell
spicetify -v
```

### 3. Run Customify from source

Install Node.js 20+ and then:

```powershell
git clone https://github.com/chingchang2000/Customize-Spotify.git
cd Customize-Spotify
npm install
npm start
```

### 4. Apply a preset

1. Pick a preset.
2. Adjust the sliders/colors if you want.
3. Click **Apply to Spotify**.
4. Customify creates a local `CustomifyStudio` Spicetify theme and runs `spicetify apply`.

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
