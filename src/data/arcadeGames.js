// Curated from KanwarAfaq/games. Games stay on a separate, static origin:
// AnyTool never downloads 3D engine bundles until a visitor clicks Play.
export const ARCADE_ORIGIN='https://games-psi-ashy.vercel.app'
export const arcadeGames=[
 {slug:'starfall',name:'Starfall',type:'Space shooter',description:'Dodge enemies, collect power-ups and defeat space bosses.',mobile:true},
 {slug:'brick-rally',name:'Brick Rally',type:'Brick breaker',description:'Bounce the ball through five levels of classic brick-breaker action.',mobile:true},
 {slug:'serpentine',name:'Serpentine',type:'Snake game',description:'Collect fruit, dodge rocks and beat your best snake score.',mobile:true},
 {slug:'skyhop',name:'Skyhop',type:'One-tap flying',description:'Tap to fly, avoid obstacles and gather stars.',mobile:true},
 {slug:'lightmerge',name:'Lightmerge',type:'2048 puzzle',description:'Slide tiles to merge matching numbers and reach 2048.',mobile:true},
 {slug:'driftrock',name:'Driftrock',type:'Asteroids shooter',description:'Navigate and shoot through drifting asteroid fields.',mobile:true},
 {slug:'lumenfall',name:'Lumenfall',type:'3D fantasy adventure',description:'Explore a fantasy world, fight enemies and discover energy crystals.',mobile:false},
 {slug:'neon-velocity',name:'Neon Velocity',type:'3D racing',description:'Race neon streets, drift corners and use nitro to win.',mobile:false},
 {slug:'starfall-protocol',name:'Starfall Protocol',type:'3D space shooter',description:'A top-down sci-fi shooter with tactical movement.',mobile:false},
 {slug:'aether-run',name:'Aether Run',type:'Neon hover racer',description:'Steer through a futuristic skyline and manage speed boosts.',mobile:true},
 {slug:'moonlit-grove',name:'Moonlit Grove',type:'Fantasy survival',description:'Cast spells and survive waves of magical enemies.',mobile:true},
 {slug:'park-dash',name:'Park Dash',type:'Kids running game',description:'Race through a park, jump hurdles and collect stars.',mobile:true},
 {slug:'serpent-studio',name:'Serpent Studio',type:'Customizable snake',description:'Play four snake modes with different speeds and skins.',mobile:true},
]
export const gamePage = slug => arcadeGames.find(g=>g.slug===slug)
export const gameURL = slug => `${ARCADE_ORIGIN}/games/${encodeURIComponent(slug)}.html`
