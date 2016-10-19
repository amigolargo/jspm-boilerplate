import d3 from 'd3'

export default function(file, callback) {
    return new Promise(
        function (resolve, reject) {
            d3.json(file, (error, data) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(data);
                });
        });
}
