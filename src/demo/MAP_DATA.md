# Jamaica parish map data

The map uses simplified geographic parish boundaries, projected to a local SVG display. It does not require an external map API, access token, or tile service.

- Dataset: geoBoundaries gbOpen, JAM ADM1, boundary ID `JAM-ADM1-11528761`.
- Administrative units: 14 parishes. Boundary year represented: 2011.
- Original source: OpenStreetMap / Wambacher, distributed through geoBoundaries.
- Release snapshot: `9469f09`.
- Metadata: https://www.geoboundaries.org/api/current/gbOpen/JAM/ADM1/
- Source geometry: https://github.com/wmgeolab/geoBoundaries/blob/9469f09/releaseData/gbOpen/JAM/ADM1/geoBoundaries-JAM-ADM1_simplified.geojson
- Geometry license reported by dataset: Creative Commons Attribution-ShareAlike 2.0, https://creativecommons.org/licenses/by-sa/2.0/

The derived geometry in `jamaicaParishes.js` remains under CC BY-SA 2.0. Changes: local equirectangular projection with latitude correction, one-decimal display coordinates, SVG path conversion, Saint → St. display-name abbreviations, and label placement. Kingston has an external label with a leader line to preserve visibility without enlarging its geographic shape. This is a simplified display map, not a legal, cadastral, or navigation reference.

Attribution and the geometry license link appear below the map. Application UI code is separate from the licensed geometry.

Interaction: pointer selection, keyboard Enter/Space, Left/Right to move among map regions, native select control, and parish buttons. Selected content uses the existing browser-local demo artists and vote totals. The Explore action opens the existing parish-filtered contestant route.
