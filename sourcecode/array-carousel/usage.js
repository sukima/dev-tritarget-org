let example = ['foo', 'bar', 'baz'];

fromPointer(example, -3); // => 'foo'
fromPointer(example, -2); // => 'bar'
fromPointer(example, -1); // => 'baz'
fromPointer(example,  0); // => 'foo'
fromPointer(example,  1); // => 'bar'
fromPointer(example,  2); // => 'baz'
fromPointer(example,  3); // => 'foo'
