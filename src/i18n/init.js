import i18next from 'i18next';
import ru from './locales/ru.js';
// import en from './locales/en.js';

const resources = {
    ru,
    // en,
};

i18next.init({
    lng: 'ru',
    fallbackLng: 'ru',
    debug: false,
    resources,
});

export default i18next;