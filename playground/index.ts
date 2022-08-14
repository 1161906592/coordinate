import { init, Circle, Polygon, registerPainter } from "zrender"
import Painter from "zrender/lib/canvas/Painter"
import { Coordinate } from "../src"

registerPainter("canvas", Painter)

const root = document.querySelector(".root") as HTMLDivElement
const zr = init(root)
const coordinate = new Coordinate(root, {
  xAxis: {
    type: "value",
    max: 360,
  },
  yAxis: {
    type: "value",
    max: 360,
  },
  polar: {
    // radius: 300,
    startAngle: 90,
    // clockwise: false
  },
  grid: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  }
})
zr.add(new Circle({
  shape: {
    cx: coordinate.center[0],
    cy: coordinate.center[1],
    r: coordinate.maxRadius
  },
  style: {
    fill: "gray",
  }
}))

const data = Array.from({length: 12}).map((_, i) => [320, 30 * i])

zr.add(new Polygon({
  shape: {
    points: data.map(d => coordinate.coord(d[0], d[1])),
    smooth: 0.5,
  },
  style: {
    fill: "#fff",
  }
}))