require('dotenv').config({ path: process.env.DOTENV_PATH });

const shouldNotarize = process.env.MAC_NOTARIZE === 'true';
const macCodeSignIdentity = process.env.MAC_CODE_SIGN_IDENTITY || null;

const config = {
  appId: 'com.max.app',
  productName: 'Max',
  electronVersion: '37.6.1',
  directories: {
    buildResources: 'resources',
    output: 'out'
  },
  extraResources: [
    {
      from: 'resources/data/sample-collection.json',
      to: 'data/sample-collection.json'
    }
  ],
  files: ['**/*'],
  afterSign: shouldNotarize ? 'notarize.js' : undefined,
  mac: {
    artifactName: 'Max_${version}_${arch}_${os}.${ext}',
    category: 'public.app-category.developer-tools',
    target: [
      {
        target: 'pkg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'resources/icons/mac/icon.icns',
    hardenedRuntime: Boolean(macCodeSignIdentity),
    identity: macCodeSignIdentity,
    entitlements: 'resources/entitlements.mac.plist',
    entitlementsInherit: 'resources/entitlements.mac.plist',
    notarize: shouldNotarize,
    protocols: [
      {
        name: 'Max',
        schemes: [
          'bruno'
        ]
      }
    ]
  },
  linux: {
    artifactName: 'Max_${version}_${arch}_${os}.${ext}',
    icon: 'resources/icons/png',
    target: [
      {
        target: 'AppImage',
        arch: ['x64', 'arm64']
      },
      {
        target: 'deb',
        arch: ['x64', 'arm64']
      },
      {
        target: 'rpm',
        arch: ['x64', 'arm64']
      }
    ],
    protocols: [
      {
        name: 'Max',
        schemes: ['bruno']
      }
    ],
    category: 'Development',
    desktop: {
      MimeType: 'x-scheme-handler/bruno;'
    }
  },
  deb: {
    // Docs: https://www.electron.build/configuration/linux#debian-package-options
    depends: [
      'libgtk-3-0',
      'libnotify4',
      'libnss3',
      'libxss1',
      'libxtst6',
      'xdg-utils',
      'libatspi2.0-0',
      'libuuid1',
      'libsecret-1-0',
      'libasound2' // #1036
    ]
  },
  win: {
    artifactName: 'Max_${version}_${arch}_win.${ext}',
    icon: 'resources/icons/win/icon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'arm64']
      }
    ],
    sign: null,
    publisherName: 'Max'
  },
  nsis: {
    include: 'resources/installer.nsh',
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
};

module.exports = config;
