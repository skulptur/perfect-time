import { useRef } from 'react'

const sheet = document.head.appendChild(document.createElement('style')).sheet!
function createCSSSelector(className: string, declaration: string) {
  sheet.insertRule(`${className} { ${declaration} }`, sheet.cssRules.length)
}

createCSSSelector('.unique_generated__blink', ' opacity: 0; transform: scale(0); transition: all 300ms ease-out;')
createCSSSelector('.unique_generated__blink-on', 'opacity: 1; transform: scale(1); transition: all 0ms')

export const useBlink = () => {
  const indicatorRef = useRef<HTMLDivElement>(null)
  const blinkOff = () => {
    requestAnimationFrame(() => {
      indicatorRef.current && indicatorRef.current.classList.remove('unique_generated__blink-on')
    })
  }

  const blinkOn = () => {
    requestAnimationFrame(
      () => indicatorRef.current && indicatorRef.current.classList.add('unique_generated__blink-on')
    )

    window.setTimeout(blinkOff, 100)
  }

  return {
    blinkProps: {
      indicatorRef,
    },
    blink: blinkOn,
  }
}

export type BlinkProps = {
  width?: string
  height?: string
  borderRadius?: string
  background?: string
  indicatorRef: React.RefObject<HTMLDivElement>
}

export const Blink = ({
  width = '100%',
  height = '100%',
  borderRadius = '100%',
  background = 'lime',
  indicatorRef,
}: BlinkProps): JSX.Element => {
  return (
    <div
      ref={indicatorRef}
      className='unique_generated__blink'
      style={{
        background,
        width,
        height,
        borderRadius,
      }}
    />
  )
}
