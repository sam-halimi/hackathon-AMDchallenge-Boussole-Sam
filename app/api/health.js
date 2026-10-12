// @ts-check
import { nodeHealth } from '../server/handler.js'

/** @param {import('node:http').IncomingMessage} req @param {import('node:http').ServerResponse} res */
export default function handler(req, res) {
  return nodeHealth(req, res, process.env)
}
