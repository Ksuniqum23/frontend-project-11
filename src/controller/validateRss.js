const throwIfInvalidRSS = (xml) => {
  const parseError = xml.querySelector('parsererror');
  if (parseError) {
    throw new Error('errors.invalidXml');
  }

  // проверка на RSS ленту
  const items = xml.querySelectorAll('item');
  if (items.length === 0) {
    throw new Error('errors.invalidRss');
  }
};
export default throwIfInvalidRSS;
