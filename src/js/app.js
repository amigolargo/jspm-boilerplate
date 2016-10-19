import requestJSON from './requestJSON';
import stacked from './stacked';


if ('visibilityState' in document) {

  const stackedVis1 = stacked()
  const stackedVis2 = stacked()
  const stackedVis3 = stacked()

  requestJSON('./data/data.json')
    .then(data => {
      d3.select('.svg-container')
        .datum(data)
        .call(stackedVis1);

      d3.select('.svg-container')
        .datum(data)
        .call(stackedVis2);

      stackedVis1
        .width(document.documentElement.clientWidth / 3)
        .height(document.documentElement.clientHeight / 3)
        .compare('stocks')             // exchanges || stocks || accounts
        .interpolate('monotone')       // monotone || step-before || cardinal
        .init()
        .update(data);

      stackedVis2
        .width(document.documentElement.clientWidth / 3)
        .height(document.documentElement.clientHeight / 3)
        .compare('accounts')           // exchanges || stocks || accounts
        .interpolate('monotone')       // monotone || step-before || cardinal
        .init()
        .update(data);

      let quarterHours = 0;
      document.querySelector('button').addEventListener('click', () => {
        quarterHours++
        stackedVis1.destroy().update(data, quarterHours);
        stackedVis2.destroy().update(data, quarterHours);
      })
    })
    .catch(error => console.log(error));
}
