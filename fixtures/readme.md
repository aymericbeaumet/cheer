It should understand source with no arguments:
<!-- DO js() --><!-- DONE -->

It should understand parentheses in arguments:
<!-- DO js("console.log('cheer')") --><!-- DONE -->

It should understand end of placeholder in arguments:
<!-- DO js("console.log(') -->')") --><!-- DONE -->

It should understand DONEs which were never galvanized (without newline):

<!-- DO js("console.log('cheer')") --><!-- DONE -->

It should understand DONEs which were never galvanized (with newline):

<!-- DO js("console.log('cheer')") -->
<!-- DONE -->

It should understand DONEs which were already galvanized:

<!-- DO js("console.log('cheer')") -->
foobar
<!-- DONE -->

It should undertand nested DONEs and only galvanize the outter ones:

<!-- DO js("console.log('cheer')") -->
<!-- DO js("console.log('cheer')") -->
<!-- DONE -->
<!-- DONE -->

<!-- DO js("console.log('cheer')") -->
<!-- DO js("console.log('cheer')") -->
<!-- DONE -->

<!-- DO js("console.log('cheer')") -->
<!-- DONE -->
<!-- DONE -->
