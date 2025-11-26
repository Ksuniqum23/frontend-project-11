import axios from 'axios'
import i18n from '../i18n/init.js'

const fetchRSS = url => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`)
    /* eslint-disable @stylistic/arrow-parens */
    .then((response) => response.data.contents)
  .catch((error) => {
    if (error.message === 'Network Error') {
      throw new Error(i18n.t('errors.network'))
    }
  })

export default fetchRSS
