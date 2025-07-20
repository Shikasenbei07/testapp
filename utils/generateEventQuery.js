export const generateEventQuery = (form) => {
  const query = {};
  Object.keys(form).forEach(k => {
    if (k === "image" && form.image) {
      query.image = form.image.name;
    } else {
      query[k] = form[k];
    }
  });
  return query;
};