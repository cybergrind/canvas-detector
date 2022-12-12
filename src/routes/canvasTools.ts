// based on and inspired by https://github.com/antoinevastel/picasso-like-canvas-fingerprinting
export const paintCanvas = ({
  canvas,
  context,
  strokeText = false,
  cssFontFamily = '',
  area = { width: 50, height: 50 },
  rounds = 10,
  maxShadowBlur = 50,
  seed = 500,
  offset = 2001000001,
  multiplier = 15000,
}) => {
  if (!context) {
    return
  }
  console.log('clear:', canvas, context)

  context.clearRect(0, 0, canvas.width, canvas.height)
  canvas.width = area.width
  canvas.height = area.height



  const createPicassoSeed = ({ seed, offset, multiplier }) => {
    let current = Number(seed) % Number(offset)
    const getNextSeed = () => {
      current = (Number(multiplier) * current) % Number(offset)
      return current
    }
    return {
      getNextSeed,
    }
  }

  const picassoSeed = createPicassoSeed({ seed, offset, multiplier })
  const { getNextSeed } = picassoSeed

  const patchSeed = (current, offset, maxBound, computeFloat) => {
    const result = (((current - 1) / offset) * (maxBound || 1)) || 0
    let ret = computeFloat ? result : Math.floor(result)
    return ret
  }

  const addRandomCanvasGradient = (context, offset, area, colors, getNextSeed) => {
    const { width, height } = area
    const canvasGradient = context.createRadialGradient(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, width),
    )
    let c1 = colors[patchSeed(getNextSeed(), offset, colors.length)]
    let c2 = colors[patchSeed(getNextSeed(), offset, colors.length)]
    //console.log('C1: ', c1, ' C2: ', c2)
    canvasGradient.addColorStop(0, c1)
    canvasGradient.addColorStop(1, c2)
    context.fillStyle = canvasGradient
  }

  const colors = [
    //'#FF6633', 
    '#FF00FF',
    '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF',
  ]

	const drawOutlineOfText = (context, offset, area, getNextSeed) => {
		const { width, height } = area
		const fontSize = 2.99;
		context.font = `${height / fontSize}px ${cssFontFamily.replace(/!important/gm, '')}`;
		context.strokeText(
			'👾A',
			patchSeed(getNextSeed(), offset, width),
			patchSeed(getNextSeed(), offset, height),
			patchSeed(getNextSeed(), offset, width),
		);
	}

  const createCircularArc = (context, offset, area, getNextSeed) => {
    const { width, height } = area
    context.beginPath()
    context.arc(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, Math.min(width, height)),
      patchSeed(getNextSeed(), offset, 2 * Math.PI, true),
      patchSeed(getNextSeed(), offset, 2 * Math.PI, true),
    )
    context.stroke()
  }

  const createBezierCurve = (context, offset, area, getNextSeed) => {
    const { width, height } = area
    context.beginPath()
    context.moveTo(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
    )
    context.bezierCurveTo(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
    )
    context.stroke()
  }

  const createQuadraticCurve = (context, offset, area, getNextSeed) => {
    const { width, height } = area
    context.beginPath()
    context.moveTo(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
    )
    context.quadraticCurveTo(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
    )
    context.stroke()
  }

  const createEllipticalArc = (context, offset, area, getNextSeed) => {
    if (!('ellipse' in context)) {
      return
    }
    const { width, height } = area
    context.beginPath()
    context.ellipse(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, Math.floor(width / 2)),
      patchSeed(getNextSeed(), offset, Math.floor(height / 2)),
      patchSeed(getNextSeed(), offset, 2 * Math.PI, true),
      patchSeed(getNextSeed(), offset, 2 * Math.PI, true),
      patchSeed(getNextSeed(), offset, 2 * Math.PI, true),
    )
    context.stroke()
  }

  const methods = [
    createCircularArc,
    createBezierCurve,
    createQuadraticCurve,
  ]

	//methods.push(createEllipticalArc) // unstable in webkit
	if (strokeText) methods.push(drawOutlineOfText)

  ;[...Array(rounds)].forEach((x) => {
      //console.log('loopX:', x)
    addRandomCanvasGradient(context, offset, area, colors, getNextSeed)
    //console.log('gradient')
    context.shadowBlur = patchSeed(getNextSeed(), offset, maxShadowBlur, true)
    context.shadowColor = colors[patchSeed(getNextSeed(), offset, colors.length)]
    const nextMethod = methods[patchSeed(getNextSeed(), offset, methods.length)]
    nextMethod(context, offset, area, getNextSeed)
    context.fill()
  })
  console.log('draw finished')
    
  return
}
