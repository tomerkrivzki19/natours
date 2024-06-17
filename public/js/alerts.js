//function for hiding alerts
export const hideAlert = () => {
  const el = document.querySelector('.alert');
  //js trick where we need to move one level up to the parent element and then from there remove a child on it
  if (el) el.parentElement.removeChild(el);
  //basic dom manipulation
};
// type is 'success' or 'error' |time => if we will add that to the argumant and specife it with a diffrent number then it will overweite the default
export const showAlert = (type, msg, time = 7) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup); // 'afterbegin' ==> inside ht body but right in the begining

  //hide all the alerts after 5 secondes
  window.setTimeout(hideAlert, time, 1000);
};
