import * as Yup from 'yup'
import i18n from '../i18n/init.js'

const validateURL = Yup.object().shape({
  url: Yup.string()
    .required(i18n.t('errors.required'))
    .trim()
    .test('has-protocol', i18n.t('errors.invalidUrl'), (value) => {
      if (!value) return false
      return /^https?:\/\/.+/i.test(value) // требуем http/https
    })
    .url(i18n.t('errors.invalidUrl'))
    .test(
      'rss-already-exists',
      i18n.t('errors.addRSS'),
      function rssAlreadyExists(value) {
        const { feeds } = this.options.context
        return !feeds.includes(value)
      },
    ),
})

export default validateURL
