/* global Module */

/* Magic Mirror
 * Node Helper: MMM-TransporteCABA
 *
 * By 
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
const axios = require('axios');
var APItransporte = 'https://apitransporte.buenosaires.gob.ar/colectivos/vehiclePositionsSimple';

module.exports = NodeHelper.create({
  start: function () {
    console.log('Starting node helper for: ' + this.name)
  },

  getBusInfo: function(info) {
    var self = this
    axios
      .get(APItransporte, {
        params: {
          //linea: info.line,
          //parada: info.stop,
          //route_id: 1577,
          client_id: '4d676f56a6134ce08624b046a6543a44',
          client_secret: '0662B467417941c4a40F5f6855f4AfA5'
        } 
      })
      .then(function (response, error) {
        if (response.status == 200 && !error) {
          //console.log(response.data);
          var result = response.data;
          console.log(result.length);
          self.sendSocketNotification('BUS_RESULT', result);
        }
      });
      /*
      .catch(function (error) {
       // console.log(error.response);
        console.log('Mal ahi che, hubo un error');
      });
      */
  },
  
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GET_INFO') {
      //console.log(payload);
      this.getBusInfo(payload);
    }
  }

});
