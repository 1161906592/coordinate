import type { CategoryAxis, Grid, Options, Polar, ValueAxis, ValueType } from './types'
import { CoordinateType } from './types'

const percentToPX = (total: number, percent: number | `${number}%`) =>
  typeof percent === 'string' ? total * (parseFloat(percent) / 100) : percent

export class Coordinate<XAxis extends ValueAxis | CategoryAxis, YAxis extends ValueAxis | CategoryAxis> {
  dom: HTMLElement
  type: CoordinateType
  xAxis: XAxis
  yAxis: YAxis
  grid: Grid
  polar?: Polar

  // readonly
  width = 0
  height = 0
  maxRadius = 0
  center = [0, 0]

  constructor(dom: HTMLElement, options: Options<XAxis, YAxis>) {
    this.dom = dom
    this.type = options.type || CoordinateType.LT
    this.xAxis = options.xAxis
    this.yAxis = options.yAxis

    const grid = options.grid
    const { top = 0, right = 0, bottom = 0, left = 0 } = grid || {}
    this.grid = { top, right, bottom, left }

    const polar = options.polar

    if (polar) {
      const { center = ['50%', '50%'], radius = '50%', startAngle = 90, clockwise = true } = polar
      this.polar = { center, radius, startAngle, clockwise }
    }

    this.resize()
  }

  coordX(x: ValueType<XAxis>) {
    const { center, type, xAxis, polar } = this

    if (polar) {
      return NaN
    }

    if ([CoordinateType.LB, CoordinateType.LT].includes(type)) {
      if (xAxis.type === 'value') {
        const { min = 0, max } = xAxis

        return center[0] + (this.width * ((x as number) - min)) / (max - min)
      } else {
        const { data, boundaryGap = true } = xAxis
        const i = data.findIndex((d) => d === x)
        if (i === -1) return NaN

        return center[0] + (this.width * (i + (boundaryGap ? 0.5 : 0))) / (data.length + (boundaryGap ? 0 : -1))
      }
    } else {
      if (xAxis.type === 'value') {
        const { min = 0, max } = xAxis

        return center[0] + this.width * (1 - ((x as number) - min) / (max - min))
      } else {
        const { data, boundaryGap = true } = xAxis
        const i = data.findIndex((d) => d === x)
        if (i === -1) return NaN

        return center[0] + this.width * (1 - (i + (boundaryGap ? 0.5 : 0)) / (data.length + (boundaryGap ? 0 : -1)))
      }
    }
  }

  coordY(y: ValueType<YAxis>) {
    const { center, type, yAxis, polar } = this

    if (polar) {
      return NaN
    }

    if ([CoordinateType.LT, CoordinateType.RT].includes(type)) {
      if (yAxis.type === 'value') {
        const { min = 0, max } = yAxis

        return center[1] + (this.height * ((y as number) - min)) / (max - min)
      } else {
        const { data, boundaryGap = true } = yAxis
        const i = data.findIndex((d) => d === y)
        if (i === -1) return NaN

        return center[1] + (this.height * (i + (boundaryGap ? 0.5 : 0))) / (data.length + (boundaryGap ? 0 : -1))
      }
    } else {
      if (yAxis.type === 'value') {
        const { min = 0, max } = yAxis

        return center[1] + this.height * (1 - ((y as number) - min) / (max - min))
      } else {
        const { data, boundaryGap = true } = yAxis
        const i = data.findIndex((d) => d === y)
        if (i === -1) return NaN

        return center[1] + this.height * (1 - (i + (boundaryGap ? 0.5 : 0)) / (data.length + (boundaryGap ? 0 : -1)))
      }
    }
  }

  radius(x: ValueType<XAxis>) {
    const { xAxis, maxRadius, polar } = this

    if (!polar) {
      return NaN
    }

    if (xAxis.type === 'value') {
      const { min = 0, max } = xAxis

      return (maxRadius * ((x as number) - min)) / (max - min)
    } else {
      const { data, boundaryGap = true } = xAxis
      const i = data.findIndex((d) => d === x)
      if (i === -1) return NaN

      return (maxRadius * (i + (boundaryGap ? 0.5 : 0))) / (data.length + (boundaryGap ? 0 : -1))
    }
  }

  radian(y: ValueType<YAxis>) {
    const { yAxis, polar } = this

    if (!polar) {
      return NaN
    }

    const { startAngle, clockwise } = polar

    if (yAxis.type === 'value') {
      const { min = 0, max } = yAxis

      return ((-startAngle + ((clockwise ? 1 : -1) * 360 * ((y as number) - min)) / (max - min)) * Math.PI) / 180
    } else {
      const { data } = yAxis
      const i = data.findIndex((d) => d === y)
      if (i === -1) return NaN

      return ((-startAngle + ((clockwise ? 1 : -1) * 360 * i) / data.length) * Math.PI) / 180
    }
  }

  coord(x: ValueType<XAxis>, y: ValueType<YAxis>): [number, number]
  coord(point: [ValueType<XAxis>, ValueType<YAxis>]): [number, number]
  coord(...args: unknown[]) {
    let x: ValueType<XAxis>
    let y: ValueType<YAxis>
    const point = args[0]

    if (Array.isArray(point)) {
      x = point[0]
      y = point[1]
    } else {
      x = point as ValueType<XAxis>
      y = args[1] as ValueType<YAxis>
    }

    if (this.polar) {
      // 极坐标系
      const { center } = this
      const curRadius = this.radius(x)
      const curRadian = this.radian(y)

      return [center[0] + curRadius * Math.cos(curRadian), center[1] + curRadius * Math.sin(curRadian)]
    } else {
      // 二维直角坐标系
      return [this.coordX(x), this.coordY(y)]
    }
  }

  resize() {
    const { dom, grid, polar, center } = this
    const { clientWidth, clientHeight } = dom
    const paddingLeft = percentToPX(clientWidth, grid.left)
    const paddingTop = percentToPX(clientHeight, grid.top)
    const paddingRight = percentToPX(clientWidth, grid.right)
    const paddingBottom = percentToPX(clientHeight, grid.bottom)
    const width = (this.width = clientWidth - paddingLeft - paddingRight)
    const height = (this.height = clientHeight - paddingTop - paddingBottom)

    if (polar) {
      const maxRadius = Math.min(width, height)
      this.maxRadius = percentToPX(maxRadius, polar.radius)

      if ([CoordinateType.LB, CoordinateType.LT].includes(this.type)) {
        center[0] = paddingLeft + percentToPX(width, polar.center[0])
      } else {
        center[0] = paddingLeft + width - percentToPX(width, polar.center[0])
      }

      if ([CoordinateType.LT, CoordinateType.RT].includes(this.type)) {
        center[1] = paddingTop + percentToPX(height, polar.center[1])
      } else {
        center[1] = paddingTop + height - percentToPX(height, polar.center[1])
      }
    } else {
      center[0] = paddingLeft
      center[1] = paddingTop
    }
  }
}
