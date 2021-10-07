if (process.env.NODE_ENV === 'production') {

}

const isDev = (process.env.NODE_ENV !== 'production')
const API_URL = isDev ? 'https://dev.api.awss.ws/v1' : 'https://api.awss.ws/v1'
export default {
  isDevMode: (process.env.NODE_ENV !== 'production'),
API_URL,
  BASE_URL: API_URL,
  FACEBOOK_CLIENT_ID: '365798288420194',
  FACEBOOK_REDIRECT_URL: `${API_URL}/authenticate/oauth-step1`,
  GOOGLE_CLIENT_ID: '848226878916-recutqmif2g0kt7f5tcpno2jomihsj3q.apps.googleusercontent.com',
  GOOGLE_REDIRECT_URL: `${API_URL}/authenticate/oauth-step1`
}
