const uniqueID = (i => () => ++i)(0);

uniqueID(); // => 1
uniqueID(); // => 2
uniqueID(); // => 3
