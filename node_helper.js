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
          //route_id: 1749,
          client_id: info[0].client_id,
          client_secret: info[0].client_secret
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
