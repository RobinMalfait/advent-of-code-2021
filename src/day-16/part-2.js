import { parse } from './parse.js'

export default function (blob) {
  return evaluate(parse(blob))
}

function evaluate(packet) {
  // Sum
  if (packet.typeId === 0) {
    return packet.packets.map((packet) => evaluate(packet)).reduce((total, current) => total + current, 0)
  }

  // Product
  else if (packet.typeId === 1) {
    return packet.packets.map((packet) => evaluate(packet)).reduce((total, current) => total * current, 1)
  }

  // Minimum
  else if (packet.typeId === 2) {
    return Math.min(...packet.packets.map((packet) => evaluate(packet)))
  }

  // Maximum
  else if (packet.typeId === 3) {
    return Math.max(...packet.packets.map((packet) => evaluate(packet)))
  }

  // Literal
  else if (packet.typeId === 4) {
    return packet.value
  }

  // Greater than
  else if (packet.typeId === 5) {
    return evaluate(packet.packets[0]) > evaluate(packet.packets[1]) ? 1 : 0
  }

  // Less than
  else if (packet.typeId === 6) {
    return evaluate(packet.packets[0]) < evaluate(packet.packets[1]) ? 1 : 0
  }

  // Equal to
  else if (packet.typeId === 7) {
    return evaluate(packet.packets[0]) === evaluate(packet.packets[1]) ? 1 : 0
  }

  // Unreachable
  else {
    throw new Error('Unknown typeId: ' + packet.typeId)
  }
}
