type Callback = () => void;

let openModalCallback: Callback | null = null;

export const registerOpenModal = (cb: Callback) => {

  console.log('registered', cb)
  openModalCallback = cb;
};

export const triggerOpenModal = () => {
  console.log(openModalCallback)
  if (openModalCallback) openModalCallback();
};

export { triggerOpenModal as openModal };
