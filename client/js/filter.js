Number.prototype.formatMoney = function(c, d, t){
  var n = this,
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "." : d,
      t = t == undefined ? "," : t,
      s = n < 0 ? "-" : "",
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

const fnumber = function(value){
  if (value == null || typeof value === 'undefined') return '';
  if (isNaN(value)) return '-';

  if(typeof value === 'number') {
    value = value.formatMoney(2);
  }

  value = value.toString()
  .replace('.', '_')
  .replace(',', '.')
  .replace('_', ',');

  return value
};

const number = function(value){
  if (value == null || typeof value === 'undefined') return '';
  if(typeof value === 'number') {
    value = value.formatMoney();
  }

  value = value.toString()
  .replace('.', '_')
  .replace(',', '.')
  .replace('_', ',');

  return value
};

const euro = function (value) {
  if (value == null || typeof value === 'undefined' || value === '') return '';

  if(value.indexOf('€') === -1) {
    value += ' €';
  }

  return value
};

const date = function(value) {
  if (value == null || typeof value === 'undefined') return '';

  if(typeof value === 'date' || typeof value === 'number') {
    value = $.format.date(value, "dd.MM.yy HH:mm")
  }

  if(value instanceof moment) {
    value = value.format("DD.MM.YYYY HH:mm")
  }

  return value
};


export {
  fnumber,
  number,
  euro,
  date
}