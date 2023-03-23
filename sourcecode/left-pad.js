const pad = (num, size = 2, fill = '0') =>
  `${Array(size).fill(fill).join('')}${num}`.slice(-size);
