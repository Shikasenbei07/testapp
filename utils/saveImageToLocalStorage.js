export const saveImageToLocalStorage = (file, callback) => {
  const reader = new FileReader();
  reader.onload = function (ev) {
    localStorage.setItem("eventCreateImage", ev.target.result);
    localStorage.setItem("eventCreateImageName", file.name);
    callback();
  };
  reader.readAsDataURL(file);
};