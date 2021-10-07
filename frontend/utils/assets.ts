import constants from '~/constants'

export default function cdnUrl (url: string) {
  return `http://${constants.isDevMode ? 'dev-img' : 'prod-img'}.stokilo.com/${url}`
}
