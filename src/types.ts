// 连续数据
export interface ValueAxis {
  type: 'value'
  min?: number
  max: number
}

// 离散的类目数据
export interface CategoryAxis<T = unknown> {
  type: 'category'
  data: T[]
  boundaryGap?: boolean
}

// 网格
export interface Grid {
  top: number | `${number}%`
  right: number | `${number}%`
  bottom: number | `${number}%`
  left: number | `${number}%`
}

// 极坐标系 xAxis为radiusAxis yAxis为angleAxis
export interface Polar {
  center: [number, number] | [`${number}%`, `${number}%`]
  radius: number | `${number}%`
  startAngle: number // 起始角度
  clockwise: boolean // 顺时针
}

export type ValueType<Axis extends ValueAxis | CategoryAxis> = Axis extends CategoryAxis<infer YCategory>
  ? YCategory
  : number

// 输入坐标系的类型 - 输出坐标始终为左上坐标系，用于布局
export enum CoordinateType {
  LT = 1, // 左上
  RT = 2, // 右上
  LB = 3, // 左下
  RB = 4, // 右下
}

export interface Options<XAxis, YAxis> {
  type?: CoordinateType
  xAxis: XAxis
  yAxis: YAxis
  grid?: Partial<Grid>
  polar?: Partial<Polar>
}