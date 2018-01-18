const getCourse = (coin, currency, callback) => {
  const symbol = coin.toUpperCase() + currency.toUpperCase();

  $.ajax({
    url: `/api/course/${symbol}`,
  }).then((course) => {
    callback(course);
  });
};

export {
  getCourse,
}