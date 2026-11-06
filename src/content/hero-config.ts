export type HeroConfig =
  | { variant: 'classic' }
  | { variant: 'spline'; sceneUrl: string }

const defaultSplineHeroUrl = 'https://my.spline.design/reededliquidglassprismherosectionconcept-S8f9axC8vUWEYK5Uc4z4n4c0/'

export function getHeroConfig(search: string): HeroConfig {
  if (new URLSearchParams(search).get('hero') === 'classic') return { variant: 'classic' }
  const sceneUrl = import.meta.env.VITE_SPLINE_HERO_URL?.trim() || defaultSplineHeroUrl
  return { variant: 'spline', sceneUrl }
}
