class logoClass extends mojs.CustomShape {
  getShape () { return '<svg version="1.1" viewBox="0 0 640 640" width="640" height="640"><defs><path d="M63.54 430.2L289.74 296.39L289.74 36.21L206.9 36.21L206.9 252.85L20 360.11L63.54 430.2Z" id="ffSdnr9bQ"></path><path d="M576.46 430.2L350.26 296.39L350.26 36.21L433.1 36.21L433.1 252.85L620 360.11L576.46 430.2Z" id="cDXQJxtWA"></path><path d="M93.54 491.88L322.52 362.9L547.84 492.99L506.43 564.72L318.81 456.4L132.47 564.64L93.54 491.88Z" id="bfuY8Br5"></path></defs><g><g><g><g><use xlink:href="#ffSdnr9bQ" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="1" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#cDXQJxtWA" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="1" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#bfuY8Br5" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="1" stroke-opacity="1"></use></g></g></g></g></svg>'; }
  //getLength () { return 200; } // optional
}
mojs.addShape( 'logoShape', logoClass )

const logo = new mojs.Shape({
  shape:    'logoShape',
  fill:     'black',
  opacity:  {0 : 1},
  scale:    { 4 : 1 },
  stroke:   'white',
  strokeWidth: { 50 : 0 },
  angle:    {720 : 0},
  duration:  2000,
}).play();