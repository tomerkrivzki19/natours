//function for hiding alerts
export const hideAlert = () => {
  const el = document.querySelector('.alert');
  //js trick where we need to move one level up to the parent element and then from there remove a child on it
  if (el) el.parentElement.removeChild(el);
  //basic dom manipulation
};
// type is 'success' or 'error'
export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup); // 'afterbegin' ==> inside ht body but right in the begining

  //hide all the alerts after 5 secondes
  window.setTimeout(hideAlert, 5000);
};
