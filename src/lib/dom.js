export const $ = (string) => {
  return document.querySelector(string);
};

export const create = (htmlString) => {
  return document.createRange().createContextualFragment(htmlString);
};
