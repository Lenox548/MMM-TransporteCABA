/* global Module */

/* Magic Mirror
 * Module: MMM-TransporteCABA
 *
 * By 
 * MIT Licensed.
 */

Module.register("MMM-TransporteCABA", {
  busesInfo: [],
  defaults: {
    header: 'Transporte CABA',
    buses: [
      {
        line: '120',
        stop: 8317
      }
    ],
    mmLocation: [ -34.6, -58.433333 ], // [ latitude, longitude ]
    updateInterval: 30000, // update interval in milliseconds
    initialLoadDelay: 1000, // initial delay for the module to be loaded in milliseconds
    fadeSpeed: 4000,
    infoClass: 'big' // small, medium or big
  },

  getStyles: function() {
    return ["MMM-TransporteCABA.css"];
  },

  start: function() {
    Log.info("Starting module: " + this.name);
    this.scheduleUpdate(this.config.initialLoadDelay);
  },

  scheduleUpdate: function(delay) {
    const nextLoad = (typeof delay !== "undefined" && delay >= 0) ? delay : this.config.updateInterval;
    setTimeout(() => {
      this.busesInfo = []; // prevent redrawing twice the same info
      this.config.buses.forEach(info => {
        this.sendSocketNotification('GET_INFO', info);
      });

			this.scheduleUpdate();
	 	}, nextLoad);

    /*
    this.intervalID = setInterval(function() {
      this.busesInfo = [] // prevent redrawing twice the same info
      this.config.buses.forEach(info => {
        this.sendSocketNotification('GET_INFO', info);
      })
    }, nextLoad)
    */
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "BUS_RESULT") {
      if (payload.length !== 0) { // update DOM only if it's needed
        this.busesInfo=[...payload];
        this.updateDom(this.config.fadeSpeed);
      }
    }
  },

  getHeader: function() {
    return this.config.header
  },

  getDom: function() {
    var wrapper = document.createElement("table")
    if (Object.entries(this.busesInfo).length === 0) return wrapper

    var busList = this.config.buses
    var busesInformation = this.busesInfo

    wrapper.className = 'cuandollega ' + this.config.infoClass
    let arrBuses = [];
    ///*
    this.busesInfo.forEach(bus => {
      var route_short_name = bus.route_short_name;
      var trip_headsign = bus.trip_headsign;
      var nameToUse = "arr"+route_short_name+trip_headsign;
      if(arrBuses.includes(2)){

      }
      let nearBuses = (typeof nameToUse !== 'undefined' && nameToUse.length > 0) ? delay : this.config.updateInterval;
      let first = true
      for (let key in nearBuses) {
        let value = nearBuses[key]
        let busRow = document.createElement("tr"),
          busSymbolCell = document.createElement("td"),
          busLineCell = document.createElement("td"),
          busDistanceCell = document.createElement("td"),
          busMinutesCell = document.createElement("td");
        
        if (nearBuses.length == 1) busRow.className = 'last' // some lines could have only 1 arrival time
        else busRow.className = first ? '' : 'last'
        busSymbolCell.innerHTML = first ? '<i class="fas fa-bus"></i>' : ''
        busSymbolCell.className = 'bus-symbol'
        busLineCell.innerHTML = first ? nearBuses['route_short_name'] : ''
        busLineCell.className = 'bus-line'
        busDistanceCell.innerHTML = this.distanceToMM(nearBuses['latitude'], nearBuses['longitude'])
        busDistanceCell.className = 'bus-distance number'
        busMinutesCell.innerHTML = nearBuses['speed'] + ' min'
        let proximityClass = ''
        if (nearBuses['speed'] <= 3 ) {
          proximityClass = 'arriving'
        } else if(nearBuses['speed'] > 3 && nearBuses['speed'] <= 5) {
          proximityClass = 'close'
        } else proximityClass = 'faraway'
       
        busMinutesCell.className = proximityClass + ' number'
        
        busRow.appendChild(busSymbolCell)
        busRow.appendChild(busLineCell)
        busRow.appendChild(busDistanceCell)
        busRow.appendChild(busMinutesCell)

        wrapper.appendChild(busRow)

        first = false
      }
    })
    //*/
		return wrapper
  },
  // distance from the upcoming bus to where my MagicMirror is located
  distanceToMM: function(lat2,lon2) {
    lat1 = this.config.mmLocation[0]
    lon1 = this.config.mmLocation[1]

    var R = 6371; // km (change this constant to get miles)
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    if (d>1) return Math.round(d)+"km";
    else if (d<=1) return Math.round(d*1000)+"m";
    return d;
  }

  /*
  https://docs.magicmirror.builders/development/core-module-file.html#suspend
  used in combination with ModuleScheduler in order to halt the timers

  suspend: function() {
    window.clearInterval(this.intervalID)
  },

  resume: function() {
    this.scheduleUpdate(this.config)
  },
  */
})

