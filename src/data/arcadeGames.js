// Curated from KanwarAfaq/games. Games stay on a separate, static origin:
// AnyTool never downloads 3D engine bundles until a visitor clicks Play.
// The complete compiled 2D and 3D game runtime is vendored in public/.
// URLs are same-origin; Vite never bundles heavy game engines on normal pages.
export const ARCADE_ORIGIN=''
export const arcadeGames=[
 {slug:'starfall',name:'Starfall',type:'Space shooter',description:'Dodge enemies, collect power-ups and defeat space bosses.',mobile:true,preview:'thumb-starfall.svg',howToPlay:"Arrow keys or mouse/touch to steer; Space or tap to fire.",tip:"Collect power-ups and dodge enemies as waves become harder."},
 {slug:'brick-rally',name:'Brick Rally',type:'Brick breaker',description:'Bounce the ball through five levels of classic brick-breaker action.',mobile:true,preview:'thumb-brick-rally.svg',howToPlay:"Move the paddle with the mouse, touch or arrow keys; Space launches the ball.",tip:"Break the colored bricks and aim carefully for useful power-ups."},
 {slug:'serpentine',name:'Serpentine',type:'Snake game',description:'Collect fruit, dodge rocks and beat your best snake score.',mobile:true,preview:'thumb-serpentine.svg',howToPlay:"Use arrow keys, WASD or swipe to steer the snake.",tip:"Eat fruit to grow, but avoid walls, rocks and your own tail."},
 {slug:'skyhop',name:'Skyhop',type:'One-tap flying',description:'Tap to fly, avoid obstacles and gather stars.',mobile:true,preview:'thumb-skyhop.svg',howToPlay:"Tap, click or press Space to keep flying.",tip:"Time each flap to pass through gaps and collect stars."},
 {slug:'lightmerge',name:'Lightmerge',type:'2048 puzzle',description:'Slide tiles to merge matching numbers and reach 2048.',mobile:true,preview:'thumb-lightmerge.jpg',howToPlay:"Swipe or use arrow keys to move all numbered tiles.",tip:"Merge matching tiles and keep space open as you work toward 2048."},
 {slug:'driftrock',name:'Driftrock',type:'Asteroids shooter',description:'Navigate and shoot through drifting asteroid fields.',mobile:true,preview:'thumb-driftrock.jpg',howToPlay:"Use A/D to turn, W to thrust and Space to shoot.",tip:"Clear floating asteroids and beware when larger rocks split."},
 {slug:'lumenfall',name:'Lumenfall',type:'3D fantasy adventure',description:'Explore a fantasy world, fight enemies and discover energy crystals.',mobile:false,preview:'thumb-lumenfall.jpg',howToPlay:"Use WASD to move, the mouse to look, Space to jump and click to attack.",tip:"Explore a 3D fantasy world, gather crystals and find the final portal. Best on desktop."},
 {slug:'neon-velocity',name:'Neon Velocity',type:'3D racing',description:'Race neon streets, drift corners and use nitro to win.',mobile:false,preview:'thumb-neon-velocity.jpg',howToPlay:"Use WASD to race, Space to drift and Shift for nitro.",tip:"Time boosts on straightaways and avoid collisions with rival cars. Best on desktop."},
 {slug:'starfall-protocol',name:'Starfall Protocol',type:'3D space shooter',description:'A top-down sci-fi shooter with tactical movement.',mobile:false,preview:'thumb-starfall-protocol.jpg',howToPlay:"Play this 3D top-down action game using a desktop keyboard and mouse.",tip:"Use careful movement and positioning through combat encounters."},
 {slug:'aether-run',name:'Aether Run',type:'Neon hover racer',description:'Steer through a futuristic skyline and manage speed boosts.',mobile:true,preview:'thumb-aether-run.svg',howToPlay:"Steer with A/D or arrow keys; Shift or Up boosts your hover racer.",tip:"Manage your energy and choose when to boost in the futuristic skyline."},
 {slug:'moonlit-grove',name:'Moonlit Grove',type:'Fantasy survival',description:'Cast spells and survive waves of magical enemies.',mobile:true,preview:'thumb-moonlit-grove.svg',howToPlay:"Move with WASD or arrow keys, aim with the pointer and use Space/Shift to dash.",tip:"Survive enemy waves with spells and collect useful resources."},
 {slug:'park-dash',name:'Park Dash',type:'Kids running game',description:'Race through a park, jump hurdles and collect stars.',mobile:true,preview:'thumb-park-dash.svg',howToPlay:"Change lanes with arrow keys or A/D, jump with Space/W and sprint with Shift.",tip:"Dodge obstacles and collect stars in a kid-friendly park race."},
 {slug:'serpent-studio',name:'Serpent Studio',type:'Customizable snake',description:'Play four snake modes with different speeds and skins.',mobile:true,preview:'thumb-serpent-studio.svg',howToPlay:"Choose a snake mode, speed and style; use arrow keys, WASD or swipes.",tip:"Try Classic, Zen, Sprint or Maze and compare best scores."},
]
export const gamePage = slug => arcadeGames.find(g=>g.slug===slug)
const compiled3D = new Set(['lumenfall','neon-velocity','starfall-protocol'])
export const gameURL = slug => compiled3D.has(slug)
  ? `/play/${encodeURIComponent(slug)}/`
  : `/games/${encodeURIComponent(slug)}.html?embed=1`

// Use the game's own lightweight preview art. No game engine is loaded to render a card.
export const gamePreviewURL = game => `${ARCADE_ORIGIN}/assets/img/${game.preview}`
