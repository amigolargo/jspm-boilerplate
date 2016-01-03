import _ from 'lodash';


if ('visibilityState' in document) {
	// https://justmarkup.com/log/2015/02/cut-the-mustard-revisited/
    console.log('Modern browser. Do some stuff');

    _.times(5, function(i) {
    	console.log('hello: ' + i)
	});
}