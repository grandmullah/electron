// Theme tokens shared between Betzone React Native and Electron renderer.
// Source of truth: betzone-react-native/src/theme/colors.ts and typography.ts

export const betzoneColors = {
  // BRAND
  brand: {
    darkBlue: "#1A3566",
    midBlue: "#3572E5",
    lightBlue: "#8EB0F0",
    orange: "#E59E25",
    gradient: {
      start: "#EDBA64",
      end: "#E89509",
    },
  },

  // BACKGROUNDS
  background: {
    black: "#030509",
    bg1: "#0E1420",
    bg2: "#182234",
    bg3: "#1F2B42",
    bg4: "#314468",
    bg5: "#445574",
  },

  // BORDERS
  borders: {
    border1: "#242933",
    border2: "#4C5669",
  },

  // TEXT
  text: {
    text1: "#4F5663",
    text2: "#687586",
    text3: "#9EA5B2",
    text4: "#C6CAD2",
    text5: "#FFFFFF",
  },

  // INTERFACE
  interface: {
    error: "#EC6F6F",
    attention: "#FED50B",
    success: "#34E434",
  },
} as const;

export const betzoneGradients = {
  appBackground: `linear-gradient(135deg, ${betzoneColors.background.bg2} 0%, ${betzoneColors.background.black} 100%)`,
  glass: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
  brand: `linear-gradient(90deg, ${betzoneColors.brand.gradient.start} 0%, ${betzoneColors.brand.gradient.end} 100%)`,
  brandMixed: `linear-gradient(90deg, ${betzoneColors.brand.midBlue} 0%, ${betzoneColors.brand.gradient.end} 100%)`,
} as const;

