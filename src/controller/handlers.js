import validateURL from './validateUrl.js';
import state from '../state/state.js';
import fetchRSS from './fetchRss.js';
import parseXML from './parseXml.js';
import validateRss from './validateRss.js';
import { addNewRssInState, addReadPostInState } from '../state/updateState.js';
import { modalRender, updateFeedback, updateUI } from '../view/render.js';

const addRSS = (xmlDoc, message, rssLink) => {
  addNewRssInState(xmlDoc, rssLink);
  updateFeedback(message.type, message.message);
  const input = document.getElementById('rss-input');
  if (input) input.value = '';
};

export const submitHandler = async (rssLink) => {
  const feedbackMessage = {
    type: 'success',
    message: 'success.addRSS',
  };

  try {
    // 1. Валидация URL
    await validateURL.validate(
      { url: rssLink },
      { context: { feeds: state.ui.rssLinksOrder } },
    );
    // 2. Получаем RSS через fetch
    const xmlString = await fetchRSS(rssLink);
    // 3. Парсим XML и проверяем RSS
    const xmlDoc = parseXML(xmlString);
    validateRss(xmlDoc); // должен бросить ошибку, если это не RSS
    // 4. Добавляем в состояние и показываем сообщение
    addRSS(xmlDoc, feedbackMessage, rssLink);
    // Возвращаем xmlDoc на случай, если кто-то хочет использовать результат
    return xmlDoc;
  } catch (error) {
    feedbackMessage.type = 'danger';
    feedbackMessage.message = error.message || 'errors.unknown';
    updateFeedback(feedbackMessage.type, feedbackMessage.message);
    throw error;
  }
};

export const previewBtnHandler = (currentPostData) => {
  addReadPostInState(currentPostData);
  modalRender(currentPostData);
  updateUI(state);
};
