# console-super
Add time stamp, color and replace previous line. It all using only console! Make console great again!

### Install
`npm i console-super`

### Usage
```Javascript
require('console-super');

console.timeTag("OMG ITS A TIME STAMP");
console.showMs(true);
console.timeTag("AND WITH MS!");
console.timeTag("I CAN EVEN OVERWRITE THIS (IN 4 SECS)");
setTimeout(function(){
    console.inlineTimeTag("NO WAY! ITS AWESOME!");
    console.timeTag("AND ITS CYAN NOW", {mod1: 'cyan'});
    console.timeTag("BRIGHTER", {mod1: 'cyan', mod2: 'bright'});
    console.timeTag("CHANGE BACKGROUND", {mod1: 'yellow', mod2: 'bright', mod3: 'bgGreen'});
}, 4000)
```

### Parameters
+ **data:** Data to be shown (`string`, `array`, `object`, `number`)
+ **base (default is 10):** If `data` is a `number` type, then `base` defines in witch base the number must be show, e.g. binary (2), decimal (10), hexdecimal (16), etc.
+ **{mod1: 'red', mod2: 'bright', mod3: 'bgWhite'}:** You can modify the terminal characteristics, like color, its background color and brightness! See at the end all the possibilities.

### Methods
+ ***console.timeTag(data[,base,{mod1, mod2, mod3}]):***
    + console.timeTag("Hi!") ->                         [22:00:19] Hi!
    + console.timeTag({"me":"ur age?", "you":20}) ->    [22:00:22] {"me":"ur age?", "you":20}
    + console.timeTag(90) ->                            [22:00:24] 90
    + console.timeTag(90, 16) ->                        [22:00:26] 5A
    + console.timeTag(13, 2, {mod1: 'red'}) ->          [22:00:28] 1101 *(imagine its red)*
+ ***console.inlineTimeTag(data[,base,{mod1, mod2, mod3}]): Overwrites the previous line***
    + console.inlineTimeTag("Loading...") -> ~~[13:00:00] Loading...~~ [13:00:03] Complete!
    + console.inlineTimeTag("Complete!") ------------------------------^
+ ***console.showMs(msOnOff):***
    + Pass `true` or `false` to toggle the milliseconds to be shown or not
    + `console.showMs(true);`

### Modifiers
```Javascript
//Modifiers
'reset'       //Reset to default
'bright'      //Brighter
'dim'         //Dim
'underscore'  //Put a underscore beneath everything
'reverse'     //Reverses the fore and background colors

//Font colors
'black'
'red'
'green'
'yellow'
'blue'
'magenta'
'cyan'
'white'

//Background colos
'bgBlack'
'bgRed'
'bgGreen'
'bgYellow'
'bgBlue'
'bgMagenta'
'bgCyan'
'bgWhite'

```