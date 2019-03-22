# Schellenberg Api / Smart Friends Api / Enexoma Api

With a lot of work over the last one and a half year I reverse engineered and implemented the Api of the gateway which my parents 
use to control their smart home blinds from the german company Schellenberg.

The Api seems to be part of a generic smart home application which uses base types for categorizing controllable smart devices and
wrapping them into a _Compatibility-Config_ which is then send to the displaying App to know which device it should display.

Because of this, with some changes to the _sessionConfig_ being present in the _test.js_ file, the Api should be usable with the Smart Friends Gateway or any Smart Home
Gateway which has software provided by a company named Enexoma (take a look at an unpacked apk or ipa file of the respective App for the cSymbol, the cSymbol Addon and the Api Version).

## NOT FINISHED
This project was created in my free time whenever I had time to not study for university. It is not finished but should be enough for most task.
Feel free to contribute or use in your project. Please link or name me when you use any of the code. 
Also feel free to ask if anything is unclear or you need help with getting something to work.
