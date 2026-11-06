import { useReducedMotion } from 'motion/react'
import '../styles/spline-hero.css'

const communityUrl = 'https://community.spline.design/file/a74713b7-6154-4b89-a5d9-47cfca3f413f'

export function SplineHeroArtwork({ sceneUrl }: { sceneUrl: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <>
      <div className="spline-hero__artwork" aria-hidden="true">
        <img
          className="spline-hero__poster"
          src={import.meta.env.BASE_URL + 'hero-layers/spline-preview.jpg'}
          alt=""
          decoding="async"
        />
        {!reducedMotion && (
          <iframe
            className="spline-hero__frame"
            src={sceneUrl}
            title="مشهد الزجاج المضلّع ثلاثي الأبعاد"
            loading="lazy"
            tabIndex={-1}
          />
        )}
      </div>
      <p className="spline-hero__credit" dir="rtl">
        <span>
          أُعيد تلوين مشهد الزجاج المضلّع لـ{' '}
          <a href={communityUrl} target="_blank" rel="noreferrer"><bdi>niemabiedy</bdi></a>
        </span>
        <span>
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer"><bdi>CC BY 4.0</bdi></a>
          {' · صُمّم باستخدام '}
          <a href="https://spline.design" target="_blank" rel="noreferrer"><bdi>Spline</bdi></a>
        </span>
      </p>
    </>
  )
}
