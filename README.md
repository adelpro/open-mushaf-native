# Open-Mushaf Native - Quran Mushaf Reader for Mobile and Web

Open-Mushaf Native is an **open-source Quran Mushaf** application built with **React Native** and **Expo**.
This mobile-friendly app offers **offline Quran reading**, **gesture navigation**, and **dynamic Tafseer popups**,
designed for seamless Quranic study on **Android**, **iOS**, **Web**, and **macOS** platforms.

<p align="center">
  <img src="https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/design/banner/banner.png"
  alt="Open-Mushaf Logo"  width="1000" height="500" />
</p>

<!-- GitHub & Social Badges -->

![GitHub Stars](https://img.shields.io/github/stars/adelpro/open-mushaf-native?style=social)
![GitHub Forks](https://img.shields.io/github/forks/adelpro/open-mushaf-native?style=social)
![GitHub Watchers](https://img.shields.io/github/watchers/adelpro/open-mushaf-native?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/adelpro?style=social)](https://twitter.com/adelpro)

<!-- Build & CI Badges -->

[![Android Build](https://github.com/adelpro/open-mushaf-native/actions/workflows/android-build.yml/badge.svg)](https://github.com/adelpro/open-mushaf-native/actions/workflows/android-build.yml)
[![CodeQL](https://github.com/adelpro/open-mushaf-native/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/adelpro/open-mushaf-native/actions/workflows/github-code-scanning/codeql)

<!-- Quality & Code Analysis -->

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ee280dfe97634fa5b5afd85fc8652d85)](https://app.codacy.com/gh/adelpro/open-mushaf-native/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![codebeat badge](https://codebeat.co/badges/60e335a3-d534-4cdb-9441-15a5b259e0bb)](https://codebeat.co/projects/github-com-adelpro-open-mushaf-native-main)

<!-- Release & Issue Tracking -->

[![Release Notes](https://img.shields.io/github/release/adelpro/open-mushaf-native?style=flat-square)](https://github.com/adelpro/open-mushaf-native/releases)
[![Open Issues](https://img.shields.io/github/issues/adelpro/open-mushaf-native?style=flat-square)](https://github.com/adelpro/open-mushaf-native/issues)
![License](https://img.shields.io/github/license/adelpro/open-mushaf-native?style=flat-square)

<!-- Tech & Platform -->

![npm](https://img.shields.io/badge/npm-v20%2B-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![Expo](https://img.shields.io/badge/Expo-1B1F23?logo=expo&logoColor=fff&style=flat)
![React Native](https://img.shields.io/badge/React%20Native-20232A?logo=react&logoColor=61DAFB)
![PWA](https://img.shields.io/badge/PWA-1B1F23?logo=pwa&logoColor=fff&style=flat)
![Jotai](https://img.shields.io/badge/Jotai-20232A?style=flat)
![Supports Android, iOS, web, macOS and Windows](https://img.shields.io/badge/platforms-android%20%7C%20ios%20%7C%20web%20%7C%20macos%20%7C%20windows-lightgrey.svg)

<!-- Other/Integrations -->

[<img src="./assets/svgs/explore-in-deepwiki.svg" title="Explore in DeepWiki" width="150" height="20">](https://deepwiki.com/adelpro/open-mushaf-native)

[<img src="https://github.com/codespaces/badge.svg" title="Open in Github Codespace" width="150" height="20">](https://codespaces.new/adelpro/open-mushaf-native)

## About

**Open-Mushaf Native** is a modern and minimalist Quran Mushaf application built with
**React Native** and **Expo**, designed for seamless, immersive reading and interaction
on mobile platforms. It focuses on performance, offline functionality, and accessibility,
providing a rich user experience with gesture-based navigation, dynamic content loading,
and localized caching for Quranic images and Tafseer data.

### Key Features

- **Swipeable Navigation**: Navigate the Quran Mushaf by swiping left or right.
- **Offline Access**: Preload and cache Quran pages and Tafseer data for complete offline functionality.
- **Dynamic Tafseer Popups**: Smoothly resize Tafseer popups with gesture control.
- **Optimized Image Loading**: Efficient loading of large Quran pages using `expo-image` for better memory management.
- **Recoil State Management**: Smooth state management for all app interactions.
- **Cross-Platform Support**: Built with Expo for easy deployment on Android and web platforms.

## Demo

Experience the seamless navigation and features of Open-Mushaf Native in this demo video.
[Watch on YouTube](https://www.youtube.com/watch?v=SpqCVOhiVes)

## App Screenshots

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 2rem 0;">
  <div>
    <img src="https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/main-screen.png"
    alt="Main reading interface" style="border-radius: 15px; max-width: 100%; height: auto;">
    <p align="center" style="margin-top: 0.5rem;">📖 Default reading view</p>
  </div>
  
  <div>
    <img src="https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/landscape-mode.png"
    alt="Landscape reading mode" style="border-radius: 15px; max-width: 100%; height: auto;">
    <p align="center" style="margin-top: 0.5rem;">🔄 Landscape layout</p>
  </div>

  <div>
    <img src="https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/dark-mode.png"
    alt="Dark mode interface" style="border-radius: 15px; max-width: 100%; height: auto;">
    <p align="center" style="margin-top: 0.5rem;">🌙 Dark theme</p>
  </div>

  <div>
    <img src="https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/tafseer-popup.png"
    alt="Tafseer explanation" style="border-radius: 15px; max-width: 100%; height: auto;">
    <p align="center" style="margin-top: 0.5rem;">📚 Resizable Tafseer</p>
  </div>

  <div>
    <img src="https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/sura-index.png"
    alt="Surah index" style="border-radius: 15px; max-width: 100%; height: auto;">
    <p align="center" style="margin-top: 0.5rem;">📑 Surah navigation</p>
  </div>

  <div>
    <img src="https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/settings-menu.png"
    alt="Settings panel" style="border-radius: 15px; max-width: 100%; height: auto;">
    <p align="center" style="margin-top: 0.5rem;">⚙️ Customization options</p>
  </div>

  <div>
    <img src="https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/riwaya-selection.png"
    alt="Riwaya selection" style="border-radius: 15px; max-width: 100%; height: auto;">
    <p align="center" style="margin-top: 0.5rem;">🔄 Riwaya switcher</p>
  </div>

  <div>
    <img src="https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/search-screen.png"
    alt="Search functionality"
    style="border-radius: 15px; max-width: 100%; height: auto;">
    <p align="center" style="margin-top: 0.5rem;">🔍 Advanced search</p>
  </div>
</div>

- **Mushaf Page**: A minimalist Quran page layout for immersive reading.

  ![Mushaf Page](https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/main-screen.png)

- **Tafseer Popup**: Resizeable Tafseer popups for deeper understanding.

  ![Tafseer Popup](https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/tafseer-popup.png)

- **Sura Index**: Navigate through the Quran using the Sura Index.

  ![Sura Index](https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/sura-index.png)

- **Settings**: Customize your reading experience.

  ![Settings](https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/settings-screen.png)

- **Navigation**: Swipe left or right to navigate the Quran.

  ![Navigation](https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/navigation-screen.png)

- **Search**: Search for specific Quranic content.

  ![Search](https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/screenshots/search-screen.png)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/adelpro/open-mushaf-native.git
   ```

2. Navigate to the project directory:

   ```bash
   cd open-mushaf-native
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the app:

   ```bash
   npx expo start
   ```

## Download

Ready-to-use versions are available for:

<div style="display: flex; gap: 20px; align-items: center; margin-top: 15px;">
  <a href="https://play.google.com/store/apps/details?id=com.adelpro.openmushafnative" target="_blank">
    <img src="https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white"
     alt="Google Play Store" />
  </a>
  
  <a href="https://open-mushaf-native.web.app/" target="_blank">
    <img src="https://img.shields.io/badge/Web_App-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white"
    alt="Web App" />
  </a>
</div>

## Contributing

Contributions are welcome to Open-Mushaf Native! Please see the [contribution guidelines](https://github.com/adelpro/open-mushaf-native/blob/main/CONTRIBUTING.md)

## Like the Project?

If you find this project helpful, please give it a star to show your support!

## License

This project is licensed under the MIT License. See the
[LICENSE](https://github.com/adelpro/open-mushaf-native/blob/main/LICENSE) file
for more details.
