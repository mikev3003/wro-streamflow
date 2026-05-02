/**
 * Known coordinates for DWS gauging stations.
 * Sourced from DWS catalogues, RQIS, and published hydrological studies.
 * Format: { [stationCode]: [lat, lng] }
 */
const STATION_COORDS = {
  // ── WMA4: Vaal-Orange ────────────────────────────────────────────────────
  C1H006: [-26.742, 28.956],  // Blesbok at Rietvley
  C1H007: [-26.863, 28.180],  // Vaal at Bloukop
  C1H008: [-26.573, 28.681],  // Watervals at Elandslaagte
  C1H012: [-26.918, 28.043],  // Vaal at Gladdedrift
  C1H015: [-26.523, 27.942],  // Klip at Delangesdrift
  C1H019: [-26.803, 29.047],  // Outflow from Grootdraai Dam
  C1H044: [-26.847, 29.038],  // Leeu Spruit at Welbedacht
  C1R001: [-26.877, 28.107],  // Vaal at Vaal Dam
  C1R002: [-26.803, 29.047],  // Vaal at Grootdraai Dam
  C2H061: [-26.695, 27.700],  // Vaal at Klipplaatdrift
  C2H071: [-26.411, 27.880],  // Klip River @ Kookfontein
  C2H122: [-26.879, 28.107],  // Outflow from Vaal Dam
  C2H137: [-26.275, 27.955],  // Klip River @ Zwartkopjes
  C2H140: [-26.694, 27.700],  // Vaal at Woodlands
  C2H272: [-26.893, 27.662],  // Vaal at Lethabo
  C2R001: [-26.645, 26.700],  // Mooi at Boskop Dam
  C2R003: [-26.603, 27.157],  // Mooi at Klerkskraal Dam
  C3R001: [-27.943, 24.836],  // Harts at Wentzel Dam
  C3R002: [-28.069, 24.556],  // Harts at Spitskop Dam
  C3R006: [-27.540, 24.778],  // Harts at Taung Dam
  C4H004: [-27.985, 26.640],  // Vet at Nooitgedacht
  C4H015: [-27.910, 26.218],  // Vet at Vaalkoppies
  C4H016: [-28.056, 25.784],  // Sand at Bloudrift
  C4R001: [-28.019, 26.544],  // Sand at Allemanskraal Dam
  C4R002: [-27.880, 27.070],  // Groot Vet at Erfenis Dam
  C5H003: [-29.182, 26.209],  // Modder at Likatlong
  C5H012: [-29.449, 25.247],  // Riet at Kromdraai
  C5H014: [-29.085, 24.897],  // Riet River at Klipdrift
  C5H035: [-29.173, 26.147],  // Modder at Tweeriviere
  C5H039: [-29.082, 26.010],  // Outflow from Krugersdrift Dam
  C5H048: [-29.375, 24.518],  // Riet at Zoutpansdrift
  C5H049: [-29.950, 24.482],  // Riet River @ Philippia
  C5H053: [-29.019, 26.352],  // Modder at Glen
  C5H054: [-29.053, 26.624],  // Renoster at Bishops Glen
  C5H056: [-29.168, 26.105],  // Modder at Diepwater
  C5R001: [-29.082, 26.013],  // Tierpoort at Tierpoort Dam
  C5R002: [-29.166, 24.913],  // Riet at Kalkfontein Dam
  C5R003: [-29.083, 26.260],  // Modder at Rustfontein Dam
  C5R004: [-29.083, 26.010],  // Modder at Krugersdrift Dam
  C5R005: [-29.116, 26.726],  // Kgabanyane at Groothoek Dam
  C6H001: [-27.844, 26.849],  // Vals at Roodewal
  C6H002: [-27.738, 26.720],  // Vals at Bothaville
  C6H006: [-28.003, 27.165],  // Vals at Tweefontein
  C6H007: [-27.659, 27.193],  // Vals at Kroonstadbrug
  C6H009: [-28.351, 27.906],  // Vals at Lindley
  C7H019: [-27.756, 27.452],  // Renoster at Verheugd
  C7R001: [-27.247, 27.558],  // Renoster at Koppies Dam
  C8H001: [-27.279, 28.495],  // Wilge at Frankfort
  C8H003: [-27.843, 29.038],  // Cornelis at Warden
  C8H005: [-27.623, 29.050],  // Elands at Elands River Drift
  C8H020: [-27.921, 28.898],  // Liebenbergsvlei at Roodekraal
  C8H023: [-27.809, 28.556],  // Meul River at The Willows
  C8H026: [-27.839, 28.876],  // Liebenbergsvlei at Frederiksdal
  C8H027: [-27.313, 28.600],  // Wilge at Ballingtomp
  C8H028: [-27.209, 28.770],  // Wilge at Bavaria
  C8H036: [-28.517, 28.767],  // Ash at outlet from Katse Dam
  C8H037: [-27.939, 28.885],  // Liebenbergsvlei at Reward
  C8R003: [-28.347, 29.042],  // Nuwejaarspr at Sterkfontein Dam
  C8R004: [-27.925, 28.964],  // Liebenbergsvlei at Saulspoort Dam
  C9H003: [-28.752, 24.523],  // Vaal at Riverton
  C9H010: [-28.437, 23.204],  // Vaal River @ Gamagara
  C9H021: [-27.647, 25.586],  // Outflow from Bloemhof Dam
  C9H024: [-28.568, 23.875],  // Vaal at Schmidsdrift
  C9R001: [-27.657, 24.840],  // Vaal at Vaalharts Weir
  C9R002: [-27.644, 25.590],  // Vaal at Bloemhof Dam
  C9R003: [-29.044, 23.767],  // Vaal at Douglas Weir
  D1H003: [-30.696, 26.715],  // Orange at Aliwal North
  D1H006: [-30.610, 26.773],  // Kornetspruit at Maghaleen
  D1H009: [-30.432, 26.510],  // Orange at Oranjedraai
  D1H011: [-30.599, 26.784],  // Kraai at Roodewal
  D1H032: [-29.483, 28.100],  // Senqunyane at Marakabei (Lesotho)
  D1H041: [-29.750, 28.680],  // Senqu at Polihali
  D1R001: [-30.710, 26.732],  // Sterkspruit at Sterkspruit Dam
  D1R002: [-29.366, 28.533],  // Malibamatso at Katse Dam
  D1R003: [-29.550, 28.083],  // Senqunyane at Mohale Dam
  D2H012: [-29.972, 27.408],  // Little Caledon at The Poplars
  D2H022: [-29.633, 26.550],  // Caledon at Wilgerdraai
  D2H033: [-29.600, 26.870],  // Outflow from Welbedacht Dam
  D2H035: [-28.874, 27.878],  // Caledon at Ficksburg
  D2H036: [-29.544, 26.740],  // Caledon at Kommissie
  D2R001: [-29.597, 26.870],  // Witspruit at Egmont Dam
  D2R002: [-29.756, 27.035],  // Leeu at Armenia Dam
  D2R004: [-29.600, 26.870],  // Caledon at Welbedacht Dam
  D2R006: [-29.258, 26.340],  // Rietspr. at Knellpoort Dam
  D3H012: [-29.867, 24.733],  // Outflow from Vanderkloof
  D3H013: [-30.541, 25.517],  // Outflow from Gariep Dam
  D3H016: [-30.068, 24.773],  // Orange at Vluytjeskra
  D3R002: [-30.541, 25.517],  // Orange at Gariep Dam
  D3R003: [-29.867, 24.733],  // Orange at Vanderkloof Dam
  D4H006: [-28.422, 22.833],  // Orange at Upington
  D4H037: [-28.300, 21.900],  // Orange at Boegoeberg Dam
  D5H002: [-28.603, 20.028],  // Orange at Onseepkans
  D5H003: [-28.600, 19.000],  // Orange at Vioolsdrift
  D5R001: [-29.000, 20.833],  // Hartebeest at Boegoeberg Dam

  // ── WMA1: Limpopo-Olifants ───────────────────────────────────────────────
  A2H005: [-23.670, 29.985],  // Limpopo at Beit Bridge
  A2H006: [-22.683, 29.367],  // Limpopo at Pont Drift
  A6H006: [-23.100, 28.750],  // Mokolo at Mokolo Dam
  A7H003: [-24.333, 29.467],  // Sterk at Roedtan
  A8H001: [-23.989, 28.433],  // Palala at Vaalwater
  A9H001: [-24.900, 28.967],  // Elands at Roodewal
  B1H007: [-24.020, 30.015],  // Olifants at Balule
  B1H010: [-24.085, 29.317],  // Olifants at Doorndraai Dam
  B1H013: [-24.095, 30.042],  // Olifants at Mamba
  B1H018: [-24.158, 30.267],  // Olifants at Mozambique border
  B2H002: [-25.131, 29.433],  // Spekboom at Klaserie
  B3H001: [-25.103, 30.367],  // Selati at Tzaneen
  B3H004: [-24.167, 30.300],  // Letaba at Tzaneen Dam
  B3R001: [-23.833, 30.150],  // Letaba at Ebenezer Dam
  B3R002: [-24.186, 30.353],  // Letaba at Tzaneen Dam
  B4H001: [-25.017, 30.117],  // Mohlapitse at Loskop Dam
  B4R001: [-25.400, 29.333],  // Olifants at Loskop Dam
  B5H002: [-25.458, 29.033],  // Klein-Olifants at Groblersdal
  B6H001: [-25.517, 28.750],  // Wilge at Tweefontein
  B6R001: [-25.658, 28.683],  // Wilge at Bronkhorstspruit Dam
  B7H006: [-25.467, 28.383],  // Elands at Balmoral
  B7R001: [-25.383, 28.283],  // Elands at Rhenosterkop Dam
  B7R002: [-25.533, 28.500],  // Elands at Rust de Winter Dam

  // ── WMA2: Inkomati-Usuthu ────────────────────────────────────────────────
  X2H001: [-25.483, 31.133],  // Crocodile at Komatipoort
  X2H010: [-25.467, 30.833],  // Crocodile at Riverside
  X2H018: [-25.683, 30.783],  // Crocodile at Noitgedacht
  X2H029: [-25.483, 31.133],  // Crocodile at Mpumalanga border
  X2H046: [-25.617, 30.883],  // Kaap at Barberton
  X3H001: [-25.633, 31.283],  // Komati at Komatipoort
  X3H003: [-26.000, 31.050],  // Lomati at Lomati Drift
  X3H006: [-25.900, 30.783],  // Komati at Tonga
  X3H021: [-26.117, 30.917],  // Komati at Nooitgedacht
  X3R001: [-26.183, 30.867],  // Komati at Nooitgedacht Dam

  // ── WMA3: Pongola-Mtamvuna ───────────────────────────────────────────────
  V1H001: [-28.617, 29.633],  // Tugela at Bergville
  V1H002: [-28.517, 29.917],  // Tugela at Colenso
  V1H004: [-28.733, 29.233],  // Tugela at Tugela Ferry
  V1H009: [-28.833, 30.350],  // Mooi at Rosetta
  V1H038: [-28.972, 30.436],  // Lions River at Balgowan
  V2H001: [-28.200, 30.750],  // Buffalo at Weenen
  V3H002: [-29.033, 30.983],  // Mvoti at Riet River
  V3H007: [-29.600, 30.733],  // Umgeni at Durban
  V3R002: [-29.533, 30.300],  // Umgeni at Midmar Dam
  V5H002: [-30.367, 30.733],  // Umzimkulu at Harding
  V6H004: [-28.233, 31.033],  // Pongola at Pongola
  V6R001: [-27.383, 31.917],  // Pongola at Pongolapoort Dam
  W1H006: [-27.483, 31.867],  // Phongola at Pongola
  W1H007: [-27.467, 32.017],  // Mkuze at Mkuze

  // ── WMA5: Mzimvubu-Tsitsikamma ──────────────────────────────────────────
  T1H004: [-30.967, 29.617],  // Mzimvubu at Port St Johns
  T3H002: [-31.583, 28.783],  // Kei at Komgha
  S1H001: [-32.683, 26.883],  // Groot-Vis at Cradock
  S3H001: [-33.133, 27.900],  // Buffalo at King Williams Town
  S6H001: [-32.983, 28.017],  // Keiskamma at Alice

  // ── WMA6: Breede-Olifants (Western Cape) ────────────────────────────────
  G1H007: [-33.883, 19.050],  // Berg at Hermon
  G2H012: [-33.733, 18.900],  // Berg at Franschhoek
  G4H005: [-33.567, 19.367],  // Breede at Worcester
  H1H006: [-33.917, 19.267],  // Breede at Swellendam
  H1H018: [-34.017, 20.433],  // Breede at Malgas
  H2H002: [-33.967, 19.950],  // Hex at Stettynskloof
  H2R001: [-33.617, 19.483],  // Hex at Brandvlei Dam
  H3H001: [-33.967, 20.550],  // Bree at Swellendam
  H4H016: [-34.020, 21.250],  // Tradouw at Barrydale
  H6H003: [-33.717, 21.167],  // Groot at Riversdale
  J1H016: [-33.933, 22.450],  // Gouritz at Gouritz
  J3H005: [-33.783, 23.817],  // Gamtoos at Patensie
  K1H001: [-33.767, 25.317],  // Sundays at Uitenhage
  L1H007: [-33.250, 26.533],  // Great Fish at Fort Beaufort

  // ── Additional stations from the live feed ───────────────────────────────
  D3R003: [-29.867, 24.733],  // Orange at Vanderkloof Dam
  D4H006: [-28.422, 22.833],  // Orange at Upington
};

/**
 * WMA bounding boxes for map fitting [south, west, north, east]
 */
const WMA_BOUNDS = {
  WMA1: [-25.5, 26.5, -22.0, 32.0],
  WMA2: [-26.5, 30.0, -24.5, 32.5],
  WMA3: [-31.0, 28.5, -26.5, 32.5],
  WMA4: [-31.0, 19.0, -25.5, 30.0],
  WMA5: [-34.0, 24.0, -30.0, 30.5],
  WMA6: [-35.0, 17.5, -32.5, 23.0],
  ALL:  [-35.0, 16.5, -22.0, 33.0],
};

/**
 * WMA approximate center points [lat, lng]
 */
const WMA_CENTERS = {
  WMA1: [-23.5, 29.5],
  WMA2: [-25.5, 31.0],
  WMA3: [-28.5, 30.5],
  WMA4: [-28.5, 24.5],
  WMA5: [-32.0, 27.5],
  WMA6: [-33.5, 20.5],
};

module.exports = { STATION_COORDS, WMA_BOUNDS, WMA_CENTERS };
