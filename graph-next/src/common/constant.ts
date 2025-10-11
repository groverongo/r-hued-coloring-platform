export const NODE_RADIUS = 45;
export const FONT_SIZE = 20;

export const GREEK_LETTER_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];

export const SNAP_TO_PADDING = 6;
export const HIT_TARGET_PADDING = 6; 

export const NODE_G_MODES = ["Label", "Color"];

export const NODE_G_MODES_STYLE: Record<string, {strokeColor: string}> = {
    "Label": {
        strokeColor: "blue"
    },
    "Color": {
        strokeColor: "red"
    }
}

export const NODE_G_COLORS = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Light Yellow', hex: '#FFFFE0' },
    { name: 'Light Blue', hex: '#ADD8E6' },
    { name: 'Light Cyan', hex: '#E0FFFF' },
    { name: 'Light Pink', hex: '#FFB6C1' },
    { name: 'Pale Green', hex: '#98FB98' },
    { name: 'Lavender', hex: '#E6E6FA' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Mint Cream', hex: '#F5FFFA' },
    { name: 'Peach', hex: '#FFE5B4' }
  ];