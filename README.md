<p align="center" style="text-align: center">
  <a href="https://github.com/RXJpaw/Valorant-Companion/">
    <img src="https://user-images.githubusercontent.com/45784529/214573856-cca73e2e-6e56-4624-bafe-fa63d6102f71.png" alt="Logo" width="128" height="128">
  </a>
</p>

<h3 align="center">Valorant Companion</h3>
<p align="center">Rank Information, Match Histories, Loadout Previews(, probably a ban) and much more!</p>

<div align="center">

<a href="https://github.com/RXJpaw/Valorant-Companion/blob/master/LICENSE.md">![Apache License 2.0](https://img.shields.io/github/license/RXJpaw/Valorant-Companion?1)</a>
<a href="https://github.com/RXJpaw/Valorant-Companion/issues">![Open Issues](https://img.shields.io/github/issues-raw/RXJpaw/Valorant-Companion?0)</a>

</div>

## About

Programmed in [TypeScript](https://github.com/microsoft/TypeScript), [Vue.js/3](https://github.com/vuejs/core) and [Electron](https://github.com/electron/electron),
this tool will help you fuel your toxicity by showing your enemies ranks and thereby how scuffed SBMM in VALORANT really is.
Spying on your enemies loadouts to feel bad about the amount of skins you own. Get yourself banned and
make your lobby feel awkward by exposing Rito-Buddy-Owners and possible VALORANT employees.
**That's what I've ever dreamed of.**



## Installation

### Use provided executables

1. Download the [latest version](https://github.com/RXJpaw/Valorant-Companion/releases/latest) and follow the version's instructions.
2. Extract the downloaded file with f.e. [7zip](https://www.7-zip.org/download.html).
3. Execute `Valorant Companion.exe`.

### Building the executables yourself

Requirements: `windows@>=19044`, `node.js@>=18.12.1`, `git`.

```bash
git clone https://github.com/RXJpaw/Valorant-Companion
```
```bash
cd Valorant-Companion
```
```bash
npm ci
```
```bash
npm run build
```
The project is built and located at `dist_electron\win-unpacked`.



## Preview Images

### Current Match
<img src="https://raw.githubusercontent.com/RXJpaw/Valorant-Companion/master/assets/preview_current_match.png" width="854" height="480">

### Match History
<img src="https://raw.githubusercontent.com/RXJpaw/Valorant-Companion/master/assets/preview_match_history.png" width="854" height="480">

### Loadout Manager (Incomplete)
<img src="https://raw.githubusercontent.com/RXJpaw/Valorant-Companion/master/assets/preview_loadout_manager.png" width="854" height="480">

## Acknowledgements

* [LukenSkyne](https://github.com/LukenSkyne), for comforting me during development and being a good friend. <3
* [Valorant-API](https://github.com/valorant-api), for actively updating assets required for this project.
* [techchrism](https://github.com/techchrism/valorant-api-docs), for providing unofficial Valorant API documentation.

## Disclaimer

This project is not affiliated, authorized or endorsed by Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.