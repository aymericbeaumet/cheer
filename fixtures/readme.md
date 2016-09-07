It should understand source with no arguments:
<!-- cheer: printf() --><!-- cheer: return -->

It should understand parentheses in arguments:
<!-- cheer: printf(")") --><!-- cheer: return -->

It should understand multiline arguments:
<!-- cheer: printf(`
1
+
1
`, {
  test: 'ok',
}) | format | printf --><!-- cheer: return -->

It should understand when never galvanized (without newline):

<!-- cheer: printf('foobar') --><!-- cheer: return -->

It should understand when never galvanized (with newline):

<!-- cheer: printf('foobar') -->
<!-- cheer: return -->

It should understand when already galvanized:

<!-- cheer: printf('foobar') -->
<!-- cheer: printf('barfoo') -->
foobar
barfoo
<!-- cheer: return -->
