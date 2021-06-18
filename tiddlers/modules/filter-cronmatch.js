/*\
title: $:/plugins/sukima/filter-cronmatch
type: application/javascript
module-type: filteroperator

filter a list based on the field of a tiddler as a date which the current date
falls within. If field show-when is M12 and today's date is in December let the
list fall through. Otherwise output an empty list.

\*/
function cronMatcher(crontab) {
  let parts = crontab.split(/\s+/).map(i => i.split(',').reduce((acc, j) => {
    if (j.includes('-')) {
      let [a, b] = j.split('-');
      a = parseInt(a, 10);
      b = parseInt(b, 10);
      let range = Array.from({ length: b - a + 1 }, (_, index) => a + index);
      return [...acc, ...range];
    } else {
      let num = parseInt(j, 10);
      return [...acc, isNaN(num) ? j : num];
    }
  }, []));
  let [minutes, hours, daysOfMonth, months, daysOfWeek] = parts;
  const matchesPart = (patterns = ['*'], num) => {
    for (let pattern of patterns) {
      if (pattern === '*') { return true; }
      if (pattern === num) { return true; }
    }
    return false;
  };
  return (date) => {
    let cond = 0;
    cond |= matchesPart(minutes, date.getMinutes()) ? 1 << 0 : 0;
    cond |= matchesPart(hours, date.getHours()) ? 1 << 1 : 0;
    cond |= matchesPart(daysOfMonth, date.getDate()) ? 1 << 2 : 0;
    cond |= matchesPart(months, date.getMonth() + 1) ? 1 << 3 : 0;
    cond |= matchesPart(daysOfWeek, date.getDay() + 1) ? 1 << 4 : 0;
    return cond === Math.pow(2, 5) - 1;
  };
}

exports.cronmatch = (source, operator) => {
  let results = [];
  let fieldname = (operator.suffix || operator.operand || "crontab").toLowerCase();
  let now = new Date();
  source((tiddler, title) => {
    if (tiddler) {
      let text = tiddler.getFieldString(fieldname) || '*';
      if (cronMatcher(text)(now)) { results.push(title); }
    } else {
      results.push(title);
    }
  });
  return results;
};
